import React from 'react';
import { useApp } from '../../../context/AppContext';

const LEVEL_COLORS = ['#9CA3AF', '#CD7F32', '#C0C0C0', '#FFD700', '#3DBFA0', '#8B5CF6'];
const LEVEL_NAMES = ['', '铜牌采集员', '银牌采集员', '金牌采集员', '白金采集员', '钻石采集员'];

function MenuRow({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value?: string; onClick?: () => void }) {
  return (
    <button
      className="flex items-center gap-3 px-4 py-3.5 w-full active:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#F5F6F8' }}>
        {icon}
      </div>
      <span className="flex-1 text-sm text-gray-700 text-left">{label}</span>
      {value && <span className="text-sm text-gray-400 mr-1">{value}</span>}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M9 18l6-6-6-6" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function MyProfile() {
  const { user, navigate, logout } = useApp();
  const level = user.level;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div
        className="px-5 pt-4 pb-6"
        style={{ background: 'linear-gradient(180deg, #2E3D4F 0%, #3a5068 100%)' }}
      >
        <h1 className="text-base font-bold text-white mb-4">我的</h1>
        {/* User card */}
        <button
          className="bg-white/10 rounded-2xl p-4 flex items-center gap-3 w-full text-left transition-all active:scale-[0.99] active:bg-white/15"
          onClick={() => navigate('edit-profile')}
          aria-label="编辑个人信息"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl overflow-hidden"
            style={{ background: `${LEVEL_COLORS[level]}30`, border: `2px solid ${LEVEL_COLORS[level]}` }}
          >
            {user.avatar ? <img src={user.avatar} alt="个人头像" className="w-full h-full object-cover" /> : '🎙️'}
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-white">{user.nickname}</p>
            <p className="text-xs text-white/60 mt-0.5">{user.phone}</p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${LEVEL_COLORS[level]}30`, color: LEVEL_COLORS[level] }}
              >
                Lv.{level} {LEVEL_NAMES[level]}
              </span>
            </div>
            <p className="text-[10px] text-white/45 mt-1.5">点击编辑个人信息</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-[#7DDFC8]">{user.points}</div>
            <div className="text-xs text-white/60">可用积分</div>
            <svg className="ml-auto mt-2" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>

        {/* Level progress */}
        <div className="mt-3 bg-white/10 rounded-2xl p-3">
          <div className="flex justify-between text-xs text-white/60 mb-1.5">
            <span>成长进度</span>
            <span>{user.exp}/{user.expToNext} exp</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(user.exp / user.expToNext) * 100}%`,
                background: LEVEL_COLORS[level],
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 py-3">
        {[
          { label: '总任务数', value: user.taskCount },
          { label: '通过率', value: `${user.passRate}%` },
          { label: '邀请人数', value: user.inviteCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl py-3 flex flex-col items-center">
            <div className="text-base font-bold text-gray-800">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Menu sections */}
      <div className="px-4 space-y-3 pb-6">
        {/* Account */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-400">账户信息</p>
          </div>
          <MenuRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#3DBFA0" strokeWidth="2" fill="none"/><path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="#3DBFA0" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>}
            label="实名认证"
            value={user.verified ? '已认证' : '未认证'}
            onClick={() => {}}
          />
          <div className="h-px bg-gray-50 mx-4" />
          <MenuRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="10" width="16" height="11" rx="3" stroke="#2E7D6B" strokeWidth="2"/><path d="M8 10V7a4 4 0 018 0v3M12 14v3" stroke="#2E7D6B" strokeWidth="2" strokeLinecap="round"/></svg>}
            label="账号与安全"
            value="安全"
            onClick={() => navigate('account-security')}
          />
          <div className="h-px bg-gray-50 mx-4" />
          <MenuRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v5c0 4.8-2.9 8.1-7 10-4.1-1.9-7-5.2-7-10V6l7-3z" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            label="授权中心"
            value="2项生效"
            onClick={() => navigate('authorization-center')}
          />
          <div className="h-px bg-gray-50 mx-4" />
          <MenuRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#8B5CF6" strokeWidth="2" fill="none"/><path d="M9 12l2 2 4-4" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            label="认证与证书"
            value={`${user.certifications.length}项`}
            onClick={() => navigate('certificates')}
          />
          <div className="h-px bg-gray-50 mx-4" />
          <MenuRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#EF4444" strokeWidth="2" fill="none"/></svg>}
            label="勋章墙"
            value={`${user.badges.length}枚`}
            onClick={() => navigate('certificates')}
          />
        </div>

        {/* Finance */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-400">积分与提现</p>
          </div>
          <MenuRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#F59E0B" strokeWidth="2" fill="none"/><path d="M12 7v5l3 3" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/></svg>}
            label="积分中心"
            value={`${user.points}分可用`}
            onClick={() => navigate('points-center')}
          />
          <div className="h-px bg-gray-50 mx-4" />
          <MenuRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="5" width="20" height="14" rx="2" stroke="#3DBFA0" strokeWidth="2" fill="none"/><path d="M2 10h20" stroke="#3DBFA0" strokeWidth="2"/></svg>}
            label="提现申请"
            onClick={() => navigate('withdraw')}
          />
        </div>

        {/* Social */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-400">邀请与分享</p>
          </div>
          <MenuRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#3B82F6" strokeWidth="2" fill="none"/><circle cx="9" cy="7" r="4" stroke="#3B82F6" strokeWidth="2" fill="none"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#3B82F6" strokeWidth="2" fill="none"/></svg>}
            label="邀请好友"
            value="各得50积分"
            onClick={() => navigate('invite')}
          />
        </div>

        {/* Other */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <MenuRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#9CA3AF" strokeWidth="2" fill="none"/><path d="M12 8v4M12 16h.01" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/></svg>}
            label="帮助与客服"
            onClick={() => {}}
          />
          <div className="h-px bg-gray-50 mx-4" />
          <MenuRow
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            label="退出登录"
            onClick={logout}
          />
        </div>
      </div>
    </div>
  );
}
