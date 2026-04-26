"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAnimation = useCallback(() => {
    const word = words[words.indexOf(currentWord) + 1] || words[0];
    setCurrentWord(word);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    intervalRef.current = setInterval(startAnimation, duration);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAnimation, duration]);

  return (
    <AnimatePresence mode="wait" onExitComplete={() => setIsAnimating(false)}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className={cn("inline-block", className)}
        key={currentWord}
      >
        {currentWord}
      </motion.div>
    </AnimatePresence>
  );
};
