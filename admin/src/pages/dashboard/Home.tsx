import { Chart } from "react-chartjs-2";
import useChartData from "./useChartData";
import StatCard from "./components/StatCard";
import TopBuyer from "./components/TopBuyer";
import TopSeller from "./components/TopSeller";

export default function Home() {
  const { data, options } = useChartData();

  return (
    <div className="space-y-6 w-full">
      <StatCard />

      <div className="bg-white rounded-xl shadow w-full">
        <Chart type="bar" data={data} options={options} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopSeller />
        <TopBuyer />
      </div>
    </div>
  );
}
