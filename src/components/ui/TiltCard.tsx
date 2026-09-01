'use client';

import React, { useRef, useState, useCallback } from 'react';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt angle in degrees (default: 5)
  glareColor?: string; // Optional custom glare color
}

export function TiltCard({
  children,
  className = '',
  maxTilt = 5,
  glareColor = 'rgba(16, 185, 129, 0.15)',
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState({
    transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
    transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
  });
  const [glareStyle, setGlareStyle] = useState({
    opacity: 0,
    background: `radial-gradient(circle at 50% 50%, ${glareColor} 0%, rgba(255, 255, 255, 0.2) 25%, transparent 70%)`,
    transition: 'opacity 0.4s ease-out',
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      setTiltStyle({
        transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`,
        transition: 'transform 0.08s ease-out',
      });

      setGlareStyle({
        opacity: 1,
        background: `radial-gradient(circle at ${glareX.toFixed(1)}% ${glareY.toFixed(1)}%, ${glareColor} 0%, rgba(255, 255, 255, 0.3) 25%, transparent 65%)`,
        transition: 'opacity 0.15s ease-out',
      });
    },
    [maxTilt, glareColor]
  );

  const handleMouseLeave = useCallback(() => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
    setGlareStyle({
      opacity: 0,
      background: `radial-gradient(circle at 50% 50%, ${glareColor} 0%, rgba(255, 255, 255, 0.2) 25%, transparent 70%)`,
      transition: 'opacity 0.5s ease-out',
    });
  }, [glareColor]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...tiltStyle,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
      className={`relative rounded-3xl overflow-hidden ${className}`}
      {...props}
    >
      {/* Interactive Glare / Light Reflection Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-30 mix-blend-overlay rounded-3xl"
        style={glareStyle}
      />
      {children}
    </div>
  );
}

export default TiltCard;
