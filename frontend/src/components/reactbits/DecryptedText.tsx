import { useEffect, useState } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  className?: string;
  characters?: string;
  revealDirection?: 'start' | 'end' | 'center';
}

const GLYPHS = '0123456789ABCDEF-+/._#';

export const DecryptedText = ({
  text,
  speed = 35,
  maxIterations = 10,
  className = '',
  characters = GLYPHS,
}: DecryptedTextProps) => {
  const [displayText, setDisplayText] = useState<string>(text);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const targetLength = text.length;

    const interval = setInterval(() => {
      iteration++;

      setDisplayText(() => {
        const revealedCount = Math.floor((iteration / maxIterations) * targetLength);
        return text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < revealedCount) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('');
      });

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, maxIterations, characters]);

  return <span className={`font-mono ${className}`}>{displayText}</span>;
};
