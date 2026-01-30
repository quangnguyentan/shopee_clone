import { useGetAllProductImagesQuery } from "@/common/api/product-image.api";
import type { ProductImage } from "@/common/types/product-image.type";
import { getAssetUrl } from "@/common/utils/assets";
import { convertDay } from "@/common/utils/convertDay";
import { Image, Space, Tag } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { useCallback, useMemo, useState } from "react";

type ToolbarAction = {
  key: string;
  label: string;
  onClick?: () => void;
  danger?: boolean;
};

const useTableData = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { data, isLoading, isFetching } = useGetAllProductImagesQuery();

  const images = data?.items ?? [];
  const total = data?.total ?? 0;

  const hasSelection = selectedRowKeys.length > 0;

  const handleBulkDelete = useCallback(() => {
    console.log("Delete images:", selectedRowKeys);
  }, [selectedRowKeys]);

  const columns = useMemo(
    () => [
      {
        title: "Image",
        dataIndex: "url",
        width: 100,
        render: (url: string) => (
          <Image
            src={getAssetUrl(url)}
            width={64}
            height={64}
            style={{
              objectFit: "cover",
              borderRadius: 8,
            }}
            preview
          />
        ),
      },

      {
        title: "Product",
        render: (_: unknown, record: ProductImage) => (
          <Space direction="vertical" size={0}>
            <strong>{record.product.name}</strong>
            <span className="text-xs text-gray-500">
              Product ID: {record.product.id}
            </span>
          </Space>
        ),
      },

      {
        title: "Primary",
        dataIndex: "is_primary",
        align: "center" as const,
        width: 120,
        render: (value: boolean) =>
          value ? (
            <Tag color="gold">Primary</Tag>
          ) : (
            <Tag color="default">Not Primary</Tag>
          ),
      },
      {
        title: "Created At",
        dataIndex: "created_at",
        width: 180,
        render: (value: string) => convertDay(value),
      },
    ],
    [],
  );

  const rowSelection: TableRowSelection<ProductImage> = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
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
    data: images,
    total,
    isLoading,
    isFetching,
    toolbarActions,
    rowSelection,
    selectedRowKeys,
  };
};

export default useTableData;
