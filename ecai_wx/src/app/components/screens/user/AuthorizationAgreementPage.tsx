import React from 'react';
import { CheckCircle2, ChevronLeft, FileText, LockKeyhole, PenLine, ShieldCheck } from 'lucide-react';
import { AUTHORIZATION_RECORDS } from '../../../data/mockData';
import { useApp } from '../../../context/AppContext';
import { AgreementPdfPreview } from '../../common/AgreementPdfPreview';

export function AuthorizationAgreementPage() {
  const { navigate, selectedAuthorizationId, selectedTaskId, signedAgreements, authorizationReturnScreen } = useApp();
  const record = AUTHORIZATION_RECORDS.find((item) => item.id === selectedAuthorizationId) ?? AUTHORIZATION_RECORDS[0];
  const signed = signedAgreements[record.id];
  const isSigned = Boolean(signed) || (record.status === 'active' && Boolean(record.agreementUrl));
  const fileName = signed?.fileName ?? record.agreementFileName ?? '数据使用授权协议.pdf';

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#EEF2F3]">
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-[#DDE5E7] bg-white px-4 py-3">
        <button onClick={() => authorizationReturnScreen === 'task-detail' ? navigate('task-detail', { taskId: selectedTaskId ?? undefined }) : navigate('authorization-center')} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F4F5]" aria-label="返回"><ChevronLeft size={18} color="#34495E" /></button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F7F4]"><FileText size={18} color="#2DA98A" /></div>
        <div className="min-w-0 flex-1"><h1 className="truncate text-sm font-semibold text-[#263A4D]">数据使用授权协议</h1><p className="mt-0.5 truncate text-[10px] text-gray-400">{record.project} · {record.version ?? 'v1.0'}</p></div>
        <span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${isSigned ? 'bg-[#E8F7F4] text-[#278E75]' : 'bg-[#FFF5DF] text-[#B97A16]'}`}>{isSigned ? '已签署' : '待签署'}</span>
      </header>

      <div className="flex min-h-0 flex-1 flex-col p-3">
        <div className="mb-2 flex items-center justify-between rounded-xl border border-[#DCE6E7] bg-white px-3 py-2">
          <div className="flex min-w-0 items-center gap-2"><ShieldCheck size={15} color="#2DA98A" /><span className="truncate text-[10px] text-[#607282]">PDF 协议原件 · {fileName}</span></div>
          <div className="flex items-center gap-1 text-[9px] text-[#7C8B98]"><LockKeyhole size={12} />只读文件</div>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#D9E2E5] bg-white shadow-[0_10px_30px_rgba(40,62,79,.08)]">
          <AgreementPdfPreview signed={isSigned} signatureDataUrl={signed?.signatureDataUrl} signedAt={signed?.signedAt} />
          {isSigned && <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[#BFE4DA] bg-white/95 px-2 py-1 text-[9px] font-semibold text-[#278E75] shadow-sm"><CheckCircle2 size={12} />电子签名已固化</div>}
        </div>
      </div>

      <footer className="flex flex-shrink-0 gap-2 border-t border-[#DCE4E6] bg-white px-4 py-3">
        {isSigned ? (
          <div className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#EAF2F0] text-xs font-semibold text-[#5B746E]"><LockKeyhole size={15} />已完成签署 · 仅查看</div>
        ) : (
          <button onClick={() => navigate('authorization-signature', { authorizationId: record.id })} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#2FAE8E] text-xs font-semibold text-white shadow-[0_8px_20px_rgba(47,174,142,.24)]"><PenLine size={16} />签署授权</button>
        )}
      </footer>
    </div>
  );
}
