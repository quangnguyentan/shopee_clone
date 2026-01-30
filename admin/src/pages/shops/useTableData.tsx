import { useGetAllShopsQuery } from "@/common/api/shop.api";
import type { Shop } from "@/common/types/shop.type";
import { convertDay } from "@/common/utils/convertDay";
import type { ToolbarAction } from "@/common/utils/mixins";
import type { TableRowSelection } from "antd/es/table/interface";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const useTableData = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();

  const { data: shopsData, isLoading, isFetching } = useGetAllShopsQuery();
  const products = shopsData?.items ?? [];
  const total = shopsData?.total ?? 0;

  const hasSelection = selectedRowKeys.length > 0;

  const canEdit = selectedRowKeys.length === 1;
  const handleEdit = useCallback(() => {
    if (selectedRowKeys.length !== 1) return;

    const productId = selectedRowKeys[0];
    navigate(`/shops/${productId}/edit`);
  }, [selectedRowKeys, navigate]);

  const handleBulkDelete = useCallback(() => {
    console.log("Delete shops:", selectedRowKeys);
  }, [selectedRowKeys]);

  const columns = useMemo(
    () => [
      {
        title: "Shop Name",
        dataIndex: "name",
        searchable: true,
      },
      {
        title: "Total Products",
        dataIndex: "name",
        render: (_: unknown, record: Shop) => record.products.length,
        searchable: true,
        sorter: (a: A, b: A) => a.products.length - b.products.length,
        width: 200,
      },
      {
        title: "Owner",
        dataIndex: "owner",
        searchable: true,
        render: (_: unknown, record: Shop) => record.user.name,
      },
      {
        width: 300,
        title: "Description",
        dataIndex: "description",
        render: (value: string) => (
          <span className="line-clamp-1">{value}</span>
        ),
      },
      {
        title: "Rating",
        dataIndex: "rating",
        searchable: true,
        sorter: (a: A, b: A) => a.rating - b.rating,
      },
      {
        title: "Status",
        dataIndex: "is_active",
        render: (value: boolean) => (value ? "Active" : "Inactive"),
      },
      {
        width: 200,
        title: "Created time",
        dataIndex: "created_at",
        searchable: true,
        render: (value: string) => convertDay(value),
      },
    ],
    [],
  );

  const rowSelection: TableRowSelection<Shop> = {
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
        onClick: () => navigate("/shops/create"),
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
    products,
    total,
    isLoading,
    isFetching,
    toolbarActions,
    rowSelection,
    selectedRowKeys,
  };
};
export default useTableData;
