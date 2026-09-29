import React, { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface Spark {
  id: number;
  x: number;
  y: number;
}

export const SparkContainer: React.FC<{
  sparks: Spark[];
  onComplete: (id: number) => void;
}> = ({ sparks, onComplete }) => {
  const reducedMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 pointer-events-none z-[100000] overflow-hidden">
      {sparks.map((spark) => (
        <SingleSpark
          key={spark.id}
          x={spark.x}
          y={spark.y}
          reducedMotion={reducedMotion}
          onDone={() => onComplete(spark.id)}
        />
      ))}
    </div>
  );
};

const SingleSpark: React.FC<{
  x: number;
  y: number;
  reducedMotion: boolean;
  onDone: () => void;
}> = ({ x, y, reducedMotion, onDone }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      onDone();
      return;
    }

    const start = performance.now();
    const duration = 400; // 400ms animation

    let frameId: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);

      if (p < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        onDone();
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [reducedMotion, onDone]);

  if (reducedMotion) return null;

  // 8 radiating ink lines
  const angles = [0, 45, 90, 135, 180, 225, 270, 315];
  const innerR = 4 + progress * 8;
  const outerR = 12 + progress * 24;
  const opacity = 1 - Math.pow(progress, 1.5);

  return (
    <svg
      style={{
        position: 'absolute',
        left: x - 40,
        top: y - 40,
        width: 80,
        height: 80,
        overflow: 'visible',
      }}
    >
      {angles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 40 + innerR * Math.cos(rad);
        const y1 = 40 + innerR * Math.sin(rad);
        const x2 = 40 + outerR * Math.cos(rad);
        const y2 = 40 + outerR * Math.sin(rad);

        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#1E2723"
            strokeWidth="2"
            strokeLinecap="square"
            strokeOpacity={opacity}
          />
        );
      })}
    </svg>
  );
};

export function useSpark() {
  const [sparks, setSparks] = useState<Spark[]>([]);

  const fireSpark = (e?: React.MouseEvent | { clientX: number; clientY: number }) => {
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    const newSpark: Spark = {
      id: Date.now() + Math.random(),
      x,
      y,
    };
    setSparks((prev) => [...prev, newSpark]);
  };

  const handleSparkComplete = (id: number) => {
    setSparks((prev) => prev.filter((s) => s.id !== id));
  };

  return {
    sparks,
    fireSpark,
    handleSparkComplete,
  };
}
