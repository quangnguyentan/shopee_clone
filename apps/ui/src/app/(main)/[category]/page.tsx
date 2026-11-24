import CategoryCatalog from "@/src/features/category/CategoryCatalog";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: encodedCategory } = await params;
  const category = decodeURIComponent(encodedCategory);
  const match = category.match(/-cat\.(\d+)$/);
  if (!match) {
    notFound();
  }
  const categoryId = match[1];
  if (!category) {
    notFound();
  }
  const categoryName = category.replace(/-cat\.\d+$/, "").replace(/-/g, " ");

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-5 sm:px-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex items-center gap-2 text-xs text-gray-500"
      >
        <span>Shopee</span>
        <span aria-hidden="true">&gt;</span>
        <span className="text-gray-700">{categoryName}</span>
      </nav>

      <CategoryCatalog categoryId={categoryId} />
    </div>
  );
}
