"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/src/components/shared/CarouselList";
import { Card, CardContent } from "@/src/components/ui/card";
import truck from "@/src/assest/truck.png";
import shield from "@/src/assest/shield.png";
import return_image from "@/src/assest/return.png";
import deal_banner from "@/src/assest/deal-banner.jpg";
import { IoIosArrowForward } from "@/src/components/shared/Icon";
import Image from "next/image";
import { useGetShopeeMallActiveQuery } from "@/src/common/api/shop.api";
import { getAssetUrl } from "@/src/lib/assets";
import { chunkArray } from "../hooks/useChunkArray";

const ShopeeMall = () => {
  const { data: shops = [] } = useGetShopeeMallActiveQuery(16);
  const pages = chunkArray(shops, 8);

  return (
    <div className="flex flex-col gap-2 px-2 bg-white">
      <div className="flex items-center gap-6 px-4 pt-4">
        <h3 className="text-red-secondary font-medium text-lg">SHOPEE MALL</h3>

        <div className="flex items-center gap-4 text-sm text-gray-700">
          <span className="flex items-center gap-1">
            <Image src={return_image} alt="" className="w-4 h-4" />
            15 ngày trả hàng
          </span>
          <span className="flex items-center gap-1">
            <Image src={shield} alt="" className="w-4 h-4" />
            Chính hãng 100%
          </span>
          <span className="flex items-center gap-1">
            <Image src={truck} alt="" className="w-4 h-4" />
            Free ship
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2 text-red-secondary cursor-pointer">
          <span className="text-sm">Xem Tất Cả</span>
          <IoIosArrowForward size={14} />
        </div>
      </div>

      <div className="flex h-[460px]">
        <div className="w-1/3 h-full">
          <Image
            src={deal_banner}
            alt="deal_banner"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="h-full w-2/3">
          <Carousel
            className="h-full"
            opts={{
              align: "start",
              slidesToScroll: 1,
            }}
          >
            <CarouselContent className="h-full">
              {pages.map((page, pageIndex) => (
                <CarouselItem
                  key={`page-${pageIndex}`}
                  className="h-full !basis-full !p-0"
                >
                  <div className="grid h-full grid-cols-4 grid-rows-2 gap-2 p-2">
                    {page.map((shop) => (
                      <Card
                        key={shop.id}
                        className="min-w-0 cursor-pointer gap-0 border-none p-0 shadow-none hover:shadow-md"
                      >
                        <CardContent className="flex h-full flex-col items-center gap-1 p-1">
                          <div className="relative h-[170px] w-full overflow-hidden rounded-sm bg-white">
                            <Image
                              src={getAssetUrl(shop.logo) ?? ""}
                              alt={shop.name}
                              fill
                              sizes="16vw"
                              className="object-contain"
                            />
                          </div>
                          <span
                            className="line-clamp-2 min-h-10 text-center text-base leading-5 text-red-primary"
                            dangerouslySetInnerHTML={{
                              __html: shop.description ?? "",
                            }}
                          />
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
  );
};

export default ShopeeMall;
