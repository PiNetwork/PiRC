import math

class PiRC2Economy:
    def __init__(self, initial_tvl=0, fee_rate=0.005):
        self.tvl = initial_tvl
        self.fee_rate = fee_rate

    def simulate_growth(self, daily_volume, days=365):
        print(f"{'Day':<10} | {'Daily Volume (Pi)':<20} | {'Total TVL (Pi)':<20}")
        print("-" * 55)
        
        current_volume = daily_volume
        for day in range(1, days + 1):
            fees = current_volume * self.fee_rate
            self.tvl += fees
            
            if day % 30 == 0: # Print update every month
                print(f"{day:<10} | {current_volume:<20,.2f} | {self.tvl:<20,.2f}")
            
            # 1% organic growth in daily usage due to PiRC2 adoption
            current_volume *= 1.01

# Example Run: Start with 1 Million Pi daily transaction volume
pirc2 = PiRC2Economy()
pirc2.simulate_growth(daily_volume=1000000)

