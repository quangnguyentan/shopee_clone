import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/src/components/shared/CarouselList";
import { CategoryItem } from "./CategoryItem";
import { CategorySkeleton } from "./CategorySkeleton";
import { chunkArray } from "../hooks/useChunkArray";
import { useGetAllCategoriesQuery } from "@/src/common/api/category.api";
import { useMemo } from "react";

const ITEMS_PER_PAGE = 20;
const Categories = () => {
  const { data: categories, isLoading } =
    useGetAllCategoriesQuery();
  const filteredCategories = useMemo(() => {
    return categories?.items?.filter((category) => !category.parent) ?? [];
  }, [categories]);
  const pages = categories
    ? chunkArray(filteredCategories, ITEMS_PER_PAGE)
    : [];
  return (
    <Carousel
      opts={{
        align: "start",
        containScroll: false,
        dragFree: true,
        skipSnaps: true,
        slidesToScroll: 3,
      }}
      className="w-full"
    >
      <CarouselContent className="!p-0">
        {isLoading
          ? Array.from({ length: 2 }).map((_, pageIndex) => (
              <CarouselItem key={pageIndex} className="p-0">
                <div className="grid grid-cols-10 grid-rows-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <CategorySkeleton key={i} />
                  ))}
                </div>
              </CarouselItem>
            ))
          : pages.map((page, pageIndex) => (
              <CarouselItem key={pageIndex} className="!p-0">
                <div className="grid grid-cols-10 grid-rows-2">
                  {page.map((category) => (
                    <CategoryItem key={category.id} category={category} />
                  ))}
                </div>
              </CarouselItem>
            ))}
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default Categories;
