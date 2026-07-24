import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';

function LogoIcon({ size = 64, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <div
      className="flex items-center justify-center rounded-2xl"
      style={{
        width: size,
        height: size,
        background: dark ? 'rgba(255,255,255,0.15)' : '#3DBFA0',
        backdropFilter: 'blur(8px)',
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 36 36" fill="none">
        <ellipse cx="18" cy="28" rx="13" ry="4" fill="white" opacity="0.3" />
        <rect x="6" y="22" width="24" height="6" rx="3" fill="white" opacity="0.6" />
        <rect x="4" y="14" width="28" height="10" rx="4" fill="white" opacity="0.8" />
        <rect x="2" y="6" width="32" height="10" rx="5" fill="white" />
      </svg>
    </div>
  );
}

function AgreementModal({ onAgree, onDisagree }: { onAgree: () => void; onDisagree: () => void }) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ zIndex: 50 }}>
      <div className="flex-1 bg-black/40" onClick={onDisagree} />
      <div className="bg-white rounded-t-3xl px-6 pt-8 pb-8 flex flex-col items-center" style={{ maxHeight: '75%' }}>
        <LogoIcon size={56} />
        <h2 className="mt-4 text-lg font-semibold text-gray-800">欢迎来到采集平台</h2>
        <p className="mt-1 text-sm text-gray-500">请阅读并同意以下协议，开始使用</p>

        <div
          className="mt-4 w-full rounded-2xl p-4 overflow-y-auto text-sm text-gray-600 leading-relaxed"
          style={{ background: '#F5F6F8', maxHeight: 200 }}
        >
          <p className="font-semibold text-gray-800 mb-2">一、用户服务协议</p>
          <p>
            本协议是您与采集平台之间关于使用本平台服务所订立的协议。您注册或使用本平台，即视为同意本协议全部条款。本平台为您提供数据采集任务发布、接受及管理服务，平台有权在不另行通知的情况下对服务内容及本协议进行更新。
          </p>
          <p className="font-semibold text-gray-800 mt-3 mb-2">二、隐私保护声明</p>
          <p>
            我们重视您的个人信息保护。您提交的采集数据仅用于人工智能模型训练，平台将严格按照相关法律法规处理您的数据，不会在未经授权的情况下将您的数据用于其他商业目的。
          </p>
          <p className="font-semibold text-gray-800 mt-3 mb-2">三、积分与提现规则</p>
          <p>
            任务完成并通过质检后积分将自动到账。积分可按规则兑换现金，提现时将收取约6.75%的第三方结算服务费，请在提现前仔细阅读费用说明。
          </p>
        </div>

        <label className="mt-4 flex w-full cursor-pointer items-start gap-2 text-xs leading-5 text-gray-500">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#3DBFA0]"
          />
          <span>
            我已阅读并同意
            <span className="text-[#3DBFA0]">《用户服务协议》</span>
            和
            <span className="text-[#3DBFA0]">《隐私政策》</span>
          </span>
        </label>

        <button
          className="mt-4 w-full py-3.5 rounded-2xl text-white text-base font-semibold transition-opacity"
          style={{ background: '#3DBFA0', opacity: agreed ? 1 : 0.5 }}
          onClick={onAgree}
          disabled={!agreed}
        >
          同意并继续
        </button>
        <button
          className="mt-3 w-full py-2.5 text-sm text-gray-500"
          onClick={onDisagree}
        >
          暂不同意
        </button>
      </div>
    </div>
  );
}

