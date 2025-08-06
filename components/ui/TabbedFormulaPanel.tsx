'use client';

import React, { useState, ReactNode } from 'react';
import CollapsiblePanel from './CollapsiblePanel';

export interface FormulaSection {
  id: string;
  label: string;
  icon: string;
  content: ReactNode;
}

export interface TabbedFormulaPanelProps {
  title: string;
  subtitle?: string | ReactNode;
  sections: FormulaSection[];
  defaultSection?: string;
  tabStyle?: 'pills' | 'underline';
  minHeight?: string;
  maxHeight?: string;
  footer?: ReactNode;
  className?: string;
}

export default function TabbedFormulaPanel({ 
  title,
  subtitle,
  sections,
  defaultSection,
  tabStyle = 'pills',
  minHeight = '400px',
  maxHeight,
  footer,
  className = ""
}: TabbedFormulaPanelProps) {
  const [activeSection, setActiveSection] = useState(defaultSection || sections[0]?.id);

  const activeContent = sections.find(section => section.id === activeSection)?.content;

  const renderPillsTabs = () => (
    <div className="flex space-x-1 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded transition-colors">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => setActiveSection(section.id)}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
            activeSection === section.id
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
          }`}
        >
          <span className="mr-1">{section.icon}</span>
          {section.label}
        </button>
      ))}
    </div>
  );

  const renderUnderlineTabs = () => (
    <nav className="flex border-b border-gray-200 dark:border-gray-600 mb-4">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => setActiveSection(section.id)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === section.id
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <span className="mr-1">{section.icon}</span>
          {section.label}
        </button>
      ))}
    </nav>
  );

  return (
    <CollapsiblePanel 
      title={title}
      subtitle={subtitle}
      className={className}
    >
      {/* Tab Navigation */}
      {tabStyle === 'pills' ? renderPillsTabs() : renderUnderlineTabs()}

      {/* Content */}
      <div 
        className={maxHeight ? 'overflow-y-auto' : ''}
        style={{ 
          minHeight,
          maxHeight: maxHeight || undefined
        }}
      >
        {activeContent}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400 transition-colors">
          {footer}
        </div>
      )}
    </CollapsiblePanel>
  );
}