'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

interface NumberFlowProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
  format?: (value: number) => string;
}

export const NumberFlow = ({ value, className, style, format }: NumberFlowProps) => {
  const spring = useSpring(value, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const display = useTransform(spring, (current) => {
    const rounded = Math.round(current);
    return format ? format(rounded) : rounded.toLocaleString();
  });

  return (
    <motion.span className={className} style={style}>
      {display}
    </motion.span>
  );
};
