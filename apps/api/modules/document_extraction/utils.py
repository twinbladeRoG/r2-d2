import time
from datetime import datetime

import gpustat
import psutil

from .schemas import CPUUsage, GPUUsage, UsageLog


def monitor_usage(log_interval=0.5, stop_event=None, usage_data=None):
    """Monitor CPU and GPU usage while the extraction function runs."""
    while not stop_event.is_set():
        memory = psutil.virtual_memory()

        cpu_usage = CPUUsage(
            cpu_utilization=psutil.cpu_percent(interval=0.5),
            cpu_count=psutil.cpu_count(logical=True),
            total_memory=memory.total,
            available_memory=memory.available,
            used_memory=memory.used,
            free_memory=memory.free,
            memory_percentage=memory.percent,
        )

        try:
            gpu_stats = gpustat.new_query()
            gpu_usage = [
                GPUUsage(
                    index=gpu_entry.index,
                    name=gpu_entry.name,
                    utilization=gpu_entry.utilization,
                    memory_used=gpu_entry.memory_used,
                    memory_total=gpu_entry.memory_total,
                    memory_free=gpu_entry.memory_free,
                    memory_available=gpu_entry.memory_available,
                    temperature=gpu_entry.temperature,
                )
                for gpu_entry in gpu_stats.gpus
            ]
        except Exception as e:
            gpu_usage = []  # Handle case where no GPU is found

        usage_data.append(
            UsageLog(
                timestamp=datetime.now(),
                cpu_usage=cpu_usage,
                gpu_usage=gpu_usage,
            )
        )
        time.sleep(log_interval)
