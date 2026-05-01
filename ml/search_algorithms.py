"""
Search Algorithms demonstration script.
Visualizes how A*, BFS, and DFS navigate the diagnostic decision graph.
"""
from dataclasses import dataclass, field
import heapq
from collections import deque

@dataclass(order=True)
class DiagnosticNode:
    state: str = field(compare=False)
    g_cost: float = field(compare=False)
    h_cost: float = field(compare=False)
    f_cost: float = field(init=False)
    path: list = field(default_factory=list, compare=False)
    
    def __post_init__(self):
        self.f_cost = self.g_cost + self.h_cost

def get_demo_graph(target_prediction="PNEUMONIA", is_positive=True):
    """Returns graph, heuristics, and target for demo."""
    
    graph = {
        "Start": [("High Confidence", 1), ("Low Confidence", 5)],
        "High Confidence": [("Positive Finding", 1 if is_positive else 10), 
                            ("Negative Finding", 10 if is_positive else 1)],
        "Low Confidence": [("Require Secondary Review", 2), 
                           ("Positive Finding", 5 if is_positive else 15),
                           ("Negative Finding", 15 if is_positive else 5)],
        "Positive Finding": [(target_prediction, 0)],
        "Negative Finding": [("NORMAL" if target_prediction == "PNEUMONIA" else "NO_TUMOR", 0)],
        "Require Secondary Review": [(target_prediction, 2)]
    }
    
    heuristics = {
        "Start": 3,
        "High Confidence": 2,
        "Low Confidence": 3,
        "Positive Finding": 1,
        "Negative Finding": 1,
        "Require Secondary Review": 1,
        target_prediction: 0,
        "NORMAL": 0,
        "NO_TUMOR": 0
    }
    
    return graph, heuristics

def run_bfs(graph, start, target):
    print("\n--- Breadth-First Search (BFS) ---")
    queue = deque([(start, [start], 0)])
    visited = set()
    nodes_expanded = 0
    
    while queue:
        current, path, cost = queue.popleft()
        nodes_expanded += 1
        
        if current == target:
            print(f"Found path: {' -> '.join(path)}")
            print(f"Total cost: {cost}")
            print(f"Nodes expanded: {nodes_expanded}")
            return path
            
        if current not in visited:
            visited.add(current)
            if current in graph:
                for neighbor, edge_cost in graph[current]:
                    if neighbor not in visited:
                        queue.append((neighbor, path + [neighbor], cost + edge_cost))
                        
    print("Path not found.")
    return []

def run_dfs(graph, start, target):
    print("\n--- Depth-First Search (DFS) ---")
    stack = [(start, [start], 0)]
    visited = set()
    nodes_expanded = 0
    
    while stack:
        current, path, cost = stack.pop()
        nodes_expanded += 1
        
        if current == target:
            print(f"Found path: {' -> '.join(path)}")
            print(f"Total cost: {cost}")
            print(f"Nodes expanded: {nodes_expanded}")
            return path
            
        if current not in visited:
            visited.add(current)
            if current in graph:
                # Reverse to process in consistent order with BFS
                for neighbor, edge_cost in reversed(graph[current]):
                    if neighbor not in visited:
                        stack.append((neighbor, path + [neighbor], cost + edge_cost))
                        
    print("Path not found.")
    return []

def run_astar(graph, heuristics, start, target):
    print("\n--- A* Search ---")
    start_node = DiagnosticNode(state=start, g_cost=0, h_cost=heuristics[start], path=[start])
    open_set = [start_node]
    visited = set()
    nodes_expanded = 0
    
    while open_set:
        current = heapq.heappop(open_set)
        nodes_expanded += 1
        
        if current.state == target:
            print(f"Found path: {' -> '.join(current.path)}")
            print(f"Total cost: {current.g_cost}")
            print(f"Nodes expanded: {nodes_expanded}")
            return current.path
            
        if current.state in visited:
            continue
            
        visited.add(current.state)
        
        if current.state in graph:
            for neighbor, edge_cost in graph[current.state]:
                if neighbor not in visited:
                    g_new = current.g_cost + edge_cost
                    h_new = heuristics.get(neighbor, 0)
                    neighbor_node = DiagnosticNode(
                        state=neighbor, 
                        g_cost=g_new, 
                        h_cost=h_new, 
                        path=current.path + [neighbor]
                    )
                    heapq.heappush(open_set, neighbor_node)
                    
    print("Path not found.")
    return []

if __name__ == "__main__":
    print("Simulating a Positive Pneumonia Diagnosis...")
    graph, heuristics = get_demo_graph("PNEUMONIA", is_positive=True)
    
    run_bfs(graph, "Start", "PNEUMONIA")
    run_dfs(graph, "Start", "PNEUMONIA")
    run_astar(graph, heuristics, "Start", "PNEUMONIA")
