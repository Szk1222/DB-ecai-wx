import React from 'react';
import { Task } from '../../data/mockData';
import { useApp } from '../../context/AppContext';

function TypeIcon({ type }: { type: string }) {
  if (type === 'voice') {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#E8F7F4' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="8" y="2" width="8" height="14" rx="4" fill="#3DBFA0" />
          <path d="M5 11a7 7 0 0014 0" stroke="#3DBFA0" strokeWidth="2" strokeLinecap="round" fill="none" />
          <line x1="12" y1="18" x2="12" y2="22" stroke="#3DBFA0" strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="22" x2="15" y2="22" stroke="#3DBFA0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  if (type === 'text') {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EEF4FF' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="18" height="18" rx="3" fill="#3B82F6" opacity="0.15" />
          <path d="M7 8h10M7 12h7M7 16h5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FFF7E6' }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#F59E0B" opacity="0.15" />
        <path d="M3 9l4-4 4 4 4-4 4 4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M3 15l4-4 4 4 4-4 4 4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
      </svg>
    </div>
  );
}

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { navigate } = useApp();
  const recruitmentRate = Math.round(((task.totalSlots - task.remainingSlots) / task.totalSlots) * 100);

  return (
    <div
      className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => navigate('task-detail', { taskId: task.id })}
    >
      <div className="flex items-start gap-3">
        <TypeIcon type={task.type} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-800 leading-snug flex-1">{task.title}</h3>
            <div className="text-right flex-shrink-0">
              <div className="text-base font-bold" style={{ color: '#3DBFA0' }}>+{task.reward}</div>
              <div className="text-xs text-gray-400">积分/次</div>
            </div>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{
                background: task.isDirected ? '#FFF3D8' : '#E8F7F4',
                color: task.isDirected ? '#A56F09' : '#2B9C82',
              }}
            >
              {task.isDirected ? '定向准入' : '大厅招募'}
            </span>
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: '#F5F6F8', color: '#6B7280' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>剩余名额 {task.remainingSlots} 人</span>
          <span>截止 {task.deadline}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${recruitmentRate}%`, background: '#3DBFA0' }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>招募进度 {recruitmentRate}%</span>
          <span>约{task.estimatedMinutes}分钟</span>
        </div>
      </div>
    </div>
  );
}
