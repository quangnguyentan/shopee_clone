import { useGetAllVariantOptionsQuery } from "@/common/api/variant-option.api";
import type { VariantOption } from "@/common/types/variant-option.type";
import { convertDay } from "@/common/utils/convertDay";
import type { TableRowSelection } from "antd/es/table/interface";
import { useCallback, useMemo, useState } from "react";

type ToolbarAction = {
  key: string;
  label: string;
  onClick?: () => void;
  url?: string;
  danger?: boolean;
};

const useTableData = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const {
    data: productsData,
    isLoading,
    isFetching,
  } = useGetAllVariantOptionsQuery();
  const products = productsData?.items ?? [];
  const total = productsData?.total ?? 0;

  const hasSelection = selectedRowKeys.length > 0;

  const handleBulkDelete = useCallback(() => {
    console.log("Delete products:", selectedRowKeys);
  }, [selectedRowKeys]);

  const columns = useMemo(
    () => [
      {
        title: "Product Name",
        dataIndex: "product.name",
        searchable: true,
        render: (_: unknown, record: VariantOption) =>
          record.variant.product.name,
      },
      { title: "Option name", dataIndex: "option_name", searchable: true },
      {
        title: "Option value",
        dataIndex: "option_value",
        searchable: true,
        sorter: (a: A, b: A) => a.option_value - b.option_value,
      },
      {
        title: "Variant VKU",
        dataIndex: "variant.sku",
        searchable: true,
        sorter: (a: A, b: A) => a.price_max - b.price_max,
        render: (_: unknown, record: VariantOption) => record.variant.sku,
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

  const rowSelection: TableRowSelection<VariantOption> = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
  };

  const toolbarActions = useMemo<ToolbarAction[]>(() => {
    const actions: ToolbarAction[] = [];

    if (hasSelection) {
      actions.push({
        key: "bulk-delete",
        label: `Delete (${selectedRowKeys.length})`,
        danger: true,
        onClick: handleBulkDelete,
      });
    }

    return actions;
  }, [hasSelection, selectedRowKeys.length, handleBulkDelete]);

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
