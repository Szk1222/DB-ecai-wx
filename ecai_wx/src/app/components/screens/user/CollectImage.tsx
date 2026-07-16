import React, { useState } from 'react';
import { TASKS } from '../../../data/mockData';
import { useApp } from '../../../context/AppContext';

const LABELS = ['沙发', '桌子', '椅子', '床', '电视', '冰箱', '洗衣机', '窗户', '门', '灯'];

interface ImageItem {
  id: string;
  dataUrl: string;
  labels: string[];
}

export function CollectImage() {
  const { selectedTaskId, navigate } = useApp();
  const task = TASKS.find((t) => t.id === selectedTaskId) ?? TASKS[1];
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const required = Math.min(task.sampleCount, 10);

  const selectedImg = images.find((img) => img.id === selected);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const id = Math.random().toString(36).slice(2);
          setImages((prev) => [...prev, { id, dataUrl: ev.target!.result as string, labels: [] }]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  function toggleLabel(label: string) {
    if (!selected) return;
    setImages((prev) =>
      prev.map((img) =>
        img.id === selected
          ? {
              ...img,
              labels: img.labels.includes(label)
                ? img.labels.filter((l) => l !== label)
                : [...img.labels, label],
            }
          : img
      )
    );
  }

  function removeImage(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (selected === id) setSelected(null);
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
        <h2 className="text-xl font-bold text-gray-800 mb-2">图片采集完成！</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          已上传 {images.length} 张图片并完成标注，提交后进入审核
        </p>
        <button
          className="w-full py-3.5 rounded-2xl text-white font-semibold"
          style={{ background: '#3DBFA0' }}
          onClick={() => navigate('review-progress', { taskId: task.id })}
        >
          提交审核
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
            <h1 className="text-sm font-semibold text-white">图片采集</h1>
            <p className="text-xs text-white/60">{task.title}</p>
          </div>
          <span className="text-sm font-bold text-white">{images.length}/{required}</span>
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min((images.length / required) * 100, 100)}%`, background: '#3DBFA0' }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* Upload grid */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">上传图片（已{images.length}张，需{required}张）</p>
          <div className="grid grid-cols-3 gap-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all"
                style={{
                  borderColor: selected === img.id ? '#3DBFA0' : 'transparent',
                }}
                onClick={() => setSelected(img.id)}
              >
                <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                {img.labels.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <p className="text-xs text-white truncate">{img.labels.join(' ')}</p>
                  </div>
                )}
                <button
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                    <path d="M2 2l6 6M8 2l-6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
            {images.length < required && (
              <label
                className="aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors"
                style={{ borderColor: '#3DBFA0', background: '#F0FAF8' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="#3DBFA0" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="text-xs mt-1" style={{ color: '#3DBFA0' }}>上传</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </div>

        {/* Label editor */}
        {selectedImg && (
          <div className="bg-white rounded-2xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              标注图中包含的物品（已选 {selectedImg.labels.length} 项）
            </p>
            <div className="flex flex-wrap gap-2">
              {LABELS.map((label) => (
                <button
                  key={label}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  style={{
                    background: selectedImg.labels.includes(label) ? '#3DBFA0' : '#F5F6F8',
                    borderColor: selectedImg.labels.includes(label) ? '#3DBFA0' : '#E5E7EB',
                    color: selectedImg.labels.includes(label) ? 'white' : '#6B7280',
                  }}
                  onClick={() => toggleLabel(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {!selected && images.length > 0 && (
          <p className="text-xs text-center text-gray-400">点击图片进行标注</p>
        )}

        {/* Submit */}
        {images.length >= required && (
          <button
            className="w-full py-3.5 rounded-2xl text-white font-semibold mt-2"
            style={{ background: '#3DBFA0' }}
            onClick={() => setIsDone(true)}
          >
            完成提交（{images.length} 张）
          </button>
        )}
      </div>
    </div>
  );
}
