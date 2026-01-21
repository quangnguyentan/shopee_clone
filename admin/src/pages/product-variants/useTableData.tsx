import { useGetAllProductVariantsQuery } from "@/common/api/product-variant.api";
import type { ProductVariant } from "@/common/types/product-variant.type";
import { convertDay } from "@/common/utils/convertDay";
import { EditOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type ToolbarAction = {
  key: string;
  label: string;
  onClick?: () => void;
  url?: string;
  danger?: boolean;
};

const useTableData = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const navigate = useNavigate();

  const {
    data: productVariantsData,
    isLoading,
    isFetching,
  } = useGetAllProductVariantsQuery();
  const products = productVariantsData?.items ?? [];
  const total = productVariantsData?.total ?? 0;

  const hasSelection = selectedRowKeys.length > 0;

  const handleEdit = useCallback(
    (record: ProductVariant) => {
      navigate(`/product-variants/${record.id}/edit`);
    },
    [navigate],
  );

  const handleBulkDelete = useCallback(() => {
    console.log("Delete products:", selectedRowKeys);
  }, [selectedRowKeys]);

  const columns = useMemo(
    () => [
      {
        title: "Product Name",
        dataIndex: "name",
        searchable: true,
        render: (_: unknown, record: ProductVariant) => record.product.name,
      },
      {
        width: 200,
        title: "Options",
        searchable: true,
        render: (_: unknown, record: ProductVariant) => (
          <div className="flex flex-col gap-2">
            {record.options.map((option) => (
              <span>
                {option.option_name}: {option.option_value}
              </span>
            ))}
          </div>
        ),
      },
      {
        title: "SKU",
        dataIndex: "sku",
        searchable: true,
        sorter: (a: A, b: A) => a.sku - b.sku,
        width: 300,
      },
      {
        title: "Stock",
        dataIndex: "stock",
        searchable: true,
        sorter: (a: A, b: A) => a.stock - b.stock,
      },
      {
        title: "Price",
        dataIndex: "price",
        searchable: true,
        sorter: (a: A, b: A) => a.price - b.price,
      },
      {
        title: "Created time",
        dataIndex: "created_at",
        searchable: true,
        render: (value: string) => convertDay(value),
      },
      {
        title: "Actions",
        key: "actions",
        fixed: "right",
        width: 120,
        render: (_: unknown, record: ProductVariant) => (
          <Space>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Space>
        ),
      },
    ],
    [handleEdit],
  );

  const rowSelection: TableRowSelection<ProductVariant> = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.stock === 0,
    }),
  };

  const toolbarActions = useMemo<ToolbarAction[]>(() => {
    const actions: ToolbarAction[] = [
      {
        key: "create",
        label: "Create",
        onClick: () => navigate("/product-variants/create"),
      },
    ];

    if (hasSelection) {
      actions.push({
        key: "bulk-delete",
        label: `Delete (${selectedRowKeys.length})`,
        danger: true,
        onClick: handleBulkDelete,
      });
    }

    return actions;
  }, [hasSelection, selectedRowKeys.length, handleBulkDelete, navigate]);

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
