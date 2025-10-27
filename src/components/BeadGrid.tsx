/**
 * 互動式拼豆網格元件 - 用於拼豆藝術創作
 * 支援顏色放置、擦除和網格互動，優化移動端觸摸交互
 */
import React, { useRef } from 'react';

export type TemplateType = 'square-large' | 'square-small' | 'circle-large';

interface BeadGridProps {
  grid: string[][];
  onBeadClick: (row: number, col: number) => void;
  selectedColor: string;
  currentTool: string;
  templateType: TemplateType;
}

const BeadGrid: React.FC<BeadGridProps> = ({ 
  grid, 
  onBeadClick, 
  selectedColor, 
  currentTool,
  templateType
}) => {
  const isDrawing = useRef(false);

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
    e.preventDefault();
    isDrawing.current = true;
    onBeadClick(row, col);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing.current) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.hasAttribute('data-row') && element.hasAttribute('data-col')) {
      const row = parseInt(element.getAttribute('data-row') || '0');
      const col = parseInt(element.getAttribute('data-col') || '0');
      onBeadClick(row, col);
    }
  };

  const handleTouchEnd = () => {
    isDrawing.current = false;
  };

  // 根據模板類型獲取配置
  const getTemplateConfig = () => {
    switch (templateType) {
      case 'square-large':
        return {
          size: '145mm',
          gridSize: 29,
          label: '網格尺寸: 145mm × 145mm | 豆子數量: 29 × 29 = 841顆',
          isCircle: false,
        };
      case 'square-small':
        return {
          size: '80mm',
          gridSize: 14,
          label: '網格尺寸: 80mm × 80mm | 豆子數量: 14 × 14 = 196顆',
          isCircle: false,
        };
      case 'circle-large':
        return {
          size: '155mm',
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
    <div className="flex flex-col items-center">
      <div
        className={`grid border-2 border-gray-400 bg-white shadow-lg touch-none ${
          config.isCircle ? 'rounded-full' : ''
        }`}
        style={{
          width: config.size,
          height: config.size,
          gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${config.gridSize}, 1fr)`,
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
                className={`border border-gray-300 rounded-full transition-all duration-150 hover:scale-110 ${
                  color ? 'shadow-md' : ''
                } ${
                  !inCircle ? 'invisible' : ''
                }`}
                style={{ 
                  backgroundColor: color || 'transparent',
                  borderColor: color ? color : '#d1d5db',
                  visibility: inCircle ? 'visible' : 'hidden',
                }}
                data-row={rowIndex}
                data-col={colIndex}
                onClick={() => inCircle && handleCellClick(rowIndex, colIndex)}
                onMouseEnter={() => inCircle && handleCellEnter(rowIndex, colIndex)}
                onMouseDown={() => inCircle && handleMouseDown(rowIndex, colIndex)}
                onTouchStart={(e) => inCircle && handleTouchStart(e, rowIndex, colIndex)}
                onTouchMove={handleTouchMove}
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