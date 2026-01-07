"use client";
import * as React from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/src/components/ui/hover-card";
import { cn } from "@/src/lib/utils"; // hàm merge className

interface CustomHoverCardProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  openDelay?: number;
  closeDelay?: number;
  classNameContent?: string;
  align?: "start" | "center" | "end"; // fix kiểu
  sideOffset?: number;
}

const CustomHoverCard: React.FC<CustomHoverCardProps> = ({
  trigger,
  content,
  openDelay = 100,
  closeDelay = 100,
  classNameContent,
  align = "end",
  sideOffset = 4,
}) => {
  return (
    <HoverCard openDelay={openDelay} closeDelay={closeDelay}>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground rounded-md border p-4 shadow-md outline-none z-50",
          classNameContent
        )}
      >
        {content}
      </HoverCardContent>
    </HoverCard>
  );
};

export default CustomHoverCard;
