"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import FilterSidebar from "./FilterSidebar";
import ProductList from "./ProductList";

export interface CategoryFilters {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  mallOnly: boolean;
  discountedOnly: boolean;
  inStock: boolean;
  attributeFilters: Record<string, string[]>;
}

const EMPTY_FILTERS: CategoryFilters = {
  mallOnly: false,
  discountedOnly: false,
  inStock: false,
  attributeFilters: {},
};

interface CategoryCatalogProps {
  categoryId: string;
}

const CategoryCatalog = ({ categoryId }: CategoryCatalogProps) => {
  const [filters, setFilters] = useState<CategoryFilters>(EMPTY_FILTERS);
  const pathname = usePathname();
  const router = useRouter();

  const applyFilters = (nextFilters: CategoryFilters) => {
    setFilters(nextFilters);
    router.replace(pathname);
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[190px_minmax(0,1fr)]">
      <FilterSidebar
        categoryId={categoryId}
        filters={filters}
        onApplyFilters={applyFilters}
      />
      <ProductList categoryId={categoryId} filters={filters} />
    </div>
  );
};

export default CategoryCatalog;
