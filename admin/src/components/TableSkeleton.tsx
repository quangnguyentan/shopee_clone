import { Skeleton } from "antd";

export default function TableSkeleton() {
  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <Skeleton.Button active size="default" />
        <Skeleton.Button active size="default" />
      </div>

      <Skeleton active paragraph={{ rows: 8 }} title={{ width: "40%" }} />
    </div>
  );
}
