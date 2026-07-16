import React, { useState, useEffect } from 'react';
import { TASKS, TEXT_SAMPLES, type RecordingHint } from '../../../data/mockData';
import { WaveAnimation } from '../../common/WaveAnimation';
import { useApp } from '../../../context/AppContext';

const TEXT_SIZES = [
  { label: '标准', size: 16, lineHeight: 1.75 },
  { label: '大字', size: 20, lineHeight: 1.7 },
  { label: '特大', size: 24, lineHeight: 1.65 },
] as const;

const HINT_STATUS_STYLES = {
  success: { background: '#E5F5EA', color: '#2F9E62', label: '状态正常' },
  warning: { background: '#FEF3C7', color: '#D97706', label: '需要注意' },
  info: { background: '#E8F1FF', color: '#3B82F6', label: '普通提示' },
} as const;

function HintStatusIcon({ status }: { status: RecordingHint['status'] }) {
  const style = HINT_STATUS_STYLES[status];

  return (
    <span
      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center"
      style={{ background: style.background }}
      role="img"
      aria-label={style.label}
    >
      {status === 'success' && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.2 6.2l2.2 2.2 5.4-5" stroke={style.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {status === 'warning' && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 3.2v3.2M6 8.7h.01" stroke={style.color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
      {status === 'info' && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M6 5.2v3M6 3.3h.01" stroke={style.color} strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

export function CollectVoice() {
  const { selectedTaskId, navigate } = useApp();
  const task = TASKS.find((t) => t.id === selectedTaskId) ?? TASKS[0];

  const [current, setCurrent] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [recordings, setRecordings] = useState<Record<number, boolean>>({});
  const [duration, setDuration] = useState(0);
  const [textSizeIndex, setTextSizeIndex] = useState(0);
  const [hintsVisible, setHintsVisible] = useState(true);
  const total = Math.min(task.sampleCount, TEXT_SAMPLES.length);
  const recordingHints = task.recordingHints ?? [];
  const currentTextSize = TEXT_SIZES[textSizeIndex];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => setDuration((d) => d + 1), 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  function toggleRecord() {
    if (isRecording) {
      setIsRecording(false);
      setRecordings((prev) => ({ ...prev, [current]: true }));
    } else {
      setIsRecording(true);
    }
  }

  function next() {
    if (current < total - 1) {
      setCurrent(current + 1);
      setIsRecording(false);
    } else {
      setIsDone(true);
    }
  }

  function prev() {
    if (current > 0) {
      setCurrent(current - 1);
      setIsRecording(false);
    }
  }

  function cycleTextSize() {
    setTextSizeIndex((index) => (index + 1) % TEXT_SIZES.length);
  }

  if (isDone) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: '#E8F7F4' }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M10 20l7 7L30 13" stroke="#3DBFA0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">录制完成！</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          已完成 {Object.keys(recordings).length}/{total} 条录音，提交后将进入审核流程
        </p>
        <button
          className="w-full py-3.5 rounded-2xl text-white font-semibold"
          style={{ background: '#3DBFA0' }}
          onClick={() => navigate('review-progress', { taskId: task.id })}
        >
          提交审核
        </button>
        <button
          className="mt-3 w-full py-3 text-sm text-gray-500"
          onClick={() => { setIsDone(false); setCurrent(0); }}
        >
          继续录制
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 pt-2 pb-4"
        style={{ background: 'linear-gradient(180deg, #2E3D4F 0%, #3a5068 100%)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            onClick={() => navigate('task-detail', { taskId: task.id })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-white">语音采集</h1>
            <p className="text-xs text-white/60">{task.title}</p>
          </div>
          <span className="text-sm font-bold text-white">{current + 1}/{total}</span>
        </div>
        {/* Progress */}
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((current + 1) / total) * 100}%`, background: '#3DBFA0' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col px-4 py-4">
        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Text to read */}
          <div
            className="rounded-2xl p-5 mb-3"
            style={{ background: '#F0FAF8', border: '1.5px solid #3DBFA0' }}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-xs text-[#258F78] font-semibold">请朗读以下文本</p>
              <button
                type="button"
                className="shrink-0 min-h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-95"
                style={{ background: '#DDF5EF', color: '#217B68', border: '1px solid #BCE9DE' }}
                onClick={cycleTextSize}
                aria-label={`当前为${currentTextSize.label}，点击切换文字大小`}
                title="在标准、大字、特大三档之间切换"
              >
                <span className="text-sm" aria-hidden="true">Aa</span>
                放大文本
                <span className="font-normal opacity-70">· {currentTextSize.label}</span>
              </button>
            </div>
            <p
              className="text-gray-800 font-medium transition-all duration-200"
              style={{ fontSize: currentTextSize.size, lineHeight: currentTextSize.lineHeight }}
            >
              {TEXT_SAMPLES[current % TEXT_SAMPLES.length]}
            </p>
          </div>

          {/* Backend-configured recording hints */}
          {recordingHints.length > 0 && (
            hintsVisible ? (
              <section
                className="rounded-2xl px-3 py-2.5 mb-3"
                style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
                aria-label="录音提示信息"
              >
                <div className="flex items-center justify-between gap-3 min-h-8">
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="5.8" stroke="#8B95A5" strokeWidth="1.4" />
                      <path d="M8 7.2v3M8 4.8h.01" stroke="#8B95A5" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-600">提示信息</span>
                    <span className="text-[10px] text-gray-400">{recordingHints.length} 条</span>
                  </div>
                  <button
                    type="button"
                    className="min-h-8 px-2 text-xs font-medium rounded-lg active:bg-gray-100"
                    style={{ color: '#6B7280' }}
                    onClick={() => setHintsVisible(false)}
                    aria-label="隐藏提示信息"
                  >
                    隐藏
                  </button>
                </div>

                <ul className="border-t border-gray-100">
                  {recordingHints.map((hint) => (
                    <li
                      key={hint.id}
                      className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-b-0 last:pb-1"
                    >
                      <HintStatusIcon status={hint.status} />
                      <span className="text-xs text-gray-600 leading-5">{hint.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <div className="flex justify-center mb-3">
                <button
                  type="button"
                  className="min-h-9 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-transform"
                  style={{ background: '#FFF8E8', color: '#976317', border: '1px solid #F3D99A' }}
                  onClick={() => setHintsVisible(true)}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="8" cy="8" r="5.5" stroke="#B7791F" strokeWidth="1.4" />
                    <path d="M8 5.2v3.2M8 10.7h.01" stroke="#B7791F" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  显示提示（{recordingHints.length}）
                </button>
              </div>
            )
          )}

          {/* Wave & timer */}
          <div
            className="min-h-32 rounded-2xl flex flex-col items-center justify-center py-4"
            style={{ background: '#F5F6F8' }}
          >
            <WaveAnimation isRecording={isRecording} />
            {isRecording && (
              <div className="mt-3 text-sm font-mono text-gray-500">
                {String(Math.floor(duration / 60)).padStart(2, '0')}:{String(duration % 60).padStart(2, '0')}
              </div>
            )}
            {recordings[current] && !isRecording && (
              <div
                className="mt-3 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: '#E8F7F4', color: '#3DBFA0' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5L10 4" stroke="#3DBFA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                录音已保存
              </div>
            )}
          </div>
        </div>

        {/* Record button */}
        <div className="pt-4 flex-none flex flex-col items-center gap-3">
          <button
            className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
            style={{
              background: isRecording ? '#EF4444' : '#3DBFA0',
              boxShadow: isRecording ? '0 0 0 8px rgba(239,68,68,0.2)' : '0 0 0 8px rgba(61,191,160,0.2)',
            }}
            onClick={toggleRecord}
          >
            {isRecording ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="3" width="6" height="11" rx="3" fill="white" />
                <path d="M5 11a7 7 0 0014 0" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
          <p className="text-xs text-gray-500">
            {isRecording ? '点击停止录音' : recordings[current] ? '点击重新录音' : '点击开始录音'}
          </p>

          {/* Nav buttons */}
          <div className="flex w-full gap-3">
            <button
              className="flex-1 py-3 rounded-2xl text-sm font-medium border border-gray-200"
              style={{ color: '#6B7280' }}
              onClick={prev}
              disabled={current === 0}
            >
              上一条
            </button>
            <button
              className="flex-1 py-3 rounded-2xl text-sm font-medium text-white transition-opacity"
              style={{
                background: '#3DBFA0',
                opacity: recordings[current] ? 1 : 0.5,
              }}
              disabled={!recordings[current]}
              onClick={next}
            >
              {current < total - 1 ? '下一条' : '完成提交'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
