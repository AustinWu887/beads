/**
 * 工具面板元件 - 提供拼豆藝術的各種操作工具
 * 包括畫筆、橡皮擦、填充工具和文件操作功能
 */
import React from 'react';
import { Download, Upload, Image as ImageIcon } from 'lucide-react';

interface ToolPanelProps {
  onClear: () => void;
  onReset: () => void;
  onSave: () => void;
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
  onSave,
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
        <button
          className="w-full p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all flex items-center justify-center gap-2 font-semibold"
          onClick={onSave}
          title="保存作品（圖片+JSON）"
        >
          <Download size={20} />
          <span>保存作品</span>
        </button>
        
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