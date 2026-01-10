"use client";

import { useRef, useState, useEffect } from "react";
import { Digit } from "./Digit";

interface TimeBoxProps {
  value: string;
}

export const TimeBox = ({ value }: TimeBoxProps) => {
  const prev = useRef(value);

  const [keys, setKeys] = useState<string[]>(
    value.split("").map((d, i) => `${d}-${i}`)
  );

  useEffect(() => {
    setKeys((oldKeys) =>
      value.split("").map((digit, i) => {
        if (i === 1 && prev.current[i] !== digit)
          return `${digit}-${i}-${Date.now()}`;
        if (i === 0 && prev.current[1] === "0" && prev.current[0] !== digit)
          return `${digit}-${i}-${Date.now()}`;
        return oldKeys[i];
      })
    );

    prev.current = value;
  }, [value]);

  return (
    <div className="flex overflow-hidden rounded-sm bg-black px-1 py-[2px]">
      {value.split("").map((d, i) => (
        <Digit key={keys[i]} value={d} />
      ))}
    </div>
  );
};
