import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';

export function WithdrawPage() {
  const { user, navigate } = useApp();
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'confirm' | 'success'>('form');
  const feeRate = 0.0675;
  const numAmount = parseFloat(amount) || 0;
  const pointsNeeded = numAmount * 100;
  const fee = numAmount * feeRate;
  const net = numAmount - fee;

  const minWithdraw = 10;
  const maxWithdraw = Math.floor(user.points / 100);
  const canWithdraw = numAmount >= minWithdraw && pointsNeeded <= user.points && !user.verified === false;

  function handleConfirm() {
    if (!user.verified) {
      setStep('confirm');
      return;
    }
    setStep('confirm');
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: '#E8F7F4' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M10 20l7 7L30 13" stroke="#3DBFA0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">提现申请已提交</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          申请已提交，预计 1-3 个工作日到账。实际到账金额 <span className="text-[#3DBFA0] font-bold">¥{net.toFixed(2)}</span>
        </p>
        <button
          className="w-full py-3.5 rounded-2xl text-white font-semibold"
          style={{ background: '#3DBFA0' }}
          onClick={() => navigate('points-center')}
        >
          返回积分中心
        </button>
      </div>
    );
  }

  if (step === 'confirm' && !user.verified) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 pt-2 pb-4" style={{ background: 'linear-gradient(180deg, #2E3D4F 0%, #3a5068 100%)' }}>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} onClick={() => setStep('form')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <h1 className="text-base font-semibold text-white">实名认证</h1>
          </div>
        </div>
        <div className="flex-1 px-4 py-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#FFF7E6' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#F59E0B" strokeWidth="2" fill="none"/></svg>
            </div>
            <h2 className="text-base font-bold text-gray-800 mb-2">提现前需完成实名认证</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              根据监管要求，提现时需完成身份证实名验证。您的身份信息将依法保护，不会用于其他用途。
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 space-y-3">
            <div>
              <label className="block text-sm text-gray-500 mb-1.5">真实姓名</label>
              <div className="flex items-center rounded-xl px-4 h-12" style={{ background: '#F5F6F8' }}>
                <input type="text" placeholder="请输入真实姓名" className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1.5">身份证号码</label>
              <div className="flex items-center rounded-xl px-4 h-12" style={{ background: '#F5F6F8' }}>
                <input type="text" maxLength={18} placeholder="请输入身份证号码" className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400" />
              </div>
            </div>
          </div>
          <button
            className="w-full py-3.5 rounded-2xl text-white font-semibold"
            style={{ background: '#3DBFA0' }}
            onClick={() => setStep('success')}
          >
            提交认证并申请提现
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-2 pb-4" style={{ background: 'linear-gradient(180deg, #2E3D4F 0%, #3a5068 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} onClick={() => navigate('my-profile')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <h1 className="text-base font-semibold text-white flex-1">提现申请</h1>
        </div>
        <div className="bg-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/60">可提现积分</p>
          <div className="text-3xl font-bold text-white mt-1">{user.points}</div>
          <p className="text-xs text-white/60 mt-1">约可提现 ¥{maxWithdraw.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {/* Amount input */}
        <div className="bg-white rounded-2xl p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">提现金额（元）</label>
          <div className="flex items-center rounded-xl px-4 h-14 border-2 transition-colors" style={{ background: '#F5F6F8', borderColor: numAmount >= minWithdraw ? '#3DBFA0' : '#E5E7EB' }}>
            <span className="text-lg text-gray-400 mr-2">¥</span>
            <input
              type="number"
              min={minWithdraw}
              max={maxWithdraw}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-xl font-bold outline-none text-gray-800 placeholder-gray-300"
            />
            <button className="text-sm text-[#3DBFA0] font-medium" onClick={() => setAmount(String(maxWithdraw))}>
              全部
            </button>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>最低提现 ¥{minWithdraw}</span>
            <span>消耗 {pointsNeeded} 积分</span>
          </div>
          <div className="flex gap-2 mt-3">
            {[10, 50, 100].map((v) => (
              <button
                key={v}
                className="flex-1 py-1.5 rounded-lg text-xs border transition-all"
                style={{
                  borderColor: numAmount === v ? '#3DBFA0' : '#E5E7EB',
                  background: numAmount === v ? '#E8F7F4' : 'transparent',
                  color: numAmount === v ? '#3DBFA0' : '#6B7280',
                }}
                onClick={() => setAmount(String(v))}
              >
                ¥{v}
              </button>
            ))}
          </div>
        </div>

        {/* Fee breakdown */}
        {numAmount > 0 && (
          <div className="bg-white rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">费用明细</h3>
            <div className="space-y-2">
              {[
                { label: '提现金额', value: `¥${numAmount.toFixed(2)}` },
                { label: `第三方结算费 (${(feeRate * 100).toFixed(2)}%)`, value: `-¥${fee.toFixed(2)}`, color: '#EF4444' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span style={{ color: color || '#374151' }}>{value}</span>
                </div>
              ))}
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-gray-700">实际到账</span>
                <span style={{ color: '#3DBFA0' }}>¥{net.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-3 p-2.5 rounded-xl text-xs text-yellow-700" style={{ background: '#FFF7E6' }}>
              第三方结算服务费 6.75% 由用户承担，已在到账金额中扣除。
            </div>
          </div>
        )}

        {/* Withdraw method */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">到账方式</h3>
          <div className="flex items-center gap-3 p-3 rounded-xl border-2" style={{ borderColor: '#3DBFA0' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#07C160' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M9.5 4C6.46 4 4 6.46 4 9.5c0 1.38.5 2.63 1.32 3.59l-.9 2.45 2.55-.78C7.82 15.54 8.64 15.8 9.5 15.8c.29 0 .57-.03.85-.07-.27-.62-.42-1.3-.42-2.02C9.93 10.56 12.49 8.2 15.65 8.2c.37 0 .73.04 1.09.1C16.1 5.76 13.05 4 9.5 4zm-1.25 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2.75 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">微信零钱</p>
              <p className="text-xs text-gray-400 mt-0.5">绑定微信账号自动到账</p>
            </div>
            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: '#3DBFA0' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#3DBFA0' }} />
            </div>
          </div>
        </div>

        <div style={{ height: 80 }} />
      </div>

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <button
          className="w-full py-3.5 rounded-2xl text-white font-semibold transition-opacity"
          style={{ background: '#3DBFA0', opacity: canWithdraw ? 1 : 0.5 }}
          disabled={!canWithdraw}
          onClick={handleConfirm}
        >
          {!user.verified ? '认证并提现' : `申请提现 ¥${net.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
