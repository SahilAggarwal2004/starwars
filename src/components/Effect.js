/* eslint-disable @next/next/no-img-element */
import React from "react";

export default function Effect({ name, num }) {
  return (
    <div className="relative w-fit max-w-[2vw]">
      <img alt="" src={`images/effects/${name}.webp`} width={20} className="aspect-square" />
      <span className="absolute right-0 -top-1/2 text-white font-semibold text-2xs xs:text-xs">{num > 1 && num}</span>
    </div>
  );
}
