import { useGetAllProductVariantAttributesQuery } from "@/common/api/product-variant-attribute.api";
import type { ProductVariantAttribute } from "@/common/types/product-variant-attribute.type";
import { convertDay } from "@/common/utils/convertDay";
import type { ToolbarAction } from "@/common/utils/mixins";
import type { GenericTableColumn } from "@/components/Table";
import type { TableRowSelection } from "antd/es/table/interface";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const useTableData = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();
  const { data, isLoading, isFetching } =
    useGetAllProductVariantAttributesQuery();
  const productsVariantAttribute = data?.items ?? [];
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

  const columns = useMemo<GenericTableColumn<ProductVariantAttribute>[]>(
    () => [
      {
        title: "Product",
        dataIndex: "variant",
        searchable: true,
        render: (_, record) => record.variant.product.name,
      },
      {
        title: "Variant SKU",
        dataIndex: "variant",
        render: (_, record) => record.variant.sku,
        width: 200,
      },
      {
        title: "Attribute",
        dataIndex: "attribute",
        searchable: true,
        render: (_, record) => record.attribute.name,
      },
      {
        title: "Value",
        dataIndex: "value",
        searchable: true,
        render: (_, record) =>
          record.value?.value ?? record.custom_value ?? "-",
      },
      {
        title: "Created at",
        dataIndex: "created_at",
        render: (value: string) => convertDay(value),
      },
    ],
    [],
  );

  const rowSelection: TableRowSelection<ProductVariantAttribute> = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
  };

  const toolbarActions = useMemo<ToolbarAction[]>(() => {
    const actions: ToolbarAction[] = [
      {
        key: "create",
        label: "Add value",
        type: "primary",
        onClick: () => navigate("/categories/create"),
      },
    ];
    if (canEdit) {
      actions.push({
        key: "edit",
        label: "Edit Value",
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
    canEdit,
    handleEdit,
    navigate,
  ]);

  return {
    columns,
    productsVariantAttribute,
    total,
    isLoading,
    isFetching,
    toolbarActions,
    rowSelection,
    selectedRowKeys,
  };
};
export default useTableData;
