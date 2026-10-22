/**
 * PiRC1 – Pi Ecosystem Token Design
 * Complete JavaScript Database Client + API Layer
 * Source: https://github.com/PiNetwork/PiRC
 *
 * Works in Node.js (ES Modules) or browser (as a module).
 * Provides: DB operations, PiPower calc, Engagement scoring,
 *           Design1/Design2 allocation, LP formation, TGE logic.
 */

// ─────────────────────────────────────────────
// CONSTANTS (PiRC1 Spec)
// ─────────────────────────────────────────────
export const PIRC1_CONFIG = {
  BASELINE_LOCKUP_PCT:    0.90,
  BASELINE_LOCKUP_YEARS:  3.0,
  BASELINE_CUTOFF_DATE:   new Date("2026-02-20"),
  ALLOCATION_DESIGNS:     ["design1", "design2"],
  PHASES:                 ["participation_window", "allocation_period", "tge", "post_tge"],
  PLATFORM_BASELINE_PIPOWER: 100,
};

// ─────────────────────────────────────────────
// IN-MEMORY STORE
// ─────────────────────────────────────────────
class PiRC1Store {
  constructor(initialData = {}) {
    this._pioneers   = new Map();
    this._projects   = new Map();
    this._launches   = new Map();
    this._lp_pools   = new Map();
    this._snapshots  = [];

    // Seed from existing JSON if provided
    if (initialData.pioneers)
      initialData.pioneers.forEach(p => this._pioneers.set(p.id, { ...p }));
    if (initialData.projects)
      initialData.projects.forEach(p => this._projects.set(p.id, { ...p }));
    if (initialData.launches)
      initialData.launches.forEach(l => this._launches.set(l.id, { ...l }));
  }

  // ── Pioneers ────────────────────────────
  addPioneer(pioneer) {
    if (this._pioneers.has(pioneer.id)) throw new Error(`Pioneer ${pioneer.id} already exists`);
    this._pioneers.set(pioneer.id, { ...pioneer });
    return pioneer;
  }
  getPioneer(id) { return this._pioneers.get(id) || null; }
  listPioneers() { return [...this._pioneers.values()]; }
  updatePioneer(id, updates) {
    const p = this._pioneers.get(id);
    if (!p) throw new Error(`Pioneer ${id} not found`);
    Object.assign(p, updates);
    return p;
  }

  // ── Projects ────────────────────────────
  addProject(project) {
    if (this._projects.has(project.id)) throw new Error(`Project ${project.id} already exists`);
    this._projects.set(project.id, { ...project });
    return project;
  }
  getProject(id) { return this._projects.get(id) || null; }
  listProjects() { return [...this._projects.values()]; }
  updateProjectStatus(id, status) {
    const p = this._projects.get(id);
    if (!p) throw new Error(`Project ${id} not found`);
    p.status = status;
    return p;
  }

  // ── Launches ────────────────────────────
  addLaunch(launch) {
    this._launches.set(launch.id, { ...launch });
    return launch;
  }
  getLaunch(id) { return this._launches.get(id) || null; }
  listLaunches() { return [...this._launches.values()]; }
  updateLaunch(id, updates) {
    const l = this._launches.get(id);
    if (!l) throw new Error(`Launch ${id} not found`);
    Object.assign(l, updates);
    return l;
  }

  // ── Serialise ────────────────────────────
  toJSON() {
    return {
      meta: { name: "PiRC1 Database", version: "1.0.0", exported: new Date().toISOString() },
      pioneers:  this.listPioneers(),
      projects:  this.listProjects(),
      launches:  this.listLaunches(),
    };
  }
}

// ─────────────────────────────────────────────
// UTILITY HELPERS
// ─────────────────────────────────────────────
function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function yearsBetween(isoDate, to = new Date()) {
  const from = new Date(isoDate);
  return (to - from) / (1000 * 60 * 60 * 24 * 365.25);
}

function lockupPct(pioneer) {
  return pioneer.mined_pi > 0 ? pioneer.locked_pi / pioneer.mined_pi : 0;
}

function isBaselineEligible(pioneer) {
  const pct     = lockupPct(pioneer);
  const years   = yearsBetween(pioneer.lockup_start_date);
  const created = new Date(pioneer.account_created);
  return (
    pct   >= PIRC1_CONFIG.BASELINE_LOCKUP_PCT   &&
    years >= PIRC1_CONFIG.BASELINE_LOCKUP_YEARS &&
    created < PIRC1_CONFIG.BASELINE_CUTOFF_DATE
  );
}

