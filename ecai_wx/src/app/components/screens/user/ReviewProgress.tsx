import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { TASKS } from '../../../data/mockData';
import { ProgressStepper } from '../../common/ProgressStepper';

type ReviewStage = 'model' | 'human' | 'done';

export function ReviewProgress() {
  const { selectedTaskId, selectedUserTaskId, navigate } = useApp();
  const task = TASKS.find((t) => t.id === selectedTaskId) ?? TASKS[0];
  const [stage, setStage] = useState<ReviewStage>('model');
  const [modelProgress, setModelProgress] = useState(0);

  useEffect(() => {
    if (stage !== 'model') return;
    const interval = setInterval(() => {
      setModelProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setStage('human'), 800);
          return 100;
        }
        return p + 4;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [stage]);

  const steps = [
    { label: '数据提交', sublabel: '完成', done: true, active: false },
    { label: '模型检测', sublabel: stage === 'model' ? '检测中' : '已完成', done: stage !== 'model', active: stage === 'model' },
    { label: '人工复核', sublabel: stage === 'human' || stage === 'done' ? '复核中' : '待开始', done: stage === 'done', active: stage === 'human' },
    { label: '积分到账', sublabel: stage === 'done' ? '已到账' : '待结算', done: stage === 'done', active: false },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 pt-2 pb-6"
        style={{ background: 'linear-gradient(180deg, #2E3D4F 0%, #3a5068 100%)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            onClick={() => navigate('my-tasks')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-white">审核进度</h1>
        </div>
        <div className="bg-white/10 rounded-2xl p-4 text-white">
          <p className="text-xs opacity-60 mb-1">{task.title}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">预计奖励</span>
            <span className="text-xl font-bold" style={{ color: '#7DDFC8' }}>+{task.reward} 积分</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* Steps */}
        <div className="bg-white rounded-2xl p-5">
          <ProgressStepper steps={steps} />
        </div>

        {/* Current stage detail */}
        {stage === 'model' && (
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: '#EEF4FF' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="#3B82F6" />
                  <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">AI 模型自动检测中</p>
                <p className="text-xs text-gray-500 mt-0.5">正在评估数据质量与规范性</p>
              </div>
            </div>
            <div className="space-y-2">
              {['音频清晰度检测', '内容完整性校验', '规范性评分'].map((item, i) => (
                <div key={item} className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: modelProgress > (i + 1) * 30 ? '#3DBFA0' : '#F3F4F6',
                    }}
                  >
                    {modelProgress > (i + 1) * 30 && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 flex-1">{item}</p>
                  {modelProgress <= (i + 1) * 30 && (
                    <span className="text-xs text-blue-500 font-medium">检测中</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>总体进度</span>
                <span>{Math.round(modelProgress)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${modelProgress}%`, background: 'linear-gradient(90deg, #3DBFA0, #3B82F6)' }}
                />
              </div>
            </div>
          </div>
        )}

        {stage === 'human' && (
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: '#FFF7E6' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#F59E0B" strokeWidth="2" fill="none" />
                  <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">人工复核中</p>
                <p className="text-xs text-gray-500 mt-0.5">AI 模型检测通过，等待人工审核员复核</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#F0FDF4' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" fill="#22C55E" />
                <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-xs text-green-700">AI 检测分数：92分，数据质量良好</p>
            </div>
            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              人工复核通常在 24-48 小时内完成。复核通过后，积分将自动到账。如有问题，审核员会通知您返工。
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs text-yellow-600 font-medium">预计 2-24 小时内完成</span>
            </div>
          </div>
        )}

        {/* Info cards */}
        <div className="bg-white rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">任务信息</h3>
          <div className="space-y-2">
            {[
              { label: '任务名称', value: task.title },
              { label: '采集类型', value: task.type === 'voice' ? '语音采集' : task.type === 'text' ? '文本采集' : '图片采集' },
              { label: '奖励积分', value: `${task.reward} 积分` },
              { label: '提交时间', value: '2026-07-15 10:30' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-800 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="p-4 bg-white border-t border-gray-100">
        <button
          className="w-full py-3.5 rounded-2xl text-sm font-medium border border-gray-200"
          style={{ color: '#6B7280' }}
          onClick={() => navigate('my-tasks')}
        >
          返回任务列表
        </button>
      </div>
    </div>
  );
}
