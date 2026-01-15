import React from "react";
import { Flex, Spin } from "antd";

const Loading: React.FC = () => (
  <Flex
    align="center"
    gap="middle"
    className="w-screen h-screen flex items-center justify-center"
  >
    <Spin size="large" />
  </Flex>
);

export default Loading;
