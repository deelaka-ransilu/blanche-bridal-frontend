"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export const ParallaxScroll = ({
  images,
  className,
}: {
  images: string[];
  className?: string;
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  // Use the PAGE scroll instead of the container scroll
  // This removes the need for overflow-y-auto and the scrollbar disappears
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"],
  });

  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -120]);

  const third = Math.ceil(images.length / 3);
  const firstPart = images.slice(0, third);
  const secondPart = images.slice(third, 2 * third);
  const thirdPart = images.slice(2 * third);

  return (
    <div ref={gridRef} className={cn("w-full overflow-hidden", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start max-w-5xl mx-auto gap-6 py-8 px-4">
        <div className="grid gap-6">
          {firstPart.map((el, idx) => (
            <motion.div style={{ y: translateFirst }} key={idx}>
              <Image
                src={el}
                className="h-72 w-full object-cover object-top rounded-xl"
                height={400}
                width={400}
                alt="bridal gown"
              />
            </motion.div>
          ))}
        </div>
        <div className="grid gap-6">
          {secondPart.map((el, idx) => (
            <motion.div style={{ y: translateSecond }} key={idx}>
              <Image
                src={el}
                className="h-72 w-full object-cover object-top rounded-xl"
                height={400}
                width={400}
                alt="bridal gown"
              />
            </motion.div>
          ))}
        </div>
        <div className="grid gap-6">
          {thirdPart.map((el, idx) => (
            <motion.div style={{ y: translateThird }} key={idx}>
              <Image
                src={el}
                className="h-72 w-full object-cover object-top rounded-xl"
                height={400}
                width={400}
                alt="bridal gown"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
