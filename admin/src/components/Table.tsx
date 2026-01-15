import { useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnType } from "antd";
import { Button, Input, Space, Table } from "antd";
import type { FilterDropdownProps } from "antd/es/table/interface";
import Highlighter from "react-highlight-words";

type KeyOf<T> = Extract<keyof T, string>;

interface GenericTableProps<T extends object> {
  data: T[];
  columns: Array<{
    title: string;
    dataIndex: KeyOf<T>;
    searchable?: boolean;
    sorter?: (a: T, b: T) => number;
    width?: string | number;
  }>;
  rowKey: KeyOf<T>;
}

function GenericTable<T extends object>({
  data,
  columns,
  rowKey,
}: GenericTableProps<T>) {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: string
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters?: () => void) => {
    clearFilters?.();
    setSearchText("");
  };

  const getSearchProps = (dataIndex: KeyOf<T>): TableColumnType<T> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<SearchOutlined />}
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
          >
            Search
          </Button>
          <Button size="small" onClick={() => handleReset(clearFilters)}>
            Reset
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      String(record[dataIndex])
        .toLowerCase()
        .includes(String(value).toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={String(text ?? "")}
        />
      ) : (
        text
      ),
  });

  const antdColumns: TableColumnType<T>[] = columns.map((col) => ({
    title: col.title,
    dataIndex: col.dataIndex,
    key: col.dataIndex,
    width: col.width,
    sorter: col.sorter,
    ...(col.searchable ? getSearchProps(col.dataIndex) : {}),
  }));

  return <Table<T> rowKey={rowKey} columns={antdColumns} dataSource={data} />;
}

export default GenericTable;
