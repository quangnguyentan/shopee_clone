"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useGetCategoryTreeQuery } from "@/src/common/api/category.api";
import { useGetCategoryAttributeByCategoryQuery } from "@/src/common/api/category-attribute.api";
import { useGetVietnamProvincesQuery } from "@/src/common/api/checkout.api";
import type { Category } from "@/src/common/types/category.type";
import type { CategoryAttribute } from "@/src/common/types/category-attribute.type";
import { createShopeeSlug } from "@/src/lib/utils";
import type { CategoryFilters } from "./CategoryCatalog";

interface FilterSidebarProps {
  categoryId: string;
  filters: CategoryFilters;
  onApplyFilters: (filters: CategoryFilters) => void;
}

const findCategory = (
  categories: Category[],
  categoryId: string,
): Category | undefined => {
  for (const category of categories) {
    if (category.id === categoryId) return category;
    const childMatch = findCategory(category.children ?? [], categoryId);
    if (childMatch) return childMatch;
  }
  return undefined;
};

const findCategoryPath = (
  categories: Category[],
  categoryId: string,
  parents: Category[] = [],
): Category[] => {
  for (const category of categories) {
    const path = [...parents, category];
    if (category.id === categoryId) return path;
    const childPath = findCategoryPath(
      category.children ?? [],
      categoryId,
      path,
    );
    if (childPath.length) return childPath;
  }
  return [];
};

