/**
 * 顏色選擇器元件 - 提供簡單的顏色選擇和自定義顏色管理
 * 支援直接顏色選擇、自定義顏色添加和刪除功能、顏色群組管理
 */
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Palette, FolderPlus, Edit2, Check, X } from 'lucide-react';

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

  // 基礎顏色選項
  const baseColors = [
    '#FF6B6B', '#4FC3F7', '#66BB6A', '#FFD54F', '#BA68C8',
    '#FFB74D', '#FFFFFF', '#9E9E9E', '#424242', '#000000'
  ];

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
      // 初始化預設群組
      const defaultGroups: ColorGroup[] = [
        { id: 'default', name: '預設群組', colors: [] },
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

  // 創建新群組
  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: ColorGroup = {
        id: Date.now().toString(),
        name: newGroupName.trim(),
        colors: [],
      };
      setColorGroups([...colorGroups, newGroup]);
      setCurrentGroupId(newGroup.id);
      setNewGroupName('');
      setShowNewGroupInput(false);
    }
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

  // 重命名群組
  const handleRenameGroup = (groupId: string) => {
    if (editingGroupName.trim()) {
      setColorGroups(colorGroups.map(g => 
        g.id === groupId ? { ...g, name: editingGroupName.trim() } : g
      ));
      setEditingGroupId(null);
      setEditingGroupName('');
    }
  };

  // 添加顏色到當前群組
  const handleAddColorToGroup = () => {
    if (customColorInput && /^#[0-9A-F]{6}$/i.test(customColorInput)) {
      const color = customColorInput.toUpperCase();
      if (currentGroup && !currentGroup.colors.includes(color)) {
        setColorGroups(colorGroups.map(g => 
          g.id === currentGroupId 
            ? { ...g, colors: [...g.colors, color] }
            : g
        ));
      }
      setCustomColorInput('');
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
      <h3 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
        <Palette size={20} />
        顏色選擇器
      </h3>

      {/* 當前選擇的顏色 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
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
      <div className="mb-4">
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

      {/* 顏色群組管理 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">顏色群組</h4>
          <button
            onClick={() => setShowNewGroupInput(!showNewGroupInput)}
            className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
            title="新增群組"
          >
            <FolderPlus size={14} />
            新增
          </button>
        </div>

        {/* 新增群組輸入 */}
        {showNewGroupInput && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
              placeholder="群組名稱"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleCreateGroup}
              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => {
                setShowNewGroupInput(false);
                setNewGroupName('');
              }}
              className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 群組標籤 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {colorGroups.map((group) => (
            <div key={group.id} className="flex items-center gap-1">
              {editingGroupId === group.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editingGroupName}
                    onChange={(e) => setEditingGroupName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleRenameGroup(group.id)}
                    className="px-2 py-1 border border-gray-300 rounded text-xs w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRenameGroup(group.id)}
                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => {
                      setEditingGroupId(null);
                      setEditingGroupName('');
                    }}
                    className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setCurrentGroupId(group.id)}
                    className={`px-3 py-1 rounded text-xs transition-colors ${
                      currentGroupId === group.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {group.name} ({group.colors.length})
                  </button>
                  <button
                    onClick={() => {
                      setEditingGroupId(group.id);
                      setEditingGroupName(group.name);
                    }}
                    className="p-1 text-gray-500 hover:text-blue-500"
                    title="重命名"
                  >
                    <Edit2 size={12} />
                  </button>
                  {colorGroups.length > 1 && (
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-1 text-gray-500 hover:text-red-500"
                      title="刪除群組"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* 當前群組的顏色 */}
        {currentGroup && (
          <>
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
                onClick={handleAddColorToGroup}
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm"
              >
                <Plus size={16} />
                添加
              </button>
            </div>

            {currentGroup.colors.length > 0 ? (
              <div className="grid grid-cols-5 gap-2">
                {currentGroup.colors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 relative group ${
                      selectedColor === color 
                        ? 'border-blue-500 shadow-md' 
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onColorSelect(color)}
                    title={`選擇 ${color}`}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveColorFromGroup(color);
                      }}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </button>
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

      {/* 操作提示 */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
        <p>💡 提示：</p>
        <p>• 點擊群組標籤切換不同的顏色群組</p>
        <p>• 點擊顏色方塊選擇顏色</p>
        <p>• 輸入十六進制顏色代碼添加到當前群組</p>
      </div>
    </div>
  );
};

export default ColorPicker;
