import { useMemo } from "react";
import type { ChartData, ChartOptions } from "chart.js";

const useChartData = () => {
  const data = useMemo<ChartData<"bar", number[], string>>(
    () => ({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
      datasets: [
        {
          label: "Orders",
          data: [120, 150, 180, 90, 200, 170, 220],
          backgroundColor: "#ef4444",
        },
        {
          label: "Completed",
          data: [100, 130, 160, 80, 180, 150, 200],
          backgroundColor: "#3b82f6",
        },
        {
          label: "Cancelled",
          data: [20, 20, 20, 10, 20, 20, 20],
          backgroundColor: "#22c55e",
        },
      ],
    }),
    []
  );

  const options = useMemo<ChartOptions<"bar">>(
    () => ({
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Sales Report",
        },
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    }),
    []
  );

  return { data, options };
};

export default useChartData;
