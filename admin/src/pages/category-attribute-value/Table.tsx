import GenericTable from "@/components/Table";
import useTableData from "./useTableData";
import { Button, Spin } from "antd";
import type { CategoryAttributeValue } from "@/common/types/category-attribute-value.type";
import TableSkeleton from "@/components/TableSkeleton";
import { useEffect } from "react";
import NProgress from "@/common/utils/nprogress";

export const Table = () => {
  const {
    columns,
    data,
    total,
    page,
    limit,
    onPageChange,
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
      <div className="flex gap-2">
        {toolbarActions.map((a) => (
          <Button key={a.key} type={a.type} onClick={a.onClick}>
            {a.label}
          </Button>
        ))}
      </div>

      <Spin spinning={isFetching}>
        <GenericTable<CategoryAttributeValue>
          rowKey="id"
          data={data ?? []}
          columns={columns as A}
          total={total}
          page={page}
          limit={limit}
          onPageChange={onPageChange}
          rowSelection={rowSelection}
        />
      </Spin>
    </div>
  );
};
