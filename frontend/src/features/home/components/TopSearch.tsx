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

const TopSearch = () => {
  const data = Array.from({ length: 120 });

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
            {data.map((_, index) => (
              <CarouselItem key={index} className="basis-1/6 !p-0">
                <div className="grid grid-rows-1 h-full">
                  {[0].map((row) => (
                    <Card
                      key={row}
                      className="border-none p-0 shadow-none h-72"
                    >
                      <CardContent
                        className="flex items-center justify-center h-full p-0 w-full flex-col gap-4 hover:shadow-lg cursor-pointer"
                        onClick={() => {}}
                      >
                        <div className="w-[90%] h-44 relative">
                          <Image
                            draggable={false}
                            priority
                            src={product_1}
                            alt="product_1"
                            className="w-full h-full object-cover"
                          />
                          <div>
                            <Image
                              src={top_label}
                              className="w-[32px] h-[40px] object-cover absolute top-0 left-0"
                              alt="top_label"
                            />
                          </div>
                          <div className="absolute bottom-0 bg-black-shadow w-full text-center text-sm py-1">
                            <span className="text-white">Bán 83k+ / tháng</span>
                          </div>
                        </div>
                        <span className="text-start w-full px-2 text-lg">
                          Áo thun
                        </span>
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
      </div>
    </div>
  );
};

export default TopSearch;
