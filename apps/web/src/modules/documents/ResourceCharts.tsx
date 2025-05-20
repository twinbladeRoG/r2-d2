import React from "react";
import { IUsageLog } from "../../types";
import { Tabs, Text } from "@mantine/core";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import dayjs from "dayjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const
    },
    title: {
      display: false
    }
  }
};

interface ResourceChartsProps {
  className?: string;
  usage: IUsageLog["usage_log"];
}

const ResourceCharts: React.FC<ResourceChartsProps> = ({
  className,
  usage
}) => {
  return (
    <Tabs defaultValue="cpu-utilization" className={className}>
      <Tabs.List>
        <Tabs.Tab value="cpu-utilization">CPU Utilization</Tabs.Tab>
        <Tabs.Tab value="ram">Memory Utilization</Tabs.Tab>
        {usage.gpu_usage.map((gpu) => (
          <Tabs.Tab key={gpu.index} value={`gpu-${gpu.index}`}>
            GPU {gpu.index}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value="cpu-utilization">
        <Line
          options={{
            responsive: true,
            scales: {
              y: { ticks: { callback: (value) => `${value}%` } }
            }
          }}
          data={{
            labels: usage.cpu_usage.available_memory.map(([time]) =>
              dayjs(time).format("mm:ss")
            ),
            datasets: [
              {
                label: "CPU Utilization",
                data: usage.cpu_usage.cpu_utilization.map(([, i]) => i),
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.3
              }
            ]
          }}
        />
      </Tabs.Panel>

      <Tabs.Panel value="ram">
        <Line
          options={{
            responsive: true,
            scales: {
              y: { ticks: { callback: (value) => `${(+value).toFixed(2)} GB` } }
            }
          }}
          data={{
            labels: usage.cpu_usage.available_memory.map(([time]) =>
              dayjs(time).format("h:mm:ss")
            ),
            datasets: [
              {
                label: "Used Memory",
                data: usage.cpu_usage.used_memory.map(
                  (i) => i[1] / Math.pow(1024, 3)
                ),
                fill: false,
                borderColor: "#228be6",
                tension: 0.3
              },
              {
                label: "Available Memory",
                data: usage.cpu_usage.available_memory.map(
                  (i) => i[1] / Math.pow(1024, 3)
                ),
                fill: false,
                borderColor: "#82c91e",
                tension: 0.3
              }
            ]
          }}
        />
      </Tabs.Panel>

      {usage.gpu_usage.map((gpu) => (
        <Tabs.Panel key={gpu.index} value={`gpu-${gpu.index}`}>
          <Tabs defaultValue="memory">
            <Tabs.List>
              <Tabs.Tab value="memory">VRAM Utilization</Tabs.Tab>
              <Tabs.Tab value="cores">GPU Utilization</Tabs.Tab>
              <Tabs.Tab value="temperature">GPU Temperature</Tabs.Tab>

              <Text fw="bold" c="green" ml="auto">
                {gpu.name}
              </Text>
            </Tabs.List>

            <Tabs.Panel value="memory">
              <Line
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      ticks: {
                        callback: (value) => `${(+value).toFixed(2)} GB`
                      }
                    }
                  }
                }}
                data={{
                  labels: gpu.memory_available.map(([time]) =>
                    dayjs(time).format("h:mm:ss")
                  ),
                  datasets: [
                    {
                      label: "Used Memory",
                      data: gpu.memory_used.map(
                        (i) => i[1] / Math.pow(1024, 1)
                      ),
                      fill: false,
                      borderColor: "#228be6",
                      tension: 0.3
                    },
                    {
                      label: "Available Memory",
                      data: gpu.memory_available.map(
                        (i) => i[1] / Math.pow(1024, 1)
                      ),
                      fill: false,
                      borderColor: "#82c91e",
                      tension: 0.3
                    }
                  ]
                }}
              />
            </Tabs.Panel>

            <Tabs.Panel value="cores">
              <Line
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      ticks: {
                        callback: (value) => `${value}%`
                      }
                    }
                  }
                }}
                data={{
                  labels: gpu.memory_available.map(([time]) =>
                    dayjs(time).format("h:mm:ss")
                  ),
                  datasets: [
                    {
                      label: "Used Memory",
                      data: gpu.utilization.map((i) => i[1]),
                      fill: false,
                      borderColor: "#228be6",
                      tension: 0.3
                    }
                  ]
                }}
              />
            </Tabs.Panel>

            <Tabs.Panel value="temperature">
              <Line
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      ticks: {
                        callback: (value) => `${value} °C`
                      }
                    }
                  }
                }}
                data={{
                  labels: gpu.memory_available.map(([time]) =>
                    dayjs(time).format("h:mm:ss")
                  ),
                  datasets: [
                    {
                      label: "GPU Temperature",
                      data: gpu.temperature.map((i) => i[1]),
                      fill: false,
                      borderColor: "#228be6",
                      tension: 0.3
                    }
                  ]
                }}
              />
            </Tabs.Panel>
          </Tabs>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};

export default ResourceCharts;
