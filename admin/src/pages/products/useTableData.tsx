import { useGetAllProductQuery } from "@/common/api/product.api";
import type { Product } from "@/common/types/product.type";
import { getAssetUrl } from "@/common/utils/assets";
import { convertDay } from "@/common/utils/convertDay";
import { Image } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type ToolbarAction = {
  key: string;
  label: string;
  onClick?: () => void;
  url?: string;
  danger?: boolean;
  type?: "primary" | "default";
};

const useTableData = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();

  const { data: productsData, isLoading, isFetching } = useGetAllProductQuery();
  const products = productsData?.items ?? [];
  const total = productsData?.total ?? 0;

  const hasSelection = selectedRowKeys.length > 0;
  const canEdit = selectedRowKeys.length === 1;
  const handleEdit = useCallback(() => {
    if (selectedRowKeys.length !== 1) return;

    const productId = selectedRowKeys[0];
    navigate(`/products/${productId}/edit`);
  }, [selectedRowKeys, navigate]);

  const handleBulkDelete = useCallback(() => {
    console.log("Delete products:", selectedRowKeys);
  }, [selectedRowKeys]);

  const columns = useMemo(
    () => [
      {
        title: "Product Name",
        dataIndex: "name",
        searchable: true,
        width: 350,
      },
      {
        width: 200,
        title: "Shop Name",
        searchable: true,
        render: (_: unknown, record: Product) => record.shop.name,
      },
      {
        width: 200,
        title: "Primary Image",
        render: (_: unknown, record: Product) =>
          record?.images?.map((img) =>
            img.is_primary ? (
              <Image
                key={img.id}
                src={getAssetUrl(img.url)}
                alt="Primary"
                width={64}
                height={64}
                style={{
                  objectFit: "cover",
                  borderRadius: 8,
                }}
                preview
              />
            ) : null,
          ),
      },
      {
        width: 200,
        title: "Price Min",
        dataIndex: "price_min",
        searchable: true,
        sorter: (a: A, b: A) => a.price_min - b.price_min,
      },
      {
        width: 200,
        title: "Price Max",
        dataIndex: "price_max",
        searchable: true,
        sorter: (a: A, b: A) => a.price_max - b.price_max,
      },
      {
        width: 200,
        title: "Stock",
        dataIndex: "stock",
        searchable: true,
      },
      {
        width: 200,
        title: "Status",
        dataIndex: "status",
        searchable: true,
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

  const rowSelection: TableRowSelection<Product> = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status === "inactive",
    }),
  };

  const toolbarActions = useMemo<ToolbarAction[]>(() => {
    const actions: ToolbarAction[] = [
      {
        key: "create",
        label: "Create",
        onClick: () => navigate("/products/create"),
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
