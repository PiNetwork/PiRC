#![no_std]

pub mod core {
    pub mod registry_v3;
    pub mod pirc211_bridge;
}

pub mod identity {
    pub mod did_registry;
}

pub mod governance {
    pub mod justice_engine;
    pub mod dao_core;
}

pub mod defi {
    pub mod amm_core;
    pub mod vault_standard;
}
