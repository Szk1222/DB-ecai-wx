import React from 'react';
import { useApp } from '../../context/AppContext';

function TaskIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke={active ? '#3DBFA0' : '#9CA3AF'} strokeWidth="1.8" fill="none" />
      <path d="M7 8h10M7 12h7M7 16h5" stroke={active ? '#3DBFA0' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17" cy="15" r="3.5" fill={active ? '#3DBFA0' : '#9CA3AF'} />
      <path d="M15.5 15l1 1 2-2" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={active ? '#3DBFA0' : '#9CA3AF'} strokeWidth="1.8" fill="none" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? '#3DBFA0' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function BottomNav() {
  const { currentTab, setTab } = useApp();

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex border-t border-gray-100 bg-white"
      style={{ height: 56 }}
    >
      <button
        className="flex-1 flex flex-col items-center justify-center gap-0.5"
        onClick={() => setTab('tasks')}
      >
        <TaskIcon active={currentTab === 'tasks'} />
        <span
          className="text-xs"
          style={{ color: currentTab === 'tasks' ? '#3DBFA0' : '#9CA3AF', fontWeight: currentTab === 'tasks' ? 600 : 400 }}
        >
          任务
        </span>
      </button>
      <button
        className="flex-1 flex flex-col items-center justify-center gap-0.5"
        onClick={() => setTab('me')}
      >
        <MeIcon active={currentTab === 'me'} />
        <span
          className="text-xs"
          style={{ color: currentTab === 'me' ? '#3DBFA0' : '#9CA3AF', fontWeight: currentTab === 'me' ? 600 : 400 }}
        >
          我的
        </span>
      </button>
    </div>
  );
}
