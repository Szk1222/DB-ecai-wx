import React, { useState } from 'react';
import { TASKS } from '../../../data/mockData';
import { TaskCard } from '../../common/TaskCard';
import { useApp } from '../../../context/AppContext';

const TABS = ['推荐', '大厅招募', '定向任务', '已领取'];

function SearchBar() {
  const [value, setValue] = useState('');
  return (
    <div
      className="flex items-center gap-2 rounded-2xl px-4 h-10"
      style={{ background: '#F5F6F8' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke="#9CA3AF" strokeWidth="2" />
        <path d="m21 21-4.35-4.35" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder="搜索任务..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
      />
    </div>
  );
}

function FilterRow() {
  const [lang, setLang] = useState('全部');
  const langs = ['全部', '普通话', '粤语', '英语'];
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {langs.map((l) => (
        <button
          key={l}
          className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all"
          style={{
            background: lang === l ? '#3DBFA0' : '#fff',
            borderColor: lang === l ? '#3DBFA0' : '#E5E7EB',
            color: lang === l ? '#fff' : '#6B7280',
          }}
          onClick={() => setLang(l)}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function TaskHall() {
  const { navigate } = useApp();
  const [activeTab, setActiveTab] = useState(0);

  const filtered = TASKS.filter((t) => {
    if (activeTab === 0) return t.isRecommended;
    if (activeTab === 1) return !t.isDirected;
    if (activeTab === 2) return t.isDirected;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 pt-2 pb-4"
        style={{ background: 'linear-gradient(180deg, #2E3D4F 0%, #3a5068 100%)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-white">任务大厅</h1>
            <p className="text-xs text-white/60 mt-0.5">今日共 {TASKS.length} 个任务可参与</p>
          </div>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            onClick={() => navigate('my-tasks')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M9 12h6M9 16h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <SearchBar />
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 pt-3 pb-0 shadow-sm">
        <div className="flex gap-0">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className="flex-1 py-2 text-sm font-medium border-b-2 transition-all"
              style={{
                borderColor: activeTab === i ? '#3DBFA0' : 'transparent',
                color: activeTab === i ? '#3DBFA0' : '#9CA3AF',
              }}
              onClick={() => {
                if (tab === '已领取') navigate('my-tasks');
                else setActiveTab(i);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white px-4 py-2.5 border-b border-gray-100">
        <FilterRow />
      </div>

      {activeTab > 0 && activeTab < 3 && (
        <div className="px-4 pt-3">
          <div
            className="rounded-2xl px-3.5 py-3 flex items-start gap-2.5 border"
            style={{
              background: activeTab === 1 ? '#F0FAF8' : '#FFF8EA',
              borderColor: activeTab === 1 ? '#D5EEE8' : '#F6E4BA',
            }}
          >
            <div
              className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: activeTab === 1 ? '#DDF4EF' : '#FBE9BF' }}
            >
              {activeTab === 1 ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l4 4L19 6" stroke="#2B9C82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="11" rx="3" stroke="#C68B1B" strokeWidth="2"/><path d="M8 10V7a4 4 0 018 0v3" stroke="#C68B1B" strokeWidth="2" strokeLinecap="round"/></svg>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: activeTab === 1 ? '#2B7F6B' : '#9A6A10' }}>
                {activeTab === 1 ? '满足要求即可认领' : '仅限名单或内部邀请'}
              </p>
              <p className="text-[11px] leading-4 mt-0.5" style={{ color: activeTab === 1 ? '#6A9389' : '#A98A4C' }}>
                {activeTab === 1
                  ? '平台自动核验账号标签与认证，通过后可直接领取。'
                  : '需命中平台派发名单，或验证正确的内部邀请口令。'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-3">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="#D1D5DB" strokeWidth="1.5" />
              <path d="M9 9h6M9 13h4" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-sm">暂无符合条件的任务</p>
          </div>
        ) : (
          filtered.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
