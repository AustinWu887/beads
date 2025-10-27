/**
 * 變換面板 - 移動、翻轉、旋轉圖案
 */
import React from 'react';
import { Move, FlipHorizontal, FlipVertical, RotateCw } from 'lucide-react';

interface TransformPanelProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onRotate: () => void;
}

const TransformPanel: React.FC<TransformPanelProps> = ({
  onMove,
  onFlipHorizontal,
  onFlipVertical,
  onRotate,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">圖案變換</h3>
      
      {/* 移動控制 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Move className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">整群移動</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <button
            onClick={() => onMove('up')}
            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors text-sm font-medium"
            title="向上移動"
          >
            ↑
          </button>
          <div></div>
          
          <button
            onClick={() => onMove('left')}
            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors text-sm font-medium"
            title="向左移動"
          >
            ←
          </button>
          <div className="flex items-center justify-center text-gray-400 text-xs">
            移動
          </div>
          <button
            onClick={() => onMove('right')}
            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors text-sm font-medium"
            title="向右移動"
          >
            →
          </button>
          
          <div></div>
          <button
            onClick={() => onMove('down')}
            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors text-sm font-medium"
            title="向下移動"
          >
            ↓
          </button>
          <div></div>
        </div>
      </div>

      {/* 翻轉和旋轉 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <RotateCw className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">翻轉 / 旋轉</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onFlipHorizontal}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors text-sm font-medium"
            title="水平翻轉"
          >
            <FlipHorizontal className="w-4 h-4" />
            水平
          </button>
          <button
            onClick={onFlipVertical}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors text-sm font-medium"
            title="垂直翻轉"
          >
            <FlipVertical className="w-4 h-4" />
            垂直
          </button>
          <button
            onClick={onRotate}
            className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors text-sm font-medium"
            title="順時針旋轉90度"
          >
            <RotateCw className="w-4 h-4" />
            旋轉 90°
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        <p>• 移動會保持圖案完整性</p>
        <p>• 超出邊界的部分會被裁切</p>
      </div>
    </div>
  );
};

export default TransformPanel;
