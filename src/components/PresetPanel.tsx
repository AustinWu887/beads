/**
 * 預設圖案面板元件 - 提供預設圖案模板
 */
import React from 'react';
import { Heart, Star, Smile, Square } from 'lucide-react';

interface PresetPanelProps {
  onLoadPreset: (patternKey: string) => void;
}

const PresetPanel: React.FC<PresetPanelProps> = ({ onLoadPreset }) => {
  const presets = [
    { key: 'heart', label: '愛心', icon: <Heart size={16} />, color: '#FF6B6B' },
    { key: 'star', label: '星星', icon: <Star size={16} />, color: '#FFEAA7' },
    { key: 'smile', label: '笑臉', icon: <Smile size={16} />, color: '#FFEAA7' },
    { key: 'clear', label: '空白', icon: <Square size={16} />, color: '#FFFFFF' }
  ];

  return (
    <div className="flex flex-col space-y-3 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700">預設圖案</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.key}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors"
            onClick={() => onLoadPreset(preset.key)}
          >
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: preset.color }}
            />
            {preset.icon}
            <span className="text-sm">{preset.label}</span>
          </button>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        點擊圖案加載到畫布
      </p>
    </div>
  );
};

export default PresetPanel;