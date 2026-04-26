"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate("span", { opacity: 1 }, { duration: 2, delay: stagger(0.2) });
  }, [animate]);

  return (
    <motion.div ref={scope}>
      <p className={cn("", className)}>
        {wordsArray.map((word, idx) => (
          <motion.span key={idx} className="opacity-0 inline-block mr-2">
            {word}
          </motion.span>
        ))}
      </p>
    </motion.div>
  );
};
