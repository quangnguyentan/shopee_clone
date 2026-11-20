import FilterSidebar from '@/src/features/category/FilterSidebar';
import ProductList from '@/src/features/category/ProductList';
import { notFound } from 'next/navigation';

// Định nghĩa kiểu dữ liệu cho props, bao gồm tham số động từ URL
interface PageProps {
    params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { category } = await params;

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