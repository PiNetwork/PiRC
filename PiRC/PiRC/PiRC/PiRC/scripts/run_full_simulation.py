from economics.pi_whitepaper_economic_model import PiWhitepaperEconomicModel

def run():

    model = PiWhitepaperEconomicModel()

    for year in range(50):

        model.run_year()

        print(model.summary())

if __name__ == "__main__":
    run()
