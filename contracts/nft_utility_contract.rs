use std::collections::HashMap;

#[derive(Debug)]
pub struct NFT {

    pub id: u64,
    pub owner: String,
    pub utility: String

}

pub struct NFTUtilityContract {

    nfts: HashMap<u64, NFT>,
    next_id: u64

}

impl NFTUtilityContract {

    pub fn new() -> Self {

        Self {
            nfts: HashMap::new(),
            next_id: 1
        }

    }

    pub fn mint(
        &mut self,
        owner: String,
        utility: String
    ) {

        let nft = NFT {
            id: self.next_id,
            owner,
            utility
        };

        self.nfts.insert(self.next_id, nft);

        self.next_id += 1;

    }

    pub fn owner_of(&self, id: u64) -> Option<&String> {

        self.nfts.get(&id).map(|n| &n.owner)

    }
}
