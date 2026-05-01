import os
import json
import logging

logger = logging.getLogger(__name__)
STATS_FILE = "stats.json"

class StatsService:
    @staticmethod
    def _load_stats():
        if os.path.exists(STATS_FILE):
            try:
                with open(STATS_FILE, "r") as f:
                    return json.load(f)
            except:
                pass
        return {"total_scans": 0, "pneumonia_count": 0, "tumor_count": 0}

    @staticmethod
    def increment_scan(disease_type: str):
        stats = StatsService._load_stats()
        stats["total_scans"] += 1
        if disease_type == "pneumonia":
            stats["pneumonia_count"] += 1
        else:
            stats["tumor_count"] += 1
        
        with open(STATS_FILE, "w") as f:
            json.dump(stats, f)
        return stats

    @staticmethod
    def get_stats():
        return StatsService._load_stats()
