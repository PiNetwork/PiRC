# frozen_string_literal: true

require_relative "spec_helper"
require_relative "../assignments"

RSpec.describe Assignments do
  let(:fixture_path) { File.expand_path("fixtures/tiny_stakes.csv", __dir__) }

  describe "#load" do
    it "loads rows and required headers" do
      a = described_class.new.load(fixture_path)
      expect(a.user_ids).to eq(%w[1 2 3])
      expect(a.stakes).to eq([2.0, 8.0, 0.0])
      expect(a.commits).to eq([1.0, 10.0, 5.0])
    end

    it "drops rows with commit below min_commit_for_analysis (default 1 Pi)" do
      path = File.expand_path("fixtures/tiny_with_sub_threshold.csv", __dir__)
      a = described_class.new.load(path)
      expect(a.min_commit_for_analysis).to eq(1.0)
      expect(a.user_ids).to eq(%w[1 2])
      expect(a.commits).to eq([1.0, 10.0])
      expect(a.participant_rows.map { |r| r["user_id"] }).to eq(%w[1 2])
    end

    it "uses constructor min_commit_for_analysis when set" do
      path = File.expand_path("fixtures/tiny_with_sub_threshold.csv", __dir__)
      a = described_class.new(min_commit_for_analysis: 0.5).load(path)
      expect(a.user_ids).to eq(%w[1 9 2 3])
      a2 = described_class.new(min_commit_for_analysis: 2.0).load(path)
      expect(a2.user_ids).to eq(%w[2])
    end

    it "stores participant rows and headers for export" do
      a = described_class.new.load(fixture_path)
      expect(a.csv_headers).to eq(%w[user_id total_staked_amount total_commit_amount])
      expect(a.participant_rows.size).to eq(3)
      expect(a.participant_rows.map { |r| r["user_id"] }).to eq(%w[1 2 3])
      expect(a.participant_rows[1]["total_commit_amount"]).to eq("10.0")
    end
  end

  describe "#assign_with_lambda" do
    let(:a) { described_class.new.load(fixture_path) }

    it "at λ=0 assigns each user their full commitment" do
      a.assign_with_lambda(0.0)
      expect(a.assignments).to eq("1" => 1.0, "2" => 10.0, "3" => 5.0)
      expect(a.total_assignment).to eq(16.0)
    end

    it "at λ=1 assigns proportional to stake under caps" do
      a.assign_with_lambda(1.0)
      expect(a.assignments["1"]).to be_within(1e-6).of(1.0)
      expect(a.assignments["2"]).to be_within(1e-6).of(4.0)
      expect(a.assignments["3"]).to be_within(1e-6).of(0.0)
      expect(a.total_assignment).to be_within(1e-6).of(5.0)
    end

    it "rejects lambda outside [0, 1]" do
      expect { a.assign_with_lambda(-0.1) }.to raise_error(ArgumentError, /lambda must be in/)
      expect { a.assign_with_lambda(1.1) }.to raise_error(ArgumentError, /lambda must be in/)
    end

    context "interior lambda" do
      it "solves via OSQP and keeps totals consistent" do
        a.assign_with_lambda(0.5, osqp_progress: false)
        sum = a.assignments.values.sum
        expect(sum).to be_within(1e-4).of(a.total_assignment)
        expect(a.total_assignment).to be > 5.0
        expect(a.total_assignment).to be < 16.0
      end
    end
  end

  describe "#initialize" do
    it "defaults lambda_grid to DEFAULT_LAMBDA_GRID" do
      expect(described_class.new.lambda_grid).to eq(described_class::DEFAULT_LAMBDA_GRID)
    end

    it "accepts a custom lambda_grid" do
      g = [0.0, 1.0]
      expect(described_class.new(lambda_grid: g).lambda_grid).to eq(g)
    end
  end

  describe "#assign" do
    let(:a) { described_class.new.load(fixture_path) }

    it "runs the default lambda grid and exposes per-lambda results" do
      a.assign(osqp_progress: false)
      expect(a.assignments_by_lambda.keys).to eq([0.0, 0.25, 0.5, 0.75, 1.0])
      expect(a.assignments_by_lambda[0.0].values.sum).to eq(16.0)
      expect(a.assignments_by_lambda[1.0].values.sum).to be_within(1e-6).of(5.0)
      expect(a.assignments).to eq(a.assignments_by_lambda[0.5])
      expect(a.total_assignment).to eq(a.total_assignment_by_lambda[0.5])
    end

    it "accepts a custom lambda list" do
      a.assign(lambdas: [0.0, 1.0], osqp_progress: false)
      expect(a.assignments_by_lambda.keys).to eq([0.0, 1.0])
      expect(a.assignments).to eq(a.assignments_by_lambda[1.0])
    end

    it "uses constructor lambda_grid when lambdas is omitted" do
      m = described_class.new(lambda_grid: [0.0, 1.0]).load(fixture_path)
      m.assign(osqp_progress: false)
      expect(m.assignments_by_lambda.keys).to eq([0.0, 1.0])
    end
  end
end
