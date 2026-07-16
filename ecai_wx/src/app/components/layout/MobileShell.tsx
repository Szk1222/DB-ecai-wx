import React from 'react';
import { useApp } from '../../context/AppContext';
import { BottomNav } from './BottomNav';

interface MobileShellProps {
  children: React.ReactNode;
}

export function MobileShell({ children }: MobileShellProps) {
  const { isLoggedIn } = useApp();
  const showNav = isLoggedIn;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div
        className="relative bg-[#F5F6F8] overflow-hidden shadow-2xl"
        style={{
          width: 390,
          height: 844,
          borderRadius: 44,
          border: '10px solid #1a1a2e',
          boxShadow: '0 0 0 2px #3a3a5c, 0 40px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-6 pt-3 pb-1"
          style={{ background: 'transparent', height: 44, zIndex: 10, position: 'relative' }}
        >
          <span className="text-xs font-semibold" style={{ color: '#1a1a2e', letterSpacing: 1 }}>9:41</span>
          <div className="flex items-center gap-1">
            <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
              <rect x="0" y="4" width="3" height="7" rx="0.5" fill="#1a1a2e" />
              <rect x="4" y="2.5" width="3" height="8.5" rx="0.5" fill="#1a1a2e" />
              <rect x="8" y="1" width="3" height="10" rx="0.5" fill="#1a1a2e" />
              <rect x="12" y="0" width="3" height="11" rx="0.5" fill="#1a1a2e" />
            </svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <path d="M8 2C10.4 2 12.6 2.9 14.2 4.5L15.5 3.2C13.5 1.2 10.9 0 8 0C5.1 0 2.5 1.2 0.5 3.2L1.8 4.5C3.4 2.9 5.6 2 8 2Z" fill="#1a1a2e"/>
              <path d="M8 5C9.7 5 11.2 5.7 12.4 6.8L13.7 5.5C12.1 4.1 10.1 3.3 8 3.3C5.9 3.3 3.9 4.1 2.3 5.5L3.6 6.8C4.8 5.7 6.3 5 8 5Z" fill="#1a1a2e"/>
              <circle cx="8" cy="10" r="2" fill="#1a1a2e"/>
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="#1a1a2e" strokeOpacity="0.35"/>
              <rect x="2" y="2" width="16" height="8" rx="2" fill="#1a1a2e"/>
              <path d="M23 4.5V7.5C23.8 7.2 24.5 6.5 24.5 6C24.5 5.5 23.8 4.8 23 4.5Z" fill="#1a1a2e" fillOpacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* Content area */}
        <div
          className="overflow-y-auto overflow-x-hidden"
          style={{
            height: showNav ? 844 - 44 - 56 - 20 : 844 - 44 - 20,
            paddingBottom: 8,
          }}
        >
          {children}
        </div>

        {/* Bottom nav */}
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
