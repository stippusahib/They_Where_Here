/* ============================================================
 * THEY WERE HERE — Country Select Input Component
 * Clean, searchable, touch-friendly country selector.
 * Zero emojis, WCAG compliant, Phosphor icons.
 * ============================================================ */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MagnifyingGlass, X, CaretDown, Check } from '@phosphor-icons/react';
import { ALL_COUNTRIES } from '@/lib/visaCheck';

interface CountrySelectInputProps {
  label: string;
  value: string;
  onChange: (country: string) => void;
  popularList?: string[];
  icon?: React.ReactNode;
  placeholder?: string;
}

export const CountrySelectInput: React.FC<CountrySelectInputProps> = ({
  label,
  value,
  onChange,
  popularList = [],
  icon,
  placeholder = 'Search country...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter countries
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return ALL_COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return ALL_COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [searchQuery]);

  const handleSelect = (country: string) => {
    onChange(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative flex flex-col gap-1.5 w-full text-left" ref={dropdownRef}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono font-bold tracking-wider uppercase text-[var(--ink-700)] flex items-center gap-1.5">
          {icon}
          <span>{label}</span>
        </label>
        {value && (
          <span className="text-[10px] font-mono text-[var(--ink-500)]">
            Selected: <strong className="text-[var(--ink-900)]">{value}</strong>
          </span>
        )}
      </div>

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all text-left bg-white text-[var(--ink-900)] shadow-2xs cursor-pointer active:scale-[0.99]"
        style={{
          minHeight: 48,
          borderColor: isOpen ? 'var(--hanko)' : 'rgba(15, 18, 48, 0.15)',
          outline: isOpen ? '2px solid rgba(210, 63, 90, 0.2)' : 'none',
        }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-[var(--ink-500)] flex-shrink-0">{icon}</span>}
          <span className="font-display font-bold text-sm truncate text-[var(--ink-900)]">
            {value || placeholder}
          </span>
        </div>
        <CaretDown
          size={16}
          weight="bold"
          className={`text-[var(--ink-500)] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Quick Select Popular Chips */}
      {popularList.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {popularList.slice(0, 5).map((pop) => {
            const isSelected = value.toLowerCase() === pop.toLowerCase();
            return (
              <button
                key={pop}
                type="button"
                onClick={() => handleSelect(pop)}
                className="px-2.5 py-1 rounded-md text-[11px] font-body font-bold transition-all cursor-pointer"
                style={{
                  background: isSelected ? 'var(--hanko)' : 'rgba(15, 18, 48, 0.05)',
                  color: isSelected ? 'var(--white)' : 'var(--ink-700)',
                  border: isSelected
                    ? '1px solid var(--hanko)'
                    : '1px solid rgba(15, 18, 48, 0.1)',
                }}
              >
                {pop}
              </button>
            );
          })}
        </div>
      )}

      {/* Dropdown Floating Menu */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-[var(--ink-900)]/15 shadow-[0_12px_32px_rgba(15,18,48,0.18)] overflow-hidden flex flex-col"
          style={{ maxHeight: 260 }}
        >
          {/* Search Box */}
          <div className="p-2.5 border-b border-[var(--ink-900)]/10 bg-[var(--paper)] flex items-center gap-2">
            <MagnifyingGlass size={16} weight="bold" className="text-[var(--ink-500)]" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type country name..."
              className="w-full bg-transparent text-xs font-body font-bold text-[var(--ink-900)] outline-none placeholder:text-[var(--ink-300)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-[var(--ink-500)] hover:text-[var(--ink-900)]"
                aria-label="Clear search"
              >
                <X size={14} weight="bold" />
              </button>
            )}
          </div>

          {/* List of Countries */}
          <div className="overflow-y-auto flex-1 divide-y divide-[var(--ink-900)]/5">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-[var(--ink-500)]">
                No matching countries found
              </div>
            ) : (
              filteredCountries.map((country) => {
                const isSelected = value.toLowerCase() === country.toLowerCase();
                return (
                  <button
                    key={country}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-body text-left hover:bg-[var(--paper)] transition-colors cursor-pointer"
                    style={{
                      background: isSelected ? 'rgba(210, 63, 90, 0.08)' : undefined,
                      minHeight: 40,
                    }}
                  >
                    <span
                      className={`truncate ${
                        isSelected
                          ? 'font-black text-[var(--hanko)]'
                          : 'font-medium text-[var(--ink-900)]'
                      }`}
                    >
                      {country}
                    </span>
                    {isSelected && (
                      <Check size={14} weight="bold" color="var(--hanko)" className="flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
