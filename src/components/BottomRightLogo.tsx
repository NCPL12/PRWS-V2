"use client";

import React from "react";
import Image from "next/image"; 

interface BottomRightLogoProps {
  src?: string;
  alt?: string;
  height?: number; 
  className?: string;
}

const BottomRightLogo: React.FC<BottomRightLogoProps> = ({
  src = "/assets/logo.png",
  alt = "Company Logo",
  height = 20, // equivalent to h-10
  className = "",
}) => {
  return (
    <div className="fixed bottom-7 right-9 z-50">
      <Image
        src={src}
        alt={alt}
        height={height}
        width={height * 2} // maintain aspect ratio like w-auto
        className={`opacity-80 hover:opacity-100 transition-opacity ${className}`}
        priority
      />
    </div>
  );
};

export default BottomRightLogo;
