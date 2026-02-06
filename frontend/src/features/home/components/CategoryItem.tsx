import { Category } from "@/src/common/types/category.type";
import { Card, CardContent } from "@/src/components/ui/card";
import Image from "next/image";

export const CategoryItem = ({ category }: { category: Category }) => {
  return (
    <Card className="border-none shadow-none !p-0">
      <CardContent
        className="flex flex-col items-center justify-center h-40 gap-3 
        border border-gray-100 hover:shadow-md cursor-pointer !p-0"
      >
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
          <Image
            src={category.imageUrl}
            alt={category.name}
            width={80}
            height={80}
            className="object-cover"
            draggable={false}
          />
        </div>

        <p className="text-sm text-center line-clamp-2 px-1 h-10">
          {category.name}
        </p>
      </CardContent>
    </Card>
  );
};
