/**
 * 模板選擇頁面 - 應用的第一步
 * 用戶在此選擇要使用的拼豆板模板
 */
import React from 'react';
import { useNavigate } from 'react-router';
import { TemplateType } from '../components/BeadGrid';
import { Square, Circle } from 'lucide-react';

const TemplateSelection: React.FC = () => {
  const navigate = useNavigate();

  const templates = [
    {
      id: 'square-large' as TemplateType,
      name: '方型板-標準',
      size: '145×145mm',
      beads: '29×29=841顆',
      description: '適合製作較大的作品,細節豐富',
      icon: Square,
    },
    {
      id: 'square-small' as TemplateType,
      name: '方型板-小型',
      size: '80×80mm',
      beads: '14×14=196顆',
      description: '適合快速創作小型作品',
      icon: Square,
    },
    {
      id: 'circle-large' as TemplateType,
      name: '圓型板-大型',
      size: '155×155mm',
      beads: '直徑29顆',
      description: '圓形設計,適合特殊造型',
      icon: Circle,
    },
  ];

  const handleSelectTemplate = (templateId: TemplateType) => {
    // 將選擇的模板存儲到 sessionStorage
    sessionStorage.setItem('selectedTemplate', templateId);
    // 導航到編輯頁面
    navigate('/editor');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* 標題區 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">創意拼豆藝術</h1>
          <p className="text-xl text-gray-600">選擇您的拼豆板模板開始創作</p>
        </div>

        {/* 模板選擇卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templates.map((template) => {
            const IconComponent = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template.id)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-left hover:scale-105 transform"
              >
                {/* 圖示 */}
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                    <IconComponent size={64} className="text-blue-600" strokeWidth={1.5} />
                  </div>
                </div>

                {/* 模板資訊 */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{template.name}</h3>
                  <div className="space-y-1 text-gray-600 mb-4">
                    <p className="text-sm">尺寸: {template.size}</p>
                    <p className="text-sm">豆子: {template.beads}</p>
                  </div>
                  <p className="text-sm text-gray-500 italic">{template.description}</p>
                </div>

                {/* 選擇按鈕提示 */}
                <div className="mt-6 text-center">
                  <span className="inline-block px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-semibold group-hover:bg-blue-600 transition-colors">
                    選擇此模板
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 底部說明 */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            💡 提示: 選擇模板後即可開始創作,您可以隨時在編輯器中切換模板
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelection;
