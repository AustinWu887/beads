/**
 * 對稱面板元件 - 提供圖案對稱繪製功能
 * 支援水平、垂直、四象限和徑向對稱模式
 */
import React from 'react';
import { 
  Square, 
  FlipHorizontal, 
  FlipVertical, 
  Crosshair,
  RotateCcw
} from 'lucide-react';

type SymmetryType = 'none' | 'horizontal' | 'vertical' | 'both' | 'radial';

interface SymmetryPanelProps {
  symmetryType: SymmetryType;
  onSymmetryChange: (type: SymmetryType) => void;
}

const SymmetryPanel: React.FC<SymmetryPanelProps> = ({ 
  symmetryType, 
  onSymmetryChange 
}) => {
  const symmetryOptions = [
    {
      type: 'none' as SymmetryType,
      label: '無對稱',
      description: '自由繪製',
      icon: Square,
      color: 'text-gray-600'
    },
    {
      type: 'horizontal' as SymmetryType,
      label: '水平對稱',
      description: '左右鏡像',
      icon: FlipHorizontal,
      color: 'text-blue-600'
    },
    {
      type: 'vertical' as SymmetryType,
      label: '垂直對稱',
      description: '上下鏡像',
      icon: FlipVertical,
      color: 'text-green-600'
    },
    {
      type: 'both' as SymmetryType,
      label: '四象限對稱',
      description: '水平和垂直',
      icon: Crosshair,
      color: 'text-purple-600'
    },
    {
      type: 'radial' as SymmetryType,
      label: '徑向對稱',
      description: '八個方向',
      icon: RotateCcw,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">對稱模式</h3>
      
      <div className="space-y-2">
        {symmetryOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = symmetryType === option.type;
          
          return (
            <button
              key={option.type}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onSymmetryChange(option.type)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isSelected ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <IconComponent 
                    size={20} 
                    className={isSelected ? 'text-blue-600' : option.color} 
                  />
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${
                    isSelected ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </div>
                  <div className={`text-xs ${
                    isSelected ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default SymmetryPanel;