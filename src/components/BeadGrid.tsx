/**
 * 互動式拼豆網格元件 - 用於拼豆藝術創作
 * 支援顏色放置、擦除和網格互動，優化移動端觸摸交互
 */
import React, { useRef, useEffect } from 'react';

export type TemplateType = 'square-large' | 'square-small' | 'circle-large';

interface BeadGridProps {
  grid: string[][];
  onBeadClick: (row: number, col: number) => void;
  selectedColor: string;
  currentTool: string;
  templateType: TemplateType;
  scale: number;
  onScaleChange: (scale: number) => void;
}

const BeadGrid: React.FC<BeadGridProps> = ({ 
  grid, 
  onBeadClick, 
  selectedColor, 
  currentTool,
  templateType,
  scale,
  onScaleChange
}) => {
  const isDrawing = useRef(false);
  const lastTouchDistance = useRef<number | null>(null);
  const isPinching = useRef(false);
  const lastTouchedCell = useRef<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // 計算兩個觸控點之間的距離
  const getTouchDistance = (touches: TouchList | React.TouchList) => {
    if (touches.length < 2) return null;
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleCellClick = (row: number, col: number) => {
    onBeadClick(row, col);
  };

  const handleCellEnter = (row: number, col: number) => {
    if (isDrawing.current) {
      onBeadClick(row, col);
    }
  };

  // 鼠標事件處理
  const handleMouseDown = (row: number, col: number) => {
    isDrawing.current = true;
    onBeadClick(row, col);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  // 觸摸事件處理
  const handleTouchStart = (e: React.TouchEvent, row: number, col: number) => {
    // 檢測是否為雙指縮放手勢
    if (e.touches.length >= 2) {
      isPinching.current = true;
      isDrawing.current = false;
      const distance = getTouchDistance(e.touches);
      lastTouchDistance.current = distance;
      return;
    }
    
    // 單指觸控才觸發繪製
    if (e.touches.length === 1 && !isPinching.current) {
      isDrawing.current = true;
      lastTouchedCell.current = `${row}-${col}`;
      onBeadClick(row, col);
    }
  };

  const handleTouchMove = (e: TouchEvent | React.TouchEvent) => {
    // 處理雙指縮放
    if (e.touches.length === 2) {
      e.preventDefault();
      isPinching.current = true;
      isDrawing.current = false;
      
      const distance = getTouchDistance(e.touches);
      if (distance) {
        if (lastTouchDistance.current === null) {
          // 初始化距離
          lastTouchDistance.current = distance;
        } else {
          // 計算縮放比例（提高靈敏度）
          const scale_ratio = distance / lastTouchDistance.current;
          const newScale = scale * scale_ratio;
          onScaleChange(Math.max(0.4, Math.min(2, newScale)));
          lastTouchDistance.current = distance;
        }
      }
      return;
    }
    
    // 單指繪製
    if (!isDrawing.current || isPinching.current) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.hasAttribute('data-row') && element.hasAttribute('data-col')) {
      const row = parseInt(element.getAttribute('data-row') || '0');
      const col = parseInt(element.getAttribute('data-col') || '0');
      const cellKey = `${row}-${col}`;
      
      // 只有當觸控到不同的格子時才觸發,提高連續繪製的流暢度
      if (cellKey !== lastTouchedCell.current) {
        lastTouchedCell.current = cellKey;
        onBeadClick(row, col);
      }
    }
  };

  // 設置非 passive 的觸控事件監聽器
  useEffect(() => {
    const gridElement = gridRef.current;
    if (!gridElement) return;

    const touchMoveHandler = (e: TouchEvent) => {
      handleTouchMove(e);
    };

    // 添加非 passive 的事件監聽器
    gridElement.addEventListener('touchmove', touchMoveHandler, { passive: false });

    return () => {
      gridElement.removeEventListener('touchmove', touchMoveHandler);
    };
  }, [scale, onScaleChange, onBeadClick]);

  const handleTouchEnd = (e: React.TouchEvent) => {
    // 如果還有觸控點，檢查是否繼續縮放
    if (e.touches.length >= 2) {
      isPinching.current = true;
      const distance = getTouchDistance(e.touches);
      lastTouchDistance.current = distance;
    } else if (e.touches.length === 0) {
      // 所有手指都離開，重置狀態
      isDrawing.current = false;
      isPinching.current = false;
      lastTouchDistance.current = null;
      lastTouchedCell.current = null;
    } else {
      // 只剩一個手指，重置縮放狀態但不重置繪製狀態
      isPinching.current = false;
      lastTouchDistance.current = null;
    }
  };

  // 根據模板類型獲取配置
  const getTemplateConfig = () => {
    switch (templateType) {
      case 'square-large':
        return {
          size: 'min(145mm, 85vw)',
          gridSize: 29,
          label: '網格尺寸: 145mm × 145mm | 豆子數量: 29 × 29 = 841顆',
          isCircle: false,
        };
      case 'square-small':
        return {
          size: 'min(80mm, 85vw)',
          gridSize: 14,
          label: '網格尺寸: 80mm × 80mm | 豆子數量: 14 × 14 = 196顆',
          isCircle: false,
        };
      case 'circle-large':
        return {
          size: 'min(155mm, 85vw)',
          gridSize: 29,
          label: '網格尺寸: 155mm × 155mm | 豆子數量: 直徑29顆',
          isCircle: true,
        };
      default:
        return {
          size: '145mm',
          gridSize: 29,
          label: '網格尺寸: 145mm × 145mm | 豆子數量: 29 × 29 = 841顆',
          isCircle: false,
        };
    }
  };

  // 檢查位置是否在圓形範圍內
  const isInCircle = (row: number, col: number, gridSize: number) => {
    const center = (gridSize - 1) / 2;
    const radius = gridSize / 2;
    const distance = Math.sqrt(Math.pow(row - center, 2) + Math.pow(col - center, 2));
    return distance <= radius;
  };

  const config = getTemplateConfig();

  return (
    <div className="p-4">
      <div
        ref={gridRef}
        className={`grid border-2 border-gray-300 bg-white shadow-lg touch-none ${
          config.isCircle ? 'rounded-full' : ''
        }`}
        style={{
          width: config.size,
          height: config.size,
          gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${config.gridSize}, 1fr)`,
          gap: '4px',
          padding: '12px',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          transition: isPinching.current ? 'none' : 'transform 0.2s ease-out',
          touchAction: 'none',
        }}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {grid.map((row, rowIndex) =>
          row.map((color, colIndex) => {
            const inCircle = !config.isCircle || isInCircle(rowIndex, colIndex, config.gridSize);
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`rounded-full transition-all duration-150 hover:scale-110 ${
                  color ? 'shadow-md' : ''
                } ${
                  !inCircle ? 'invisible' : ''
                }`}
                style={{ 
                  backgroundColor: color || '#e5e7eb',
                  visibility: inCircle ? 'visible' : 'hidden',
                  aspectRatio: '1',
                  transform: color ? 'scale(1)' : 'scale(0.5)',
                }}
                data-row={rowIndex}
                data-col={colIndex}
                onClick={() => inCircle && handleCellClick(rowIndex, colIndex)}
                onMouseEnter={() => inCircle && handleCellEnter(rowIndex, colIndex)}
                onMouseDown={() => inCircle && handleMouseDown(rowIndex, colIndex)}
                onTouchStart={(e) => inCircle && handleTouchStart(e, rowIndex, colIndex)}
                title={inCircle ? `位置: (${rowIndex + 1}, ${colIndex + 1})` : ''}
                disabled={!inCircle}
              />
            );
          })
        )}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        {config.label}
      </div>
    </div>
  );
};

export default BeadGrid;