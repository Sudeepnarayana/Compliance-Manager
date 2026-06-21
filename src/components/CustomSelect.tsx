'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the dropdown container
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-border-main rounded-xl bg-canvas-bg text-text-main text-xs focus:ring-1 focus:ring-primary focus:outline-none text-left cursor-pointer transition-all hover:border-slate-400 dark:hover:border-slate-600"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder || 'Select option'}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 opacity-60 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-card-bg border border-border-main rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-1 duration-100">
          <div className="max-h-60 overflow-y-auto divide-y divide-border-main/40">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-canvas-bg transition-colors cursor-pointer block ${
                  opt.value === value
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-text-main hover:text-text-main'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
