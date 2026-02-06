import { useGetFlashSaleByIdQuery } from "@/common/api/flash-sale.api";
import type { FlashSaleItem } from "@/common/types/flash-sale-items.type";
import { convertDay } from "@/common/utils/convertDay";
import type { ToolbarAction } from "@/common/utils/mixins";
import type { TableRowSelection } from "antd/es/table/interface";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const useTableData = () => {
  const { flashSaleId } = useParams<{ flashSaleId: string }>();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const onPageChange = (p: number, l: number) => {
    setPage(p);
    setLimit(l);
  };
  const navigate = useNavigate();

  const {
    data: flashSaleItems,
    isLoading,
    isFetching,
  } = useGetFlashSaleByIdQuery(Number(flashSaleId), {
    skip: !flashSaleId,
  });

  const data = flashSaleItems?.items ?? [];
  const total = flashSaleItems?.items?.length ?? 0;

  const hasSelection = selectedRowKeys.length > 0;
  const canEdit = selectedRowKeys.length === 1;

  const handleEdit = useCallback(() => {
    if (!canEdit) return;
    navigate(`/flash-sales/${flashSaleId}/items/${selectedRowKeys[0]}/edit`);
  }, [canEdit, selectedRowKeys, flashSaleId, navigate]);

  const handleBulkDelete = useCallback(() => {
    console.log("Delete flash sale items:", selectedRowKeys);
  }, [selectedRowKeys]);

  const columns = useMemo(
    () => [
      {
        title: "Product",
        key: "product",
        render: (_: unknown, record: FlashSaleItem) => {
          const product = record.product_variant.product;

          return (
            <div className="flex items-center gap-3">
              <span className="line-clamp-1">{product.name}</span>
            </div>
          );
        },
      },
      {
        title: "Variant",
        dataIndex: ["product_variant", "sku"],
        width: 300,
      },
      {
        title: "Original Price",
        width: 140,
        render: (_: unknown, record: FlashSaleItem) =>
          record.product_variant.price.toLocaleString(),
      },
      {
        title: "Flash Price",
        dataIndex: "flash_price",
        width: 140,
        render: (v: number) => v.toLocaleString(),
      },
      {
        title: "Discount",
        dataIndex: "discount_percent",
        width: 100,
        render: (v: number) => `-${v}%`,
      },
      {
        title: "Stock",
        dataIndex: "stock",
        width: 90,
      },
      {
        title: "Sold",
        dataIndex: "sold",
        width: 90,
      },
      {
        title: "Active",
        dataIndex: "is_active",
        width: 90,
        render: (v: boolean) => (v ? "Yes" : "No"),
      },
      {
        title: "Created",
        dataIndex: "created_at",
        width: 160,
        render: convertDay,
      },
    ],
    [],
  );

  const rowSelection: TableRowSelection<FlashSaleItem> = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  const toolbarActions = useMemo<ToolbarAction[]>(() => {
    const actions: ToolbarAction[] = [
      {
        key: "add",
        label: "Add",
        type: "primary",
        onClick: () => navigate(`/flash-sales/${flashSaleId}/items/create`),
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
        key: "delete",
        label: `Remove (${selectedRowKeys.length})`,
        danger: true,
        onClick: handleBulkDelete,
      });
    }

    return actions;
  }, [
    canEdit,
    hasSelection,
    selectedRowKeys.length,
    handleEdit,
    navigate,
    flashSaleId,
    handleBulkDelete,
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
