'use client';
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: () => void;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   'bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-accent-hover)] border border-[var(--color-accent)]',
  secondary: 'bg-transparent border border-[var(--color-text)] text-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)]',
  ghost:     'bg-transparent text-[var(--color-text)] hover:text-[var(--color-accent)] border border-transparent hover:border-[var(--color-accent)]',
};

export function Button({ variant = 'primary', children, className = '', type = 'button', disabled, onClick }: ButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`px-8 py-4 font-medium text-sm tracking-widest uppercase transition-all duration-300 ease-out disabled:opacity-50 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
