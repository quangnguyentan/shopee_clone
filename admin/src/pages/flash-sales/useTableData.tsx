import { useGetFlashSalesQuery } from "@/common/api/flash-sale.api";
import { getFlashSaleStatus } from "@/common/helper/getFlashSaleStatus";
import type { FlashSale } from "@/common/types/flash-sales.type";
import { convertDay } from "@/common/utils/convertDay";
import type { ToolbarAction } from "@/common/utils/mixins";
import type { ColumnsType, TableRowSelection } from "antd/es/table/interface";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const useTableData = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const onPageChange = (p: number, l: number) => {
    setPage(p);
    setLimit(l);
  };
  const navigate = useNavigate();

  const { data, isLoading, isFetching } = useGetFlashSalesQuery();
  const total = data?.length ?? 0;

  const hasSelection = selectedRowKeys.length > 0;

  const canEdit = selectedRowKeys.length === 1;
  const handleEdit = useCallback(() => {
    if (selectedRowKeys.length !== 1) return;
    navigate(`/flash-sales/${selectedRowKeys[0]}/edit`);
  }, [selectedRowKeys, navigate]);

  const handleBulkDelete = useCallback(() => {
    console.log("Delete shops:", selectedRowKeys);
  }, [selectedRowKeys]);

  const columns: ColumnsType<FlashSale> = [
    {
      title: "Flash Sale Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <span
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={() => navigate(`/flash-sales/${record.id}/items`)}
        >
          {name}
        </span>
      ),
    },
    {
      title: "Time",
      key: "time",
      width: 320,
      render: (_, record) => (
        <div className="flex flex-col text-xs">
          <span>Start: {convertDay(record.start_time)}</span>
          <span>End: {convertDay(record.end_time)}</span>
        </div>
      ),
      sorter: (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const status = getFlashSaleStatus(record);
        return (
          <span
            className={
              status === "Active"
                ? "text-green-600"
                : status === "Upcoming"
                  ? "text-blue-600"
                  : "text-gray-400"
            }
          >
            {status}
          </span>
        );
      },
    },
    {
      title: "Active",
      dataIndex: "is_active",
      key: "is_active",
      render: (v: boolean) => (v ? "Yes" : "No"),
      width: 100,
    },
    {
      title: "Items",
      key: "items",
      width: 100,
      render: (_, record) => record.items?.length ?? 0,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      sorter: true,
      width: 100,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: convertDay,
      width: 160,
    },
  ];

  const rowSelection: TableRowSelection<FlashSale> = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.is_active === false,
    }),
  };

  const toolbarActions = useMemo<ToolbarAction[]>(() => {
    const actions: ToolbarAction[] = [
      {
        key: "create",
        label: "Create",
        onClick: () => navigate("/flash-sales/create"),
        type: "primary",
      },
    ];
    if (canEdit) {
      actions.push({
        key: "edit",
        label: "Edit",
        onClick: handleEdit,
      });
    }
    if (hasSelection) {
      actions.push({
        key: "bulk-delete",
        label: `Delete (${selectedRowKeys.length})`,
        danger: true,
        onClick: handleBulkDelete,
      });
    }

    return actions;
  }, [
    hasSelection,
    selectedRowKeys.length,
    handleBulkDelete,
    navigate,
    canEdit,
    handleEdit,
  ]);

  return {
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
    selectedRowKeys,
  };
};
export default useTableData;
