import numpy as np

def gini(values):
    values = np.array(values)
    values = np.sort(values)
    n = len(values)
    return (2 * np.sum((np.arange(1, n+1) * values))) / (n * np.sum(values)) - (n+1)/n

def attack_resistance(before, after):
    return 1 - (after / before)
