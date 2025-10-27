/**
 * 模板選擇面板 - 選擇不同的拼豆板模板
 */
import React from 'react';

export type TemplateType = 'square-large' | 'square-small' | 'circle-large';

interface TemplatePanelProps {
  selectedTemplate: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
}

const templates = [
  {
    id: 'square-large' as TemplateType,
    name: '方型板-標準',
    size: '145×145mm',
    beads: '29×29=841顆',
    icon: '⬜',
  },
  {
    id: 'square-small' as TemplateType,
    name: '方型板-小',
    size: '80×80mm',
    beads: '14×14=196顆',
    icon: '◻️',
  },
  {
    id: 'circle-large' as TemplateType,
    name: '圓型板-標準',
    size: '155×155mm',
    beads: '直徑29顆',
    icon: '⭕',
  },
];

const TemplatePanel: React.FC<TemplatePanelProps> = ({ 
  selectedTemplate, 
  onTemplateChange 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">選擇模板</h3>
      <div className="space-y-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{template.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{template.name}</div>
                <div className="text-sm text-gray-600">{template.size}</div>
                <div className="text-xs text-gray-500">{template.beads}</div>
              </div>
              {selectedTemplate === template.id && (
                <span className="text-blue-500 text-xl">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplatePanel;
