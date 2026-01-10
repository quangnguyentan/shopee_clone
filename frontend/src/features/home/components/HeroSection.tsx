"use client";
import Image from "next/image";
import img1 from "@/src/assest/sc.image-up.webp";
import img2 from "@/src/assest/sc.image-down.webp";
import slider_image1 from "@/src/assest/slider_image.webp";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/src/components/shared/CarouselSection";
import Autoplay from "embla-carousel-autoplay";
const HeroSection = () => {
  return (
    <section className="flex items-center justify-center h-[235px]">
      <div className="flex-6 ">
        <Carousel
          opts={{
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
        >
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index}>
                <div>
                  <Card className="!border-none !p-0 m-0!">
                    <CardContent className="w-full !px-0">
                      <Image
                        src={slider_image1}
                        alt="section_image"
                        className="rounded-l-sm"
                      />
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious aria-orientation="horizontal" />
          <CarouselNext aria-orientation="horizontal" />
          <CarouselDots />
        </Carousel>
      </div>
      <div className="flex-3">
        <Image src={img1} alt="section_image" className="rounded-r-sm" />
        <Image src={img2} alt="section_image" className="rounded-r-sm" />
      </div>
    </section>
  );
};

export default HeroSection;
