import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, Eraser, PenLine, RotateCcw, ShieldCheck } from 'lucide-react';
import { AUTHORIZATION_RECORDS } from '../../../data/mockData';
import { createSignedAuthorizationAgreement } from '../../../data/authorizationAgreement';
import { useApp } from '../../../context/AppContext';

export function AuthorizationSignaturePage() {
  const { navigate, selectedAuthorizationId, selectedTaskId, saveSignedAgreement, authorizationReturnScreen } = useApp();
  const record = AUTHORIZATION_RECORDS.find((item) => item.id === selectedAuthorizationId) ?? AUTHORIZATION_RECORDS[0];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [hasInk, setHasInk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);
      const context = canvas.getContext('2d');
      context?.scale(ratio, ratio);
      if (context) {
        context.lineWidth = 3.2;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = '#174F7A';
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const context = event.currentTarget.getContext('2d');
    const next = point(event);
    context?.beginPath();
    context?.moveTo(next.x, next.y);
    setError('');
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const context = event.currentTarget.getContext('2d');
    const next = point(event);
    context?.lineTo(next.x, next.y);
    context?.stroke();
    setHasInk(true);
  };

  const stop = (event: React.PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = false;
    event.currentTarget.getContext('2d')?.closePath();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    setError('');
  };

  const save = async () => {
    if (!hasInk || !canvasRef.current) {
      setError('请先在画板内完成签名');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const signatureDataUrl = canvasRef.current.toDataURL('image/png');
      const agreement = await createSignedAuthorizationAgreement(record, signatureDataUrl);
      saveSignedAgreement(agreement);
      if (authorizationReturnScreen === 'task-detail') {
        navigate('task-detail', { taskId: selectedTaskId ?? undefined });
      } else {
        navigate('authorization-agreement', { authorizationId: record.id });
      }
    } catch {
      setError('签署文件生成失败，请重新尝试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#1F3042] text-white">
      <aside className="flex w-[205px] flex-shrink-0 flex-col border-r border-white/10 bg-[#172637] p-4">
        <button onClick={() => navigate('authorization-agreement', { authorizationId: record.id })} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10" aria-label="返回协议"><ChevronLeft size={18} /></button>
        <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2FAE8E]"><PenLine size={22} /></div>
        <h1 className="mt-3 text-base font-semibold">作业员签署</h1>
        <p className="mt-1 text-[10px] leading-5 text-white/45">请横向手写本人真实姓名。签名将固化到协议 PDF，保存后不可编辑。</p>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-[#76DCC4]"><ShieldCheck size={14} />签署对象</div>
          <p className="mt-2 text-[10px] leading-4 text-white/65">{record.project}</p>
          <p className="mt-1 text-[9px] text-white/35">协议版本 {record.version}</p>
        </div>
        <div className="mt-auto flex items-center gap-2 text-[9px] text-white/35"><Eraser size={12} />支持手指或触控笔书写</div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col p-4">
        <div className="mb-3 flex items-center justify-between">
          <div><b className="text-sm">请在下方区域签名</b><span className="ml-2 text-[10px] text-white/38">保持字迹完整、清晰</span></div>
          <div className="flex items-center gap-2">
            {error && <span className="mr-1 text-[10px] text-[#FFB29F]">{error}</span>}
            <button onClick={clear} className="flex h-8 items-center gap-1.5 rounded-lg border border-white/12 px-3 text-[10px] text-white/62"><RotateCcw size={13} />重写</button>
            <button disabled={saving} onClick={save} className="flex h-8 items-center gap-1.5 rounded-lg bg-[#2FAE8E] px-4 text-[10px] font-semibold text-white disabled:opacity-60"><Check size={14} />{saving ? '生成协议中…' : '保存并签署'}</button>
          </div>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border-2 border-dashed border-[#9DB9C7]/45 bg-[#F9FBFB] shadow-[inset_0_0_0_1px_rgba(255,255,255,.8)]">
          <canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={stop} onPointerCancel={stop} onPointerLeave={stop} className="h-full w-full touch-none cursor-crosshair" aria-label="横屏签名画板" />
          {!hasInk && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><span className="border-b border-[#B8C9D0] px-24 pb-2 text-lg tracking-[.35em] text-[#B4C2C8]">请签名</span></div>}
          <div className="pointer-events-none absolute bottom-3 right-4 text-[9px] text-[#A1B0B7]">签名将写入授权协议签署页</div>
        </div>
      </main>
    </div>
  );
}
