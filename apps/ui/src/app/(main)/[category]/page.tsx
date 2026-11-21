import FilterSidebar from '@/src/features/category/FilterSidebar';
import ProductList from '@/src/features/category/ProductList';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { category } = await params;
    const match = category.match(/-cat\.(\d+)$/);
    if (!match) {
        notFound();
    }
    const categoryId = match[1];
    if (!category) {
        notFound();
    }

    return (
        <div className="container mx-auto">


            <div className="grid grid-cols-4 gap-4">
                <FilterSidebar />
                <ProductList />
            </div>
        </div>
    );
}