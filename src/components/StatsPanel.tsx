/**
 * 統計面板元件 - 顯示拼豆顏色統計
 */
import React from 'react';

interface StatsPanelProps {
  grid: string[][];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ grid }) => {
  // 計算每個顏色的數量
  const calculateStats = () => {
    const colorCount: { [key: string]: number } = {};
    
    grid.forEach(row => {
      row.forEach(color => {
        if (color) {
          colorCount[color] = (colorCount[color] || 0) + 1;
        }
      });
    });
    
    // 轉換為陣列並排序（數量從多到少）
    return Object.entries(colorCount)
      .map(([color, count]) => ({ color, count }))
      .sort((a, b) => b.count - a.count);
  };
  
  const stats = calculateStats();
  const total = stats.reduce((sum, item) => sum + item.count, 0);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">拼豆統計</h3>
      
      {stats.length === 0 ? (
        <p className="text-gray-500 text-center py-4">尚未放置任何拼豆</p>
      ) : (
        <>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {stats.map(({ color, count }) => (
              <div
                key={color}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {color}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-800">
                  {count}
                </span>
              </div>
            ))}
          </div>
          
          {/* 總計 */}
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-base font-bold text-gray-800">總計</span>
              <span className="text-xl font-bold text-blue-600">{total}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatsPanel;
