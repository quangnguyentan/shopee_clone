import GenericTable from "../../components/Table";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
}

const products: Product[] = [
  { id: "p1", name: "iPhone", price: 1000, category: "Phone" },
  { id: "p2", name: "MacBook", price: 2000, category: "Laptop" },
];

export const Table = () => {
  return (
    <GenericTable<Product>
      rowKey="id"
      data={products}
      columns={[
        {
          title: "Product Name",
          dataIndex: "name",
          searchable: true,
        },
        {
          title: "Price",
          dataIndex: "price",
          searchable: true,
          sorter: (a, b) => a.price - b.price,
        },
        {
          title: "Category",
          dataIndex: "category",
          searchable: true,
        },
      ]}
    />
  );
};
