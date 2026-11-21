import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
} from "@/common/api/user.api";
import type { User } from "@/common/types/user.type";
import { convertDay } from "@/common/utils/convertDay";
import type { TableRowSelection } from "antd/es/table/interface";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Modal } from "antd";

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const navigate = useNavigate();
  const onPageChange = (p: number, l: number) => {
    setPage(p);
    setLimit(l);
  };

  const { data: userData, isLoading, isFetching } = useGetAllUsersQuery({
    page,
    limit,
  });
  const [deleteUser] = useDeleteUserMutation();
  const data = userData?.items ?? [];
  const total = userData?.total ?? 0;

  const hasSelection = selectedRowKeys.length > 0;
  const canEdit = selectedRowKeys.length === 1;
  const handleEdit = useCallback(() => {
    if (selectedRowKeys.length !== 1) return;

    const userId = selectedRowKeys[0];
    navigate(`/users/${userId}/edit`);
  }, [selectedRowKeys, navigate]);

  const handleBulkDelete = useCallback(() => {
    Modal.confirm({
      title: `Delete ${selectedRowKeys.length} buyer account(s)?`,
      content: "Seller accounts must be suspended rather than deleted.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((key) => deleteUser(String(key)).unwrap()),
          );
          setSelectedRowKeys([]);
          message.success("Buyer accounts deleted");
        } catch {
          message.error("Could not delete the selected accounts");
        }
      },
    });
  }, [deleteUser, selectedRowKeys]);

  const columns = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        searchable: true,
        sorter: (a: A, b: A) => a.name.localeCompare(b.name),
      },

      {
        width: 300,
        title: "Email",
        dataIndex: "email",
        searchable: true,
        sorter: (a: A, b: A) => a.email.localeCompare(b.email),
      },
      {
        width: 200,
        title: "Phone",
        dataIndex: "phone",
        searchable: true,
        sorter: (a: A, b: A) => (a.phone ?? "").localeCompare(b.phone ?? ""),
        render: (value: string) => value || "N/A",
      },
      {
        width: 200,
        title: "Role",
        dataIndex: "role",
        searchable: true,
        sorter: (a: A, b: A) => a.role.localeCompare(b.role),
      },
      {
        width: 160,
        title: "Status",
        dataIndex: "status",
        searchable: true,
        render: (value: string) => value.toLowerCase(),
      },
      {
        width: 200,
        title: "Two Factor Enabled",
        dataIndex: "two_factor_enabled",
        searchable: true,
        render: (value: boolean) => (value ? "Yes" : "No"),
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

  const rowSelection: TableRowSelection<User> = {
    selectedRowKeys,
    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.role !== "buyer",
    }),
  };

  const toolbarActions = useMemo<ToolbarAction[]>(() => {
    const actions: ToolbarAction[] = [
      {
        key: "create",
        label: "Create",
        onClick: () => navigate("/users/create"),
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
