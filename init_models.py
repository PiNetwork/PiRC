from core.math.differential_geometry import DifferentialManifold
from core.crypto.quantum_sim import QuantumEncryptor

print("Initializing Differential Manifolds...")
manifold = DifferentialManifold([0.1, 0.5, 0.9])
print(f"Curvature: {manifold.calculate_curvature()}")

print("Initializing Quantum Key Distribution...")
q = QuantumEncryptor()
print(f"Secured Key Sample: {q.generate_entangled_key()[:32]}...")
