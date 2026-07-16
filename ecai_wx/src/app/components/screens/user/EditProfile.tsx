import React, { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { Camera, Check, ChevronLeft, LockKeyhole, MapPin } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

const languages = ['普通话', '粤语', '四川话', '闽南语', '英语'];

export function EditProfile() {
  const { user, navigate, updateProfile } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nickname: user.nickname,
    gender: user.gender,
    birthday: user.birthday,
    region: user.region,
    language: user.language,
    avatar: user.avatar,
  });
  const [saved, setSaved] = useState(false);

  function handleAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, avatar: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    updateProfile(form);
    setSaved(true);
    window.setTimeout(() => navigate('my-profile'), 700);
  }

  return (
    <form className="flex h-full flex-col overflow-y-auto" onSubmit={submit}>
      <div className="relative px-5 pt-2 pb-16 overflow-hidden" style={{ background: 'linear-gradient(145deg, #293A4D 0%, #3B536B 100%)' }}>
        <div className="absolute -right-12 -top-16 w-40 h-40 rounded-full border border-white/10" />
        <div className="absolute right-3 top-10 w-20 h-20 rounded-full bg-[#3DBFA0]/10 blur-xl" />
        <div className="relative flex items-center gap-3">
          <button type="button" onClick={() => navigate('my-profile')} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center active:bg-white/25" aria-label="返回">
            <ChevronLeft size={19} color="white" />
          </button>
          <h1 className="text-base font-semibold text-white">编辑个人信息</h1>
        </div>
      </div>

      <div className="relative -mt-11 flex flex-col items-center px-4">
        <button type="button" onClick={() => fileInputRef.current?.click()} className="relative w-23 h-23 rounded-[28px] border-4 border-[#F5F6F8] bg-[#DDF4EF] shadow-lg overflow-hidden flex items-center justify-center active:scale-95 transition-transform" aria-label="更换头像">
          {form.avatar ? <img src={form.avatar} alt="头像预览" className="w-full h-full object-cover" /> : <span className="text-4xl">🎙️</span>}
          <span className="absolute right-1 bottom-1 w-7 h-7 rounded-full bg-[#3DBFA0] border-2 border-white flex items-center justify-center">
            <Camera size={14} color="white" />
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        <p className="mt-2 text-xs text-gray-400">点击更换头像</p>
      </div>

      <div className="px-4 mt-4 space-y-3 pb-5">
        <section className="bg-white rounded-2xl overflow-hidden shadow-[0_6px_24px_rgba(46,61,79,0.04)]">
          <div className="px-4 pt-3 pb-2">
            <p className="text-xs font-semibold tracking-wide text-gray-400">基本资料</p>
          </div>
          <Field label="昵称">
            <input value={form.nickname} maxLength={16} onChange={(e) => setForm({ ...form, nickname: e.target.value })} className="w-full text-right text-sm text-gray-800 outline-none bg-transparent" placeholder="请输入昵称" />
          </Field>
          <Field label="性别">
            <div className="flex justify-end gap-1.5">
              {['男', '女', '保密'].map((gender) => (
                <button key={gender} type="button" onClick={() => setForm({ ...form, gender })} className="px-2.5 py-1 rounded-lg text-xs transition-colors" style={{ background: form.gender === gender ? '#E8F7F4' : '#F5F6F8', color: form.gender === gender ? '#2B9C82' : '#9CA3AF' }}>{gender}</button>
              ))}
            </div>
          </Field>
          <Field label="生日">
            <input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} className="text-right text-sm text-gray-700 outline-none bg-transparent" />
          </Field>
          <Field label="所在地区" icon={<MapPin size={14} color="#9CA3AF" />}>
            <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="w-full text-right text-sm text-gray-700 outline-none bg-transparent" placeholder="省市区" />
          </Field>
          <Field label="常用语言" last>
            <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="text-right text-sm text-gray-700 outline-none bg-transparent">
              {languages.map((language) => <option key={language}>{language}</option>)}
            </select>
          </Field>
        </section>

        <section className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 pt-3 pb-2"><p className="text-xs font-semibold tracking-wide text-gray-400">账号信息</p></div>
          <Field label="手机号"><span className="text-sm text-gray-400">{user.phone}</span></Field>
          <Field label="用户编号" last><span className="text-sm text-gray-400">ECAI-{user.id.toUpperCase()}-0268</span></Field>
        </section>

        <div className="flex gap-2.5 px-1 text-[11px] leading-5 text-gray-400">
          <LockKeyhole size={14} className="mt-0.5 flex-shrink-0" color="#3DBFA0" />
          手机号与实名信息受安全保护，如需修改请前往帮助与客服进行身份核验。
        </div>

        <button type="submit" disabled={!form.nickname.trim()} className="w-full h-12 rounded-2xl bg-[#3DBFA0] text-white text-sm font-semibold shadow-[0_10px_24px_rgba(61,191,160,0.22)] active:scale-[0.98] transition-transform disabled:opacity-50">
          {saved ? <span className="flex items-center justify-center gap-2"><Check size={17} />已保存</span> : '保存修改'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, icon, last = false, children }: { label: string; icon?: React.ReactNode; last?: boolean; children: React.ReactNode }) {
  return (
    <div className={`mx-4 min-h-13 py-3 flex items-center gap-2 ${last ? '' : 'border-b border-gray-100'}`}>
      {icon}
      <span className="w-20 flex-shrink-0 text-sm text-gray-600">{label}</span>
      <div className="flex-1 text-right min-w-0">{children}</div>
    </div>
  );
}
