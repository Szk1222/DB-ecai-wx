import React, { useState } from 'react';
import { USER_TASKS, UserTaskStatus } from '../../../data/mockData';
import { StatusBadge } from '../../common/StatusBadge';
import { useApp } from '../../../context/AppContext';

const STATUS_TABS: { label: string; statuses: UserTaskStatus[] }[] = [
  { label: '全部', statuses: [] },
  { label: '进行中', statuses: ['in_progress', 'submitted'] },
  { label: '审核中', statuses: ['model_review', 'human_review'] },
  { label: '需返工', statuses: ['rework'] },
  { label: '已通过', statuses: ['passed'] },
];

export function MyTasks() {
  const { navigate } = useApp();
  const [activeTab, setActiveTab] = useState(0);

  const filtered = USER_TASKS.filter((ut) => {
    if (STATUS_TABS[activeTab].statuses.length === 0) return true;
    return STATUS_TABS[activeTab].statuses.includes(ut.status);
  });

  const typeColor = (type: string) => {
    if (type === 'voice') return '#3DBFA0';
    if (type === 'text') return '#3B82F6';
    return '#F59E0B';
  };

  const typeLabel = (type: string) => {
    if (type === 'voice') return '语音';
    if (type === 'text') return '文本';
    return '图片';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 pt-2 pb-4"
        style={{ background: 'linear-gradient(180deg, #2E3D4F 0%, #3a5068 100%)' }}
      >
        <div className="flex items-center gap-3">
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            onClick={() => navigate('task-hall')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-white flex-1">我的任务</h1>
        </div>
      </div>

      {/* Status tabs */}
      <div className="bg-white shadow-sm">
        <div className="flex overflow-x-auto no-scrollbar">
          {STATUS_TABS.map((tab, i) => (
            <button
              key={tab.label}
              className="flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all"
              style={{
                borderColor: activeTab === i ? '#3DBFA0' : 'transparent',
                color: activeTab === i ? '#3DBFA0' : '#9CA3AF',
              }}
              onClick={() => setActiveTab(i)}
            >
              {tab.label}
              {tab.statuses.length > 0 && (
                <span
                  className="ml-1 text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background: activeTab === i ? '#3DBFA0' : '#F3F4F6',
                    color: activeTab === i ? 'white' : '#9CA3AF',
                  }}
                >
                  {USER_TASKS.filter((ut) =>
                    tab.statuses.length === 0 || tab.statuses.includes(ut.status)
                  ).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-3">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="#D1D5DB" strokeWidth="1.5" />
              <path d="M9 9h6M9 13h4" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-sm">该状态暂无任务</p>
          </div>
        ) : (
          filtered.map((ut) => (
            <div
              key={ut.id}
              className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => {
                if (ut.status === 'passed' || ut.status === 'model_review' || ut.status === 'human_review') {
                  navigate('review-progress', { userTaskId: ut.id });
                } else if (ut.status === 'in_progress' || ut.status === 'rework') {
                  const screen = ut.task.type === 'voice'
                    ? 'collect-voice'
                    : ut.task.type === 'text'
                    ? 'collect-text'
                    : 'collect-image';
                  navigate(screen as any, { taskId: ut.taskId, userTaskId: ut.id });
                }
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${typeColor(ut.task.type)}20`, color: typeColor(ut.task.type) }}
                    >
                      {typeLabel(ut.task.type)}
                    </span>
                    <StatusBadge type="user-task" status={ut.status} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 leading-snug">{ut.task.title}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                  {ut.earnedPoints ? (
                    <div className="text-base font-bold" style={{ color: '#3DBFA0' }}>+{ut.earnedPoints}</div>
                  ) : (
                    <div className="text-base font-bold text-gray-400">+{ut.task.reward}</div>
                  )}
                  <div className="text-xs text-gray-400">积分</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>完成进度 {ut.progress}/{ut.total}</span>
                  <span>截止 {ut.expiresAt}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(ut.progress / ut.total) * 100}%`,
                      background: ut.status === 'passed' ? '#22C55E' : ut.status === 'rework' ? '#EF4444' : '#3DBFA0',
                    }}
                  />
                </div>
              </div>

              {/* Rework reason */}
              {ut.reworkReason && (
                <div
                  className="mt-2 p-2 rounded-xl text-xs text-red-600"
                  style={{ background: '#FEF2F2' }}
                >
                  返工原因：{ut.reworkReason}
                </div>
              )}

              {/* Earn hint */}
              {ut.earnedPoints && (
                <div
                  className="mt-2 p-2 rounded-xl text-xs"
                  style={{ background: '#F0FDF4', color: '#22C55E' }}
                >
                  ✓ 已获得 {ut.earnedPoints} 积分，{ut.reviewedAt} 到账
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
