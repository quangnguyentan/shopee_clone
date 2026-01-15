import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { data } from "./useChartData";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  return <Doughnut data={data} />;
}
