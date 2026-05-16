'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SecretButtonProps {
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}

let nextParticleId = 0;

interface Particle {
  id: number;
  angle: number;
  size: number;
}

export function SecretButton({ onClick, className, children }: SecretButtonProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const trigger = useCallback(() => {
    const count = 9;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: nextParticleId++,
      angle: (360 / count) * i + Math.random() * 16 - 8,
      size: Math.random() * 5 + 3,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    const ids = new Set(newParticles.map(p => p.id));
    setTimeout(() => setParticles(prev => prev.filter(p => !ids.has(p.id))), 900);
  }, []);

  useEffect(() => {
    const t1 = setTimeout(trigger, 700);
    const t2 = setTimeout(trigger, 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [trigger]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={trigger}
      className={className}
      style={{ position: 'relative', overflow: 'visible' }}
    >
      {particles.map(p => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: Math.cos((p.angle * Math.PI) / 180) * 30,
            y: Math.sin((p.angle * Math.PI) / 180) * 30,
            scale: 0.1,
          }}
          transition={{ duration: 0.75, ease: 'easeOut' as const }}
          aria-hidden
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: p.size,
            height: p.size,
            marginTop: -p.size / 2,
            marginLeft: -p.size / 2,
            pointerEvents: 'none',
            zIndex: 50,
            background: 'var(--color-accent)',
            clipPath: 'polygon(50% 0%, 55% 45%, 100% 50%, 55% 55%, 50% 100%, 45% 55%, 0% 50%, 45% 45%)',
          }}
        />
      ))}
      {children}
    </button>
  );
}
