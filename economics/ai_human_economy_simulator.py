"""
AI + Human Economy Simulator
Models future Pi ecosystem workforce economy
"""

import random
import statistics
from dataclasses import dataclass, field
from typing import List


@dataclass
class Task:
    difficulty: float
    ai_accuracy: float
    reward: float


@dataclass
class HumanWorker:
    skill: float
    tasks_completed: int = 0
    earnings: float = 0.0


@dataclass
class AISystem:
    accuracy: float


@dataclass
class EconomyState:
    humans: List[HumanWorker]
    ai: AISystem
    tasks: List[Task]
    reward_pool: float = 0


class HumanAIEconomySimulator:

    def __init__(self, human_count=1000):
        humans = [
            HumanWorker(skill=random.uniform(0.4, 1.0))
            for _ in range(human_count)
        ]

        self.state = EconomyState(
            humans=humans,
            ai=AISystem(accuracy=0.75),
            tasks=[]
        )

    def generate_tasks(self, n=500):
        tasks = []
        for _ in range(n):
            difficulty = random.uniform(0.2, 1.0)
            reward = difficulty * random.uniform(0.5, 2.0)

            tasks.append(Task(
                difficulty=difficulty,
                ai_accuracy=self.state.ai.accuracy,
                reward=reward
            ))

        self.state.tasks = tasks

    def ai_attempt(self, task):
        success = random.random() < (self.state.ai.accuracy - task.difficulty * 0.3)
        return success

    def human_attempt(self, worker, task):
        probability = worker.skill - task.difficulty * 0.4
        success = random.random() < probability

        if success:
            worker.tasks_completed += 1
            worker.earnings += task.reward
            self.state.reward_pool += task.reward

        return success

    def run_round(self):

        for task in self.state.tasks:

            if self.ai_attempt(task):
                continue

            worker = random.choice(self.state.humans)
            self.human_attempt(worker, task)

    def summary(self):

        earnings = [h.earnings for h in self.state.humans]

        return {
            "total_rewards": sum(earnings),
            "avg_worker_income": statistics.mean(earnings),
            "median_worker_income": statistics.median(earnings),
            "top_worker": max(earnings),
            "tasks_completed": sum(h.tasks_completed for h in self.state.humans)
        }


if __name__ == "__main__":

    sim = HumanAIEconomySimulator()

    for _ in range(30):
        sim.generate_tasks(500)
        sim.run_round()

    print(sim.summary())
