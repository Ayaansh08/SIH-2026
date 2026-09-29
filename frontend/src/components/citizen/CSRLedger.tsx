import React, { useState } from 'react';
import type { EvaluatedAsset } from '../../data/assets';
import { formatInr } from '../../data/assets';
import { useLang } from '../../i18n/useLang';
import { Sheet } from '../lightswind/Sheet';
import { useToast } from '../lightswind/Toast';

interface CSRLedgerProps {
  assets: EvaluatedAsset[];
  onPledgeSubmit: (assetId: string, amount: number, e: React.MouseEvent) => void;
  onSelectAsset?: (asset: EvaluatedAsset) => void;
  selectedAssetId?: string;
}

export const CSRLedger: React.FC<CSRLedgerProps> = ({
  assets,
  onPledgeSubmit,
  onSelectAsset,
  selectedAssetId,
}) => {
  const { lang, t } = useLang();
  const isHindi = lang === 'hi';
  const { addToast } = useToast();

  const [sponsorAsset, setSponsorAsset] = useState<EvaluatedAsset | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');

  const handleOpenSponsor = (asset: EvaluatedAsset) => {
    setSponsorAsset(asset);
    const remaining = Math.max(0, asset.costInr - asset.pledgedInr);
    setAmountStr(String(remaining));
    setCompanyName('');
    setEmail('');
    setFormError('');
  };

  const handleConfirmPledge = (e: React.MouseEvent) => {
    if (!sponsorAsset) return;
    if (!companyName.trim()) {
      setFormError('Please enter a corporate or trust name.');
      return;
    }
    const num = Number(amountStr);
    if (isNaN(num) || num <= 0) {
      setFormError('Please enter a valid pledge amount in ₹.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid nodal officer email address.');
      return;
    }

    onPledgeSubmit(sponsorAsset.id, num, e);
    addToast({
      title: 'CSR PLEDGE RECORDED (DEMO)',
      description: `Pledge of ${formatInr(num)} registered for ${sponsorAsset.name}.`,
      type: 'INFO',
    });
    setSponsorAsset(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Protect Intro Banner (Single ruled line on desktop) */}
      <div className="bg-gauge-panel p-3 border-2 border-rule flex items-center justify-between font-mono text-xs text-offwhite">
        <span className="font-bold">
          {t('protectSubheading')}
        </span>
        <span className="hidden sm:inline text-secondary">
          SCHEDULE VII RESILIENCE
        </span>
      </div>

      {/* Desktop Ruled Table (>=1024px) */}
      <div className="hidden xl:block bg-gauge-room border-2 border-rule overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-xs text-offwhite">
          <thead>
            <tr className="bg-gauge-panel border-b-2 border-rule text-offwhite font-bold uppercase">
              <th className="p-3 border-r border-rule">Asset / Reach</th>
              <th className="p-3 border-r border-rule">Exposure</th>
              <th className="p-3 border-r border-rule">Verdict</th>
              <th className="p-3 border-r border-rule">Measure</th>
              <th className="p-3 border-r border-rule">Cost</th>
              <th className="p-3 border-r border-rule">Pledged / Required</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule/50">
            {assets.map((asset) => {
              const isSelected = selectedAssetId === asset.id;
              const isNo = asset.verdict === 'NO';
              const isPartly = asset.verdict === 'PARTLY';

              const verdictLabel = isNo ? 'NO' : isPartly ? 'PARTLY' : 'YES';
              const verdictColor = isNo ? '#E2461F' : isPartly ? '#E0A526' : '#6E8B74';
              const pctPledged = Math.min(100, Math.round((asset.pledgedInr / asset.costInr) * 100));
              const fundingGap = Math.max(0, asset.costInr - asset.pledgedInr);

              return (
                <tr
                  key={asset.id}
                  onClick={() => onSelectAsset && onSelectAsset(asset)}
                  className={`cursor-pointer transition-colors hover:bg-gauge-panel/60 ${
                    isSelected ? 'bg-gauge-panel border-l-4 border-l-lichen' : ''
                  }`}
                >
                  <td className="p-3 border-r border-rule/40">
                    <div className="font-display font-extrabold text-base text-offwhite leading-tight">
                      {isHindi ? asset.nameHi : asset.name}
                    </div>
                    <div className="text-[11px] text-secondary mt-0.5">
                      [{asset.id}] · KM {asset.chainage_km}
                    </div>
                  </td>

                  <td className="p-3 border-r border-rule/40 whitespace-nowrap">
                    {asset.isInundated ? (
                      <span className="text-danger-vermilion font-bold">
                        {asset.modelledDepthM}m DEPTH
                      </span>
                    ) : (
                      <span className="text-lichen font-semibold">
                        T+{asset.arrivalMin}m FLOOD
                      </span>
                    )}
                  </td>

                  <td className="p-3 border-r border-rule/40">
                    <span
                      className="font-display font-extrabold text-sm uppercase px-1.5 py-0.5 border border-current bg-gauge-room inline-block"
                      style={{ color: verdictColor }}
                    >
                      {verdictLabel}
                    </span>
                  </td>

                  <td className="p-3 border-r border-rule/40 max-w-[200px] font-sans text-xs text-offwhite/90">
                    {isHindi ? asset.measureHi : asset.measureEn}
                  </td>

                  <td className="p-3 border-r border-rule/40 whitespace-nowrap font-bold text-offwhite">
                    {formatInr(asset.costInr)}
                  </td>

                  <td className="p-3 border-r border-rule/40 min-w-[160px]">
                    <div className="flex justify-between text-[11px] text-secondary mb-1">
                      <span>{formatInr(asset.pledgedInr)}</span>
                      <span className="font-bold text-offwhite">{pctPledged}%</span>
                    </div>
                    <div className="w-full h-2.5 border border-rule bg-gauge-panel relative overflow-hidden">
                      <div
                        className="h-full bg-lichen"
                        style={{ width: `${pctPledged}%` }}
                      />
                    </div>
                  </td>

                  <td className="p-3 text-right">
                    {!isNo && fundingGap > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSponsor(asset);
                        }}
                        className="px-2.5 py-1 bg-lichen text-gauge-room font-mono font-bold text-xs uppercase hover:bg-lichen/90 border border-lichen transition-colors"
                      >
                        SPONSOR
                      </button>
                    ) : (
                      <span className="text-secondary/50 text-[11px]">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards (<1024px or fallback) */}
      <div className="flex flex-col gap-4 xl:hidden">
        {assets.map((asset) => {
          const isSelected = selectedAssetId === asset.id;
          const isNo = asset.verdict === 'NO';
          const isPartly = asset.verdict === 'PARTLY';
          const isYes = asset.verdict === 'YES';

          const verdictLabel = isNo
            ? t('verdictNo')
            : isPartly
            ? t('verdictPartly')
            : t('verdictYes');

          const verdictColor = isNo ? '#E2461F' : isPartly ? '#E0A526' : '#6E8B74';
          const pctPledged = Math.min(100, Math.round((asset.pledgedInr / asset.costInr) * 100));
          const fundingGap = Math.max(0, asset.costInr - asset.pledgedInr);

          return (
            <div
              key={asset.id}
              onClick={() => onSelectAsset && onSelectAsset(asset)}
              className={`bg-gauge-panel border-2 border-rule p-4 flex flex-col gap-3 transition-colors ${
                isSelected ? 'ring-2 ring-lichen bg-gauge-room' : ''
              }`}
            >
              {/* Asset Card Header */}
              <div className="flex items-start justify-between border-b border-rule/50 pb-2">
                <div className="flex flex-col">
                  <span className="font-mono text-xs text-secondary">
                    [{asset.id}] · KM {asset.chainage_km} · {asset.type}
                  </span>
                  <h3 className="font-display font-extrabold text-2xl text-offwhite leading-tight mt-1">
                    {isHindi ? asset.nameHi : asset.name}
                  </h3>
                </div>

                {/* Verdict Badge Top-Right */}
                <div className="flex items-center gap-1.5 border border-rule bg-gauge-room px-2 py-1 shrink-0 ml-2">
                  {isNo && (
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <polygon points="6,1 11,6 6,11 1,6" fill="#E2461F" stroke="#11171A" strokeWidth="1.5" />
                    </svg>
                  )}
                  {isPartly && (
                    <svg width="12" height="12" viewBox="0 0 12 12">
                      <polygon points="6,1 11,11 1,11" fill="#E0A526" stroke="#11171A" strokeWidth="1.5" />
                    </svg>
                  )}
                  {isYes && (
                    <svg width="10" height="10" viewBox="0 0 10 10">
                      <rect width="10" height="10" fill="#6E8B74" stroke="#11171A" strokeWidth="1.5" />
                    </svg>
                  )}
                  <span
                    className="font-display font-extrabold text-sm uppercase leading-none tracking-tight"
                    style={{ color: verdictColor }}
                  >
                    {verdictLabel}
                  </span>
                </div>
              </div>

              {/* Exposure Detail */}
              <div className="font-mono text-xs flex items-center justify-between text-secondary">
                <span>PROJECTED EXPOSURE:</span>
                {asset.isInundated ? (
                  <span className="text-danger-vermilion font-bold">
                    INUNDATED ({asset.modelledDepthM}m DEPTH)
                  </span>
                ) : (
                  <span className="text-lichen font-bold">
                    T+{asset.arrivalMin}m FLOOD ARRIVAL
                  </span>
                )}
              </div>

              {/* Recommended Measure Panel with 3px lichen left rule */}
              <div className="bg-gauge-room p-3 border border-rule border-l-[3px] border-l-lichen flex flex-col gap-1">
                <span className="font-mono text-[11px] text-secondary font-bold uppercase">
                  {t('measureLabel')}:
                </span>
                <p className="font-sans text-sm text-offwhite font-medium leading-snug">
                  {isHindi ? asset.measureHi : asset.measureEn}
                </p>
              </div>

              {/* Funding Bar with Big Shoulders 32 % Readout */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-baseline justify-between font-mono text-scale-15 text-offwhite">
                  <span>
                    PLEDGED {formatInr(asset.pledgedInr)} / {formatInr(asset.costInr)}
                  </span>
                  <span className="font-display font-extrabold text-3xl text-offwhite leading-none">
                    {pctPledged}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-3.5 border-2 border-rule bg-gauge-room overflow-hidden flex items-center">
                  <div
                    className="h-full transition-all duration-500 ease-out border-r border-rule"
                    style={{
                      width: `${pctPledged}%`,
                      backgroundColor: '#6E8B74',
                      backgroundImage: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 4px,
                        rgba(17, 23, 26, 0.45) 4px,
                        rgba(17, 23, 26, 0.45) 6px
                      )`,
                    }}
                  />

                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 w-[1px] bg-rule pointer-events-none"
                      style={{ left: `${(i + 1) * 10}%` }}
                    />
                  ))}
                </div>

                {/* Multi-line CSR-Eligible Stamp */}
                <div className="w-full mt-2">
                  <div
                    className="survey-stamp text-xs text-secondary border-rule w-full text-center"
                    style={{
                      minWidth: 0,
                      whiteSpace: 'normal',
                      lineHeight: '1.3',
                      display: 'block',
                      padding: '4px 8px',
                    }}
                  >
                    {t('csrTag')}
                  </div>
                </div>

                {/* Sponsor Button Full Width on Mobile */}
                {!isNo && fundingGap > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSponsor(asset);
                    }}
                    className="mt-2 min-h-[44px] w-full py-2.5 bg-lichen text-gauge-room font-mono font-bold text-xs uppercase hover:bg-lichen/90 active:bg-lichen transition-colors border border-lichen"
                  >
                    {t('sponsorButton')}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sponsor Modal Sheet */}
      <Sheet
        isOpen={Boolean(sponsorAsset)}
        onClose={() => setSponsorAsset(null)}
        title={sponsorAsset ? (isHindi ? sponsorAsset.nameHi : sponsorAsset.name) : ''}
        subtitle="CSR SPONSORSHIP PLEDGE"
      >
        {sponsorAsset && (
          <div className="flex flex-col gap-4 font-mono text-scale-13 text-offwhite">
            <div className="bg-gauge-panel border border-rule p-2.5 text-center font-bold text-xs text-watch-amber">
              {t('sponsorDemoNotice')}
            </div>

            <div className="bg-gauge-room p-3 border border-rule flex flex-col gap-1 text-xs">
              <span className="text-secondary">TARGET ASSET:</span>
              <span className="font-bold text-sm text-offwhite">{sponsorAsset.name}</span>
              <span className="text-secondary mt-1">ESTIMATED FUNDING GAP:</span>
              <span className="font-bold text-base text-lichen">
                {formatInr(Math.max(0, sponsorAsset.costInr - sponsorAsset.pledgedInr))}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-secondary">
                  {t('companyName')} *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Teesta Valley Hydro Resilience Trust"
                  className="bg-gauge-room border border-rule p-2 font-mono text-sm text-offwhite focus:outline-none focus:ring-1 focus:ring-lichen placeholder:text-secondary/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-secondary">
                  {t('pledgeAmount')} *
                </label>
                <input
                  type="number"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="bg-gauge-room border border-rule p-2 font-mono text-sm text-offwhite focus:outline-none focus:ring-1 focus:ring-lichen"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-secondary">
                  {t('contactEmail')} *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nodal.officer@company.in"
                  className="bg-gauge-room border border-rule p-2 font-mono text-sm text-offwhite focus:outline-none focus:ring-1 focus:ring-lichen placeholder:text-secondary/50"
                />
              </div>

              {formError && (
                <div className="text-danger-vermilion font-bold text-xs p-2 bg-gauge-room border border-danger-vermilion">
                  {formError}
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirmPledge}
                className="mt-2 min-h-[44px] w-full py-3 bg-lichen text-gauge-room font-mono font-bold text-sm uppercase hover:bg-lichen/90 active:bg-lichen transition-colors border border-lichen flex items-center justify-center gap-2"
              >
                <span>{t('submitPledge')}</span>
                <span>✓</span>
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
};
