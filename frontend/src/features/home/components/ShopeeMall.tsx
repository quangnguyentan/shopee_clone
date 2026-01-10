"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/src/components/shared/CarouselList";
import { Card, CardContent } from "@/src/components/ui/card";
import product_1 from "@/src/assest/product_1.webp";
import truck from "@/src/assest/truck.png";
import shield from "@/src/assest/shield.png";
import return_image from "@/src/assest/return.png";
import deal_banner from "@/src/assest/deal-banner.jpg";
import { IoIosArrowForward } from "@/src/components/shared/Icon";
import Image from "next/image";
import { cn } from "@/src/lib/utils";

const ShopeeMall = () => {
  const data = Array.from({ length: 120 });
  return (
    <div className="flex flex-col gap-2 px-2">
      <div className="flex items-center gap-6 px-4 pt-4">
        <h3 className="text-red-secondary font-medium text-lg whitespace-nowrap">
          SHOPEE MALL
        </h3>
        <div
          className={cn(
            "relative flex items-center justify-between gap-3 cursor-pointer",
            "after:absolute after:content-[''] after:h-[16px] after:w-0 after:top-[calc(50%-9px)] after:left-[-10px] after:border-l-[1px] after:border-l-gray-tertiary after:border-r-[1px] after:border-r-gray-teborder-l-gray-tertiary"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center gap-1">
              <Image
                src={return_image}
                alt="return"
                className="w-4 h-4 object-cover rounded-full"
              />
              <span>Trả hàng Miễn phí 15 ngày</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Image
                src={shield}
                alt="return"
                className="w-4 h-4 object-cover rounded-full"
              />
              <span>Hàng chính hãng 100%</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <Image
                src={truck}
                alt="return"
                className="w-4 h-4 object-cover rounded-full"
              />
              <span>Miễn phí vận chuyển</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 ml-auto text-red-secondary cursor-pointer">
          <span className="text-sm">Xem Tất Cả</span>
          <div className="w-4 h-4 rounded-full bg-red-secondary flex items-center justify-center">
            <IoIosArrowForward className="text-white" size={14} />
          </div>
        </div>
      </div>
      <div>
        <div className="w-full h-[470px] flex items-center justify-center">
          <div className="w-1/3 h-full">
            <Image
              src={deal_banner}
              alt="deal_banner"
              className="w-full h-full"
            />
          </div>
          <div className="w-2/3 h-full">
            <Carousel
              className="w-full h-full"
              opts={{
                align: "start",
                containScroll: "trimSnaps",
                slidesToScroll: 4,
              }}
            >
              <CarouselContent>
                {data.map((_, index) => (
                  <CarouselItem key={index} className="basis-1/4 !p-0">
                    <div className="grid grid-rows-1 h-full gap-6">
                      {[0, 1].map((row) => (
                        <Card
                          key={row}
                          className="border-none p-0 shadow-none h-full"
                        >
                          <CardContent
                            className="flex items-center justify-center h-full p-0 w-full flex-col gap-0 hover:shadow-lg cursor-pointer"
                            onClick={() => {}}
                          >
                            <div className="w-full h-48">
                              <Image
                                src={product_1}
                                alt="phone"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-[#ee4d2d] text-lg font-normal">
                              Ưu đãi đến 50%
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
      </div>
    </div>
  );
};

export default ShopeeMall;
