import BuyerProductDetail from "@/src/features/product/components/BuyerProductDetail";
import { notFound } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();

  return <BuyerProductDetail productId={id} />;
}