const FilterSidebar = ({
  categoryId,
  filters,
  onApplyFilters,
}: FilterSidebarProps) => {
  const { data: categoryTree = [] } = useGetCategoryTreeQuery();
  const { data: attributes = [] } = useGetCategoryAttributeByCategoryQuery(
    { categoryId: Number(categoryId) },
    { skip: !Number.isInteger(Number(categoryId)) },
  );
  const { data: provinces = [] } = useGetVietnamProvincesQuery();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceError, setPriceError] = useState("");
  const [minRating, setMinRating] = useState<number | undefined>(
    filters.minRating,
  );
  const [mallOnly, setMallOnly] = useState(filters.mallOnly);
  const [discountedOnly, setDiscountedOnly] = useState(filters.discountedOnly);
  const [inStock, setInStock] = useState(filters.inStock);
  const [provinceCodes, setProvinceCodes] = useState(filters.provinceCodes);
  const [showAllProvinces, setShowAllProvinces] = useState(false);
  const [attributeFilters, setAttributeFilters] = useState<
    Record<string, string[]>
  >(filters.attributeFilters);
  const category = useMemo(
    () => findCategory(categoryTree, categoryId),
    [categoryTree, categoryId],
  );
  const categoryPath = useMemo(
    () => findCategoryPath(categoryTree, categoryId),
    [categoryTree, categoryId],
  );
  const visibleProvinces = showAllProvinces
    ? provinces
    : provinces.slice(0, 5);

  const toggleProvince = (code: number) => {
    setProvinceCodes((current) =>
      current.includes(code)
        ? current.filter((value) => value !== code)
        : [...current, code],
    );
  };

  const toggleAttributeValue = (
    attribute: CategoryAttribute,
    valueId: string,
  ) => {
    setAttributeFilters((current) => {
      const selected = current[attribute.id] ?? [];
      const next = selected.includes(valueId)
        ? selected.filter((id) => id !== valueId)
        : [...selected, valueId];
      return { ...current, [attribute.id]: next };
    });
  };

  const applyFilters = () => {
    const min = minPrice === "" ? undefined : Number(minPrice);
    const max = maxPrice === "" ? undefined : Number(maxPrice);
    if (
      (min !== undefined && (!Number.isFinite(min) || min < 0)) ||
      (max !== undefined && (!Number.isFinite(max) || max < 0))
    ) {
      setPriceError("Giá phải lớn hơn hoặc bằng 0");
      return;
    }
    if (min !== undefined && max !== undefined && min > max) {
      setPriceError("Giá tối thiểu không thể lớn hơn giá tối đa");
      return;
    }
    setPriceError("");
    onApplyFilters({
      minPrice: min,
      maxPrice: max,
      minRating,
      mallOnly,
      discountedOnly,
      inStock,
      provinceCodes,
      attributeFilters: Object.fromEntries(
        Object.entries(attributeFilters).filter(([, values]) => values.length),
      ),
    });
  };

  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setPriceError("");
    setMinRating(undefined);
    setMallOnly(false);
    setDiscountedOnly(false);
    setInStock(false);
    setProvinceCodes([]);
    setAttributeFilters({});
    onApplyFilters({
      mallOnly: false,
      discountedOnly: false,
      inStock: false,
      provinceCodes: [],
      attributeFilters: {},
    });
  };

  return (
    <aside className="space-y-5 rounded-sm bg-white px-4 py-4 text-sm text-gray-800">
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <span aria-hidden="true">☷</span>
          Tất cả danh mục
        </h2>
        {categoryPath.slice(0, -1).map((ancestor) => (
          <Link
            key={ancestor.id}
            href={`/${createShopeeSlug(ancestor.name, "cat", ancestor.id)}`}
            className="mb-2 block text-gray-600 hover:text-red-primary"
          >
            ‹ {ancestor.name}
          </Link>
        ))}
        <div className="space-y-2 border-l border-gray-200 pl-3">
          <span className="block font-medium text-red-primary">
            {category?.name ?? "Danh mục"}
          </span>
          {category?.children?.map((child) => (
            <Link
              key={child.id}
              href={`/${createShopeeSlug(child.name, "cat", child.id)}`}
              className="block leading-5 text-gray-600 hover:text-red-primary"
            >
              {child.name}
            </Link>
          ))}
        </div>
      </section>

      <div className="border-t border-gray-100" />

      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <span aria-hidden="true">▤</span>
          Bộ lọc tìm kiếm
        </h2>
        <h3 className="mb-2">Khoảng giá</h3>
        <div className="flex items-center gap-2">
          <input
            aria-label="Giá tối thiểu"
            type="number"
            min="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            placeholder="₫ TỪ"
            className="min-w-0 w-1/2 rounded-sm border border-gray-300 px-2 py-2 text-xs outline-none focus:border-red-primary"
          />
          <span className="text-gray-400">–</span>
          <input
            aria-label="Giá tối đa"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="₫ ĐẾN"
            className="min-w-0 w-1/2 rounded-sm border border-gray-300 px-2 py-2 text-xs outline-none focus:border-red-primary"
          />
        </div>
        {priceError && (
          <p className="mt-2 text-xs text-red-primary">{priceError}</p>
        )}
        <button
          type="button"
          onClick={applyFilters}
          className="mt-3 w-full rounded-sm bg-red-primary py-2 text-xs font-medium uppercase text-white hover:bg-red-600"
        >
          Áp dụng
        </button>
      </section>

      <div className="border-t border-gray-100" />

      <section>
        <h3 className="mb-2 font-medium">Nơi bán</h3>
        <div className="space-y-2">
          {visibleProvinces.map((province) => (
            <label
              key={province.code}
              className="flex cursor-pointer items-center gap-2 text-gray-600"
            >
              <input
                type="checkbox"
                checked={provinceCodes.includes(province.code)}
                onChange={() => toggleProvince(province.code)}
                className="accent-red-primary"
              />
              <span>{province.name}</span>
            </label>
          ))}
        </div>
        {provinces.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAllProvinces((current) => !current)}
            className="mt-2 text-xs text-gray-500 hover:text-red-primary"
          >
            {showAllProvinces ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </section>

      <div className="border-t border-gray-100" />

      {attributes.map((attribute) => (
        <section key={attribute.id}>
          <h3 className="mb-2 font-medium">{attribute.name}</h3>
          <div className="space-y-2">
            {attribute.values?.map((value) => (
              <label
                key={value.id}
                className="flex cursor-pointer items-center gap-2 text-gray-600"
              >
                <input
                  type="checkbox"
                  checked={(attributeFilters[attribute.id] ?? []).includes(
                    value.id,
                  )}
                  onChange={() => toggleAttributeValue(attribute, value.id)}
                  className="accent-red-primary"
                />
                {value.value}
              </label>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h3 className="mb-2 font-medium">Loại shop</h3>
        <label className="flex cursor-pointer items-center gap-2 text-gray-600">
          <input
            type="checkbox"
            checked={mallOnly}
            onChange={(event) => setMallOnly(event.target.checked)}
            className="accent-red-primary"
          />
          Shopee Mall
        </label>
      </section>

      <section>
        <h3 className="mb-2 font-medium">Tình trạng sản phẩm</h3>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(event) => setInStock(event.target.checked)}
              className="accent-red-primary"
            />
            Còn hàng
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              checked={discountedOnly}
              onChange={(event) => setDiscountedOnly(event.target.checked)}
              className="accent-red-primary"
            />
            Đang giảm giá
          </label>
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-medium">Đánh giá</h3>
        {[5, 4, 3, 2].map((rating) => (
          <label
            key={rating}
            className="mb-1 flex cursor-pointer items-center gap-2 text-amber-500"
          >
            <input
              type="radio"
              name="minimum-rating"
              checked={minRating === rating}
              onChange={() => setMinRating(rating)}
              className="accent-red-primary"
            />
            <span aria-label={`${rating} sao trở lên`}>
              {"★".repeat(rating)}
              {"☆".repeat(5 - rating)}
            </span>
            <span className="text-gray-600">trở lên</span>
          </label>
        ))}
      </section>

      <div className="space-y-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={applyFilters}
          className="w-full rounded-sm bg-red-primary py-2 text-xs font-medium uppercase text-white hover:bg-red-600"
        >
          Áp dụng
        </button>
        <button
          type="button"
          onClick={resetFilters}
          className="w-full rounded-sm border border-gray-300 py-2 text-xs font-medium uppercase text-gray-600 hover:bg-gray-50"
        >
          Xóa tất cả
        </button>
      </div>
    </aside>
  );
};

export default FilterSidebar;