// ─────────────────────────────────────────────
// PIRC1 ENGINE – Core Logic
// ─────────────────────────────────────────────
export class PiRC1Engine {
  /**
   * @param {PiRC1Store} store
   */
  constructor(store) {
    this.store = store;
  }

  // ── PiPower Calculation ─────────────────
  /**
   * PiPower ∝ (stakedPi / totalStaked) × T_available
   * + baseline for qualifying Long-Term Lockers
   */
  calculatePiPower({ pioneerId, stakedPi, totalStakedPiNetwork, tAvailable, platformBaseline }) {
    const pioneer = this.store.getPioneer(pioneerId);
    if (!pioneer) throw new Error(`Pioneer ${pioneerId} not found`);

    const proportional = totalStakedPiNetwork > 0
      ? (stakedPi / totalStakedPiNetwork) * tAvailable
      : 0;

    const baseline = isBaselineEligible(pioneer)
      ? (platformBaseline ?? PIRC1_CONFIG.PLATFORM_BASELINE_PIPOWER)
      : 0;

    return Math.round((proportional + baseline) * 1e6) / 1e6;
  }

  // ── Engagement Scoring ──────────────────
  /**
   * Returns engagement score 0.0 – 1.0
   * Weights: registered 20%, onboarded 20%, features 30%, milestones 30%
   */
  scoreEngagement({ registered, onboarded, featuresUsed, milestonesCompleted, maxFeatures = 10, maxMilestones = 5 }) {
    let score = 0;
    if (registered)  score += 0.20;
    if (onboarded)   score += 0.20;
    score += 0.30 * Math.min(featuresUsed    / maxFeatures,    1);
    score += 0.30 * Math.min(milestonesCompleted / maxMilestones, 1);
    return Math.round(score * 10000) / 10000;
  }

  // ── Liquidity Pool Formation ────────────
  /**
   * Per PiRC1: initial LP is PERMANENTLY locked; withdrawal disabled.
   */
  formLiquidityPool({ piLocked, tokensLocked }) {
    const initialPrice = tokensLocked > 0 ? piLocked / tokensLocked : 0;
    return {
      pi_locked:            Math.round(piLocked    * 1e6) / 1e6,
      tokens_locked:        Math.round(tokensLocked * 1e6) / 1e6,
      initial_price_pi:     Math.round(initialPrice * 1e8) / 1e8,
      withdrawal_enabled:   false,    // PERMANENTLY DISABLED (PiRC1 spec)
      formed_at:            new Date().toISOString(),
    };
  }

  // ── TGE Price Lower Bound ───────────────
  tgePriceLowerBound(lpPi, lpTokens) {
    return lpTokens > 0 ? Math.round((lpPi / lpTokens) * 1e8) / 1e8 : 0;
  }

  // ── Design 1: Stability-Oriented ────────
  /**
   * 50/50 purchase vs liquidity buckets.
   * Moderate engagement bonus (up to +10% extra tokens).
   * No lock-up on bonuses.
   */
  allocateDesign1({ participants, tAvailable, totalPiCommitted, projectLiquidityTokens }) {
    const purchaseBucket  = tAvailable * 0.50;
    const liquidityBucket = tAvailable * 0.50;
    const totalPiPower    = participants.reduce((s, p) => s + p.pipower, 0) || 1;

    const allocations = participants.map(p => {
      const share       = p.pipower / totalPiPower;
      const baseTokens  = share * purchaseBucket;
      const bonusPct    = p.engagement_score * 0.10;        // up to 10%
      const bonusTokens = baseTokens * bonusPct;
      return {
        pioneer_id:       p.pioneer_id,
        pipower:          p.pipower,
        engagement_score: p.engagement_score,
        base_tokens:      Math.round(baseTokens  * 1e6) / 1e6,
        bonus_tokens:     Math.round(bonusTokens * 1e6) / 1e6,
        total_tokens:     Math.round((baseTokens + bonusTokens) * 1e6) / 1e6,
        pi_paid:          p.pi_committed,
        discount_pct:     Math.round(bonusPct * 100 * 100) / 100,
        lock_up_months:   0,
      };
    });

    const lp = this.formLiquidityPool({
      piLocked:     totalPiCommitted,
      tokensLocked: liquidityBucket + projectLiquidityTokens,
    });

    return { design: "design1", allocations, liquidity_pool: lp };
  }

