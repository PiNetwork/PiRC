import numpy as np
from sklearn.linear_model import LinearRegression


class NetworkGrowthAIModel:

    def __init__(self):

        self.model = LinearRegression()

    def generate_training_data(self):

        users = []
        activity = []

        for year in range(1, 15):

            user_count = year * 2000000 + np.random.randint(100000)

            tx_activity = user_count * np.random.uniform(0.05, 0.2)

            users.append([year])
            activity.append(tx_activity)

        return np.array(users), np.array(activity)

    def train(self):

        X, y = self.generate_training_data()

        self.model.fit(X, y)

    def predict_activity(self, year):

        prediction = self.model.predict(np.array([[year]]))

        return float(prediction[0])


if __name__ == "__main__":

    ai = NetworkGrowthAIModel()

    ai.train()

    for year in range(15, 25):

        print("Year", year, "Predicted Activity:", ai.predict_activity(year))
