import { Alert, Card, Col, Row, Statistic } from "antd";
import { useGetAllProductQuery } from "@/common/api/product.api";
import { useGetAllShopsQuery } from "@/common/api/shop.api";
import { useGetAllUsersQuery } from "@/common/api/user.api";
import { useGetOrdersQuery } from "@/common/api/order.api";
import { useAppSelector } from "@/common/hooks/useAppSelector";

export default function StatCard() {
  const isSeller = useAppSelector((state) => state.user.me?.role === "seller");
  const users = useGetAllUsersQuery(
    { page: 1, limit: 1 },
    { skip: isSeller },
  );
  const shops = useGetAllShopsQuery({ page: 1, limit: 1 });
  const products = useGetAllProductQuery({ page: 1, limit: 1 });
  const orders = useGetOrdersQuery({ page: 1, limit: 1 });

  const failed =
    (!isSeller && users.isError) ||
    shops.isError ||
    products.isError ||
    orders.isError;
  if (failed) {
    return (
      <Alert
        type="error"
        showIcon
        message="Dashboard data could not be loaded."
        description="Refresh the page or check the API connection."
      />
    );
  }

  const loading =
    (!isSeller && users.isLoading) ||
    shops.isLoading ||
    products.isLoading ||
    orders.isLoading;
  const cards = [
    ...(isSeller
      ? []
      : [{ title: "Users", value: users.data?.total ?? 0 }]),
    { title: "Shops", value: shops.data?.total ?? 0 },
    { title: "Products", value: products.data?.total ?? 0 },
    { title: "Orders", value: orders.data?.total ?? 0 },
  ];

  return (
    <Row gutter={[16, 16]}>
      {cards.map(({ title, value }) => (
        <Col key={title} xs={24} sm={12} lg={6}>
          <Card loading={loading} variant="borderless">
            <Statistic title={title} value={value} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
