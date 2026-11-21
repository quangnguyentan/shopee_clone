import { Typography } from "antd";
import { useAppSelector } from "@/common/hooks/useAppSelector";
import StatCard from "./components/StatCard";

export default function Home() {
  const isSeller = useAppSelector((state) => state.user.me?.role === "seller");

  return (
    <div className="space-y-6 w-full">
      <div>
        <Typography.Title level={3} className="!mb-1">
          {isSeller ? "Seller dashboard" : "Admin dashboard"}
        </Typography.Title>
        <Typography.Text type="secondary">
          {isSeller
            ? "A live overview of your shop and fulfillment activity."
            : "A live overview of users, shops, products, and orders."}
        </Typography.Text>
      </div>
      <StatCard />
    </div>
  );
}
