/**
 * 工具面板元件 - 提供拼豆藝術的各種操作工具
 * 包括畫筆、橡皮擦、填充工具和文件操作功能
 */
import React from 'react';
import { Brush, Eraser, Download, Upload, Undo2, Redo2, Trash2, RotateCcw, PaintBucket } from 'lucide-react';

interface ToolPanelProps {
  onClear: () => void;
  onReset: () => void;
  onSaveJSON: () => void;
  onSaveImage: () => void;
  onLoadJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  onUndo,
  onRedo,
  currentTool,
  onToolChange,
  canUndo,
  canRedo
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">工具</h3>
      
      {/* 繪圖工具 */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-3 gap-2">
          <button
            className={`p-3 rounded-lg border-2 transition-all ${
              currentTool === 'brush' 
                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onToolChange('brush')}
            title="畫筆工具"
          >
            <Brush size={20} className="mx-auto" />
            <span className="text-xs mt-1 block">畫筆</span>
          </button>
          
          <button
            className={`p-3 rounded-lg border-2 transition-all ${
              currentTool === 'eraser' 
                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onToolChange('eraser')}
            title="橡皮擦工具"
          >
            <Eraser size={20} className="mx-auto" />
            <span className="text-xs mt-1 block">橡皮</span>
          </button>
          
          <button
            className={`p-3 rounded-lg border-2 transition-all ${
              currentTool === 'fill' 
                ? 'border-blue-500 bg-blue-50 text-blue-600' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onToolChange('fill')}
            title="填充工具 - 替換相鄰同色豆子"
          >
            <PaintBucket size={20} className="mx-auto" />
            <span className="text-xs mt-1 block">填充</span>
          </button>
        </div>
      </div>

      {/* 操作工具 */}
      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-2">
          <button
            className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onUndo}
            disabled={!canUndo}
            title="撤銷上一步"
          >
            <Undo2 size={16} />
            <span className="text-sm">撤銷</span>
          </button>
          
          <button
            className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onRedo}
            disabled={!canRedo}
            title="重做下一步"
          >
            <Redo2 size={16} />
            <span className="text-sm">重做</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-1"
            onClick={onClear}
            title="清除所有豆子"
          >
            <Trash2 size={16} />
            <span className="text-sm">清除</span>
          </button>
          
          <button
            className="p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center gap-1"
            onClick={onReset}
            title="重置所有設置"
          >
            <RotateCcw size={16} />
            <span className="text-sm">重置</span>
          </button>
        </div>
      </div>

      {/* 文件操作 */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-600">文件操作</h4>
        
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
      </div>

      {/* 工具說明 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-700 mb-1">工具說明</h4>
        <p className="text-xs text-blue-600">
          {currentTool === 'brush' && '畫筆: 點擊放置豆子，拖動連續繪製'}
          {currentTool === 'eraser' && '橡皮: 點擊清除豆子，拖動連續清除'}
          {currentTool === 'fill' && '填充: 點擊豆子替換所有相鄰同色豆子'}
        </p>
      </div>
    </div>
  );
};

export default ToolPanel;