  // ── Design 2: Engagement-Weighted ───────
  /**
   * Hybrid fixed-price + swap.
   * Top 10%: 30% discount + 12mo lock-up
   * Next 20%: 20% discount + 6mo lock-up
   * Rest:     10% discount + 3mo lock-up
   */
  allocateDesign2({ participants, totalPiCommitted, projectLiquidityTokens, basePricePi }) {
    const sorted = [...participants].sort((a, b) => b.engagement_score - a.engagement_score);
    const n = sorted.length;

    const allocations = sorted.map((p, rank) => {
      let discountPct, lockUpMonths;
      if (rank < n * 0.10) { discountPct = 0.30; lockUpMonths = 12; }
      else if (rank < n * 0.30) { discountPct = 0.20; lockUpMonths = 6; }
      else                       { discountPct = 0.10; lockUpMonths = 3; }

      const effectivePrice = basePricePi * (1 - discountPct);
      const tokens = effectivePrice > 0 ? p.pi_committed / effectivePrice : 0;

      return {
        pioneer_id:         p.pioneer_id,
        rank:               rank + 1,
        engagement_score:   p.engagement_score,
        pipower:            p.pipower,
        pi_paid:            p.pi_committed,
        effective_price_pi: Math.round(effectivePrice * 1e6) / 1e6,
        total_tokens:       Math.round(tokens * 1e6) / 1e6,
        discount_pct:       discountPct * 100,
        lock_up_months:     lockUpMonths,
      };
    });

    const lp = this.formLiquidityPool({
      piLocked:     totalPiCommitted,
      tokensLocked: projectLiquidityTokens,
    });

    return { design: "design2", allocations, liquidity_pool: lp };
  }

  // ── Full Launch Simulation ──────────────
  /**
   * @param {string}   projectId
   * @param {object[]} participantData  [{pioneerId, stakedPi, piCommitted, engagementData}]
   * @param {string}   allocationDesign "design1" | "design2"
   * @param {number}   basePricePi      only used by design2
   */
  simulateLaunch({ projectId, participantData, allocationDesign = "design1", basePricePi = 1.0 }) {
    const project = this.store.getProject(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const tAvailable   = project.tokens_for_launchpad;
    const lpTokens     = project.tokens_for_liquidity;
    const totalStaked  = participantData.reduce((s, p) => s + p.staked_pi, 0) || 1;
    const totalPi      = participantData.reduce((s, p) => s + p.pi_committed, 0);

    // Enrich participants with PiPower + engagement score
    const enriched = participantData.map(pd => {
      const pioneer = this.store.getPioneer(pd.pioneer_id);
      if (!pioneer) throw new Error(`Pioneer ${pd.pioneer_id} not found`);

      const pipower = this.calculatePiPower({
        pioneerId: pd.pioneer_id,
        stakedPi: pd.staked_pi,
        totalStakedPiNetwork: totalStaked,
        tAvailable,
      });

      const engagement_score = pd.engagement_score ?? this.scoreEngagement(pd.engagement_data ?? {});

      return { ...pd, pioneer_id: pd.pioneer_id, pipower, engagement_score };
    });

    let result;
    if (!PIRC1_CONFIG.ALLOCATION_DESIGNS.includes(allocationDesign)) {
      throw new Error(`Invalid allocation design: ${allocationDesign}`);
    }

    if (allocationDesign === "design1") {
      result = this.allocateDesign1({ participants: enriched, tAvailable, totalPiCommitted: totalPi, projectLiquidityTokens: lpTokens });
    } else {
      result = this.allocateDesign2({ participants: enriched, totalPiCommitted: totalPi, projectLiquidityTokens: lpTokens, basePricePi });
    }

    result.project_id        = projectId;
    result.project_name      = project.name;
    result.token_symbol      = project.token_symbol;
    result.total_pi_raised   = totalPi;
    result.participant_count = enriched.length;
    result.tge_price_lower_bound = this.tgePriceLowerBound(
      result.liquidity_pool.pi_locked,
      result.liquidity_pool.tokens_locked,
    );
    result.simulated_at = new Date().toISOString();

    return result;
  }

  // ── Reports ─────────────────────────────
  reportPioneer(pioneerId) {
    const p = this.store.getPioneer(pioneerId);
    if (!p) return { error: "Pioneer not found" };
    return {
      ...p,
      computed: {
        lockup_pct:                 Math.round(lockupPct(p) * 10000) / 100,
        lockup_years:               Math.round(yearsBetween(p.lockup_start_date) * 100) / 100,
        baseline_pipower_eligible:  isBaselineEligible(p),
        unlocked_pi:                Math.round((p.mined_pi - p.locked_pi) * 1e6) / 1e6,
      },
    };
  }

  reportProject(projectId) {
    const p = this.store.getProject(projectId);
    if (!p) return { error: "Project not found" };
    const communityAlloc = p.tokens_for_launchpad + p.tokens_for_liquidity;
    return {
      ...p,
      computed: {
        community_allocation_pct: Math.round(communityAlloc / p.total_supply * 10000) / 100,
        team_allocation_pct:      Math.round(p.tokens_for_team / p.total_supply * 10000) / 100,
        product_first_compliant:  p.has_working_product,
        anti_rugpull:             true,   // per PiRC1 spec: LP withdrawal permanently disabled
      },
    };
  }

  listAllPioneersWithStats() {
    return this.store.listPioneers().map(p => this.reportPioneer(p.id));
  }
}

// ─────────────────────────────────────────────
// REST-STYLE API LAYER (for Node / Express / Fetch)
// ─────────────────────────────────────────────
export class PiRC1Api {
  constructor(engine) {
    this.engine = engine;
    this.store  = engine.store;
  }

