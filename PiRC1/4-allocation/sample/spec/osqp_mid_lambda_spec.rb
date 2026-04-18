# frozen_string_literal: true

# Integration target for tuning OSQP hyperparameters used in
# Assignments#solve_osqp_for_lambda! (large_problem branch: eps_abs, eps_rel, max_iter).
#
# Mid-blend λ≈0.3 is the hardest case on full launchpad-scale data (see terminal logs).
#
# Usage:
#   bundle exec rspec spec/osqp_mid_lambda_spec.rb --tag slow
#   OSQP_MID_LAMBDA_SLICE=8000 bundle exec rspec spec/osqp_mid_lambda_spec.rb --tag slow
#
# Requires ../launchpad_user_stake_commit_totals.csv next to spec/ (under sample/).
# Without that file, examples are skipped.

require "tempfile"

require_relative "spec_helper"
require_relative "../assignments"

RSpec.describe "OSQP mid-blend λ=0.3 (launchpad slice)", :osqp_mid_lambda, :slow do
  LAUNCHPAD = File.expand_path("../launchpad_user_stake_commit_totals.csv", __dir__)
  # Must be > 10_000 so Assignments uses the large-problem OSQP branch (same as full launchpad run).
  SLICE_ROWS = Integer(ENV.fetch("OSQP_MID_LAMBDA_SLICE", "12000"))

  before(:all) do
    unless File.file?(LAUNCHPAD)
      @launchpad_missing = true
      next
    end

    @launchpad_missing = false
    @slice = Tempfile.new(["launchpad_osqp_mid_lambda", ".csv"])
    @slice.close
    lines = File.foreach(LAUNCHPAD).first(SLICE_ROWS + 1)
    raise "launchpad CSV empty" if lines.nil? || lines.empty?

    File.write(@slice.path, lines.join)
    @slice_path = @slice.path
  end

  after(:all) do
    @slice&.unlink
  end

  it "runs assign_with_lambda(0.3) on a large slice without error" do
    skip "launchpad CSV missing at #{LAUNCHPAD}" if @launchpad_missing

    a = Assignments.new.load(@slice_path)
    # Slice has SLICE_ROWS data lines; MIN_COMMIT_FOR_ANALYSIS drops some rows.
    expect(a.user_ids.size).to be <= SLICE_ROWS
    expect(a.user_ids.size).to be > 10_000

    expect do
      a.assign_with_lambda(0.3, osqp_progress: false)
    end.not_to raise_error

    sum = a.assignments.values.sum
    expect(sum).to be_within(1.0).of(a.total_assignment)

    by_uid = a.user_ids.each_with_index.to_h { |uid, i| [uid, a.commits[i]] }
    a.assignments.each do |uid, ai|
      expect(ai).to be >= -0.02
      expect(ai).to be <= by_uid[uid] + 0.02
    end
  end

end
