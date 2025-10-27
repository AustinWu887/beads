/**
 * 顏色選擇器元件 - 提供簡單的顏色選擇和自定義顏色管理
 * 支援直接顏色選擇、自定義顏色添加和刪除功能
 */
import React, { useState } from 'react';
import { Plus, Trash2, Palette } from 'lucide-react';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  customColors: string[];
  onAddCustomColor: (color: string) => void;
  onRemoveCustomColor: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
  customColors,
  onAddCustomColor,
  onRemoveCustomColor,
}) => {
  const [customColorInput, setCustomColorInput] = useState('');

  // 基礎顏色選項
  const baseColors = [
    '#FF6B6B', '#4FC3F7', '#66BB6A', '#FFD54F', '#BA68C8',
    '#FFB74D', '#FFFFFF', '#9E9E9E', '#424242', '#000000'
  ];

  const handleAddCustomColor = () => {
    if (customColorInput && /^#[0-9A-F]{6}$/i.test(customColorInput)) {
      onAddCustomColor(customColorInput.toUpperCase());
      setCustomColorInput('');
    }
  };

  const handleColorInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustomColor();
    }
  };

  const handleColorClick = (color: string, e: React.MouseEvent) => {
    if (e.altKey && customColors.includes(color)) {
      onRemoveCustomColor(color);
    } else {
      onColorSelect(color);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
        <Palette size={20} />
        顏色選擇器
      </h3>

      {/* 當前選擇的顏色 */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">當前顏色</span>
          <div className="text-xs text-gray-500">
            {selectedColor}
          </div>
        </div>
        <div 
          className="w-full h-12 rounded-lg border-2 border-gray-300 shadow-sm"
          style={{ backgroundColor: selectedColor }}
        />
      </div>

      {/* 基礎顏色 */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">基礎顏色</h4>
        <div className="grid grid-cols-5 gap-2">
          {baseColors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                selectedColor === color 
                  ? 'border-blue-500 shadow-md' 
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
              title={`選擇 ${color}`}
            />
          ))}
        </div>
      </div>

      {/* 自定義顏色 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">自定義顏色</h4>
        
        {/* 自定義顏色輸入 */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={customColorInput}
            onChange={(e) => setCustomColorInput(e.target.value)}
            onKeyPress={handleColorInputKeyPress}
            placeholder="#FF5733"
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddCustomColor}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm"
          >
            <Plus size={16} />
            添加
          </button>
        </div>

        {/* 自定義顏色列表 */}
        {customColors.length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {customColors.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 relative group ${
                  selectedColor === color 
                    ? 'border-blue-500 shadow-md' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={(e) => handleColorClick(color, e)}
                title={`點擊選擇 ${color}\n按住Alt點擊刪除`}
              >
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded" />
                <Trash2 
                  size={12} 
                  className="absolute top-0 right-0 text-white bg-red-500 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity" 
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 操作提示 */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
        <p>💡 提示：</p>
        <p>• 點擊顏色方塊選擇顏色</p>
        <p>• 在自定義顏色上按住 Alt 鍵點擊可刪除</p>
        <p>• 輸入十六進制顏色代碼添加自定義顏色</p>
      </div>
    </div>
  );
};

export default ColorPicker;
