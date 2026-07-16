import React from 'react';
import { UserTaskStatus, PointStatus, WithdrawStatus } from '../../data/mockData';

const USER_TASK_LABELS: Record<UserTaskStatus, { label: string; bg: string; color: string }> = {
  available:    { label: '可领取',   bg: '#E8F7F4', color: '#3DBFA0' },
  in_progress:  { label: '进行中',   bg: '#EEF4FF', color: '#3B82F6' },
  submitted:    { label: '已提交',   bg: '#F3F4F6', color: '#6B7280' },
  model_review: { label: '模型检测', bg: '#FFF7E6', color: '#F59E0B' },
  human_review: { label: '人工复核', bg: '#FFF7E6', color: '#F59E0B' },
  rework:       { label: '需返工',   bg: '#FEF2F2', color: '#EF4444' },
  passed:       { label: '已通过',   bg: '#F0FDF4', color: '#22C55E' },
  failed:       { label: '未通过',   bg: '#FEF2F2', color: '#EF4444' },
  expired:      { label: '已过期',   bg: '#F3F4F6', color: '#9CA3AF' },
};

const POINT_LABELS: Record<PointStatus, { label: string; bg: string; color: string }> = {
  pending:  { label: '待生效', bg: '#FFF7E6', color: '#F59E0B' },
  available:{ label: '可用',   bg: '#F0FDF4', color: '#22C55E' },
  frozen:   { label: '冻结中', bg: '#EEF4FF', color: '#3B82F6' },
  redeemed: { label: '已兑换', bg: '#F3F4F6', color: '#6B7280' },
  deducted: { label: '已扣回', bg: '#FEF2F2', color: '#EF4444' },
};

const WITHDRAW_LABELS: Record<WithdrawStatus, { label: string; bg: string; color: string }> = {
  pending_id:     { label: '待实名',   bg: '#FFF7E6', color: '#F59E0B' },
  pending_review: { label: '待审核',   bg: '#EEF4FF', color: '#3B82F6' },
  processing:     { label: '处理中',   bg: '#F5F3FF', color: '#8B5CF6' },
  paid:           { label: '已到账',   bg: '#F0FDF4', color: '#22C55E' },
  failed:         { label: '失败',     bg: '#FEF2F2', color: '#EF4444' },
  closed:         { label: '已关闭',   bg: '#F3F4F6', color: '#9CA3AF' },
};

interface Props {
  type: 'user-task' | 'point' | 'withdraw';
  status: string;
}

export function StatusBadge({ type, status }: Props) {
  let info: { label: string; bg: string; color: string } | undefined;
  if (type === 'user-task') info = USER_TASK_LABELS[status as UserTaskStatus];
  else if (type === 'point') info = POINT_LABELS[status as PointStatus];
  else info = WITHDRAW_LABELS[status as WithdrawStatus];

  if (!info) return null;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: info.bg, color: info.color }}
    >
      {info.label}
    </span>
  );
}
