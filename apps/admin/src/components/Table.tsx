import { useMemo, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import type { InputRef, TableColumnType } from "antd";
import { Button, Input, Space, Table } from "antd";
import type {
  FilterDropdownProps,
  TableRowSelection,
} from "antd/es/table/interface";
import Highlighter from "react-highlight-words";

type KeyOf<T> = Extract<keyof T, string>;

export interface GenericTableColumn<T> {
  title: string;
  dataIndex: KeyOf<T>;
  searchable?: boolean;
  sorter?: (a: T, b: T) => number;
  width?: string | number;
  render?: TableColumnType<T>["render"];
}

interface GenericTableProps<T extends object> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number, limit: number) => void;

  columns: GenericTableColumn<T>[];
  rowKey: KeyOf<T>;
  rowSelection?: TableRowSelection<T>;
}

function GenericTable<T extends object>({
  data,
  total,
  page,
  limit,
  onPageChange,
  columns,
  rowKey,
  rowSelection,
}: GenericTableProps<T>) {
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState<string>("");

  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps["confirm"],
    dataIndex: string,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters?: () => void) => {
    clearFilters?.();
    setSearchText("");
  };

  const getSearchProps = (
    dataIndex: KeyOf<T>,
    customRender?: TableColumnType<T>["render"],
  ): TableColumnType<T> => ({
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

    render: (text, record, index) => {
      const renderedValue = customRender
        ? customRender(text, record, index)
        : text;

      return searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={String(renderedValue ?? "")}
        />
      ) : (
        renderedValue
      );
    },
  });

  const antdColumns: TableColumnType<T>[] = columns.map((col) => ({
    title: col.title,
    dataIndex: col.dataIndex,
    key: col.dataIndex,
    width: col.width ?? 150,
    sorter: col.sorter,
    ...(col.searchable
      ? getSearchProps(col.dataIndex, col.render)
      : { render: col.render }),
  }));

  const tableWidth = useMemo(() => {
    return columns.reduce(
      (total, col) => total + (typeof col.width === "number" ? col.width : 150),
      0,
    );
  }, [columns]);
  return (
    <Table<T>
      rowKey={rowKey}
      columns={antdColumns}
      dataSource={data}
      rowSelection={rowSelection}
      scroll={{
        x: tableWidth,
      }}
      pagination={{
        current: page,
        pageSize: limit,
        total,
        showSizeChanger: true,
        onChange: onPageChange,
      }}
    />
  );
}

export default GenericTable;
