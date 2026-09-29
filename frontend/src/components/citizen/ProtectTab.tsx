import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { INITIAL_ASSETS, evaluateAssets, type InfraAsset, type EvaluatedAsset } from '../../data/assets';
import { CSRLedger } from './CSRLedger';

interface ProtectTabProps {
  onFireSpark: (e?: React.MouseEvent) => void;
  onSelectAsset?: (asset: EvaluatedAsset) => void;
  selectedAssetId?: string;
}

export const ProtectTab: React.FC<ProtectTabProps> = ({
  onFireSpark,
  onSelectAsset,
  selectedAssetId,
}) => {
  const { currentFrame, allFrames } = useScenario();
  const [assetList, setAssetList] = useState<InfraAsset[]>(INITIAL_ASSETS);

  const evaluated = evaluateAssets(assetList, currentFrame, allFrames);

  const handlePledgeSubmit = (assetId: string, amount: number, e: React.MouseEvent) => {
    onFireSpark(e);

    setAssetList((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            pledgedInr: Math.min(a.costInr, a.pledgedInr + amount),
          };
        }
        return a;
      })
    );
  };

  return (
    <div className="flex flex-col gap-4 select-none">
      <CSRLedger
        assets={evaluated}
        onPledgeSubmit={handlePledgeSubmit}
        onSelectAsset={onSelectAsset}
        selectedAssetId={selectedAssetId}
      />
    </div>
  );
};
