'use client';

import React, { useState, ReactNode } from 'react';

interface CollapsiblePanelProps {
  title: string;
  subtitle?: string | ReactNode;
  children: ReactNode;
  defaultCollapsed?: boolean;
  className?: string;
  headerExtra?: ReactNode;
}

export default function CollapsiblePanel({ 
  title, 
  subtitle, 
  children, 
  defaultCollapsed = false,
  className = "",
  headerExtra
}: CollapsiblePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors ${className}`} 
         style={{ padding: isCollapsed ? '8px 16px' : '16px' }}>
      <div className={`flex justify-between items-center ${isCollapsed ? 'mb-0' : 'mb-4'}`}>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {headerExtra}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={isCollapsed ? "Expand panel" : "Collapse panel"}
          >
            <svg
              className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {!isCollapsed && children}
    </div>
  );
}