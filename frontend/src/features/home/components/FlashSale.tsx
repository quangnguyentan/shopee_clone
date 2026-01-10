"use client";

import { useEffect, useState } from "react";
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
import Image from "next/image";
const END_TIME = Date.now() + 120 * 60 * 1000;

const FlashSale = () => {
  const data = Array.from({ length: 120 });

  const [time, setTime] = useState(() => END_TIME - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const diff = END_TIME - Date.now();
      setTime(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  const h = Math.floor(time / 3600000);
  const m = Math.floor((time / 60000) % 60);
  const s = Math.floor((time / 1000) % 60);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 px-4 pt-4">
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
      <div>
        <Carousel
          opts={{
            align: "start",
            containScroll: "trimSnaps",
            slidesToScroll: 4,
          }}
          className="w-full"
        >
          <CarouselContent>
            {data.map((_, index) => (
              <CarouselItem key={index} className="basis-1/5 !p-0">
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
                        <div className="w-[90%] h-44">
                          <Image
                            src={phone}
                            alt="phone"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-2 w-[70%] flex items-center justify-center flex-col">
                          <strong className="text-red-primary text-xl font-normal flex gap-0.5">
                            9.000
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