  /** GET /pioneers */
  getPioneers() {
    return { success: true, data: this.engine.listAllPioneersWithStats() };
  }

  /** POST /pioneers */
  createPioneer(body) {
    const pioneer = {
      id: uid("pioneer"),
      username:            body.username,
      mined_pi:            body.mined_pi,
      locked_pi:           body.locked_pi,
      lockup_start_date:   body.lockup_start_date,
      account_created:     body.account_created,
      kyc_verified:        body.kyc_verified ?? false,
      launches_participated: [],
      total_tokens_received: {},
    };
    this.store.addPioneer(pioneer);
    return { success: true, data: this.engine.reportPioneer(pioneer.id) };
  }

  /** GET /pioneers/:id */
  getPioneer(id) {
    const report = this.engine.reportPioneer(id);
    if (report.error) return { success: false, error: report.error };
    return { success: true, data: report };
  }

  /** GET /projects */
  getProjects() {
    return { success: true, data: this.store.listProjects().map(p => this.engine.reportProject(p.id)) };
  }

  /** POST /projects */
  createProject(body) {
    const project = {
      id: uid("proj"),
      name:                       body.name,
      token_symbol:               body.token_symbol,
      has_working_product:        body.has_working_product,
      total_supply:               body.total_supply,
      tokens_for_launchpad:       body.tokens_for_launchpad,
      tokens_for_liquidity:       body.tokens_for_liquidity,
      tokens_for_team:            body.tokens_for_team,
      team_unlock_schedule_months: body.team_unlock_schedule_months,
      allocation_design:          body.allocation_design ?? "design1",
      escrow_wallet:              body.escrow_wallet ?? uid("ESCROW"),
      category:                   body.category ?? "General",
      status:                     "registration",
      use_cases:                  body.use_cases ?? [],
    };
    this.store.addProject(project);
    return { success: true, data: this.engine.reportProject(project.id) };
  }

