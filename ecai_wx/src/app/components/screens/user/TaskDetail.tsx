import React, { useMemo, useState } from 'react';
import { BadgeCheck, Check, CheckCircle2, KeyRound, LockKeyhole, ShieldCheck, UserCheck, XCircle } from 'lucide-react';
import { TASKS } from '../../../data/mockData';
import { useApp } from '../../../context/AppContext';

function BackButton() {
  const { navigate } = useApp();
  return (
    <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }} onClick={() => navigate('task-hall')} aria-label="返回任务大厅">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function TaskDetail() {
  const { selectedTaskId, navigate, user } = useApp();
  const task = TASKS.find((item) => item.id === selectedTaskId) ?? TASKS[0];
  const [accepted, setAccepted] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteVerified, setInviteVerified] = useState(Boolean(task.directedAccess?.userInDispatchList));
  const [codeError, setCodeError] = useState('');
  const [claimed, setClaimed] = useState(false);

  const typeLabel = task.type === 'voice' ? '语音采集' : task.type === 'text' ? '文本采集' : '图片采集';
  const collectScreen = task.type === 'voice' ? 'collect-voice' : task.type === 'text' ? 'collect-text' : 'collect-image';

  const qualificationItems = useMemo(() => {
    const items = [
      ...(task.requiredUserTags ?? []).map((name) => ({ type: '标签', name, matched: user.tags.includes(name) })),
      ...(task.requiredCertifications ?? []).map((name) => ({ type: '认证', name, matched: user.certifications.includes(name) })),
    ];
    return items.length > 0 ? items : [{ type: '账号', name: '账号状态正常', matched: true }];
  }, [task, user]);

  const hallEligible = !task.isDirected && qualificationItems.every((item) => item.matched);
  const accessReady = task.isDirected ? inviteVerified : hallEligible;
  const canClaim = accepted && accessReady && !claimed;

  function verifyInviteCode() {
    const expected = task.directedAccess?.inviteCode;
    if (expected && inviteCode.trim().toUpperCase() === expected.toUpperCase()) {
      setInviteVerified(true);
      setCodeError('');
      return;
    }
    setInviteVerified(false);
    setCodeError('口令无效或已过期，请向邀请人确认');
  }

  function claimTask() {
    if (!canClaim) return;
    setClaimed(true);
    window.setTimeout(() => navigate(collectScreen as any, { taskId: task.id }), 650);
  }

  function actionLabel() {
    if (claimed) return '领取成功，正在进入任务…';
    if (!accessReady) return task.isDirected ? '验证定向资格后认领' : '暂不符合认领要求';
    if (!accepted) return '勾选数据授权后认领';
    return task.isDirected ? '确认认领定向任务' : '确认认领任务';
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-2 pb-6" style={{ background: 'linear-gradient(180deg, #2E3D4F 0%, #3a5068 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <BackButton />
          <h1 className="text-base font-semibold text-white flex-1">任务详情</h1>
          <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: task.isDirected ? 'rgba(245,158,11,.2)' : 'rgba(61,191,160,.2)', color: task.isDirected ? '#FCD27B' : '#A8F0E0' }}>
            {task.isDirected ? '定向任务' : '大厅招募'}
          </span>
        </div>
        <div className="bg-white/10 rounded-2xl p-4 text-white">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <span className="inline-block text-xs px-2 py-0.5 rounded-full mb-2" style={{ background: 'rgba(61,191,160,0.3)', color: '#a8f0e0' }}>{typeLabel}</span>
              <h2 className="text-base font-bold leading-snug">{task.title}</h2>
            </div>
            <div className="text-right"><div className="text-2xl font-bold text-[#3DBFA0]">+{task.reward}</div><div className="text-xs opacity-60">积分/次</div></div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Metric value={String(task.remainingSlots)} label="剩余名额" />
            <Metric value={`${task.sampleCount}条`} label="采集数量" />
            <Metric value={`~${task.estimatedMinutes}分钟`} label="预计用时" />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3">
        <section className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">任务说明</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
        </section>

        <ClaimAccessPanel
          directed={task.isDirected}
          qualificationItems={qualificationItems}
          hallEligible={hallEligible}
          userInDispatchList={Boolean(task.directedAccess?.userInDispatchList)}
          inviteCode={inviteCode}
          inviteVerified={inviteVerified}
          codeError={codeError}
          issuer={task.directedAccess?.issuer ?? '项目组'}
          onCodeChange={(value) => { setInviteCode(value); setCodeError(''); }}
          onVerify={verifyInviteCode}
        />

        <section className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">参与要求</h3>
          {task.requirements.length === 0 ? (
            <p className="text-sm text-[#3DBFA0]">✓ 无特殊要求，新手友好</p>
          ) : (
            <ul className="space-y-1.5">
              {task.requirements.map((requirement, index) => (
                <li key={requirement} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white bg-[#3DBFA0]">{index + 1}</span>{requirement}
                </li>
              ))}
            </ul>
          )}
          {task.certRequired && (
            <div className="mt-3 flex items-center gap-2 rounded-xl p-2.5 bg-[#FFF7E6]">
              <BadgeCheck size={16} color="#F59E0B" />
              <span className="text-xs text-yellow-700">{task.isDirected ? '定向资格由项目方名单或内部邀请确认' : '平台将在认领前自动核验所需认证'}</span>
            </div>
          )}
        </section>

        <section className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">验收规则</h3>
          <ul className="space-y-1.5">
            {task.verifyRules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 size={14} color="#3DBFA0" className="mt-0.5 flex-shrink-0" />{rule}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2"><ShieldCheck size={17} color="#3DBFA0" /><h3 className="text-sm font-semibold text-gray-800">数据授权</h3></div>
          <p className="text-xs text-gray-500 leading-relaxed">参与本任务即视为授权平台将采集的数据用于人工智能模型训练。个人信息将按照隐私政策进行脱敏处理，不会公开披露。</p>
          <label className="flex items-start gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5" style={{ accentColor: '#3DBFA0' }} />
            <span className="text-xs text-gray-600">我已阅读并同意上述授权内容</span>
          </label>
        </section>
        <div className="h-1" />
      </div>

      <div className="flex-shrink-0 px-4 pt-3 pb-2 bg-white border-t border-gray-100 shadow-[0_-8px_24px_rgba(46,61,79,0.06)]" style={{ zIndex: 5 }}>
        <button className="w-full py-3.5 rounded-2xl text-white text-sm font-semibold transition-all active:scale-[0.99] disabled:cursor-not-allowed" style={{ background: claimed ? '#2E3D4F' : '#3DBFA0', opacity: canClaim || claimed ? 1 : 0.48 }} disabled={!canClaim} onClick={claimTask}>
          {claimed && <Check size={16} className="inline mr-1.5 -mt-0.5" />}{actionLabel()}
        </button>
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="bg-white/10 rounded-xl py-2"><div className="text-sm font-semibold">{value}</div><div className="text-xs opacity-60 mt-0.5">{label}</div></div>;
}

interface QualificationItem { type: string; name: string; matched: boolean }

function ClaimAccessPanel({ directed, qualificationItems, hallEligible, userInDispatchList, inviteCode, inviteVerified, codeError, issuer, onCodeChange, onVerify }: {
  directed: boolean;
  qualificationItems: QualificationItem[];
  hallEligible: boolean;
  userInDispatchList: boolean;
  inviteCode: string;
  inviteVerified: boolean;
  codeError: string;
  issuer: string;
  onCodeChange: (value: string) => void;
  onVerify: () => void;
}) {
  if (!directed) {
    return (
      <section className="rounded-2xl border border-[#D5EEE8] bg-[#F0FAF8] p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#DDF4EF] flex items-center justify-center flex-shrink-0"><UserCheck size={19} color="#2B9C82" /></div>
          <div className="flex-1"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-[#285F52]">大厅招募资格</h3><span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#2B9C82]">{hallEligible ? '核验通过' : '未满足'}</span></div><p className="text-[11px] leading-4 mt-1 text-[#6A9389]">平台已自动核验账号标签与认证，满足要求即可直接认领，无需邀请码。</p></div>
        </div>
        <div className="mt-3 rounded-xl bg-white/75 px-3 py-2 space-y-2">
          {qualificationItems.map((item) => (
            <div key={`${item.type}-${item.name}`} className="flex items-center gap-2 text-xs"><span className="w-9 text-gray-400">{item.type}</span><span className="flex-1 text-gray-600">{item.name}</span>{item.matched ? <CheckCircle2 size={15} color="#3DBFA0" /> : <XCircle size={15} color="#E26D5A" />}</div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[#F2DCA8] bg-[#FFF8EA] p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#FBE9BF] flex items-center justify-center flex-shrink-0"><LockKeyhole size={18} color="#B87C0B" /></div>
        <div className="flex-1"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-[#7A5612]">定向准入验证</h3>{inviteVerified && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#2B9C82]">资格已解锁</span>}</div><p className="text-[11px] leading-4 mt-1 text-[#A98A4C]">仅限平台派发名单成员，或持项目组内部邀请口令的用户认领。</p></div>
      </div>

      {userInDispatchList ? (
        <div className="mt-3 rounded-xl bg-white/80 px-3 py-3 flex items-center gap-2.5"><CheckCircle2 size={17} color="#3DBFA0" /><div><p className="text-xs font-medium text-gray-700">已命中平台派发名单</p><p className="text-[11px] text-gray-400 mt-0.5">当前账号可认领此定向任务</p></div></div>
      ) : inviteVerified ? (
        <div className="mt-3 rounded-xl bg-white/80 px-3 py-3 flex items-center gap-2.5"><CheckCircle2 size={17} color="#3DBFA0" /><div><p className="text-xs font-medium text-gray-700">内部邀请口令验证通过</p><p className="text-[11px] text-gray-400 mt-0.5">邀请方：{issuer}</p></div></div>
      ) : (
        <div className="mt-3">
          <div className="rounded-lg flex items-center gap-2 mb-2 text-[11px] text-[#A47116]"><XCircle size={14} />当前账号未命中平台派发名单</div>
          <div className={`h-11 rounded-xl bg-white flex items-center gap-2 pl-3 pr-1.5 border ${codeError ? 'border-[#EFA190]' : 'border-[#ECD8AA]'}`}>
            <KeyRound size={16} color="#C08A25" className="flex-shrink-0" />
            <input value={inviteCode} onChange={(event) => onCodeChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onVerify(); }} placeholder="输入内部邀请口令" className="flex-1 min-w-0 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400 uppercase" />
            <button onClick={onVerify} disabled={!inviteCode.trim()} className="h-8 px-3 rounded-lg bg-[#2E3D4F] text-white text-xs disabled:opacity-40">验证</button>
          </div>
          {codeError && <p className="text-[11px] text-[#D66552] mt-1.5">{codeError}</p>}
          <p className="flex items-center gap-1 text-[10px] text-[#B39A69] mt-2"><LockKeyhole size={11} />口令由项目内部邀请人提供，请勿转发</p>
        </div>
      )}
    </section>
  );
}
