# frozen_string_literal: true

require "csv"
require "osqp"

# Optimal fairness allocation per ../4-allocation design 3.md:
# For blending parameter λ ∈ [0, 1], maximize (1 - λ) A + λ F with
#   F = Σ_i -(s_i/S - a_i/A)^2
# using auxiliary A and Σ_i a_i = A so rate mismatch is Σ_i (a_i - (s_i/S) A)^2 / A^2;
# the QP uses the same proportional penalty Σ_i (a_i - (s_i/S) A)^2 blended with A (exact at λ=0,1).
#
# CSV columns (e.g. ./launchpad_user_stake_commit_totals.csv in this directory):
#   user_id, total_staked_amount, total_commit_amount
# Rows with total_commit_amount below the instance cutoff are skipped (not optimized or exported).
class Assignments
  REQUIRED_HEADERS = %w[user_id total_staked_amount total_commit_amount].freeze

  # Default for {#initialize} +min_commit_for_analysis:+.
  DEFAULT_MIN_COMMIT_FOR_ANALYSIS = 1.0

  # Default for {#initialize} +lambda_grid:+ (design doc: 0 = weight only total A, 1 = weight only fairness).
  DEFAULT_LAMBDA_GRID = [0.0, 0.25, 0.5, 0.75, 1.0].freeze

  attr_reader :assignments, :total_assignment
  attr_reader :assignments_by_lambda, :total_assignment_by_lambda
  attr_reader :user_ids, :stakes, :commits, :loaded_path
  attr_reader :min_commit_for_analysis, :lambda_grid
  # One CSV row per participant in file order (headers downcased like {#load}); use for export.
  attr_reader :csv_headers, :participant_rows

  # @param min_commit_for_analysis [Numeric] rows with +total_commit_amount+ strictly below this are ignored
  # @param lambda_grid [Enumerable<Numeric>] default λ list for {#assign} when +lambdas:+ is omitted
  def initialize(min_commit_for_analysis: DEFAULT_MIN_COMMIT_FOR_ANALYSIS, lambda_grid: DEFAULT_LAMBDA_GRID)
    @min_commit_for_analysis = min_commit_for_analysis.to_f
    @lambda_grid = Array(lambda_grid).map(&:to_f).freeze
    @user_ids = []
    @stakes = []
    @commits = []
    @csv_headers = nil
    @participant_rows = []
    @loaded_path = nil
    @assignments = nil
    @total_assignment = nil
    @assignments_by_lambda = nil
    @total_assignment_by_lambda = nil
  end

  # @param filename [String] path to CSV (e.g. launchpad_user_stake_commit_totals.csv)
  def load(filename)
    @loaded_path = filename
    @user_ids = []
    @stakes = []
    @commits = []
    @csv_headers = nil
    @participant_rows = []
    @assignments = nil
    @total_assignment = nil
    @assignments_by_lambda = nil
    @total_assignment_by_lambda = nil

    CSV.foreach(filename, headers: true, header_converters: :downcase) do |row|
      missing = REQUIRED_HEADERS - row.headers.compact.map(&:downcase)
      raise ArgumentError, "CSV missing headers: #{missing.join(', ')}" if missing.any? && @user_ids.empty?

      c = Float(row["total_commit_amount"])
      next if c < @min_commit_for_analysis

      @csv_headers ||= row.headers
      @participant_rows << CSV::Row.new(row.headers, row.fields)

      uid = row["user_id"]
      s = Float(row["total_staked_amount"])
      @user_ids << uid
      @stakes << s
      @commits << c
    end

    self
  end

  # Runs {#assign_with_lambda} for each λ in +lambdas+, or in {#lambda_grid} if +lambdas+ is +nil+.
  # Populates {#assignments_by_lambda} and {#total_assignment_by_lambda}.
  # Sets {#assignments} / {#total_assignment} to the λ = 0.5 entry when present, else the last λ.
  #
  # @param lambdas [Enumerable<Numeric>, nil] blending values in [0, 1]; +nil+ means use {#lambda_grid}
  # @param osqp_settings [Hash] passed to OSQP::Solver#solve for interior λ
  # @param osqp_progress [Boolean] when true, print OSQP start/finish lines to stderr
  def assign(lambdas: nil, osqp_settings: {}, osqp_progress: true)
    raise "load a CSV first" if @user_ids.empty?

    list = (lambdas.nil? ? @lambda_grid : lambdas).map(&:to_f)
    @assignments_by_lambda = {}
    @total_assignment_by_lambda = {}

    list.each do |lam|
      assign_with_lambda(lam, osqp_settings: osqp_settings, osqp_progress: osqp_progress)
      @assignments_by_lambda[lam] = @assignments.dup
      @total_assignment_by_lambda[lam] = @total_assignment
    end

    preferred = list.include?(0.5) ? 0.5 : list.last
    @assignments = @assignments_by_lambda[preferred]
    @total_assignment = @total_assignment_by_lambda[preferred]

    self
  end

  # Quadratic-programming solve (OSQP) for a single λ, except λ = 0 and λ = 1 where closed forms apply.
  #
  # Objective (minimize): λ · Σ_i (a_i - (s_i/S) A)^2 - (1 - λ) · A  with  Σ_i a_i = A,  0 ≤ a_i ≤ c_i.
  #
  # @param blend_lambda [Numeric] λ in [0, 1]
  # @param osqp_settings [Hash] passed to OSQP::Solver#solve
  # @param osqp_progress [Boolean] when true, print OSQP start/finish lines to stderr
  def assign_with_lambda(blend_lambda, osqp_settings: {}, osqp_progress: true)
    raise "load a CSV first" if @user_ids.empty?

    lam = blend_lambda.to_f
    raise ArgumentError, "lambda must be in [0, 1], got #{lam}" if lam.negative? || lam > 1.0

    if lam <= 0.0
      assign_lambda_zero!
    elsif lam >= 1.0
      assign_closed_form!
    else
      solve_osqp_for_lambda!(lam, osqp_settings, osqp_progress: osqp_progress)
    end

    self
  end

  private

  # λ = 0: maximize A only → a_i = c_i, A = Σ c_i
  def assign_lambda_zero!
    n = @user_ids.size
    c_vec = @commits
    @assignments = {}
    n.times { |i| @assignments[@user_ids[i]] = c_vec[i] }
    @total_assignment = c_vec.sum
  end

  # λ = 1: proportional fair caps — a_i = A · s_i/S, A = min_{s_i>0}(c_i S / s_i)
  def assign_closed_form!
    n = @user_ids.size
    s_vec = @stakes
    c_vec = @commits
    stake_sum = s_vec.sum
    raise ArgumentError, "total stake S must be positive" if stake_sum <= 0

    cap_a = Float::INFINITY
    n.times do |i|
      si = s_vec[i]
      next if si <= 0

      ci = c_vec[i]
      cap = ci * stake_sum / si
      cap_a = cap if cap < cap_a
    end
    raise ArgumentError, "no positive-stake row to anchor A" if cap_a.infinite?

    @assignments = {}
    n.times do |i|
      si = s_vec[i]
      ai = si.positive? ? cap_a * si / stake_sum : 0.0
      @assignments[@user_ids[i]] = ai
    end
    @total_assignment = cap_a
  end

  def solve_osqp_for_lambda!(lam, osqp_settings, osqp_progress:)
    n = @user_ids.size
    s_vec = @stakes
    c_vec = @commits
    stake_sum = s_vec.sum
    raise ArgumentError, "total stake S must be positive" if stake_sum <= 0

    w = s_vec.map { |si| si / stake_sum }
    n1 = n + 1

    # minimize lam * Q - (1-lam) * A  with  Q = sum (a_i - w_i A)^2
    # Scale by 1/lam so P stays O(1): minimize Q - ((1-lam)/lam) * A
    inv_lam = 1.0 / lam
    coef_a = (1.0 - lam) * inv_lam

    p = OSQP::Matrix.new(n1, n1)
    w_sq_sum = w.sum { |wi| wi * wi }
    n.times do |i|
      p[i, i] = 2.0
      p[i, n] = -2.0 * w[i]
    end
    p[n, n] = 2.0 * w_sq_sum

    q = Array.new(n1, 0.0)
    q[n] = -coef_a

    a_mat = OSQP::Matrix.new(2 + n, n1)
    n.times do |i|
      a_mat[0, i] = 1.0
    end
    a_mat[0, n] = -1.0

    l = [0.0]
    u = [0.0]

    n.times do |i|
      row = 1 + i
      a_mat[row, i] = 1.0
      l << 0.0
      u << c_vec[i]
    end

    a_big_row = 1 + n
    a_mat[a_big_row, n] = 1.0
    l << 0.0
    u << c_vec.sum + 1.0

    if osqp_progress
      warn format(
        "Assignments: OSQP starting λ=%g (n=%d participants, %d variables, %d constraints)",
        lam,
        n,
        n1,
        a_mat.m
      )
    end

    large_problem = n > 10_000
    default_osqp = {
      verbose: false,
      # Large QPs: tight eps + low max_iter often hit iteration limit at mid-λ; relax slightly and allow more iters.
      eps_abs: large_problem ? 1e-6 : 1e-8,
      eps_rel: large_problem ? 1e-6 : 1e-8,
      max_iter: large_problem ? 2_000_000 : 200_000,
      adaptive_rho: 1,
      scaling: 10,
      polishing: 0
    }

    solver = OSQP::Solver.new
    wall_start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    result = solver.solve(
      p, q, a_mat, l, u,
      **default_osqp.merge(osqp_settings)
    )
    wall_secs = Process.clock_gettime(Process::CLOCK_MONOTONIC) - wall_start

    osqp_secs = result[:solve_time] || result[:run_time]
    osqp_part = osqp_secs ? format(" OSQP_solve=%.3fs", osqp_secs) : ""
    if osqp_progress
      warn format(
        "Assignments: OSQP finished λ=%g status=%s iterations=%d wall=%.3fs%s",
        lam,
        result[:status],
        result[:iter],
        wall_secs,
        osqp_part
      )
    end

    ok = result[:status] == "solved" || result[:status] == "solved inaccurate"
    pr = result[:pri_res]
    dr = result[:dua_res]
    max_iter_stop = result[:status].to_s.include?("maximum") || result[:status].to_s.include?("iterations reached")

    unless ok
      # Tight residuals (scaled problem): sometimes met before true "solved" flag.
      if max_iter_stop && pr && dr && pr < 0.01 && dr < 0.01
        if osqp_progress
          warn format(
            "Assignments: OSQP λ=%g hit iteration limit; accepting approximate solution (pri_res=%g dua_res=%g)",
            lam,
            pr,
            dr
          )
        end
        ok = true
      end
      # Large QPs at mid-λ often stall on KKT; last iterate is still usable for allocation tuning — see spec/osqp_mid_lambda_spec.rb.
      if !ok && max_iter_stop && large_problem
        if osqp_progress
          warn format(
            "Assignments: OSQP λ=%g hit max_iter=%d; using last iterate (pri_res=%g dua_res=%g). Tune eps_abs/eps_rel/max_iter in solve_osqp_for_lambda! if you need tighter KKT.",
            lam,
            result[:iter],
            pr.to_f,
            dr.to_f
          )
        end
        ok = true
      end
    end

    raise "OSQP failed: status=#{result[:status]} (#{result[:status_val]})" unless ok

    x = result[:x]
    a_vals = x.take(n)
    @total_assignment = a_vals.sum
    @assignments = {}
    n.times do |i|
      @assignments[@user_ids[i]] = a_vals[i]
    end
  end
end