  /** POST /launches/simulate */
  simulateLaunch(body) {
    try {
      const result = this.engine.simulateLaunch({
        projectId:        body.project_id,
        participantData:  body.participants,
        allocationDesign: body.allocation_design,
        basePricePi:      body.base_price_pi,
      });
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /** GET /config */
  getConfig() {
    return { success: true, data: PIRC1_CONFIG };
  }

  /** POST /engagement/score */
  scoreEngagement(body) {
    const score = this.engine.scoreEngagement(body);
    return { success: true, data: { engagement_score: score } };
  }
}

// ─────────────────────────────────────────────
// FACTORY – create a ready-to-use instance
// ─────────────────────────────────────────────
/**
 * Create a PiRC1 API instance, optionally seeding from JSON data.
 * @param {object} seedData  – parsed pirc1_database.json (optional)
 */
export function createPiRC1({ seedData } = {}) {
  const store  = new PiRC1Store(seedData ?? {});
  const engine = new PiRC1Engine(store);
  const api    = new PiRC1Api(engine);
  return { store, engine, api };
}

// ─────────────────────────────────────────────
// DEMO (Node.js: node pirc1_client.js)
// ─────────────────────────────────────────────
function runDemo() {
  console.log("\n=== PiRC1 JavaScript Demo ===\n");

  const { api } = createPiRC1();

  // Create pioneers
  const alice = api.createPioneer({
    username: "alice_pi", mined_pi: 5000, locked_pi: 4800,
    lockup_start_date: "2022-01-15", account_created: "2021-03-10", kyc_verified: true,
  });
  const bob = api.createPioneer({
    username: "bob_pi", mined_pi: 300, locked_pi: 200,
    lockup_start_date: "2023-06-01", account_created: "2022-09-20", kyc_verified: true,
  });
  const carol = api.createPioneer({
    username: "carol_pi", mined_pi: 12000, locked_pi: 10800,
    lockup_start_date: "2021-05-10", account_created: "2020-12-01", kyc_verified: true,
  });

  console.log("Pioneers:");
  [alice, bob, carol].forEach(r => {
    const { data: d } = r;
    console.log(`  [${d.username}] lockup: ${d.computed.lockup_pct}% | baseline eligible: ${d.computed.baseline_pipower_eligible}`);
  });

  // Create project
  const project = api.createProject({
    name: "Demo DeFi App", token_symbol: "DDA", has_working_product: true,
    total_supply: 1_000_000_000, tokens_for_launchpad: 200_000_000,
    tokens_for_liquidity: 100_000_000, tokens_for_team: 100_000_000,
    team_unlock_schedule_months: 24, allocation_design: "design1",
    category: "DeFi", use_cases: ["Payments", "Governance", "Staking"],
  });
  const proj = project.data;
  console.log(`\nProject: ${proj.name} (${proj.token_symbol})`);
  console.log(`  Community allocation: ${proj.computed.community_allocation_pct}% | Anti-rugpull: ${proj.computed.anti_rugpull}`);

  // Engagement scores
  const { engine } = createPiRC1();
  const aliceEng = 0.90;  // pre-computed for demo
  const bobEng   = 0.35;
  const carolEng = 1.00;

  // Simulate Design 1
  const d1 = api.simulateLaunch({
    project_id: proj.id,
    allocation_design: "design1",
    participants: [
      { pioneer_id: alice.data.id, staked_pi: 500, pi_committed: 450, engagement_score: aliceEng },
      { pioneer_id: bob.data.id,   staked_pi: 100, pi_committed: 80,  engagement_score: bobEng   },
      { pioneer_id: carol.data.id, staked_pi: 900, pi_committed: 850, engagement_score: carolEng },
    ],
  });
  console.log("\n── Design 1 Launch ──");
  console.log(`  Total Pi raised: ${d1.data.total_pi_raised}`);
  console.log(`  LP: ${d1.data.liquidity_pool.pi_locked} Pi + ${d1.data.liquidity_pool.tokens_locked} tokens`);
  console.log(`  TGE price lower bound: ${d1.data.tge_price_lower_bound} Pi`);
  d1.data.allocations.forEach(a =>
    console.log(`    [${a.pioneer_id}] ${a.total_tokens} tokens | +${a.discount_pct}% bonus | lock: ${a.lock_up_months}mo`)
  );

  // Simulate Design 2
  const d2 = api.simulateLaunch({
    project_id: proj.id,
    allocation_design: "design2",
    base_price_pi: 0.005,
    participants: [
      { pioneer_id: alice.data.id, staked_pi: 500, pi_committed: 450, engagement_score: aliceEng },
      { pioneer_id: bob.data.id,   staked_pi: 100, pi_committed: 80,  engagement_score: bobEng   },
      { pioneer_id: carol.data.id, staked_pi: 900, pi_committed: 850, engagement_score: carolEng },
    ],
  });
  console.log("\n── Design 2 Launch ──");
  d2.data.allocations.forEach(a =>
    console.log(`    Rank #${a.rank} [${a.pioneer_id}] ${a.total_tokens} tokens | ${a.discount_pct}% off | lock: ${a.lock_up_months}mo`)
  );

  console.log("\n✓ PiRC1 JS engine ready.\n");
}

// Auto-run in Node.js
if (typeof process !== "undefined" && process.argv[1]?.endsWith("pirc1_client.js")) {
  runDemo();
}