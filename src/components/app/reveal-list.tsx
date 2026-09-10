"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/utils/motion";

export function RevealList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer(0.05)}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}
