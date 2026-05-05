    def run_epoch(self):
        self.epoch += 1
        
        # Stochastic Market Movement (Bear bias: -5% to +2%)
        market_shift = random.uniform(-0.05, 0.02)
        self.pi_price *= (1 + market_shift)
        self.liquidity *= (1 + market_shift)
        liquidity_trend = "DOWN" if market_shift < 0 else "UP"

        phi = self.get_phi()
        daily_exit_pool_usd = self.liquidity * self.exit_cap
        exit_requests_ref = 0

        # Agents React (Simplifying for bank run focus)
        for agent in self.agents:
            # Randomly trigger panic exits (5% chance per day normally)
            if agent.ref_balance > 0 and (random.random() < 0.05 or (phi < 0.5 and random.random() < 0.30)):
                exit_requests_ref += agent.ref_balance

        # --- 🚨 NEW: Market Impact & Slippage Model 🚨 ---
        actual_pi_withdrawn = 0
        total_slippage_usd = 0
        
        if exit_requests_ref > 0:
            # 1. Convert requested REF to Pi Value (Conceptually)
            requested_usd_value = (exit_requests_ref / self.qwf) * self.pi_price
            
            # 2. Calculate Slippage Ratio: Demand vs Available Exit Door
            # Extreme Panic creates Extreme Slippage
            slippage_ratio = min(requested_usd_value / (daily_exit_pool_usd * 2), 0.90) # Cap at 90% loss
            
            # 3. Calculate actual USD cleared after Slippage Penalty
            usd_cleared_after_slippage = min(requested_usd_value * (1 - slippage_ratio), daily_exit_pool_usd)
            
            # 4. Final amounts
            actual_pi_withdrawn = usd_cleared_after_slippage / self.pi_price
            total_slippage_usd = requested_usd_value - usd_cleared_after_slippage
            
            # 5. Update State
            self.total_pi_locked -= actual_pi_withdrawn
            self.liquidity -= usd_cleared_after_slippage # Exit drains liquidity
            self.ref_supply -= exit_requests_ref # Full REF amount is burned
            
            # Refund remaining Pi value (Conceptually, for agent model depth)
            # In a full ABM, agents would receive back 'Pi' or a fraction thereof.
            
        print(f"Epoch {self.epoch:02d} | Phi: {phi:.4f} | Exit Demand: ${requested_usd_value/1e3:,.1f}k | "
              f"Actual Exit: ${usd_cleared_after_slippage/1e3:,.1f}k | Panic Penalty (Slippage): {slippage_ratio*100:.1f}%")

        self.history['epoch'].append(self.epoch)
        self.history['phi'].append(phi)
        self.history['liquidity'].append(self.liquidity)
        self.history['ref_supply'].append(self.ref_supply)
