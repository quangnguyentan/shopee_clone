import { useGetAllCategoryAttributesQuery } from "@/common/api/category-attribute.api";
import type { CategoryAttribute } from "@/common/types/category-attribute.type";
import { convertDay } from "@/common/utils/convertDay";
import type { ToolbarAction } from "@/common/utils/mixins";
import { Button } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const useTableData = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();
  const { data, isLoading, isFetching } = useGetAllCategoryAttributesQuery();
  const categoryAttribute = data?.items ?? [];
  const total = data?.total ?? 0;

  const hasSelection = selectedRowKeys.length > 0;

  const canEdit = selectedRowKeys.length === 1;
  const handleEdit = useCallback(() => {
    if (selectedRowKeys.length !== 1) return;

    const productId = selectedRowKeys[0];
    navigate(`/categoryAttributes/${productId}/edit`);
  }, [selectedRowKeys, navigate]);

  const handleBulkDelete = useCallback(() => {
    console.log("Delete categoryAttributes:", selectedRowKeys);
  }, [selectedRowKeys]);

  const columns = useMemo(
    () => [
      {
        title: "Category Name",
        dataIndex: "categoryAttribute.name",
        searchable: true,
        render: (_: unknown, record: CategoryAttribute) =>
          record?.category?.name,
      },
      {
        title: "Attribute name",
        dataIndex: "name",
        searchable: true,
      },
      {
        title: "Type",
        dataIndex: "type",
        searchable: true,
      },
      {
        title: "Allow Custom",
        dataIndex: "allow_custom",
        searchable: true,
        render: (_: unknown, record: CategoryAttribute) =>
          record.allow_custom ? "Yes" : "No",
      },
      {
        title: "Order Index",
        dataIndex: "order_index",
        searchable: true,
      },
      {
        title: "Values",
        key: "values",
        render: (_: unknown, record: CategoryAttribute) => (
          <Button
            type="link"
            onClick={() => navigate(`/category-attributes/${record.id}/values`)}
          >
            Manage values
          </Button>
        ),
      },
      {
        title: "Created time",
        dataIndex: "created_at",
        searchable: true,
        render: (value: string) => convertDay(value),
      },
    ],
    [navigate],
  );

  const rowSelection: TableRowSelection<CategoryAttribute> = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
  };

  const toolbarActions = useMemo<ToolbarAction[]>(() => {
    const actions: ToolbarAction[] = [
      {
        key: "create",
        label: "Create",
        onClick: () => navigate("/categoryAttributes/create"),
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
    categoryAttribute,
    total,
    isLoading,
    isFetching,
    toolbarActions,
    rowSelection,
    selectedRowKeys,
  };
};
export default useTableData;
