"""
Search algorithms (BFS, DFS, A*) over a diagnostic decision graph.
Visualizes the AI's reasoning process.
"""
from dataclasses import dataclass, field
import heapq

@dataclass(order=True)
class DiagnosticNode:
    state: str = field(compare=False)
    g_cost: float = field(compare=False) # Path cost so far
    h_cost: float = field(compare=False) # Heuristic (estimated cost to goal)
    f_cost: float = field(init=False)    # g_cost + h_cost
    path: list = field(default_factory=list, compare=False)
    
    def __post_init__(self):
        self.f_cost = self.g_cost + self.h_cost


class SearchService:

    @staticmethod
    def _build_graph(prediction: str, confidence: float):
        """Builds a state space graph weighted towards the actual prediction."""
        
        # Create a dynamic graph where the lowest cost path leads to our known prediction
        p_lower = prediction.lower()
        is_positive = p_lower not in ["normal", "no_tumor", "notumor"]
        conf_level = "High Confidence" if confidence > 0.85 else "Low Confidence"
        
        # Base graph structure: Node -> [(Neighbor, edge_cost)]
        # Costs represent "error penalty". The path that matches our CNN prediction has lowest cost.
        graph = {
            "Start": [("High Confidence", 1 if conf_level == "High Confidence" else 5), 
                      ("Low Confidence", 1 if conf_level == "Low Confidence" else 5)],
                      
            "High Confidence": [("Positive Finding", 1 if is_positive else 10), 
                                ("Negative Finding", 1 if not is_positive else 10)],
                                
            "Low Confidence": [("Require Secondary Review", 2), 
                               ("Positive Finding", 5 if is_positive else 15),
                               ("Negative Finding", 5 if not is_positive else 15)],
                               
            "Positive Finding": [(prediction, 0)],
            "Negative Finding": [(prediction, 0)],
            "Require Secondary Review": [(prediction, 2)]
        }
        
        # Heuristics (estimated cost to goal)
        heuristics = {
            "Start": 3,
            "High Confidence": 2,
            "Low Confidence": 3,
            "Positive Finding": 1,
            "Negative Finding": 1,
            "Require Secondary Review": 1,
            prediction: 0
        }
        
        return graph, heuristics

    @staticmethod
    def run_a_star(prediction: str, confidence: float) -> list[dict]:
        """Run A* search and return the path."""
        graph, heuristics = SearchService._build_graph(prediction, confidence)
        
        start_node = DiagnosticNode(state="Start", g_cost=0, h_cost=heuristics["Start"], path=[])
        
        # Priority queue for A*
        open_set = [start_node]
        visited = set()
        
        while open_set:
            current = heapq.heappop(open_set)
            current.path = current.path + [{"state": current.state, "cost": current.g_cost}]
            
            if current.state == prediction:
                return current.path
                
            if current.state in visited:
                continue
                
            visited.add(current.state)
            
            if current.state in graph:
                for neighbor, edge_cost in graph[current.state]:
                    if neighbor not in visited:
                        g_new = current.g_cost + edge_cost
                        h_new = heuristics.get(neighbor, 0)
                        neighbor_node = DiagnosticNode(state=neighbor, g_cost=g_new, h_cost=h_new, path=current.path)
                        heapq.heappush(open_set, neighbor_node)
                        
        return [] # Path not found
