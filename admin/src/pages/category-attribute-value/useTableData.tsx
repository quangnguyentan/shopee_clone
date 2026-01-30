import { useParams, useNavigate } from "react-router-dom";
import { useGetCategoryAttributeValueByAttributeIdQuery } from "@/common/api/category-attribute-value.api";
import type { CategoryAttributeValue } from "@/common/types/category-attribute-value.type";
import { useCallback, useMemo, useState } from "react";
import type { TableRowSelection } from "antd/es/table/interface";
import type { ToolbarAction } from "@/common/utils/mixins";
import { convertDay } from "@/common/utils/convertDay";

const useTableData = () => {
  const { attributeId } = useParams();
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { data, isLoading, isFetching } =
    useGetCategoryAttributeValueByAttributeIdQuery({
      attributeId: Number(attributeId),
    });
  const canEdit = selectedRowKeys.length === 1;
  const handleEdit = useCallback(() => {
    if (selectedRowKeys.length !== 1) return;

    const attributeValueId = selectedRowKeys[0];
    navigate(
      `/category-attributes/${attributeId}/values/${attributeValueId}/edit`,
    );
  }, [selectedRowKeys, navigate, attributeId]);

  const items = data ?? [];

  const columns = useMemo(
    () => [
      {
        title: "Value",
        dataIndex: "value",
        searchable: true,
      },
      {
        title: "Created at",
        dataIndex: "created_at",
        searchable: true,
        render: (value: string) => convertDay(value),
      },
    ],
    [],
  );

  const rowSelection: TableRowSelection<CategoryAttributeValue> = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  const toolbarActions = useMemo<ToolbarAction[]>(() => {
    const actions: ToolbarAction[] = [
      {
        key: "create",
        label: "Add value",
        type: "primary",
        onClick: () =>
          navigate(`/category-attributes/${attributeId}/values/create`),
      },
    ];
    if (canEdit) {
      actions.push({
        key: "edit",
        label: "Edit Value",
        onClick: handleEdit,
      });
    }
    return actions;
  }, [navigate, attributeId, canEdit, handleEdit]);

  return {
    columns,
    items,
    isLoading,
    isFetching,
    rowSelection,
    toolbarActions,
  };
};

export default useTableData;
