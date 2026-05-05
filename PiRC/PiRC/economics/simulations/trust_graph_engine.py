import networkx as nx

def compute_trust(graph):
    return nx.pagerank(graph, alpha=0.85)

def build_graph():
    G = nx.DiGraph()

    # contoh koneksi
    edges = [
        ("A", "B"),
        ("B", "C"),
        ("C", "A"),
        ("D", "E"),  # sybil cluster
        ("E", "D")
    ]

    G.add_edges_from(edges)
    return G

if __name__ == "__main__":
    G = build_graph()
    trust_scores = compute_trust(G)

    print("Trust Scores:")
    for k, v in trust_scores.items():
        print(k, round(v, 4))
