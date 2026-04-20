mod pirc_config;
use std::collections::HashMap;

#[derive(Debug)]
pub struct Worker {

    pub id: String,
    pub completed_tasks: u64,
    pub reward: f64

}

pub struct HumanWorkOracle {

    workers: HashMap<String, Worker>,
    reward_per_task: f64

}

impl HumanWorkOracle {

    pub fn new(reward: f64) -> Self {

        Self {
            workers: HashMap::new(),
            reward_per_task: reward
        }
    }

    pub fn register_worker(&mut self, id: String) {

        self.workers.insert(id.clone(), Worker {
            id,
            completed_tasks: 0,
            reward: 0.0
        });
    }

    pub fn submit_task(&mut self, worker_id: &String) {

        if let Some(worker) = self.workers.get_mut(worker_id) {

            worker.completed_tasks += 1;
            worker.reward += self.reward_per_task;

        }
    }

    pub fn worker_reward(&self, worker_id: &String) -> Option<f64> {

        self.workers.get(worker_id).map(|w| w.reward)
    }
}
