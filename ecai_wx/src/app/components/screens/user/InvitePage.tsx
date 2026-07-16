import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { INVITE_RECORDS } from '../../../data/mockData';

export function InvitePage() {
  const { user, navigate } = useApp();
  const [copied, setCopied] = useState(false);
  const earned = INVITE_RECORDS.filter((r) => r.firstTaskPassed).length * 50;

  function copyCode() {
    navigator.clipboard?.writeText(user.inviteCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div
        className="px-5 pt-2 pb-8"
        style={{ background: 'linear-gradient(180deg, #2E3D4F 0%, #3a5068 100%)' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            onClick={() => navigate('my-profile')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-white flex-1">邀请好友</h1>
        </div>

        {/* Hero */}
        <div className="text-center text-white mb-6">
          <div className="text-5xl mb-2">🎁</div>
          <h2 className="text-xl font-bold">邀请好友，双方各得</h2>
          <div className="text-4xl font-black mt-1" style={{ color: '#7DDFC8' }}>50<span className="text-xl font-bold ml-1">积分</span></div>
          <p className="text-xs text-white/60 mt-2">被邀请人完成首个任务并通过审核后奖励到账</p>
        </div>

        {/* Invite code */}
        <div className="bg-white/15 rounded-2xl p-4">
          <p className="text-xs text-white/60 mb-2">我的邀请码</p>
          <div className="flex items-center justify-between">
            <span
              className="text-2xl font-black tracking-widest"
              style={{ color: '#7DDFC8', letterSpacing: 4 }}
            >
              {user.inviteCode}
            </span>
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: copied ? '#22C55E' : '#3DBFA0',
                color: 'white',
              }}
              onClick={copyCode}
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* How it works */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">邀请规则</h3>
          <div className="space-y-3">
            {[
              { step: '1', text: '分享邀请码或链接给好友', icon: '📤' },
              { step: '2', text: '好友使用邀请码注册账号', icon: '👤' },
              { step: '3', text: '好友完成首个任务并通过质检', icon: '✅' },
              { step: '4', text: '双方各获得 50 积分奖励', icon: '🎉' },
            ].map(({ step, text, icon }) => (
              <div key={step} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-base"
                  style={{ background: '#E8F7F4' }}
                >
                  {icon}
                </div>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 rounded-xl text-xs text-gray-500 leading-relaxed" style={{ background: '#F5F6F8' }}>
            • 每个用户只能被邀请一次，不支持多级分销<br/>
            • 奖励积分在被邀请人首个任务验收通过后 24 小时内到账<br/>
            • 平台保留对异常邀请行为的审核权利
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-800">邀请统计</h3>
            <span className="text-xs text-[#3DBFA0]">累计获得 {earned} 积分</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center mb-3">
            {[
              { label: '已邀请', value: INVITE_RECORDS.length },
              { label: '首单通过', value: INVITE_RECORDS.filter((r) => r.firstTaskPassed).length },
              { label: '待达成', value: INVITE_RECORDS.filter((r) => !r.firstTaskPassed).length },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl py-3">
                <div className="text-base font-bold text-gray-800">{value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Invite records */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-800">邀请记录</p>
          </div>
          {INVITE_RECORDS.map((record, i) => (
            <div key={record.id}>
              {i > 0 && <div className="h-px bg-gray-50 mx-4" />}
              <div className="flex items-center gap-3 px-4 py-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ background: record.firstTaskPassed ? '#3DBFA0' : '#9CA3AF' }}
                >
                  {record.nickname[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">{record.nickname}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{record.joinedAt} 加入</p>
                </div>
                <div className="text-right">
                  {record.firstTaskPassed ? (
                    <>
                      <div className="text-sm font-bold" style={{ color: '#3DBFA0' }}>+{record.rewardPoints}</div>
                      <div className="text-xs text-gray-400">已到账</div>
                    </>
                  ) : (
                    <div
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: '#FFF7E6', color: '#F59E0B' }}
                    >
                      待首单
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Share button */}
        <button
          className="w-full py-3.5 rounded-2xl text-white font-semibold"
          style={{ background: '#3DBFA0' }}
          onClick={copyCode}
        >
          分享邀请码给好友
        </button>
      </div>
    </div>
  );
}
