/**
 * 圖片上傳面板 - 將圖片轉換為拼豆圖案
 */
import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadPanelProps {
  onImageLoad: (imageData: string[][]) => void;
  gridSize: number;
  availableColors: string[];
}

const ImageUploadPanel: React.FC<ImageUploadPanelProps> = ({ onImageLoad, gridSize, availableColors }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 計算兩個顏色之間的距離
  const colorDistance = (color1: string, color2: string): number => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    return Math.sqrt(
      Math.pow(r1 - r2, 2) +
      Math.pow(g1 - g2, 2) +
      Math.pow(b1 - b2, 2)
    );
  };

  // 找到最接近的拼豆顏色（從可用顏色中選擇）
  const findClosestBeadColor = (hexColor: string): string => {
    if (availableColors.length === 0) return '';
    
    let closestColor = availableColors[0];
    let minDistance = colorDistance(hexColor, closestColor);
    
    for (const beadColor of availableColors) {
      const distance = colorDistance(hexColor, beadColor);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = beadColor;
      }
    }
    
    return closestColor;
  };

  // RGB 轉 HEX
  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // 計算顏色亮度
  const getBrightness = (r: number, g: number, b: number): number => {
    return (r * 299 + g * 587 + b * 114) / 1000;
  };

  // 判斷是否為背景色（基於邊緣像素）
  const isBackgroundColor = (
    r: number, 
    g: number, 
    b: number, 
    bgR: number, 
    bgG: number, 
    bgB: number,
    threshold: number = 50
  ): boolean => {
    const distance = Math.sqrt(
      Math.pow(r - bgR, 2) +
      Math.pow(g - bgG, 2) +
      Math.pow(b - bgB, 2)
    );
    return distance < threshold;
  };

  // 處理圖片上傳
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 創建 canvas 來處理圖片
        const canvas = document.createElement('canvas');
        canvas.width = gridSize;
        canvas.height = gridSize;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;

        // 將圖片繪製到 canvas 並縮放到網格大小
        ctx.drawImage(img, 0, 0, gridSize, gridSize);
        
        // 獲取像素數據
        const imageData = ctx.getImageData(0, 0, gridSize, gridSize);
        const pixels = imageData.data;
        
        // 自動檢測背景色（使用四個角落的平均色）
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
        
        // 轉換為拼豆網格（帶去背）
        const beadGrid: string[][] = [];
        
        for (let row = 0; row < gridSize; row++) {
          const rowData: string[] = [];
          for (let col = 0; col < gridSize; col++) {
            const index = (row * gridSize + col) * 4;
            const r = pixels[index];
            const g = pixels[index + 1];
            const b = pixels[index + 2];
            const a = pixels[index + 3];
            
            // 如果像素是透明的或是背景色，設為空
            if (a < 128 || isBackgroundColor(r, g, b, bgR, bgG, bgB, 60)) {
              rowData.push('');
            } else {
              const hexColor = rgbToHex(r, g, b);
              const beadColor = findClosestBeadColor(hexColor);
              rowData.push(beadColor);
            }
          }
          beadGrid.push(rowData);
        }
        
        onImageLoad(beadGrid);
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
    
    // 重置 input
    event.target.value = '';
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5" />
        圖片轉換
      </h3>
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          上傳圖片並自動轉換為拼豆圖案
        </p>
        <button
          onClick={handleButtonClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
        >
          <Upload className="w-5 h-5" />
          上傳圖片
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <div className="text-xs text-gray-500 space-y-1">
          <p>• 支援 JPG、PNG、GIF 等格式</p>
          <p>• 自動去背（移除四角背景色）</p>
          <p>• 圖片會自動縮放至網格大小</p>
          <p>• 僅使用顏色選擇器中的顏色</p>
          <p>• 建議先添加自定義顏色以獲得更好效果</p>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadPanel;
