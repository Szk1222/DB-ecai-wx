import React, { useState } from 'react';
import { TASKS, TEXT_SAMPLES } from '../../../data/mockData';
import { useApp } from '../../../context/AppContext';

export function CollectText() {
  const { selectedTaskId, navigate } = useApp();
  const task = TASKS.find((t) => t.id === selectedTaskId) ?? TASKS[2];

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isDone, setIsDone] = useState(false);
  const total = Math.min(task.sampleCount, 5);
  const currentAnswer = answers[current] ?? '';

  const prompts = [
    { role: '场景', text: '顾客来电询问订单状态，已等待超过预期配送时间。' },
    { role: '场景', text: '顾客反映收到的商品与描述不符，要求退款处理。' },
    { role: '场景', text: '顾客咨询会员积分兑换流程及有效期规则。' },
    { role: '场景', text: '顾客希望修改已下单商品的收货地址。' },
    { role: '场景', text: '顾客投诉客服态度问题，情绪较为激动。' },
  ];

  function next() {
    if (current < total - 1) setCurrent(current + 1);
    else setIsDone(true);
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
        <h2 className="text-xl font-bold text-gray-800 mb-2">文本采集完成！</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          已完成 {Object.keys(answers).length}/{total} 条内容，点击提交进入审核
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
          继续编写
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
            <h1 className="text-sm font-semibold text-white">文本采集</h1>
            <p className="text-xs text-white/60">{task.title}</p>
          </div>
          <span className="text-sm font-bold text-white">{current + 1}/{total}</span>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((current + 1) / total) * 100}%`, background: '#3DBFA0' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 py-4 overflow-y-auto">
        {/* Scenario prompt */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: '#FFF7E6', border: '1.5px solid #F59E0B' }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2" />
              <path d="M12 8v4M12 16h.01" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-semibold text-yellow-700">任务场景</span>
          </div>
          <p className="text-sm text-yellow-800">{prompts[current % prompts.length].text}</p>
        </div>

        {/* Reference text */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: '#F5F6F8' }}
        >
          <p className="text-xs text-gray-400 mb-1.5">参考文本（可参考但不要照抄）</p>
          <p className="text-sm text-gray-600 leading-relaxed">{TEXT_SAMPLES[current % TEXT_SAMPLES.length]}</p>
        </div>

        {/* Input area */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">请根据场景撰写对话内容</label>
            <span
              className="text-xs"
              style={{ color: currentAnswer.length < 20 ? '#EF4444' : '#3DBFA0' }}
            >
              {currentAnswer.length} / 500字
            </span>
          </div>
          <textarea
            className="flex-1 rounded-2xl p-4 text-sm text-gray-800 resize-none outline-none border-2 transition-colors leading-relaxed"
            style={{
              borderColor: currentAnswer.length >= 20 ? '#3DBFA0' : '#E5E7EB',
              background: '#fff',
              minHeight: 160,
            }}
            placeholder="客服：您好，感谢您的来电，请问有什么可以帮助您？&#10;用户：我的订单...&#10;客服：..."
            value={currentAnswer}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [current]: e.target.value.slice(0, 500) }))
            }
          />
          {currentAnswer.length < 20 && currentAnswer.length > 0 && (
            <p className="text-xs text-red-500 mt-1">内容至少需要 20 个字符</p>
          )}
        </div>

        {/* Nav */}
        <div className="flex gap-3 mt-4">
          <button
            className="flex-1 py-3 rounded-2xl text-sm font-medium border border-gray-200"
            style={{ color: '#6B7280' }}
            onClick={() => current > 0 && setCurrent(current - 1)}
            disabled={current === 0}
          >
            上一条
          </button>
          <button
            className="flex-1 py-3 rounded-2xl text-sm font-medium text-white transition-opacity"
            style={{ background: '#3DBFA0', opacity: currentAnswer.length >= 20 ? 1 : 0.5 }}
            disabled={currentAnswer.length < 20}
            onClick={next}
          >
            {current < total - 1 ? '下一条' : '完成提交'}
          </button>
        </div>
      </div>
    </div>
  );
}
