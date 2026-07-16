import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { POINT_TRANSACTIONS } from '../../../data/mockData';
import { StatusBadge } from '../../common/StatusBadge';

const FILTER_TABS = ['全部', '获得', '兑换', '邀请'];

export function PointsCenter() {
  const { user, navigate } = useApp();
  const [activeTab, setActiveTab] = useState(0);

  const filtered = POINT_TRANSACTIONS.filter((t) => {
    if (activeTab === 0) return true;
    if (activeTab === 1) return t.type === 'earn';
    if (activeTab === 2) return t.type === 'redeem';
    if (activeTab === 3) return t.type === 'invite';
    return true;
  });

  const frozenPoints = user.frozenPoints;
  const totalPoints = user.points + frozenPoints;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 pt-2 pb-6"
        style={{ background: 'linear-gradient(180deg, #2E3D4F 0%, #3a5068 100%)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            onClick={() => navigate('my-profile')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-white flex-1">积分中心</h1>
        </div>

        {/* Balance card */}
        <div className="bg-white/10 rounded-2xl p-5 text-center">
          <p className="text-xs text-white/60 mb-1">可用积分</p>
          <div className="text-4xl font-bold text-white">{user.points}</div>
          <div className="mt-3 flex justify-center gap-6 text-xs text-white/60">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base font-semibold text-white/80">{frozenPoints}</span>
              <span>冻结积分</span>
            </div>
            <div className="w-px bg-white/20" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base font-semibold text-white/80">{user.totalEarned}</span>
              <span>累计获得</span>
            </div>
            <div className="w-px bg-white/20" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-base font-semibold text-white/80">100:1</span>
              <span>兑换比例</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 px-4 py-3">
        <button
          className="bg-white rounded-2xl p-4 flex items-center gap-3 active:bg-gray-50"
          onClick={() => navigate('withdraw')}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#E8F7F4' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="5" width="20" height="14" rx="2" stroke="#3DBFA0" strokeWidth="2" fill="none" />
              <path d="M2 10h20" stroke="#3DBFA0" strokeWidth="2" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">兑换提现</p>
            <p className="text-xs text-gray-400 mt-0.5">100积分=¥1</p>
          </div>
        </button>
        <button
          className="bg-white rounded-2xl p-4 flex items-center gap-3 active:bg-gray-50"
          onClick={() => navigate('invite')}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#EEF4FF' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#3B82F6" strokeWidth="2" fill="none" />
              <circle cx="9" cy="7" r="4" stroke="#3B82F6" strokeWidth="2" fill="none" />
              <path d="M23 11l-2-2m0 0l-2 2m2-2v6" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">邀请得积分</p>
            <p className="text-xs text-gray-400 mt-0.5">各得50积分</p>
          </div>
        </button>
      </div>

      {/* Transactions */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-100">
            {FILTER_TABS.map((tab, i) => (
              <button
                key={tab}
                className="flex-1 py-2.5 text-sm font-medium border-b-2 transition-all"
                style={{
                  borderColor: activeTab === i ? '#3DBFA0' : 'transparent',
                  color: activeTab === i ? '#3DBFA0' : '#9CA3AF',
                }}
                onClick={() => setActiveTab(i)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div>
            {filtered.map((tx, i) => (
              <div key={tx.id}>
                {i > 0 && <div className="h-px bg-gray-50 mx-4" />}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: tx.type === 'earn' ? '#E8F7F4'
                        : tx.type === 'invite' ? '#EEF4FF'
                        : tx.type === 'deduct' || tx.type === 'redeem' ? '#FEF2F2'
                        : '#FFF7E6',
                    }}
                  >
                    <span className="text-base">
                      {tx.type === 'earn' ? '✓' : tx.type === 'invite' ? '👥' : tx.type === 'redeem' ? '💳' : tx.type === 'deduct' ? '✗' : '❄'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{tx.createdAt}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className="text-sm font-bold"
                      style={{ color: tx.amount > 0 ? '#3DBFA0' : '#EF4444' }}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                    </div>
                    <StatusBadge type="point" status={tx.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
