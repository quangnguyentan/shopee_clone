import GenericTable from "../../components/Table";
import useTableData from "./useTableData";
import { Button, Spin } from "antd";
import TableSkeleton from "@/components/TableSkeleton";
import { useEffect } from "react";
import NProgress from "@/common/utils/nprogress";
import type { ProductVariantAttribute } from "@/common/types/product-variant-attribute.type";

export const Table = () => {
  const {
    columns,
    productsVariantAttribute,
    isLoading,
    isFetching,
    toolbarActions,
    rowSelection,
  } = useTableData();
  const showLoading = isLoading || isFetching;
  useEffect(() => {
    if (showLoading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [showLoading]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-start h-8">
        {toolbarActions.map((a) => (
          <Button
            key={a.key}
            type="primary"
            danger={a.danger}
            onClick={a.onClick}
            className="rounded-full! mx-1 w-20 h-full"
          >
            {a.label}
          </Button>
        ))}
      </div>

      <Spin spinning={isFetching}>
        <GenericTable<ProductVariantAttribute>
          rowKey="id"
          data={productsVariantAttribute}
          columns={columns as A}
          rowSelection={rowSelection}
        />
      </Spin>
    </div>
  );
};
