import React, { useState } from 'react';
import { ChevronLeft, KeyRound, Mail, MessageCircle, Phone, ShieldCheck, Smartphone } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

type BindingKey = 'wechat' | 'phone' | 'email';

export function AccountSecurity() {
  const { navigate, user } = useApp();
  const [bindings, setBindings] = useState<Record<BindingKey, boolean>>({
    wechat: true,
    phone: Boolean(user.phone),
    email: false,
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordSaved, setPasswordSaved] = useState(false);

  function bind(key: BindingKey) {
    if (key === 'phone') {
      navigate('edit-profile', { returnTo: 'account-security' });
      return;
    }
    setBindings((current) => ({ ...current, [key]: true }));
  }

  function savePassword() {
    if (!passwords.current || passwords.next.length < 6 || passwords.next !== passwords.confirm) return;
    setPasswordSaved(true);
    setPasswords({ current: '', next: '', confirm: '' });
    window.setTimeout(() => {
      setPasswordSaved(false);
      setShowPasswordForm(false);
    }, 900);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F2F5F5]">
      <header className="relative flex-shrink-0 overflow-hidden bg-[linear-gradient(145deg,#293A4D_0%,#3C566D_100%)] px-4 pb-6 pt-4 text-white">
        <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full border border-white/10" />
        <div className="relative flex items-center gap-3">
          <button onClick={() => navigate('my-profile')} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15" aria-label="返回我的">
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold">账号与安全</h1>
            <p className="mt-0.5 text-[10px] text-white/50">管理登录凭证与账号绑定</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3DBFA0]/25"><ShieldCheck size={19} color="#8BE6D0" /></div>
        </div>
      </header>

      <main className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-5 pt-4">
        <section className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(46,61,79,.05)]">
          <SectionTitle title="修改密码" subtitle="建议定期更新登录密码" />
          <button onClick={() => setShowPasswordForm((visible) => !visible)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50">
            <IconBox color="#F0F5FF"><KeyRound size={17} color="#4D76C9" /></IconBox>
            <div className="flex-1"><p className="text-sm text-gray-700">登录密码</p><p className="mt-0.5 text-[10px] text-gray-400">通过原密码验证后修改</p></div>
            <span className="text-xs font-medium text-[#2FAE8E]">修改</span>
          </button>
          {showPasswordForm && (
            <div className="mx-4 mb-4 space-y-2 rounded-xl bg-[#F6F8F8] p-3">
              <PasswordInput placeholder="请输入当前密码" value={passwords.current} onChange={(current) => setPasswords({ ...passwords, current })} />
              <PasswordInput placeholder="请输入新密码（至少6位）" value={passwords.next} onChange={(next) => setPasswords({ ...passwords, next })} />
              <PasswordInput placeholder="再次输入新密码" value={passwords.confirm} onChange={(confirm) => setPasswords({ ...passwords, confirm })} />
              <button onClick={savePassword} disabled={!passwords.current || passwords.next.length < 6 || passwords.next !== passwords.confirm} className="h-9 w-full rounded-lg bg-[#2FAE8E] text-xs font-semibold text-white disabled:opacity-40">
                {passwordSaved ? '修改成功' : '确认修改'}
              </button>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(46,61,79,.05)]">
          <SectionTitle title="绑定方式" subtitle="绑定后可用于登录和安全验证" />
          <BindingRow icon={<MessageCircle size={17} color="#07A94F" />} iconBg="#E9F9EF" label="微信" detail={bindings.wechat ? '采集达人' : '未绑定'} bound={bindings.wechat} onBind={() => bind('wechat')} />
          <Divider />
          <BindingRow icon={<Phone size={17} color="#337FC4" />} iconBg="#EDF6FF" label="手机号" detail={bindings.phone ? user.phone : '未绑定'} bound={bindings.phone} onBind={() => bind('phone')} />
          <Divider />
          <BindingRow icon={<Mail size={17} color="#D78337" />} iconBg="#FFF4E8" label="邮箱" detail={bindings.email ? 'c***@example.com' : '未绑定'} bound={bindings.email} onBind={() => bind('email')} />
        </section>

        <section className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_28px_rgba(46,61,79,.05)]">
          <SectionTitle title="安全中心" subtitle="查看账号当前安全状态" />
          <div className="flex items-center gap-3 px-4 py-3.5">
            <IconBox color="#EAF8F4"><ShieldCheck size={17} color="#2FAE8E" /></IconBox>
            <div className="flex-1"><p className="text-sm text-gray-700">账号安全状态</p><p className="mt-0.5 text-[10px] text-gray-400">未发现异常登录或风险操作</p></div>
            <span className="rounded-full bg-[#E8F7F4] px-2 py-1 text-[10px] font-medium text-[#278E75]">安全</span>
          </div>
          <Divider />
          <button className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50">
            <IconBox color="#F3F4F6"><Smartphone size={17} color="#667788" /></IconBox>
            <div className="flex-1"><p className="text-sm text-gray-700">登录设备管理</p><p className="mt-0.5 text-[10px] text-gray-400">当前共 1 台设备</p></div>
            <ChevronLeft size={15} className="rotate-180 text-gray-300" />
          </button>
        </section>
      </main>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="border-b border-gray-50 px-4 py-3"><p className="text-xs font-semibold text-gray-700">{title}</p><p className="mt-0.5 text-[10px] text-gray-400">{subtitle}</p></div>;
}

function IconBox({ color, children }: { color: string; children: React.ReactNode }) {
  return <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: color }}>{children}</div>;
}

function Divider() {
  return <div className="mx-4 h-px bg-gray-50" />;
}

function BindingRow({ icon, iconBg, label, detail, bound, onBind }: { icon: React.ReactNode; iconBg: string; label: string; detail: string; bound: boolean; onBind: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <IconBox color={iconBg}>{icon}</IconBox>
      <div className="min-w-0 flex-1"><p className="text-sm text-gray-700">{label}</p><p className="mt-0.5 truncate text-[10px] text-gray-400">{detail}</p></div>
      {bound ? <span className="rounded-full bg-[#E8F7F4] px-2 py-1 text-[10px] font-medium text-[#278E75]">已绑定</span> : <button onClick={onBind} className="rounded-lg border border-[#BFDCD5] px-2.5 py-1.5 text-[10px] font-semibold text-[#278E75]">去绑定</button>}
    </div>
  );
}

function PasswordInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (value: string) => void }) {
  return <input type="password" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-lg border border-[#E1E7E8] bg-white px-3 text-xs outline-none focus:border-[#70CDB7]" />;
}
