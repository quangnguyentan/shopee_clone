import { Skeleton } from "antd";

const ProductVariantSkeleton = () => {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between mb-3">
        <Skeleton.Input active size="small" style={{ width: 160 }} />
        <Skeleton.Button active size="small" />
      </div>

      <Skeleton active title={false} paragraph={{ rows: 4 }} />
    </div>
  );
};

export default ProductVariantSkeleton;
