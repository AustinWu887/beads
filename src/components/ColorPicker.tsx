/**
 * 顏色選擇器元件 - 提供簡單的顏色選擇和自定義顏色管理
 * 支援直接顏色選擇、自定義顏色添加和刪除功能、顏色群組管理
 */
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Palette, FolderPlus, Edit2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ColorGroup {
  id: string;
  name: string;
  colors: string[];
}

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
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>([]);
  const [currentGroupId, setCurrentGroupId] = useState<string>('default');
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [isColorPickerExpanded, setIsColorPickerExpanded] = useState(false);
  
  // HSV 色彩選擇器狀態
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [value, setValue] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 基礎顏色選項
  const baseColors = [
    '#FF6B6B', '#4FC3F7', '#66BB6A', '#FFD54F', '#BA68C8',
    '#FFB74D', '#FFFFFF', '#9E9E9E', '#424242', '#000000'
  ];

  // HSV 轉 RGB
  const hsvToRgb = (h: number, s: number, v: number): { r: number; g: number; b: number } => {
    h = h / 360;
    s = s / 100;
    v = v / 100;
    
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // RGB 轉 HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  // 獲取當前 HSV 對應的顏色
  const getCurrentColor = (): string => {
    const rgb = hsvToRgb(hue, saturation, value);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  };

  // 更新選擇的顏色
  useEffect(() => {
    const color = getCurrentColor();
    onColorSelect(color);
  }, [hue, saturation, value]);

  // 繪製色彩漸層畫布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // 繪製飽和度和明度的漸層
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const s = (x / width) * 100;
        const v = ((height - y) / height) * 100;
        const rgb = hsvToRgb(hue, s, v);
        ctx.fillStyle = rgbToHex(rgb.r, rgb.g, rgb.b);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }, [hue]);

  // 處理色板點擊
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const s = (x / rect.width) * 100;
    const v = ((rect.height - y) / rect.height) * 100;
    
    setSaturation(Math.max(0, Math.min(100, s)));
    setValue(Math.max(0, Math.min(100, v)));
  };

  // 處理色板拖動
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    handleCanvasClick(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      handleCanvasClick(e);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // 從 localStorage 載入顏色群組
  useEffect(() => {
    const savedGroups = localStorage.getItem('beadArt-colorGroups');
    if (savedGroups) {
      try {
        const groups = JSON.parse(savedGroups);
        setColorGroups(groups);
      } catch (error) {
        console.error('Failed to load color groups:', error);
      }
    } else {
      // 初始化預設群組，包含基礎顏色
      const defaultGroups: ColorGroup[] = [
        { id: 'default', name: '預設群組', colors: baseColors },
      ];
      setColorGroups(defaultGroups);
    }
  }, []);

  // 保存顏色群組到 localStorage
  useEffect(() => {
    if (colorGroups.length > 0) {
      localStorage.setItem('beadArt-colorGroups', JSON.stringify(colorGroups));
    }
  }, [colorGroups]);

  // 獲取當前群組
  const currentGroup = colorGroups.find(g => g.id === currentGroupId) || colorGroups[0];

  // 創建新群組 - 直接進入編輯模式
  const handleCreateGroup = () => {
    const newGroup: ColorGroup = {
      id: 'temp-' + Date.now().toString(),
      name: '',
      colors: [],
    };
    setColorGroups([...colorGroups, newGroup]);
    setCurrentGroupId(newGroup.id);
    setEditingGroupId(newGroup.id);
    setEditingGroupName('');
  };

  // 刪除群組
  const handleDeleteGroup = (groupId: string) => {
    if (colorGroups.length <= 1) {
      alert('至少需要保留一個群組');
      return;
    }
    if (confirm('確定要刪除此群組嗎?')) {
      const newGroups = colorGroups.filter(g => g.id !== groupId);
      setColorGroups(newGroups);
      if (currentGroupId === groupId) {
        setCurrentGroupId(newGroups[0].id);
      }
    }
  };

  // 重命名或確認新增群組
  const handleRenameGroup = (groupId: string) => {
    if (editingGroupName.trim()) {
      // 如果是臨時群組，更新為正式ID
      const isTemp = groupId.startsWith('temp-');
      const finalId = isTemp ? Date.now().toString() : groupId;
      
      setColorGroups(colorGroups.map(g => 
        g.id === groupId ? { ...g, id: finalId, name: editingGroupName.trim() } : g
      ));
      
      if (isTemp) {
        setCurrentGroupId(finalId);
      }
      
      setEditingGroupId(null);
      setEditingGroupName('');
    } else if (groupId.startsWith('temp-')) {
      // 如果是空名稱的臨時群組，刪除它
      handleCancelEdit(groupId);
    }
  };
  
  // 取消編輯
  const handleCancelEdit = (groupId: string) => {
    if (groupId.startsWith('temp-')) {
      // 刪除臨時群組
      const newGroups = colorGroups.filter(g => g.id !== groupId);
      setColorGroups(newGroups);
      if (newGroups.length > 0) {
        setCurrentGroupId(newGroups[0].id);
      }
    }
    setEditingGroupId(null);
    setEditingGroupName('');
  };

  // 添加顏色到當前群組
  const handleAddColorToGroup = (color?: string) => {
    const colorToAdd = color || customColorInput;
    if (colorToAdd && /^#[0-9A-F]{6}$/i.test(colorToAdd)) {
      const upperColor = colorToAdd.toUpperCase();
      if (currentGroup && !currentGroup.colors.includes(upperColor)) {
        setColorGroups(colorGroups.map(g => 
          g.id === currentGroupId ? { ...g, colors: [...g.colors, upperColor] } : g
        ));
        onAddCustomColor(upperColor);
        if (!color) {
          setCustomColorInput('');
        }
      } else if (currentGroup && currentGroup.colors.includes(upperColor)) {
        alert('此顏色已存在於當前群組中');
      }
    }
  };

  // 從群組中刪除顏色
  const handleRemoveColorFromGroup = (color: string) => {
    setColorGroups(colorGroups.map(g => 
      g.id === currentGroupId 
        ? { ...g, colors: g.colors.filter(c => c !== color) }
        : g
    ));
  };

  const handleColorInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddColorToGroup();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">顏色選擇</h3>
      
      {/* 顏色群組管理 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">顏色群組</h4>
          <button
            onClick={handleCreateGroup}
            className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
            title="新增群組"
          >
            <FolderPlus size={14} />
            新增
          </button>
        </div>

        {/* 群組下拉選單 */}
        <div className="mb-3">
          {editingGroupId ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editingGroupName}
                onChange={(e) => setEditingGroupName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRenameGroup(editingGroupId)}
                placeholder="群組名稱"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={() => handleRenameGroup(editingGroupId)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                title="確認"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => handleCancelEdit(editingGroupId)}
                className="p-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                title="取消"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={currentGroupId}
                onChange={(e) => setCurrentGroupId(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {colorGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.colors.length})
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setEditingGroupId(currentGroupId);
                  setEditingGroupName(currentGroup?.name || '');
                }}
                className="p-2 text-gray-500 hover:text-blue-500 border border-gray-300 rounded hover:bg-gray-50"
                title="重命名群組"
              >
                <Edit2 size={16} />
              </button>
              {colorGroups.length > 1 && (
                <button
                  onClick={() => handleDeleteGroup(currentGroupId)}
                  className="p-2 text-gray-500 hover:text-red-500 border border-gray-300 rounded hover:bg-gray-50"
                  title="刪除群組"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 當前群組的顏色 */}
        {currentGroup && (
          <>
            {currentGroup.colors.length > 0 ? (
              <div className="grid grid-cols-5 gap-2">
                {currentGroup.colors.map((color) => (
                  <div key={color} className="relative group">
                    <button
                      className={`w-full aspect-square rounded border-2 transition-all hover:scale-105 ${
                        selectedColor === color 
                          ? 'border-blue-500 shadow-md' 
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => onColorSelect(color)}
                      title={`選擇 ${color}`}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`確定要刪除顏色 ${color} 嗎？`)) {
                          handleRemoveColorFromGroup(color);
                        }
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 shadow-md z-10"
                      title="刪除此顏色"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-300 rounded">
                此群組尚無顏色
              </div>
            )}
          </>
        )}
      </div>

      {/* HSV 色彩選擇器 */}
      <div className="mb-4">
        <button
          onClick={() => setIsColorPickerExpanded(!isColorPickerExpanded)}
          className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors mb-3 p-2 rounded hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            {isColorPickerExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            <Palette size={18} />
            色彩選擇器
          </div>
        </button>

        {isColorPickerExpanded && (
        <>
        {/* 色彩漸層畫布 */}
        <div className="relative mb-3">
          <canvas
            ref={canvasRef}
            width={280}
            height={200}
            className="w-full rounded-lg cursor-crosshair border-2 border-gray-300"
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
          {/* 選擇器指示器 */}
          <div
            className="absolute w-4 h-4 border-2 border-white rounded-full pointer-events-none shadow-lg"
            style={{
              left: `${(saturation / 100) * 100}%`,
              top: `${((100 - value) / 100) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>

        {/* 色相滑桿 */}
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-1">色相</div>
          <input
            type="range"
            min="0"
            max="360"
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
            }}
          />
        </div>

        {/* 當前顏色顯示 */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm flex-shrink-0"
              style={{ backgroundColor: selectedColor }}
            />
            <div className="flex-1">
              <div className="text-xs text-gray-600">當前顏色</div>
              <div className="text-sm font-mono font-semibold">{selectedColor}</div>
            </div>
          </div>
          <button
            onClick={() => handleAddColorToGroup(selectedColor)}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} />
            添加到 {currentGroup?.name || '預設群組'}
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;
