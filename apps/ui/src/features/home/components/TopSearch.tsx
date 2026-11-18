"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/src/components/shared/CarouselList";
import { Card, CardContent } from "@/src/components/ui/card";
import product_1 from "@/src/assest/product_1.jpg";
import top_label from "@/src/assest/top_label.png";
import { IoIosArrowForward } from "@/src/components/shared/Icon";

import Image from "next/image";
import { useGetTopSearchProductsTodayQuery } from "@/src/common/api/product.api";
import { formatSold } from "@/src/common/helper/formatSold";

const TopSearch = () => {
  const { data = [] } = useGetTopSearchProductsTodayQuery();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <h3 className="text-red-secondary font-medium text-lg">
          TÌM KIẾM HÀNG ĐẦU
        </h3>
        <div className="flex items-center justify-center gap-1 text-red-secondary cursor-pointer">
          <span className="text-sm">Xem Tất Cả</span>
          <IoIosArrowForward size={14} />
        </div>
      </div>
      <div>
        <Carousel
          opts={{
            align: "start",
            containScroll: false,
            dragFree: true,
            skipSnaps: true,
            slidesToScroll: 4,
          }}
          className="w-full"
        >
          <CarouselContent>
            {data.map((item) => (
              <CarouselItem key={item.id} className="basis-1/6 !p-0">
                <Card className="border-none p-0 shadow-none h-72">
                  <CardContent
                    className="flex items-center justify-center h-full p-0 w-full flex-col gap-4 hover:shadow-lg cursor-pointer"
                    onClick={() => {}}
                  >
                    <div className="w-[90%] h-44 relative">
                      <Image
                        draggable={false}
                        src={product_1}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />

                      <Image
                        src={top_label}
                        className="w-[32px] h-[40px] object-cover absolute top-0 left-0"
                        alt="top_label"
                      />

                      <div className="absolute bottom-0 bg-black-shadow w-full text-center text-sm py-1">
                        <span className="text-white">
                          Đã bán {formatSold(item.sold_count)}
                        </span>
                      </div>
                    </div>

                    <span className="text-start w-full px-2 text-lg line-clamp-2">
                      {item.name}
                    </span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
};

export default TopSearch;
