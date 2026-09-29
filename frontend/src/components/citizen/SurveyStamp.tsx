import React, { useEffect, useState } from 'react';
import { useLang } from '../../i18n/useLang';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export type StatusLevel = 'SAFE' | 'WATCH' | 'DANGER';

interface SurveyStampProps {
  status: StatusLevel;
  frameTimestep: number;
}

// Scramble alphabet strictly limited to characters in SAFE, WATCH, DANGER
const SCRAMBLE_CHARS = 'SAFEWATCHDNGR';

let sessionDecryptPlayed = false;

export const SurveyStamp: React.FC<SurveyStampProps> = ({ status, frameTimestep }) => {
  const { lang, t } = useLang();
  const reducedMotion = useReducedMotion();

  const isHindi = lang === 'hi';
  const statusWord = isHindi
    ? status === 'SAFE'
      ? t('statusSafe')
      : status === 'WATCH'
      ? t('statusWatch')
      : t('statusDanger')
    : status;

  const [displayText, setDisplayText] = useState(statusWord);
  const [clipReveal, setClipReveal] = useState(false);

  // Time issued string
  const [issuedTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (reducedMotion || sessionDecryptPlayed) {
      setDisplayText(statusWord);
      setClipReveal(true);
      return;
    }

    sessionDecryptPlayed = true;

    if (isHindi) {
      // Stepped clip-path reveal for Devanagari
      setDisplayText(statusWord);
      const timer = setTimeout(() => {
        setClipReveal(true);
      }, 50);
      return () => clearTimeout(timer);
    }

    // English sequential left-to-right scramble decrypt
    const targetLength = statusWord.length;
    const maxIterations = 8;
    let iteration = 0;

    const interval = setInterval(() => {
      let output = '';
      const resolvedChars = Math.floor((iteration / maxIterations) * targetLength);

      for (let i = 0; i < targetLength; i++) {
        if (i < resolvedChars) {
          output += statusWord[i];
        } else {
          output += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }

      setDisplayText(output);
      iteration++;

      if (iteration > maxIterations) {
        setDisplayText(statusWord);
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [status, isHindi, reducedMotion, statusWord]);

  // Color mapping
  const colorHex =
    status === 'DANGER' ? '#E2461F' : status === 'WATCH' ? '#E0A526' : '#6E8B74';

  return (
    <div className="flex flex-col items-center my-4 select-none">
      {/* Rotated -2deg Stamp Container */}
      <div
        className="relative bg-gauge-panel px-6 py-4 border-2 border-rule flex flex-col items-center justify-center transition-transform"
        style={{
          transform: 'rotate(-2deg)',
          boxShadow: 'inset 0 0 0 2px #11171A, inset 0 0 0 3px #2E3B40',
        }}
      >
        {/* Registration tick marks at corners */}
        <span className="absolute top-1 left-1.5 font-mono text-[10px] text-secondary pointer-events-none">┼</span>
        <span className="absolute top-1 right-1.5 font-mono text-[10px] text-secondary pointer-events-none">┼</span>
        <span className="absolute bottom-1 left-1.5 font-mono text-[10px] text-secondary pointer-events-none">┼</span>
        <span className="absolute bottom-1 right-1.5 font-mono text-[10px] text-secondary pointer-events-none">┼</span>

        {/* Word + Shape Row */}
        <div className="flex items-center gap-4">
          {/* Status Shape: SAFE=Square, WATCH=Triangle, DANGER=Diamond */}
          <div className="shrink-0">
            {status === 'SAFE' && (
              <svg width="28" height="28" viewBox="0 0 28 28">
                <rect x="3" y="3" width="22" height="22" fill={colorHex} stroke="#11171A" strokeWidth="2" />
              </svg>
            )}
            {status === 'WATCH' && (
              <svg width="30" height="28" viewBox="0 0 30 28">
                <polygon points="15,2 29,26 1,26" fill={colorHex} stroke="#11171A" strokeWidth="2" strokeLinejoin="miter" />
              </svg>
            )}
            {status === 'DANGER' && (
              <svg width="28" height="28" viewBox="0 0 28 28">
                <polygon points="14,1 27,14 14,27 1,14" fill={colorHex} stroke="#11171A" strokeWidth="2" strokeLinejoin="miter" />
              </svg>
            )}
          </div>

          {/* Status Word */}
          <div
            className={`tracking-tight uppercase leading-none ${
              isHindi ? 'font-devanagari font-extrabold text-[46px]' : 'font-display font-extrabold text-[76px]'
            }`}
            style={{
              color: colorHex,
              clipPath: isHindi && !clipReveal && !reducedMotion ? 'inset(0 100% 0 0)' : 'none',
              transition: isHindi ? 'clip-path 400ms steps(6)' : 'none',
            }}
          >
            {displayText}
          </div>
        </div>

        {/* Mono Caption Line */}
        <div className="mt-2 pt-1 border-t border-rule/60 w-full text-center font-mono text-scale-13 text-secondary tracking-wider">
          {t('issuedAt')} {issuedTime} · {t('frame')} T+{String(frameTimestep).padStart(3, '0')} MIN
        </div>
      </div>
    </div>
  );
};
