import React from "react";
import { Flex, Spin } from "antd";

const Loading: React.FC = () => (
  <Flex align="center" justify="center" className="fixed inset-0 z-50 bg-white">
    <Spin size="large" />
  </Flex>
);

export default Loading;
