/**
 * 工具面板元件 - 提供拼豆藝術的各種操作工具
 * 包括畫筆、橡皮擦、填充工具和文件操作功能
 */
import React from 'react';
import { Brush, Eraser, Download, Upload, Undo2, Redo2, Trash2, RotateCcw, PaintBucket, Image as ImageIcon } from 'lucide-react';

interface ToolPanelProps {
  onClear: () => void;
  onReset: () => void;
  onSaveJSON: () => void;
  onSaveImage: () => void;
  onLoadJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUndo: () => void;
  onRedo: () => void;
  currentTool: string;
  onToolChange: (tool: string) => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ToolPanel: React.FC<ToolPanelProps> = ({
  onClear,
  onReset,
  onSaveJSON,
  onSaveImage,
  onLoadJSON,
  onLoadImage,
  onUndo,
  onRedo,
  currentTool,
  onToolChange,
  canUndo,
  canRedo
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">檔案</h3>

      {/* 文件操作 */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-1"
            onClick={onSaveJSON}
            title="保存為JSON文件"
          >
            <Download size={16} />
            <span className="text-sm">保存JSON</span>
          </button>
          
          <button
            className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-1"
            onClick={onSaveImage}
            title="保存為PNG圖片"
          >
            <Download size={16} />
            <span className="text-sm">保存圖片</span>
          </button>
        </div>
        
        <label className="block">
          <input
            type="file"
            accept=".json"
            onChange={onLoadJSON}
            className="hidden"
          />
          <div className="w-full p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-1 cursor-pointer">
            <Upload size={16} />
            <span className="text-sm">加載JSON</span>
          </div>
        </label>
        
        <label className="block">
          <input
            type="file"
            accept="image/*"
            onChange={onLoadImage}
            className="hidden"
          />
          <div className="w-full p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-1 cursor-pointer">
            <ImageIcon size={16} />
            <span className="text-sm">載入圖片</span>
          </div>
        </label>
      </div>

    </div>
  );
};

export default ToolPanel;