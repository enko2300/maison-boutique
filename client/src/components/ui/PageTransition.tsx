import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect } from 'react';

const variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

export default function PageTransition({ children, pathname }: { children: ReactNode; pathname: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
