import time
from datetime import datetime

import gpustat
import psutil

from .schemas import GPUUsage, UsageLog


def monitor_usage(
    log_interval=0.5, stop_event=None, usage_data: UsageLog | None = None
):
    """Monitor CPU and GPU usage while the extraction function runs."""
    while not stop_event.is_set():
        memory = psutil.virtual_memory()
        now = datetime.now()

        usage_data.cpu_usage.cpu_count = psutil.cpu_count(logical=True)
        usage_data.cpu_usage.total_memory = memory.total

        usage_data.cpu_usage.cpu_utilization.append(
            (now, psutil.cpu_percent(interval=0.5))
        )
        usage_data.cpu_usage.available_memory.append((now, memory.available))
        usage_data.cpu_usage.used_memory.append((now, memory.used))
        usage_data.cpu_usage.free_memory.append((now, memory.free))
        usage_data.cpu_usage.memory_percentage.append((now, memory.percent))

        try:
            gpu_stats = gpustat.new_query()

            for gpu_entry in gpu_stats.gpus:
                index = gpu_entry.index
                try:
                    if usage_data.gpu_usage[index]:
                        pass
                except IndexError:
                    usage_data.gpu_usage.append(
                        GPUUsage(
                            index=gpu_entry.index,
                            uuid=gpu_entry.uuid,
                            name=gpu_entry.name,
                            memory_total=gpu_entry.memory_total,
                        )
                    )

                usage_data.gpu_usage[index].utilization.append(
                    (now, gpu_entry.utilization)
                )
                usage_data.gpu_usage[index].memory_used.append(
                    (now, gpu_entry.memory_used)
                )
                usage_data.gpu_usage[index].memory_free.append(
                    (now, gpu_entry.memory_free)
                )
                usage_data.gpu_usage[index].memory_available.append(
                    (now, gpu_entry.memory_available)
                )
                usage_data.gpu_usage[index].temperature.append(
                    (now, gpu_entry.temperature)
                )

        except Exception as e:
            gpu_usage = []  # Handle case where no GPU is found

        time.sleep(log_interval)
