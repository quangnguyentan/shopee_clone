"use client";

import { useEffect, useMemo, useState } from "react";
import flash_sale from "@/src/assest/flash_sale.png";
import { TimeBox } from "./TimeBox";
import { Colon } from "./Colon";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/src/components/shared/CarouselList";
import { Card, CardContent } from "@/src/components/ui/card";
import phone from "@/src/assest/phone.jpg";
import mall from "@/src/assest/mall.png";
import shop_mall_voucher from "@/src/assest/shop_mall_voucher.png";
import Image from "next/image";
import {
  BsLightningFill,
  IoIosArrowForward,
} from "@/src/components/shared/Icon";
import {
  useGetActiveFlashSaleQuery,
  useGetFlashSaleItemsQuery,
} from "@/src/common/api/flash-sale.api";
import { getAssetUrl } from "@/src/lib/assets";

const FlashSale = () => {
  const { data: flashSale } = useGetActiveFlashSaleQuery();

  const flashSaleId = flashSale?.id;

  const { data: items = [] } = useGetFlashSaleItemsQuery(flashSaleId!, {
    skip: !flashSaleId,
  });
  console.log(items, "items");
  const [time, setTime] = useState(() => {
    const END_TIME = flashSale ? Date.now() + flashSale.countdown : null;
    return END_TIME ? END_TIME - Date.now() : 0;
  });

  useEffect(() => {
    if (!flashSale) return;

    const END_TIME = Date.now() + flashSale.countdown;
    const id = setInterval(() => {
      const diff = END_TIME - Date.now();
      setTime(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(id);
  }, [flashSale]);

  const h = Math.floor(time / 3600000);
  const m = Math.floor((time / 60000) % 60);
  const s = Math.floor((time / 1000) % 60);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3 pt-4">
            <div
              className="bg-no-repeat bg-center"
              style={{
                width: 130,
                height: 30,
                backgroundImage: `url(${flash_sale.src})`,
                backgroundSize: "130px 30px",
              }}
            />

            <div className="flex items-center gap-1">
              <TimeBox value={pad(h)} />
              <Colon />
              <TimeBox value={pad(m)} />
              <Colon />
              <TimeBox value={pad(s)} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1 text-red-secondary cursor-pointer">
            <span className="text-sm">Xem Tất Cả</span>
            <IoIosArrowForward size={14} />
          </div>
        </div>
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
            {items?.map((item, index) => (
              <CarouselItem key={index} className="basis-1/5 !p-0">
                <div className="grid grid-rows-1 h-full">
                  {[0].map((row) => (
                    <Card
                      key={row}
                      className="border-none p-0 shadow-none h-72"
                    >
                      <CardContent
                        className="flex items-center justify-center h-full p-0 w-full flex-col gap-4 hover:shadow-lg cursor-pointer"
                        onClick={() => {
                          console.log(
                            item?.product_variant?.product?.images?.filter(
                              (i: A) => i?.is_primary,
                            ),
                          );
                        }}
                      >
                        <div className="w-[90%] h-44 relative">
                          <Image
                            src={
                              item?.product_variant?.product?.images?.find(
                                (i: A) => i?.is_primary,
                              )?.url ?? "/placeholder.png"
                            }
                            alt={
                              item?.product_variant?.product?.name ??
                              "product image"
                            }
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 90%"
                            priority={false}
                          />
                          <div className="absolute top-0 right-0 bg-yellow-primary text-lightning flex items-center gap-1 rounded-bl-md">
                            <BsLightningFill size={14} />
                            <span className="text-sm font-semibold">
                              ${item?.discount_percent}%
                            </span>
                          </div>
                          <div className="absolute top-4 left-0 w-full h-full">
                            <Image
                              src={mall}
                              alt="mall"
                              className="object-cover w-6 h-5"
                            />
                          </div>
                          <div className="absolute bottom-0 w-full h-full">
                            <Image
                              src={shop_mall_voucher}
                              alt="shop_mall_voucher"
                              className="w-full h-full"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 w-[70%] flex items-center justify-center flex-col">
                          <strong className="text-red-primary text-xl font-normal flex gap-0.5">
                            {item?.flash_price.toLocaleString()}
                            <span className="">₫</span>
                          </strong>
                          <div className="h-4 relative w-full flex items-center justify-center">
                            <span className="absolute top-0 left-0 w-full z-30 text-xs text-white font-semibold flex items-center justify-center">
                              ĐANG BÁN CHẠY
                            </span>
                            <div className="h-4 bg-linear-sale absolute top-0 left-0 w-[20%] z-20 rounded-lg"></div>
                            <div className="h-4 bg-red-tertiary absolute top-0 left-0 w-full z-10 rounded-lg"></div>
                          </div>
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
      </div>
    </div>
  );
};

export default FlashSale;
