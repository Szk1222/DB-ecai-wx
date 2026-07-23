import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';

const CERTS = [
  { id: 'c1', name: '大模型基础测评', icon: '🤖', desc: '完成大模型能力基础测试，获得平台认证资质', status: 'passed', date: '2026-05-12', unlocks: '文本高阶任务' },
  { id: 'c2', name: '普通话水平认证', icon: '🎙️', desc: '普通话发音标准性认证，提升语音任务匹配权重', status: 'passed', date: '2026-04-20', unlocks: '普通话专项任务' },
  { id: 'c3', name: '粤语认证', icon: '🌏', desc: '粤语母语者专属认证，解锁方言采集高薪任务', status: 'locked', date: '', unlocks: '粤语定向任务' },
  { id: 'c4', name: '数据采集专项认证', icon: '🏷️', desc: '图像与文本采集专业能力认证', status: 'available', date: '', unlocks: '采集专项任务' },
];

const BADGES = [
  { id: 'b1', name: '新手上路', icon: '🌱', desc: '完成第一个任务', earned: true },
  { id: 'b2', name: '首单达成', icon: '⭐', desc: '首次任务通过质检', earned: true },
  { id: 'b3', name: '连续7天', icon: '🔥', desc: '连续7天参与任务', earned: true },
  { id: 'b4', name: '邀请达人', icon: '👥', desc: '成功邀请5位好友', earned: true },
  { id: 'b5', name: '声音精英', icon: '🎵', desc: '完成100条语音采集', earned: false },
  { id: 'b6', name: '文字达人', icon: '✍️', desc: '完成50条文本采集', earned: false },
  { id: 'b7', name: '图像大师', icon: '📸', desc: '完成30张图片采集', earned: false },
  { id: 'b8', name: '钻石会员', icon: '💎', desc: '成长等级达到 Lv.5', earned: false },
];

const LEVELS = [
  { level: 1, name: '铜牌采集员', exp: 0, color: '#CD7F32', perks: ['参与基础任务'] },
  { level: 2, name: '银牌采集员', exp: 200, color: '#C0C0C0', perks: ['优先任务推荐', '专属客服'] },
  { level: 3, name: '金牌采集员', exp: 500, color: '#FFD700', perks: ['任务优先分配', '积分加成 5%'] },
  { level: 4, name: '白金采集员', exp: 1000, color: '#3DBFA0', perks: ['VIP 任务通道', '积分加成 10%', '提现免手续费'] },
  { level: 5, name: '钻石采集员', exp: 2000, color: '#8B5CF6', perks: ['专属高薪任务', '积分加成 15%', '优先提现审核'] },
];

export function CertificatePage() {
  const { user, navigate } = useApp();
  const [activeTab, setActiveTab] = useState<'cert' | 'badge' | 'level'>('cert');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-2 pb-4" style={{ background: 'linear-gradient(180deg, #2E3D4F 0%, #3a5068 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} onClick={() => navigate('my-profile')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <h1 className="text-base font-semibold text-white flex-1">认证中心</h1>
        </div>
        <div className="flex gap-2">
          {[{ key: 'cert', label: '我的认证' }, { key: 'badge', label: '勋章墙' }, { key: 'level', label: '成长等级' }].map(({ key, label }) => (
            <button
              key={key}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeTab === key ? '#3DBFA0' : 'rgba(255,255,255,0.15)',
                color: activeTab === key ? 'white' : 'rgba(255,255,255,0.7)',
              }}
              onClick={() => setActiveTab(key as any)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Certifications */}
        {activeTab === 'cert' && (
          <>
            {CERTS.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl p-4"
                style={{ opacity: cert.status === 'locked' ? 0.6 : 1 }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{
                      background: cert.status === 'passed' ? '#E8F7F4' : cert.status === 'available' ? '#EEF4FF' : '#F3F4F6',
                    }}
                  >
                    {cert.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-800">{cert.name}</h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: cert.status === 'passed' ? '#E8F7F4' : cert.status === 'available' ? '#EEF4FF' : '#F3F4F6',
                          color: cert.status === 'passed' ? '#3DBFA0' : cert.status === 'available' ? '#3B82F6' : '#9CA3AF',
                        }}
                      >
                        {cert.status === 'passed' ? '已通过' : cert.status === 'available' ? '可参加' : '未解锁'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{cert.desc}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-xs text-gray-400">解锁：</span>
                      <span className="text-xs font-medium" style={{ color: '#3DBFA0' }}>{cert.unlocks}</span>
                    </div>
                    {cert.date && <p className="text-xs text-gray-400 mt-0.5">通过时间：{cert.date}</p>}
                  </div>
                </div>
                {cert.status === 'available' && (
                  <button
                    className="mt-3 w-full py-2.5 rounded-xl text-sm font-medium text-white"
                    style={{ background: '#3DBFA0' }}
                  >
                    开始测评
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {/* Badges */}
        {activeTab === 'badge' && (
          <div className="bg-white rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-800 mb-3">
              已获得 {BADGES.filter((b) => b.earned).length}/{BADGES.length} 枚勋章
            </p>
            <div className="grid grid-cols-4 gap-3">
              {BADGES.map((badge) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-1.5"
                  style={{ opacity: badge.earned ? 1 : 0.4 }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: badge.earned ? '#E8F7F4' : '#F3F4F6' }}
                  >
                    {badge.icon}
                  </div>
                  <span className="text-xs text-center text-gray-600 leading-tight">{badge.name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-gray-500">未获得勋章任务</p>
              {BADGES.filter((b) => !b.earned).map((badge) => (
                <div key={badge.id} className="flex items-center gap-2.5 p-2.5 rounded-xl" style={{ background: '#F5F6F8' }}>
                  <span className="text-lg">{badge.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{badge.name}</p>
                    <p className="text-xs text-gray-400">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Levels */}
        {activeTab === 'level' && (
          <div className="space-y-3">
            {LEVELS.map((lv) => (
              <div
                key={lv.level}
                className="bg-white rounded-2xl p-4 border-2 transition-all"
                style={{
                  borderColor: lv.level === user.level ? lv.color : 'transparent',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold text-white"
                    style={{ background: lv.color }}
                  >
                    {lv.level}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold" style={{ color: lv.color }}>{lv.name}</p>
                      {lv.level === user.level && (
                        <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: lv.color }}>当前等级</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">需要 {lv.exp} exp</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lv.perks.map((perk) => (
                    <span
                      key={perk}
                      className="text-xs px-2 py-1 rounded-lg font-medium"
                      style={{ background: `${lv.color}15`, color: lv.color }}
                    >
                      ✓ {perk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
