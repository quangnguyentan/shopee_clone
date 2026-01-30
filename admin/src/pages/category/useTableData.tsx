import { useGetAllCategoriesQuery } from "@/common/api/category.api";
import type { Category } from "@/common/types/category.type";
import { convertDay } from "@/common/utils/convertDay";
import type { ToolbarAction } from "@/common/utils/mixins";
import type { TableRowSelection } from "antd/es/table/interface";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const useTableData = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();
  const { data, isLoading, isFetching } = useGetAllCategoriesQuery();
  const categories = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasSelection = selectedRowKeys.length > 0;

  const canEdit = selectedRowKeys.length === 1;
  const handleEdit = useCallback(() => {
    if (selectedRowKeys.length !== 1) return;

    const productId = selectedRowKeys[0];
    navigate(`/categories/${productId}/edit`);
  }, [selectedRowKeys, navigate]);

  const handleBulkDelete = useCallback(() => {
    console.log("Delete categories:", selectedRowKeys);
  }, [selectedRowKeys]);

  const columns = useMemo(
    () => [
      {
        title: "Category Name",
        dataIndex: "name",
        searchable: true,
      },
      {
        title: "Category Parent",
        dataIndex: "parent",
        searchable: true,
        render: (_: unknown, record: Category) =>
          record?.parent ? record?.parent.name : "N/A",
      },
      {
        title: "Category children",
        dataIndex: "category.childrent",
        searchable: true,
        render: (_: unknown, record: Category) => {
          return record?.children?.length
            ? record?.children?.map((c, index) => (
                <span key={index}>{c?.name}</span>
              ))
            : "N/A";
        },
      },
      {
        title: "Attributes",
        dataIndex: "category.attributes",
        searchable: true,
        sorter: (a: A, b: A) => a.price_max - b.price_max,
        render: (_: unknown, record: Category) =>
          record?.attributes?.map((a) => <p key={a.id}>{a?.name}</p>),
        width: 250,
      },
      {
        title: "Created time",
        dataIndex: "created_at",
        searchable: true,
        render: (value: string) => convertDay(value),
      },
    ],
    [],
  );

  const rowSelection: TableRowSelection<Category> = {
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
        onClick: () => navigate("/categories/create"),
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
    categories,
    total,
    isLoading,
    isFetching,
    toolbarActions,
    rowSelection,
    selectedRowKeys,
  };
};
export default useTableData;
