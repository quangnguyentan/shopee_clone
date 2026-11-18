import GenericTable from "../../components/Table";
import useTableData from "./useTableData";
import { Button, Spin } from "antd";
import TableSkeleton from "@/components/TableSkeleton";
import { useEffect } from "react";
import NProgress from "@/common/utils/nprogress";
import type { User } from "@/common/types/user.type";

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
      <div className="flex justify-start h-8">
        {toolbarActions.map((a) => (
          <Button
            key={a.key}
            type={a.type}
            danger={a.danger}
            onClick={a.onClick}
            className="rounded-full! mx-1 w-20 h-full"
          >
            {a.label}
          </Button>
        ))}
      </div>

      <Spin spinning={isFetching}>
        <GenericTable<User>
          rowKey="id"
          data={data}
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
