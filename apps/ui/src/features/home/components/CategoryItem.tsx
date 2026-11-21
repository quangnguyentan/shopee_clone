import { Category } from "@/src/common/types/category.type";
import { Card, CardContent } from "@/src/components/ui/card";
import Image from "next/image";
import { getAssetUrl } from "@/src/lib/assets";
import { useNavigate } from "@/src/common/constants/navigate.constant";
import { createShopeeSlug } from "@/src/lib/utils";
import Link from "next/link";

export const CategoryItem = ({ category }: { category: Category }) => {
  const imageUrl = getAssetUrl(category.imageUrl ?? undefined);
  const { push } = useNavigate();
  const categoryUrl = createShopeeSlug(
    category.name,
    "cat",
    category.id
  );
  return (
    <Link href={`/${categoryUrl}`}>
      <Card className="border-none shadow-none !p-0">
        <CardContent
          className="flex flex-col items-center justify-center h-40 gap-3 
        border border-gray-100 hover:shadow-md cursor-pointer !p-0"
        >
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={category.name}
                width={80}
                height={80}
                className="object-cover"
                draggable={false}
              />
            ) : null}
          </div>

          <p className="text-sm text-center line-clamp-2 px-1 h-10">
            {category.name}
          </p>
        </CardContent>
      </Card >
    </Link>
  );
};
