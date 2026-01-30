export type ToolbarAction = {
  key: string;
  label: string;
  onClick?: () => void;
  url?: string;
  danger?: boolean;
  type?: "primary" | "default";
};
