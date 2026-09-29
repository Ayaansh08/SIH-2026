export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}: TabsProps) => {
  return (
    <div className={`flex border-b border-rule bg-gauge-room ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-3 py-2 text-scale-13 font-mono uppercase tracking-wider transition-colors border-r border-rule flex items-center gap-2 ${
              isActive
                ? 'bg-gauge-panel text-offwhite border-b-2 border-b-lichen font-medium'
                : 'text-contour hover:text-offwhite hover:bg-gauge-panel/50'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`text-[10px] px-1 py-0.5 border ${
                  isActive
                    ? 'border-lichen text-lichen'
                    : 'border-rule text-contour'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
