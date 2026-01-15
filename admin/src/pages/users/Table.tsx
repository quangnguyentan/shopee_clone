import GenericTable from "../../components/Table";

interface User {
  id: string;
  name: string;
  age: number;
  address: string;
}

const users: User[] = [
  { id: "1", name: "John Brown", age: 32, address: "New York" },
  { id: "2", name: "Joe Black", age: 42, address: "London" },
];

export const Table = () => {
  return (
    <GenericTable<User>
      rowKey="id"
      data={users}
      columns={[
        {
          title: "Name",
          dataIndex: "name",
          searchable: true,
        },
        {
          title: "Age",
          dataIndex: "age",
          searchable: true,
        },
        {
          title: "Address",
          dataIndex: "address",
          searchable: true,
        },
      ]}
    />
  );
};
