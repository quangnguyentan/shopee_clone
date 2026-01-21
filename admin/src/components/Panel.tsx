import React from "react";
import { Drawer } from "antd";

type PanelProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
};

const Panel = ({ open, onClose, title, children }: PanelProps) => {
  return (
    <Drawer title={title} open={open} onClose={onClose} closable destroyOnClose>
      {children}
    </Drawer>
  );
};

export default Panel;