export function OnboardingScreen() {
  const { login } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loginAgreementAccepted, setLoginAgreementAccepted] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [countdown, setCountdown] = useState(0);

  function sendCode() {
    setCodeSent(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  function handleSubmit() {
    if (phone.length < 11 || !code.trim()) return;
    if (tab === 'register') {
      setShowAgreement(true);
      return;
    }
    if (loginAgreementAccepted) login();
  }

  function handleWechatLogin() {
    if (tab === 'register') {
      setShowAgreement(true);
      return;
    }
    if (loginAgreementAccepted) login();
  }

  return (
    <div className="relative h-full flex flex-col">
      {/* Header gradient */}
      <div
        className="flex flex-col items-center pt-10 pb-12 px-8"
        style={{ background: 'linear-gradient(180deg, #2E3D4F 0%, #3a5068 100%)' }}
      >
        <LogoIcon size={72} dark />
        <h1 className="mt-5 text-2xl font-bold text-white">标贝易采</h1>
        <p className="mt-1.5 text-sm text-white/60">高效灵活的数据采集任务平台</p>

        {/* Tab switcher */}
        <div
          className="mt-8 flex w-full rounded-2xl p-1"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        >
          <button
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: tab === 'login' ? '#3DBFA0' : 'transparent',
              color: tab === 'login' ? '#fff' : 'rgba(255,255,255,0.6)',
            }}
            onClick={() => {
              setTab('login');
              setLoginAgreementAccepted(false);
            }}
          >
            登录
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: tab === 'register' ? '#3DBFA0' : 'transparent',
              color: tab === 'register' ? '#fff' : 'rgba(255,255,255,0.6)',
            }}
            onClick={() => {
              setTab('register');
              setLoginAgreementAccepted(false);
            }}
          >
            注册
          </button>
        </div>
      </div>

      {/* Form area */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-white rounded-t-3xl -mt-6 px-6 pt-8 pb-6 flex flex-col">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1.5">手机号码</label>
            <div
              className="flex items-center rounded-xl px-4 h-12"
              style={{ background: '#F5F6F8' }}
            >
              <span className="text-sm text-gray-500 mr-2">+86</span>
              <div className="w-px h-4 bg-gray-200 mr-3" />
              <input
                type="tel"
                maxLength={11}
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1.5">验证码</label>
            <div
              className="flex items-center rounded-xl px-4 h-12 gap-3"
              style={{ background: '#F5F6F8' }}
            >
              <input
                type="text"
                maxLength={6}
                placeholder="请输入验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
              />
              <button
                className="text-sm font-medium flex-shrink-0 px-2"
                style={{ color: countdown > 0 ? '#9CA3AF' : '#3DBFA0' }}
                onClick={sendCode}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `${countdown}s后重发` : '获取验证码'}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-sm text-gray-500 mb-1.5">
                邀请码 <span className="text-xs text-gray-400">（非必填）</span>
              </label>
              <div className="flex h-12 items-center rounded-xl px-4" style={{ background: '#F5F6F8' }}>
                <input
                  type="text"
                  maxLength={20}
                  placeholder="有邀请码可填写"
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                  className="flex-1 bg-transparent text-sm uppercase text-gray-800 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>
          )}
        </div>

        {tab === 'login' && (
          <label className="mt-5 flex cursor-pointer items-start gap-2 text-xs leading-5 text-gray-500">
            <input
              type="checkbox"
              checked={loginAgreementAccepted}
              onChange={(event) => setLoginAgreementAccepted(event.target.checked)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#3DBFA0]"
            />
            <span>
              我已阅读并同意
              <span className="text-[#3DBFA0]">《用户服务协议》</span>
              和
              <span className="text-[#3DBFA0]">《隐私政策》</span>
            </span>
          </label>
        )}

        <button
          className={`${tab === 'login' ? 'mt-3' : 'mt-6'} w-full py-3.5 rounded-2xl text-white text-base font-semibold transition-opacity`}
          style={{
            background: '#3DBFA0',
            opacity: phone.length >= 11 && Boolean(code.trim()) && (tab === 'register' || loginAgreementAccepted) ? 1 : 0.5,
          }}
          onClick={handleSubmit}
          disabled={phone.length < 11 || !code.trim() || (tab === 'login' && !loginAgreementAccepted)}
        >
          {tab === 'login' ? '立即登录' : '立即注册'}
        </button>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">其他登录方式</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="mt-4 flex justify-center">
          <button
            className="flex flex-col items-center gap-1"
            onClick={handleWechatLogin}
            disabled={tab === 'login' && !loginAgreementAccepted}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: '#07C160' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M9.5 4C6.46 4 4 6.46 4 9.5c0 1.38.5 2.63 1.32 3.59l-.9 2.45 2.55-.78C7.82 15.54 8.64 15.8 9.5 15.8c.29 0 .57-.03.85-.07-.27-.62-.42-1.3-.42-2.02C9.93 10.56 12.49 8.2 15.65 8.2c.37 0 .73.04 1.09.1C16.1 5.76 13.05 4 9.5 4zm-1.25 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2.75 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
                <path d="M15.65 9.5c-2.56 0-4.65 1.85-4.65 4.13 0 2.27 2.09 4.12 4.65 4.12.55 0 1.07-.09 1.56-.24l2.01.61-.7-1.92c.71-.73 1.13-1.6 1.13-2.57C19.65 11.35 17.89 9.5 15.65 9.5zm-1.15 2.75c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75zm2.5 0c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75z" />
              </svg>
            </div>
            <span className={`text-xs ${tab === 'login' && !loginAgreementAccepted ? 'text-gray-300' : 'text-gray-500'}`}>微信登录</span>
          </button>
        </div>

        {tab === 'register' && (
          <p className="mt-auto pt-6 text-center text-xs text-gray-400 leading-5">
            注册后将确认并同意
            <span className="text-[#3DBFA0]">《用户服务协议》</span>
            和
            <span className="text-[#3DBFA0]">《隐私政策》</span>
          </p>
        )}
      </div>

      {showAgreement && (
        <AgreementModal
          onAgree={() => {
            setShowAgreement(false);
            login();
          }}
          onDisagree={() => setShowAgreement(false)}
        />
      )}
    </div>
  );
}
