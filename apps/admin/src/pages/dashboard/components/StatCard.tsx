import React from "react";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";

const StatCard: React.FC = () => (
  <Row gutter={16}>
    <Col span={8}>
      <Card variant="borderless" className="purple-gradient">
        <Statistic
          title="Total Orders"
          value={11.28}
          precision={2}
          styles={{
            content: { color: "white", fontWeight: 500 },
            title: { color: "white", fontSize: 16, fontWeight: 500 },
          }}
          prefix={<ArrowUpOutlined />}
          suffix="%"
        />
      </Card>
    </Col>
    <Col span={8}>
      <Card variant="borderless" className="blue-cyan">
        <Statistic
          title="Buyers"
          value={9.3}
          precision={2}
          styles={{
            content: { color: "white", fontWeight: 500 },
            title: { color: "white", fontSize: 16, fontWeight: 500 },
          }}
          prefix={<ArrowDownOutlined />}
          suffix="%"
        />
      </Card>
    </Col>
    <Col span={8}>
      <Card variant="borderless" className="green-gradient">
        <Statistic
          title="Seller"
          value={9.3}
          precision={2}
          styles={{
            content: { color: "white", fontWeight: 500 },
            title: { color: "white", fontSize: 16, fontWeight: 500 },
          }}
          prefix={<ArrowDownOutlined />}
          suffix="%"
        />
      </Card>
    </Col>
  </Row>
);

export default StatCard;
