import React, { useState } from 'react';
import { Building2, CalendarDays, ChevronDown, ChevronLeft, FileText, Fingerprint, PenLine, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { AUTHORIZATION_RECORDS, AuthorizationRecord } from '../../../data/mockData';
import { useApp } from '../../../context/AppContext';

type Filter = 'all' | 'active' | 'inactive';

const statusMeta = {
  pending: { label: '待签署', color: '#B57918', background: '#FFF5DF' },
  active: { label: '生效中', color: '#2B9C82', background: '#E8F7F4' },
  expired: { label: '已到期', color: '#9CA3AF', background: '#F1F2F4' },
  revoked: { label: '已撤回', color: '#E26D5A', background: '#FFF0ED' },
};

export function AuthorizationCenter() {
  const { navigate, signedAgreements } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const records = AUTHORIZATION_RECORDS.map((record): AuthorizationRecord => {
    const signed = signedAgreements[record.id];
    return signed ? { ...record, status: 'active', authorizedBy: '张 *', authorizedAt: signed.signedAt, expiresAt: signed.expiresAt, agreementUrl: signed.pdfUrl, agreementFileName: signed.fileName } : record;
  });
  const activeCount = records.filter((record) => record.status === 'active').length;
  const filtered = records.filter((record) => filter === 'all' || (filter === 'active' ? record.status === 'active' : record.status !== 'active'));

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="relative z-10 flex-shrink-0 px-5 pt-2 pb-5 overflow-hidden" style={{ background: 'linear-gradient(145deg, #293A4D 0%, #3B536B 100%)' }}>
        <div className="absolute -right-12 -top-14 w-40 h-40 rounded-full border border-white/10" />
        <div className="relative flex items-center gap-3 mb-5">
          <button onClick={() => navigate('my-profile')} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center active:bg-white/25" aria-label="返回">
            <ChevronLeft size={19} color="white" />
          </button>
          <h1 className="text-base font-semibold text-white">授权中心</h1>
        </div>
        <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3DBFA0] flex items-center justify-center shadow-[0_8px_20px_rgba(61,191,160,.25)]">
            <ShieldCheck size={26} color="white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">授权数据详情</p>
            <p className="text-xs text-white/55 mt-1">共 {records.length} 条记录，{activeCount} 项授权生效中</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#7DDFC8] shadow-[0_0_0_5px_rgba(125,223,200,.12)]" />
        </div>
      </div>

      <div className="relative z-[5] flex-shrink-0 bg-[#F5F6F8] px-4 pt-3 pb-2 border-b border-gray-100">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#E9EBEE] p-1">
          {([
            ['all', `全部 ${records.length}`],
            ['active', `生效中 ${activeCount}`],
            ['inactive', `待签 / 失效 ${records.length - activeCount}`],
          ] as Array<[Filter, string]>).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} className={`py-2 rounded-lg text-xs transition-all ${filter === key ? 'bg-white text-[#26384A] shadow-sm font-semibold' : 'text-gray-500'}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="px-4 py-3 space-y-3">
          {filtered.map((record) => (
            <AuthorizationCard key={record.id} record={record} expanded={expandedId === record.id} onToggle={() => setExpandedId(expandedId === record.id ? null : record.id)} onOpenAgreement={() => navigate('authorization-agreement', { authorizationId: record.id })} />
          ))}
        </div>

        <div className="mx-4 mb-5 rounded-2xl border border-[#D5EEE8] bg-[#F0FAF8] px-4 py-3 flex gap-2.5">
          <Fingerprint size={18} color="#3DBFA0" className="flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-5 text-[#4D7C71]">平台完整记录每次授权的配置与操作人。授权到期后，相关机构将无法继续获取新增数据。</p>
        </div>
      </div>
    </div>
  );
}

function AuthorizationCard({ record, expanded, onToggle, onOpenAgreement }: { record: AuthorizationRecord; expanded: boolean; onToggle: () => void; onOpenAgreement: () => void }) {
  const meta = statusMeta[record.status];
  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-[0_5px_22px_rgba(46,61,79,0.045)]">
      <button onClick={onToggle} className="w-full p-4 text-left active:bg-gray-50">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#EEF3F7] flex items-center justify-center flex-shrink-0">
            <Building2 size={21} color="#3A5068" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h2 className="text-sm font-semibold text-gray-800 flex-1 leading-5">{record.project}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0" style={{ color: meta.color, background: meta.background }}>{meta.label}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1 truncate">授权给：{record.organizationShortName}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
          <span className="text-[11px] text-gray-400">{record.status === 'pending' ? '签署后立即生效' : `授权人 · ${record.authorizedBy}`}</span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-[#2B9C82]">{expanded ? '收起详情' : '查看详情'}<ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} /></span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 bg-[#FBFCFD] px-4 pb-4 pt-3">
          <p className="text-[11px] font-semibold tracking-wide text-gray-400 mb-2.5">授权配置</p>
          <div className="space-y-2.5">
            {record.scopes.map((scope) => (
              <div key={scope.name} className="flex items-start gap-2.5">
                <span className="mt-1 w-4 h-4 rounded-full bg-[#E8F7F4] flex items-center justify-center flex-shrink-0"><span className="w-1.5 h-1.5 rounded-full bg-[#3DBFA0]" /></span>
                <div><p className="text-xs font-medium text-gray-700">{scope.name}</p><p className="text-[11px] leading-5 text-gray-400">{scope.detail}</p></div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl bg-white border border-gray-100 p-3 space-y-2.5">
            <InfoRow icon={<UserRoundCheck size={14} />} label="谁授权" value={`${record.authorizedBy}（${record.authorizerRelation}）`} />
            <InfoRow icon={<Fingerprint size={14} />} label="授权方式" value={record.authorizationMethod} />
            <InfoRow icon={<CalendarDays size={14} />} label="授权时间" value={record.authorizedAt} />
            <InfoRow icon={<CalendarDays size={14} />} label="有效期至" value={record.expiresAt} />
          </div>

          <div className="mt-3">
            <p className="text-[11px] text-gray-400">授权用途</p>
            <p className="text-xs text-gray-600 mt-1 leading-5">{record.purpose}</p>
          </div>

          {record.agreementUrl && <div className="mt-3 flex gap-2">
            <button onClick={onOpenAgreement} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D9E7E3] bg-white text-[11px] font-semibold text-[#4B665F]"><FileText size={14} />查看协议 PDF</button>
            {record.status === 'pending' && <button onClick={onOpenAgreement} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2FAE8E] text-[11px] font-semibold text-white"><PenLine size={14} />签署授权</button>}
          </div>}
        </div>
      )}
    </article>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-400">
      {icon}<span className="w-14 text-[11px]">{label}</span><span className="flex-1 text-right text-[11px] text-gray-600">{value}</span>
    </div>
  );
}
