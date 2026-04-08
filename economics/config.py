import random
import numpy as np

GLOBAL_SEED = 42

def set_seed(seed=GLOBAL_SEED):
    random.seed(seed)
    np.random.seed(seed)
