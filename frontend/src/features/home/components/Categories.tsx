import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/src/components/shared/CarouselList";
import { Card, CardContent } from "@/src/components/ui/card";
import category_1 from "@/src/assest/category.1.webp";
import Image from "next/image";
import { Skeleton } from "@/src/components/ui/skeleton";
const Categories = () => {
  const data = Array.from({ length: 120 });

  return (
    <Carousel
      opts={{
        align: "start",
        containScroll: "trimSnaps",
        slidesToScroll: 3,
      }}
      className="w-full"
    >
      <CarouselContent>
        {data.map((_, index) => (
          <CarouselItem key={index} className="basis-[10%] !p-0">
            <div className="grid grid-rows-2">
              {[0, 1].map((row) => (
                <Card key={row} className="border-none p-0 shadow-none">
                  <CardContent
                    className="flex items-center justify-center h-40 p-0 w-full flex-col gap-4 border 
                  border-gray-100 hover:shadow-lg cursor-pointer"
                  >
                    <div className="w-20 h-20 rounded-full bg-gray-blackground">
                      <Image
                        src={category_1}
                        alt="category"
                        className="w-20 h-20 object-cover"
                      />
                    </div>
                    <div className="space-y-2 w-[90%] mx-auto flex-col">
                      <Skeleton className="h-2 w-full bg-gray-blackground" />
                      <Skeleton className="h-2 w-full bg-gray-blackground" />
                    </div>
                  </CardContent>
                </Card>
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
