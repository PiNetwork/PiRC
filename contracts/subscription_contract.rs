use std::collections::HashMap;

pub struct Subscription {

    pub user: String,
    pub expiry: u64

}

pub struct SubscriptionContract {

    subscriptions: HashMap<String, Subscription>

}

impl SubscriptionContract {

    pub fn new() -> Self {

        Self {
            subscriptions: HashMap::new()
        }

    }

    pub fn subscribe(
        &mut self,
        user: String,
        duration: u64
    ) {

        let expiry = duration;

        self.subscriptions.insert(user.clone(), Subscription {

            user,
            expiry

        });

    }

    pub fn active(&self, user: &String) -> bool {

        self.subscriptions.contains_key(user)

    }
}
