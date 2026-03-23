#!/usr/bin/env ruby
# frozen_string_literal: true

require "csv"
require_relative "assignments"

OUTPUT_FILENAME = "assignments.csv"

# One less than the count of λ values: grid is i/LEVELS for i = 0..LEVELS (LEVELS+1 points on [0,1]).
DEFAULT_LEVELS = 4

def usage
  warn "Usage: #{$PROGRAM_NAME} INPUT.csv [MIN_COMMIT] [LEVELS]"
  warn "MIN_COMMIT defaults to #{Assignments::DEFAULT_MIN_COMMIT_FOR_ANALYSIS} Pi (rows below are skipped)."
  warn "LEVELS defaults to #{DEFAULT_LEVELS} → λ ∈ {i/#{DEFAULT_LEVELS} | i = 0..#{DEFAULT_LEVELS}} (#{DEFAULT_LEVELS + 1} values)."
  warn "writes #{OUTPUT_FILENAME}, and prints per-λ totals and fairness metrics on stdout."
  exit 1
end

# @param levels [Integer] segment count; produces λ = i/levels for i = 0,…,levels (levels+1 grid points)
def lambda_grid_from_levels(levels)
  levels = Integer(levels)
  raise ArgumentError, "LEVELS must be >= 1" if levels < 1

  (0..levels).map { |i| i.to_f / levels }
  [ 0.02, 0.04, 0.06, 0.08,
    0.22, 0.24, 0.26, 0.28,
    0.32, 0.34, 0.36, 0.38 ]
end

def lambda_header(lam)
  format("assignment_lambda_%0.2f", lam)
end

# Per design 3: F = sum_i -(s_i/S - a_i/A)^2 ; average fairness = F / n.
# Returns [F, F/n] or [nil, nil] if stake sum or total allocation is non-positive.
def fairness_metrics(model, assignments_by_uid)
  n = model.user_ids.size
  stake_sum = model.stakes.sum
  return [nil, nil] if stake_sum <= 0

  a_total = assignments_by_uid.values.sum
  return [nil, nil] if a_total <= 0

  f = 0.0
  model.user_ids.each_with_index do |uid, i|
    wi = model.stakes[i] / stake_sum
    ai = assignments_by_uid[uid].to_f
    f -= (wi - ai / a_total)**2
  end
  [f, f / n]
end

# Five significant digits (sprintf %g precision counts significant digits for %g).
def fmt5(x)
  format("%.5g", x)
end

def print_lambda_summary(model, lambdas)
  n = model.user_ids.size
  puts
  puts format(
    "%-8s  %16s  %14s  %14s  %14s",
    "lambda",
    "total_assignment",
    "fairness_F",
    "avg_fairness",
    "std_fairness"
  )
  puts format(
    "%-8s  %16s  %14s  %14s  %14s",
    "------",
    "----------------",
    "--------------",
    "--------------",
    "--------------"
  )

  lambdas.each do |lam|
    total = model.total_assignment_by_lambda[lam]
    total_i = total.round
    f, avg = fairness_metrics(model, model.assignments_by_lambda[lam])
    f_s = f.nil? ? "n/a" : fmt5(f)
    avg_s = avg.nil? ? "n/a" : fmt5(avg)
    std_s =
      if avg.nil?
        "n/a"
      else
        fmt5(Math.sqrt(avg.abs))
      end

    puts format(
      "%-8s  %16d  %14s  %14s  %14s",
      format("%0.2f", lam),
      total_i,
      f_s,
      avg_s,
      std_s
    )
  end
  puts "(n=#{n} participants; F = sum_i -(s_i/S - a_i/A)^2; std_fairness = sqrt(|F/n|), analogous to stdev vs variance.)"
  puts
end

def main(argv)
  usage if argv.empty? || argv.include?("-h") || argv.include?("--help")
  if argv.size > 3
    warn "Error: too many arguments (expected at most INPUT, MIN_COMMIT, LEVELS)"
    usage
  end

  input_path = argv.first
  unless File.file?(input_path)
    warn "Error: not a file: #{input_path.inspect}"
    exit 1
  end

  min_commit = Assignments::DEFAULT_MIN_COMMIT_FOR_ANALYSIS
  levels = DEFAULT_LEVELS
  min_commit = Float(argv[1]) if argv[1]
  levels = Integer(argv[2]) if argv[2]

  lambda_grid =
    begin
      lambda_grid_from_levels(levels)
    rescue ArgumentError => e
      warn "Error: #{e.message}"
      exit 1
    end

  model = Assignments.new(
    min_commit_for_analysis: min_commit,
    lambda_grid: lambda_grid
  ).load(input_path)
  if model.participant_rows.empty?
    warn "Error: CSV has no data rows: #{input_path.inspect}"
    exit 1
  end

  model.assign

  lambdas = model.assignments_by_lambda.keys
  base_headers = model.csv_headers
  extra_headers = lambdas.map { |lam| lambda_header(lam) }
  out_headers = base_headers + extra_headers

  CSV.open(OUTPUT_FILENAME, "w", write_headers: true, headers: out_headers) do |csv|
    model.participant_rows.each do |row|
      uid = row["user_id"]
      out = base_headers.map { |h| row[h] }
      lambdas.each do |lam|
        val = model.assignments_by_lambda[lam][uid]
        raise "missing assignment for user_id=#{uid.inspect} λ=#{lam}" if val.nil?

        out << val
      end
      csv << out
    end
  end

  $stderr.puts "Wrote #{OUTPUT_FILENAME} (#{model.participant_rows.size} rows, #{lambdas.size} λ columns)."
  print_lambda_summary(model, lambdas)
end

main(ARGV) if __FILE__ == $PROGRAM_NAME
