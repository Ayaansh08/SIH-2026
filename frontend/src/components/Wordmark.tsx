import React from 'react';
import { Link } from 'react-router-dom';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  asLink?: boolean;
  to?: string;
  className?: string;
}

export const Wordmark: React.FC<WordmarkProps> = ({
  size = 'md',
  asLink = true,
  to = '/',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    hero: 'text-[clamp(64px,9vw,140px)]',
  }[size];

  const boxSize = {
    sm: 14,
    md: 18,
    lg: 24,
    hero: 54,
  }[size];

  const strokeW = size === 'hero' ? 3.5 : size === 'lg' ? 2 : 1.5;

  const content = (
    <span
      className={`font-display font-extrabold tracking-tight uppercase leading-none inline-flex items-center gap-1.5 select-none ${sizeClasses} ${className}`}
    >
      <span>PRAVAH</span>
      <span className="inline-flex items-center justify-center shrink-0">
        <svg
          width={boxSize}
          height={boxSize}
          viewBox="0 0 24 24"
          fill="none"
          className="inline-block"
          aria-hidden="true"
        >
          {/* Hard-edged boundary square */}
          <rect
            x="2"
            y="2"
            width="20"
            height="20"
            stroke="currentColor"
            strokeWidth={strokeW}
          />
          {/* Survey diagonal crosshair */}
          <line
            x1="5"
            y1="5"
            x2="19"
            y2="19"
            stroke="currentColor"
            strokeWidth={strokeW}
            strokeLinecap="square"
          />
          <line
            x1="19"
            y1="5"
            x2="5"
            y2="19"
            stroke="currentColor"
            strokeWidth={strokeW}
            strokeLinecap="square"
          />
        </svg>
      </span>
    </span>
  );

  if (asLink) {
    return (
      <Link
        to={to}
        className="inline-flex items-center text-current hover:opacity-85 transition-opacity no-underline"
      >
        {content}
      </Link>
    );
  }

  return content;
};
