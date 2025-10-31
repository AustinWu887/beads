/**
 * 首頁元件 - 拼豆藝術應用
 * 管理主要應用狀態並協調各元件之間的互動
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import BeadGrid, { TemplateType } from '../components/BeadGrid';
import ColorPicker from '../components/ColorPicker';
import ToolPanel from '../components/ToolPanel';
import SymmetryPanel from '../components/SymmetryPanel';
import ImageUploadPanel from '../components/ImageUploadPanel';
import TransformPanel from '../components/TransformPanel';
import { 
  Palette, 
  Settings, 
  Move, 
  ChevronDown,
  X,
  Home as HomeIcon,
  Brush,
  Eraser,
  PaintBucket,
  Undo2,
  Redo2,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crosshair,
  Square,
  ZoomIn,
  ZoomOut,
  Hand
} from 'lucide-react';

// 對稱類型
type SymmetryType = 'none' | 'horizontal' | 'vertical' | 'both' | 'radial';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 從 sessionStorage 讀取初始模板
  const getInitialTemplate = (): TemplateType => {
    const saved = sessionStorage.getItem('selectedTemplate');
    return (saved as TemplateType) || 'square-large';
  };
  
  // 根據模板類型獲取網格大小
  const getGridSize = (template: TemplateType): number => {
    switch (template) {
      case 'square-small':
        return 14;
      case 'square-large':
      case 'circle-large':
      default:
        return 29;
    }
  };
  
  const initialTemplate = getInitialTemplate();
  const initialGridSize = getGridSize(initialTemplate);
  
  const [templateType, setTemplateType] = useState<TemplateType>(initialTemplate);
  const [grid, setGrid] = useState<string[][]>(
    Array(initialGridSize).fill(null).map(() => Array(initialGridSize).fill(''))
  );
  const [selectedColor, setSelectedColor] = useState<string>('#FF6B6B');
  const [currentTool, setCurrentTool] = useState<string>('brush');
  const [symmetryType, setSymmetryType] = useState<SymmetryType>('none');
  const [scale, setScale] = useState<number>(1);
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  
  // 面板展開狀態
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  
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
    Array(initialGridSize).fill(null).map(() => Array(initialGridSize).fill(''))
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  
  // 用於圖片導出的ref
  const gridRef = useRef<HTMLDivElement>(null);
  // 畫板容器ref用於拖動滾動
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

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

  // 移動模式的拖動滾動功能
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isPanMode) return;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop
      };
      container.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      container.scrollLeft = dragStart.current.scrollLeft - dx;
      container.scrollTop = dragStart.current.scrollTop - dy;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      container.style.cursor = 'grab';
    };

    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanMode]);

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
    const gridSize = grid.length;
    const maxIndex = gridSize - 1;
    
    const placeBead = (r: number, c: number, clr: string, t: string) => {
      if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
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
        placeBead(row, maxIndex - col, color, tool);
        break;
        
      case 'vertical':
        // 垂直對稱
        placeBead(maxIndex - row, col, color, tool);
        break;
        
      case 'both':
        // 水平和垂直對稱（四象限）
        placeBead(row, maxIndex - col, color, tool);
        placeBead(maxIndex - row, col, color, tool);
        placeBead(maxIndex - row, maxIndex - col, color, tool);
        break;
        
      case 'radial':
        // 徑向對稱（八個方向）
        placeBead(row, maxIndex - col, color, tool);
        placeBead(maxIndex - row, col, color, tool);
        placeBead(maxIndex - row, maxIndex - col, color, tool);
        placeBead(col, row, color, tool);
        placeBead(col, maxIndex - row, color, tool);
        placeBead(maxIndex - col, row, color, tool);
        placeBead(maxIndex - col, maxIndex - row, color, tool);
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
    const gridSize = grid.length;
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    setGrid(newGrid);
    updateHistory(newGrid);
  };

  const handleReset = () => {
    const gridSize = grid.length;
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
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

  // 放大
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2));
  };

  // 縮小
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.4));
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
        
        const gridSize = grid.length;
        if (data.grid && Array.isArray(data.grid) && data.grid.length === gridSize) {
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

  // 處理圖片文件上傳
  const handleLoadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const gridSize = grid.length;
        canvas.width = gridSize;
        canvas.height = gridSize;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, gridSize, gridSize);
        const imageData = ctx.getImageData(0, 0, gridSize, gridSize);
        const pixels = imageData.data;
        
        // 檢測背景色
        const corners = [
          { row: 0, col: 0 },
          { row: 0, col: gridSize - 1 },
          { row: gridSize - 1, col: 0 },
          { row: gridSize - 1, col: gridSize - 1 }
        ];
        
        let bgR = 0, bgG = 0, bgB = 0;
        corners.forEach(({ row, col }) => {
          const index = (row * gridSize + col) * 4;
          bgR += pixels[index];
          bgG += pixels[index + 1];
          bgB += pixels[index + 2];
        });
        bgR = Math.round(bgR / 4);
        bgG = Math.round(bgG / 4);
        bgB = Math.round(bgB / 4);
        
        // 轉換為拼豆網格
        const beadGrid: string[][] = [];
        
        for (let row = 0; row < gridSize; row++) {
          const rowData: string[] = [];
          for (let col = 0; col < gridSize; col++) {
            const index = (row * gridSize + col) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const a = pixels[index + 3];
            
            // 判斷是否為背景色
            const isBackground = a < 128 || 
              Math.sqrt(Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)) < 60;
            
            if (isBackground) {
              rowData.push('');
            } else {
              const hexColor = '#' + [r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
              }).join('');
              
              // 找最接近的顏色
              let closestColor = availableColors[0];
              let minDistance = Infinity;
              
              for (const beadColor of availableColors) {
                const hex1 = hexColor.replace('#', '');
                const hex2 = beadColor.replace('#', '');
                
                const r1 = parseInt(hex1.substr(0, 2), 16);
                const g1 = parseInt(hex1.substr(2, 2), 16);
                const b1 = parseInt(hex1.substr(4, 2), 16);
                
                const r2 = parseInt(hex2.substr(0, 2), 16);
                const g2 = parseInt(hex2.substr(2, 2), 16);
                const b2 = parseInt(hex2.substr(4, 2), 16);
                
                const distance = Math.sqrt(
                  Math.pow(r1 - r2, 2) +
                  Math.pow(g1 - g2, 2) +
                  Math.pow(b1 - b2, 2)
                );
                
                if (distance < minDistance) {
                  minDistance = distance;
                  closestColor = beadColor;
                }
              }
              
              rowData.push(closestColor);
            }
          }
          beadGrid.push(rowData);
        }
        
        handleImageLoad(beadGrid);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    event.target.value = '';
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

  const togglePanel = (panelName: string) => {
    setOpenPanel(openPanel === panelName ? null : panelName);
  };

  const handleBackToHome = () => {
    if (confirm('返回首頁將清除當前作品,確定要繼續嗎?')) {
      sessionStorage.removeItem('selectedTemplate');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* 頂部標題 */}
      <header className="text-center py-6 bg-white/80 backdrop-blur-sm shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">創意拼豆藝術</h1>
      </header>

      {/* 主要內容區 - 板子置中 */}
      <div className="flex items-center justify-center py-8">
        <div>
          {/* 控制按鈕 - 撤銷/重做靠左，縮放置中，模式切換靠右 */}
          <div className="flex justify-between items-center w-full mb-3">
            {/* 撤銷/重作按鈕 - 左側 */}
            <div className="flex gap-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="撤銷"
              >
                <Undo2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="重作"
              >
                <Redo2 className="w-5 h-5" />
              </button>
            </div>

            {/* 縮放控制按鈕 - 中間 */}
            <div className="flex gap-2">
              <button
                onClick={handleZoomOut}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-all"
                title="縮小"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <div className="flex items-center px-3 py-2 bg-white rounded-lg shadow-lg">
                <span className="text-sm font-semibold">{Math.round(scale * 100)}%</span>
              </div>
              <button
                onClick={handleZoomIn}
                className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-all"
                title="放大"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            {/* 模式切換按鈕 - 右側 */}
            <button
              onClick={() => setIsPanMode(!isPanMode)}
              className={`px-4 py-2 rounded-lg shadow-lg transition-all flex items-center gap-2 ${
                isPanMode 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title={isPanMode ? "切換到放豆模式" : "切換到移動模式"}
            >
              {isPanMode ? (
                <>
                  <Hand className="w-5 h-5" />
                  <span className="text-sm font-semibold">移動</span>
                </>
              ) : (
                <>
                  <Brush className="w-5 h-5" />
                  <span className="text-sm font-semibold">放豆</span>
                </>
              )}
            </button>
          </div>

          {/* 畫板容器 - 限制縮放範圍 */}
          <div 
            ref={containerRef}
            className={`overflow-auto max-w-[95vw] max-h-[70vh] rounded-lg border-2 border-gray-300 bg-gray-50 ${
              isPanMode ? 'cursor-grab active:cursor-grabbing' : ''
            }`}
          >
            <div 
              ref={gridRef} 
              className="inline-block"
              style={{ pointerEvents: isPanMode ? 'none' : 'auto' }}
            >
              <BeadGrid
                grid={grid}
                onBeadClick={isPanMode ? () => {} : handleBeadClick}
                selectedColor={selectedColor}
                currentTool={currentTool}
                templateType={templateType}
                scale={scale}
                onScaleChange={setScale}
              />
            </div>
          </div>

          {/* 工具按鈕 - 下方 */}
          <div className="flex flex-col items-center gap-3 mt-4">
            {/* 第一排：繪圖工具 */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setCurrentTool('brush')}
                className={`p-3 rounded-lg shadow-lg transition-all ${
                  currentTool === 'brush'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="畫筆"
              >
                <Brush size={24} />
              </button>
              <button
                onClick={() => setCurrentTool('eraser')}
                className={`p-3 rounded-lg shadow-lg transition-all ${
                  currentTool === 'eraser'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="橡皮擦"
              >
                <Eraser size={24} />
              </button>
              <button
                onClick={() => setCurrentTool('fill')}
                className={`p-3 rounded-lg shadow-lg transition-all ${
                  currentTool === 'fill'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="填充"
              >
                <PaintBucket size={24} />
              </button>
              <button
                onClick={handleReset}
                className="p-3 rounded-lg shadow-lg transition-all bg-white text-gray-700 hover:bg-gray-50"
                title="重置"
              >
                <RotateCcw size={24} />
              </button>
            </div>

            {/* 第二排：功能工具 */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleBackToHome}
                className="p-3 rounded-lg shadow-lg transition-all bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-300"
                title="返回首頁"
              >
                <HomeIcon size={24} />
              </button>
              <button
                onClick={() => togglePanel('color')}
                className={`p-3 rounded-lg shadow-lg transition-all ${
                  openPanel === 'color' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="顏色選擇"
              >
                <Palette size={24} />
              </button>
              <button
                onClick={() => togglePanel('symmetry')}
                className={`p-3 rounded-lg shadow-lg transition-all ${
                  openPanel === 'symmetry' 
                    ? 'bg-blue-500 text-white' 
                    : symmetryType !== 'none'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="對稱模式"
              >
                {symmetryType === 'horizontal' && <FlipHorizontal size={24} />}
                {symmetryType === 'vertical' && <FlipVertical size={24} />}
                {symmetryType === 'both' && <Crosshair size={24} />}
                {symmetryType === 'radial' && <RotateCcw size={24} />}
                {symmetryType === 'none' && <Square size={24} />}
              </button>
              <button
                onClick={() => togglePanel('transform')}
                className={`p-3 rounded-lg shadow-lg transition-all ${
                  openPanel === 'transform' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="移動與變換"
              >
                <Move size={24} />
              </button>
              <button
                onClick={() => togglePanel('settings')}
                className={`p-3 rounded-lg shadow-lg transition-all ${
                  openPanel === 'settings' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                title="工具與設定"
              >
                <Settings size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 展開的面板 - 置中顯示 */}
      {openPanel && (
        <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center p-4" onClick={() => setOpenPanel(null)}>
          <div className="w-full max-w-[400px] min-w-[320px]" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <button
                onClick={() => setOpenPanel(null)}
                className="absolute -top-2 -right-2 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                title="關閉"
              >
                <X size={20} />
              </button>

              {openPanel === 'color' && (
                <ColorPicker 
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                  customColors={customColors}
                  onAddCustomColor={handleAddCustomColor}
                  onRemoveCustomColor={handleRemoveCustomColor}
                />
              )}

              {openPanel === 'symmetry' && (
                <SymmetryPanel
                  symmetryType={symmetryType}
                  onSymmetryChange={setSymmetryType}
                />
              )}

              {openPanel === 'transform' && (
                <TransformPanel
                  onMove={handleMove}
                  onFlipHorizontal={handleFlipHorizontal}
                  onFlipVertical={handleFlipVertical}
                  onRotate={handleRotate}
                />
              )}

              {openPanel === 'settings' && (
                <ToolPanel
                  onClear={handleClear}
                  onReset={handleReset}
                  onSaveJSON={handleSaveJSON}
                  onSaveImage={handleSaveImage}
                  onLoadJSON={handleLoadJSON}
                  onLoadImage={handleLoadImage}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  currentTool={currentTool}
                  onToolChange={setCurrentTool}
                  canUndo={historyIndex > 0}
                  canRedo={historyIndex < history.length - 1}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;