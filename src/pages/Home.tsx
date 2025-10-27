/**
 * 首頁元件 - 拼豆藝術應用
 * 管理主要應用狀態並協調各元件之間的互動
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import BeadGrid, { TemplateType } from '../components/BeadGrid';
import ColorPicker from '../components/ColorPicker';
import ToolPanel from '../components/ToolPanel';
import PresetPanel from '../components/PresetPanel';
import SymmetryPanel from '../components/SymmetryPanel';
import TemplatePanel from '../components/TemplatePanel';
import ImageUploadPanel from '../components/ImageUploadPanel';
import TransformPanel from '../components/TransformPanel';

// 預設圖案數據
const PRESET_PATTERNS = {
  heart: Array(29).fill(null).map((_, row) => 
    Array(29).fill(null).map((_, col) => {
      // 簡單的心形圖案
      const x = col - 14.5;
      const y = row - 14.5;
      const distance = Math.sqrt(x*x + y*y);
      const angle = Math.atan2(y, x);
      const heartEquation = distance < 10 - 5 * Math.sin(angle) * Math.sin(angle);
      return heartEquation ? '#FF6B6B' : '';
    })
  ),
  star: Array(29).fill(null).map((_, row) => 
    Array(29).fill(null).map((_, col) => {
      // 星星圖案
      const x = col - 14.5;
      const y = row - 14.5;
      const distance = Math.sqrt(x*x + y*y);
      const angle = Math.atan2(y, x);
      const starEquation = distance < 8 + 2 * Math.sin(5 * angle);
      return starEquation ? '#FFEAA7' : '';
    })
  ),
  smile: Array(29).fill(null).map((_, row) => 
    Array(29).fill(null).map((_, col) => {
      // 笑臉圖案
      const x = col - 14.5;
      const y = row - 14.5;
      const distance = Math.sqrt(x*x + y*y);
      
      // 臉部
      if (distance < 10) return '#FFEAA7';
      
      // 眼睛
      if ((col === 10 && (row === 8 || row === 9)) || 
          (col === 19 && (row === 8 || row === 9))) return '#000000';
      
      // 嘴巴
      if (row === 18 && col >= 11 && col <= 18 && 
          Math.abs((col - 14.5) / 3.5) < 1) return '#000000';
      
      return '';
    })
  ),
  clear: Array(29).fill(null).map(() => Array(29).fill(''))
};

// 對稱類型
type SymmetryType = 'none' | 'horizontal' | 'vertical' | 'both' | 'radial';

const HomePage: React.FC = () => {
  const [templateType, setTemplateType] = useState<TemplateType>('square-large');
  const [grid, setGrid] = useState<string[][]>(
    Array(29).fill(null).map(() => Array(29).fill(''))
  );
  const [selectedColor, setSelectedColor] = useState<string>('#FF6B6B');
  const [currentTool, setCurrentTool] = useState<string>('brush');
  const [symmetryType, setSymmetryType] = useState<SymmetryType>('none');
  
  // 自定義顏色狀態
  const [customColors, setCustomColors] = useState<string[]>([]);
  
  // 基礎顏色選項（與 ColorPicker 相同）
  const baseColors = [
    '#FF6B6B', '#4FC3F7', '#66BB6A', '#FFD54F', '#BA68C8',
    '#FFB74D', '#FFFFFF', '#9E9E9E', '#424242', '#000000'
  ];
  
  // 所有可用的顏色（基礎顏色 + 自定義顏色）
  const availableColors = [...baseColors, ...customColors];
  
  // 撤銷/重做狀態
  const [history, setHistory] = useState<string[][][]>([
    Array(29).fill(null).map(() => Array(29).fill(''))
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  
  // 用於圖片導出的ref
  const gridRef = useRef<HTMLDivElement>(null);

  // 從localStorage加載自定義顏色
  useEffect(() => {
    const savedColors = localStorage.getItem('beadArt-customColors');
    if (savedColors) {
      try {
        setCustomColors(JSON.parse(savedColors));
      } catch (error) {
        console.error('Failed to load custom colors:', error);
      }
    }
  }, []);

  // 保存自定義顏色到localStorage
  useEffect(() => {
    localStorage.setItem('beadArt-customColors', JSON.stringify(customColors));
  }, [customColors]);

  // 更新歷史記錄
  const updateHistory = useCallback((newGrid: string[][]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newGrid);
    if (newHistory.length > 50) {
      newHistory.shift(); // 限制歷史記錄為50步
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  /**
   * 洪水填充算法 - 用於顏色區塊替換
   * 點擊豆子時，替換所有相鄰的同色豆子
   */
  const floodFill = useCallback((startRow: number, startCol: number, newColor: string): string[][] => {
    const oldColor = grid[startRow][startCol];
    
    // 如果新舊顏色相同，則不需要填充
    if (oldColor === newColor) return grid;
    
    // 創建網格的深拷貝
    const newGrid = grid.map(row => [...row]);
    const queue: [number, number][] = [[startRow, startCol]];
    const visited = new Set<string>();
    
    // 四連通方向：上、右、下、左
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
    
    while (queue.length > 0) {
      const [row, col] = queue.shift()!;
      const key = `${row},${col}`;
      
      // 跳過已訪問或顏色不匹配的單元格
      if (visited.has(key) || newGrid[row][col] !== oldColor) continue;
      
      // 填充當前單元格
      newGrid[row][col] = newColor;
      visited.add(key);
      
      // 檢查四個方向的相鄰單元格
      for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        // 確保在網格範圍內
        if (newRow >= 0 && newRow < 29 && newCol >= 0 && newCol < 29) {
          queue.push([newRow, newCol]);
        }
      }
    }
    
    return newGrid;
  }, [grid]);

  /**
   * 對稱繪製處理
   * 根據對稱類型在對稱位置也放置豆子
   */
  const handleSymmetricalPlacement = useCallback((row: number, col: number, color: string, tool: string): string[][] => {
    const newGrid = grid.map(row => [...row]);
    const center = 14; // 29x29網格的中心點索引是14
    
    const placeBead = (r: number, c: number, clr: string, t: string) => {
      if (r >= 0 && r < 29 && c >= 0 && c < 29) {
        if (t === 'brush') {
          newGrid[r][c] = clr;
        } else if (t === 'eraser') {
          newGrid[r][c] = '';
        }
      }
    };
    
    // 放置原始位置的豆子
    placeBead(row, col, color, tool);
    
    // 根據對稱類型放置對稱位置的豆子
    switch (symmetryType) {
      case 'horizontal':
        // 水平對稱
        placeBead(row, 28 - col, color, tool);
        break;
        
      case 'vertical':
        // 垂直對稱
        placeBead(28 - row, col, color, tool);
        break;
        
      case 'both':
        // 水平和垂直對稱（四象限）
        placeBead(row, 28 - col, color, tool);
        placeBead(28 - row, col, color, tool);
        placeBead(28 - row, 28 - col, color, tool);
        break;
        
      case 'radial':
        // 徑向對稱（八個方向）
        placeBead(row, 28 - col, color, tool);
        placeBead(28 - row, col, color, tool);
        placeBead(28 - row, 28 - col, color, tool);
        placeBead(col, row, color, tool);
        placeBead(col, 28 - row, color, tool);
        placeBead(28 - col, row, color, tool);
        placeBead(28 - col, 28 - row, color, tool);
        break;
        
      case 'none':
      default:
        // 無對稱，只放置原始位置
        break;
    }
    
    return newGrid;
  }, [grid, symmetryType]);

  const handleBeadClick = useCallback((row: number, col: number) => {
    setGrid(prevGrid => {
      let newGrid: string[][];
      
      if (currentTool === 'brush') {
        newGrid = handleSymmetricalPlacement(row, col, selectedColor, 'brush');
      } else if (currentTool === 'eraser') {
        newGrid = handleSymmetricalPlacement(row, col, '', 'eraser');
      } else if (currentTool === 'fill') {
        // 使用洪水填充算法（不對稱填充）
        newGrid = floodFill(row, col, selectedColor);
      } else {
        newGrid = prevGrid;
      }
      
      updateHistory(newGrid);
      return newGrid;
    });
  }, [selectedColor, currentTool, updateHistory, floodFill, handleSymmetricalPlacement]);

  // 添加自定義顏色
  const handleAddCustomColor = (color: string) => {
    if (!customColors.includes(color)) {
      const newColors = [...customColors, color];
      setCustomColors(newColors);
    }
  };

  // 刪除自定義顏色
  const handleRemoveCustomColor = (color: string) => {
    const newColors = customColors.filter(c => c !== color);
    setCustomColors(newColors);
  };

  const handleClear = () => {
    const newGrid = Array(29).fill(null).map(() => Array(29).fill(''));
    setGrid(newGrid);
    updateHistory(newGrid);
  };

  const handleReset = () => {
    const newGrid = Array(29).fill(null).map(() => Array(29).fill(''));
    setGrid(newGrid);
    setSelectedColor('#FF6B6B');
    setCurrentTool('brush');
    setSymmetryType('none');
    setHistory([newGrid]);
    setHistoryIndex(0);
  };

  // 撤銷功能
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setGrid(history[historyIndex - 1]);
    }
  };

  // 重做功能
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setGrid(history[historyIndex + 1]);
    }
  };

  // 保存為JSON
  const handleSaveJSON = () => {
    const data = {
      grid: grid,
      timestamp: new Date().toISOString(),
      beadCount: grid.flat().filter(color => color !== '').length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `拼豆作品_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert(`作品已保存為JSON！共使用了 ${data.beadCount} 顆豆子。`);
  };

  // 保存為圖片
  const handleSaveImage = () => {
    if (!gridRef.current) return;
    
    // 創建canvas元素
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 設置canvas尺寸（145mm轉換為像素，約550px）
    const pixelSize = 550;
    canvas.width = pixelSize;
    canvas.height = pixelSize;
    
    // 背景色
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pixelSize, pixelSize);
    
    // 計算每個豆子的像素大小
    const beadSize = pixelSize / 29;
    const beadRadius = beadSize * 0.4;
    
    // 繪製所有豆子槽（包括空白）
    grid.forEach((row, rowIndex) => {
      row.forEach((color, colIndex) => {
        const x = colIndex * beadSize + beadSize / 2;
        const y = rowIndex * beadSize + beadSize / 2;
        
        // 繪製豆子槽（淺灰色圓形邊框）
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, beadRadius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // 如果有顏色，填充豆子
        if (color) {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, beadRadius, 0, 2 * Math.PI);
          ctx.fill();
          
          // 添加陰影效果
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });
    
    // 導出為圖片
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `拼豆作品_${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    alert(`作品已保存為圖片！共使用了 ${grid.flat().filter(color => color !== '').length} 顆豆子。`);
  };

  // 加載JSON文件
  const handleLoadJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (data.grid && Array.isArray(data.grid) && data.grid.length === 29) {
          setGrid(data.grid);
          updateHistory(data.grid);
          alert(`作品加載成功！共 ${data.beadCount || data.grid.flat().filter((color: string) => color !== '').length} 顆豆子。`);
        } else {
          alert('檔案格式錯誤，無法加載作品。');
        }
      } catch (error) {
        alert('檔案讀取失敗，請確保選擇了有效的JSON檔案。');
      }
    };
    reader.readAsText(file);
    
    // 重置input以便可以再次選擇相同檔案
    event.target.value = '';
  };

  // 加載預設圖案
  const handleLoadPreset = (patternKey: string) => {
    const presetGrid = PRESET_PATTERNS[patternKey as keyof typeof PRESET_PATTERNS];
    if (presetGrid) {
      setGrid(presetGrid);
      updateHistory(presetGrid);
    }
  };

  // 模板切換處理
  const handleTemplateChange = (newTemplate: TemplateType) => {
    setTemplateType(newTemplate);
    
    // 根據模板類型重新初始化網格
    let newGridSize = 29;
    if (newTemplate === 'square-small') {
      newGridSize = 14;
    }
    
    const newGrid = Array(newGridSize).fill(null).map(() => Array(newGridSize).fill(''));
    setGrid(newGrid);
    setHistory([newGrid]);
    setHistoryIndex(0);
  };

  // 處理圖片載入
  const handleImageLoad = (imageData: string[][]) => {
    setGrid(imageData);
    updateHistory(imageData);
    alert(`圖片已成功轉換為拼豆圖案！共使用了 ${imageData.flat().filter(color => color !== '').length} 顆豆子。`);
  };

  // 整群移動
  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    const gridSize = grid.length;
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        let newRow = row;
        let newCol = col;
        
        switch (direction) {
          case 'up':
            newRow = row - 1;
            break;
          case 'down':
            newRow = row + 1;
            break;
          case 'left':
            newCol = col - 1;
            break;
          case 'right':
            newCol = col + 1;
            break;
        }
        
        // 檢查新位置是否在範圍內
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
          newGrid[newRow][newCol] = grid[row][col];
        }
      }
    }
    
    setGrid(newGrid);
    updateHistory(newGrid);
  };

  // 水平翻轉
  const handleFlipHorizontal = () => {
    const newGrid = grid.map(row => [...row].reverse());
    setGrid(newGrid);
    updateHistory(newGrid);
  };

  // 垂直翻轉
  const handleFlipVertical = () => {
    const newGrid = [...grid].reverse();
    setGrid(newGrid);
    updateHistory(newGrid);
  };

  // 順時針旋轉90度
  const handleRotate = () => {
    const gridSize = grid.length;
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        // 順時針旋轉90度的公式：新位置 (col, gridSize - 1 - row)
        newGrid[col][gridSize - 1 - row] = grid[row][col];
      }
    }
    
    setGrid(newGrid);
    updateHistory(newGrid);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">創意拼豆藝術</h1>
          <p className="text-lg text-gray-600">選擇您的模板並創作拼豆作品</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* 左側面板 - 模板、工具和顏色選擇器 */}
          <div className="flex flex-col gap-6">
            <TemplatePanel
              selectedTemplate={templateType}
              onTemplateChange={handleTemplateChange}
            />
            <ImageUploadPanel
              onImageLoad={handleImageLoad}
              gridSize={grid.length}
              availableColors={availableColors}
            />
            <ColorPicker 
              selectedColor={selectedColor}
              onColorSelect={setSelectedColor}
              customColors={customColors}
              onAddCustomColor={handleAddCustomColor}
              onRemoveCustomColor={handleRemoveCustomColor}
            />
            <ToolPanel
              onClear={handleClear}
              onReset={handleReset}
              onSaveJSON={handleSaveJSON}
              onSaveImage={handleSaveImage}
              onLoadJSON={handleLoadJSON}
              onUndo={handleUndo}
              onRedo={handleRedo}
              currentTool={currentTool}
              onToolChange={setCurrentTool}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
            />
            <SymmetryPanel
              symmetryType={symmetryType}
              onSymmetryChange={setSymmetryType}
            />
            <TransformPanel
              onMove={handleMove}
              onFlipHorizontal={handleFlipHorizontal}
              onFlipVertical={handleFlipVertical}
              onRotate={handleRotate}
            />
            <PresetPanel onLoadPreset={handleLoadPreset} />
          </div>

          {/* 主要網格 */}
          <div ref={gridRef}>
            <BeadGrid
              grid={grid}
              onBeadClick={handleBeadClick}
              selectedColor={selectedColor}
              currentTool={currentTool}
              templateType={templateType}
            />
          </div>

          {/* 右側面板 - 統計資訊 */}
          <div className="bg-white rounded-lg shadow-md p-6 min-w-[200px]">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">統計資訊</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">已使用豆子:</span>
                <span className="font-semibold">
                  {grid.flat().filter(color => color !== '').length} / {grid.length * grid[0].length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">當前工具:</span>
                <span className="font-semibold capitalize">
                  {currentTool === 'brush' ? '畫筆' : 
                   currentTool === 'eraser' ? '橡皮' : 
                   currentTool === 'fill' ? '填充' : currentTool}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">對稱模式:</span>
                <span className="font-semibold capitalize">
                  {symmetryType === 'none' ? '無' :
                   symmetryType === 'horizontal' ? '水平' :
                   symmetryType === 'vertical' ? '垂直' :
                   symmetryType === 'both' ? '四象限' : '徑向'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">當前顏色:</span>
                <div 
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: selectedColor }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">操作歷史:</span>
                <span className="font-semibold">{historyIndex + 1} / {history.length}</span>
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>提示: 點擊放置豆子，按住鼠標拖動可以連續放置</p>
          <p>在移動設備上，觸摸並拖動也可以繪製</p>
          <p className="mt-2 text-blue-600">
            新功能: 三種模板、圖片轉換、整群移動、翻轉旋轉、對稱模式、自定義顏色
          </p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;