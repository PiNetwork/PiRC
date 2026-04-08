pub struct InteroperabilityStatus;

impl InteroperabilityStatus {
    pub fn all_layers_ready(active_layers: u32) -> bool {
        active_layers == 7
    }
}
