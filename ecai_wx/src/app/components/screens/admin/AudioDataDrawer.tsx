import { useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Drawer, Input, message, Select, Slider, Space, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  AudioOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  FileTextOutlined,
  PauseCircleFilled,
  PlayCircleFilled,
  RobotOutlined,
  SafetyCertificateFilled,
  SoundOutlined,
} from '@ant-design/icons';
import './AudioDataDrawer.css';
import { DEFAULT_MODEL_THRESHOLDS, MODEL_SCORING_METRICS, ModelScoringMetricKey } from './modelScoringPolicy';

export type AudioMachineStatus = 'pending' | 'checking' | 'passed' | 'warning' | 'failed' | 'error';
export type AudioAuthorizationStatus = 'pending' | 'approved' | 'rejected' | 'revoked' | 'expired';

export interface AudioRecordingDetails {
  id: string;
  label?: string;
  transcript: string;
  duration: number;
  format?: string;
  sampleRate?: string;
  bitDepth?: string;
  channels?: string;
  fileSize?: string;
  machineStatus: AudioMachineStatus;
  machineScore?: number;
  machineSummary?: string;
  machineMetrics?: Partial<Record<ModelScoringMetricKey, number>>;
  humanReviewStatus?: 'pending' | 'passed' | 'failed';
  rejectionReason?: string;
}

export interface AudioDataDetails extends AudioRecordingDetails {
  title: string;
  user?: string;
  taskName?: string;
  jobId?: string;
  submittedAt?: string;
  authorizationStatus: AudioAuthorizationStatus;
  authorizationSummary?: string;
  recordings?: AudioRecordingDetails[];
}

interface AudioDataDrawerProps {
  data: AudioDataDetails | null;
  open: boolean;
  onClose: () => void;
  presentation?: 'drawer' | 'page';
  mode?: 'view' | 'review';
  onApprove?: () => void;
  onReject?: () => void;
}

const MACHINE_META: Record<AudioMachineStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: '未检测', color: 'default', icon: <AudioOutlined /> },
  checking: { label: '检测中', color: 'processing', icon: <SoundOutlined /> },
  passed: { label: '机检通过', color: 'success', icon: <CheckCircleFilled /> },
  warning: { label: '需人工关注', color: 'warning', icon: <ExclamationCircleFilled /> },
  failed: { label: '机检不通过', color: 'error', icon: <CloseCircleFilled /> },
  error: { label: '检测异常', color: 'warning', icon: <ExclamationCircleFilled /> },
};

const WAVE_HEIGHTS = [12, 22, 34, 17, 39, 27, 15, 31, 43, 21, 29, 13, 25, 38, 18, 35, 45, 24, 14, 37, 28, 17, 41, 23, 32, 15, 27, 40, 19, 30, 12, 34, 22, 42, 18, 28, 37, 16, 32, 21, 39, 24, 14, 35, 26, 41, 19, 29];
const REJECTION_REASONS = ['有环境噪音', '声音过小或爆音', '发音口音不清', '语音与文本不匹配', '明显停顿或截断', '包含多余人声'];
const HUMAN_REVIEW_META = {
  pending: { label: '待人工验收', color: 'default' },
  passed: { label: '人工验收合格', color: 'success' },
  failed: { label: '人工验收不合格', color: 'error' },
} as const;

function formatTime(value: number) {
  const seconds = Math.max(0, Math.floor(value));
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function AudioDataDrawer({ data, open, onClose, presentation = 'drawer', mode = 'view', onApprove, onReject }: AudioDataDrawerProps) {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [selectedRecording, setSelectedRecording] = useState(0);
  const [recordingKeyword, setRecordingKeyword] = useState('');
  const [machineFilter, setMachineFilter] = useState<AudioMachineStatus>();
  const [humanFilter, setHumanFilter] = useState<'pending' | 'passed' | 'failed'>();
  const [reviews, setReviews] = useState<Record<string, { status: 'pending' | 'passed' | 'failed'; reasons: string[]; customReason: string }>>({});
  const activeRecording = data?.recordings?.[selectedRecording] ?? data;

  useEffect(() => {
    setPlaying(false);
    setPosition(0);
    setSelectedRecording(0);
    setRecordingKeyword('');
    setMachineFilter(undefined);
    setHumanFilter(undefined);
    const sourceRecordings = data?.recordings?.length ? data.recordings : data ? [data] : [];
    setReviews(Object.fromEntries(sourceRecordings.map((recording) => [
      recording.id,
      {
        status: recording.humanReviewStatus ?? 'pending',
        reasons: recording.rejectionReason ? [recording.rejectionReason] : [],
        customReason: '',
      },
    ])));
  }, [data?.id, open]);

  useEffect(() => {
    if (!playing || !activeRecording) return undefined;
    const timer = window.setInterval(() => {
      setPosition((current) => {
        const next = current + 0.25;
        if (next >= activeRecording.duration) {
          window.setTimeout(() => setPlaying(false), 0);
          return 0;
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, [activeRecording, playing]);

  const waveform = useMemo(() => WAVE_HEIGHTS.map((height, index) => ({
    height: Math.max(8, height - ((activeRecording?.id.length ?? 0) + index) % 9),
    played: activeRecording?.duration ? index / WAVE_HEIGHTS.length <= position / activeRecording.duration : false,
  })), [activeRecording?.duration, activeRecording?.id, position]);

  if (!data || !activeRecording) return null;
  const machine = MACHINE_META[activeRecording.machineStatus];
  const recordings = data.recordings?.length ? data.recordings : [data];
  const filteredRecordings = recordings
    .map((recording, index) => ({ recording, index }))
    .filter(({ recording }) => {
      const reviewStatus = reviews[recording.id]?.status ?? recording.humanReviewStatus ?? 'pending';
      return (!recordingKeyword.trim() || [recording.id, recording.label, recording.transcript].some((value) => value?.toLowerCase().includes(recordingKeyword.trim().toLowerCase())))
        && (!machineFilter || recording.machineStatus === machineFilter)
        && (!humanFilter || reviewStatus === humanFilter);
    });
  const activeReview = reviews[activeRecording.id] ?? { status: 'pending' as const, reasons: [], customReason: '' };
  const updateActiveReview = (patch: Partial<typeof activeReview>) => {
    setReviews((current) => ({ ...current, [activeRecording.id]: { ...activeReview, ...patch } }));
  };
  const judgeActiveRecording = (status: 'passed' | 'failed') => {
    if (status === 'failed' && !activeReview.reasons.length && !activeReview.customReason.trim()) {
      message.warning('请选择或输入验收不合格原因');
      return;
    }
    updateActiveReview({ status });
    message.success(status === 'passed' ? '当前句子已判定为合格' : '当前句子已判定为不合格');
  };

  const content = (
      <div className="audio-detail-layout">
        <aside className="audio-recording-sidebar">
          <div className="audio-recording-sidebar__head">
            <span>录音列表</span>
            <Tag>{filteredRecordings.length} / {recordings.length} 条</Tag>
          </div>
          <div className="audio-recording-filters">
            <Input
              allowClear
              size="small"
              placeholder="编号 / 文本内容"
              value={recordingKeyword}
              onChange={(event) => setRecordingKeyword(event.target.value)}
            />
            <Select
              allowClear
              size="small"
              placeholder="机检状态"
              value={machineFilter}
              onChange={setMachineFilter}
              options={Object.entries(MACHINE_META).map(([value, meta]) => ({ value, label: meta.label }))}
            />
            <Select
              allowClear
              size="small"
              placeholder="人工验收状态"
              value={humanFilter}
              onChange={setHumanFilter}
              options={Object.entries(HUMAN_REVIEW_META).map(([value, meta]) => ({ value, label: meta.label }))}
            />
            <Button size="small" onClick={() => { setRecordingKeyword(''); setMachineFilter(undefined); setHumanFilter(undefined); }}>重置筛选</Button>
          </div>
          <div className="audio-recording-sidebar__list">
            {filteredRecordings.map(({ recording, index }) => {
              const humanReview = reviews[recording.id] ?? { status: recording.humanReviewStatus ?? 'pending', reasons: recording.rejectionReason ? [recording.rejectionReason] : [], customReason: '' };
              const rejectionReason = [...humanReview.reasons, humanReview.customReason].filter(Boolean).join('、');
              return (
              <button
                type="button"
                key={recording.id}
                className={`audio-recording-item ${selectedRecording === index ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedRecording(index);
                  setPlaying(false);
                  setPosition(0);
                }}
              >
                <span className="audio-recording-item__index">{String(index + 1).padStart(2, '0')}</span>
                <span className="audio-recording-item__body">
                  <b>{recording.label ?? `录音 ${index + 1}`}</b>
                  <small>{recording.transcript}</small>
                  <i><AudioOutlined /> {formatTime(recording.duration)}</i>
                </span>
                <span className="audio-recording-item__statuses">
                  <Tag color={MACHINE_META[recording.machineStatus].color}>{MACHINE_META[recording.machineStatus].label}</Tag>
                  <Tag color={HUMAN_REVIEW_META[humanReview.status].color}>{HUMAN_REVIEW_META[humanReview.status].label}</Tag>
                </span>
                {humanReview.status === 'failed' && <span className="audio-recording-item__reason">原因：{rejectionReason || '未填写'}</span>}
              </button>
            )})}
            {!filteredRecordings.length && <div className="audio-recording-sidebar__empty">暂无符合条件的录音文本</div>}
          </div>
        </aside>

        <main className="audio-detail-main">
        <div className="audio-detail-hero">
        <span className="audio-detail-hero__icon"><AudioOutlined /></span>
        <div className="audio-detail-hero__content">
          <h2>{data.title}</h2>
          <div className="audio-detail-hero__meta">
            {data.user && <span>采集用户：{data.user}</span>}
            {data.jobId && <span>所属作业：{data.jobId}</span>}
            {data.submittedAt && <span>提交时间：{data.submittedAt}</span>}
          </div>
        </div>
        <Tag
          className="audio-detail-hero__authorization"
          color={data.authorizationStatus === 'approved' ? 'success' : 'default'}
          icon={<SafetyCertificateFilled />}
        >
          {data.authorizationStatus === 'approved' ? '已授权' : '未授权'}
        </Tag>
      </div>

      <section className="audio-player-card" aria-label="音频播放器">
        <div className="audio-player-card__topline">
          <div>
            <div className="audio-player-card__label">录音播放</div>
            <div className="audio-player-card__hint">点击播放按钮预览当前音频</div>
          </div>
          <Tag color="cyan">
            格式 {activeRecording.format ?? 'WAV'} · 采样率 {activeRecording.sampleRate ?? '16 kHz'} · 位深 {activeRecording.bitDepth ?? '16 bit'} · {activeRecording.channels ?? '单声道'} · {activeRecording.fileSize ?? '—'}
          </Tag>
        </div>
        <div className="audio-player-card__controls">
          <Button
            className="audio-player-card__play"
            type="text"
            shape="circle"
            icon={playing ? <PauseCircleFilled /> : <PlayCircleFilled />}
            aria-label={playing ? '暂停音频' : '播放音频'}
            onClick={() => setPlaying((current) => !current)}
          />
          <div className="audio-player-card__timeline">
            <div className="audio-waveform" aria-hidden="true">
              {waveform.map((bar, index) => (
                <span key={index} className={bar.played ? 'is-played' : ''} style={{ height: `${bar.height}px` }} />
              ))}
            </div>
            <Slider
              className="audio-player-slider"
              min={0}
              max={activeRecording.duration || 1}
              step={0.1}
              value={position}
              tooltip={{ formatter: (value) => formatTime(value ?? 0) }}
              onChange={setPosition}
            />
            <div className="audio-player-card__time">
              <span>{formatTime(position)}</span>
              <span>{formatTime(activeRecording.duration)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="audio-detail-section">
        <div className="audio-detail-section__title"><FileTextOutlined /> 录音文本</div>
        <div className="audio-transcript">“{activeRecording.transcript}”</div>
      </section>

      <section className="audio-detail-section">
        <div className="audio-machine-score__header">
          <div className="audio-detail-section__title">机检结果</div>
          <Tag color={machine.color} icon={machine.icon}>{machine.label}</Tag>
        </div>
        <div className="audio-machine-metrics">
          {MODEL_SCORING_METRICS.map((metric) => {
            const score = activeRecording.machineMetrics?.[metric.key];
            const threshold = DEFAULT_MODEL_THRESHOLDS[metric.key];
            const passed = typeof score === 'number' && (metric.direction === 'min' ? score >= threshold : score <= threshold);
            return (
              <div className="audio-machine-metric" key={metric.key}>
                <span className="audio-machine-metric__info">
                  <strong>{metric.title}</strong>
                  <small>阈值 {metric.direction === 'min' ? '≥' : '≤'} {threshold}{metric.suffix}</small>
                  <em title={`${metric.model.code} · ${metric.model.id}`}><RobotOutlined /> {metric.model.name} · {metric.model.version}</em>
                </span>
                <b>{typeof score === 'number' ? `${score}${metric.suffix}` : '—'}</b>
                <Tag color={typeof score !== 'number' ? 'default' : passed ? 'success' : 'error'}>{typeof score !== 'number' ? '待检测' : passed ? '通过' : '未通过'}</Tag>
              </div>
            );
          })}
        </div>
        <p className="audio-machine-summary">{activeRecording.machineSummary ?? '暂无机检说明'}</p>
      </section>

      <section className="audio-detail-section audio-human-review">
        <div className="audio-human-review__header">
          <div>
            <div className="audio-detail-section__title">人工验收</div>
            <small>当前句子：{activeRecording.label ?? activeRecording.id}</small>
          </div>
          <Tag color={HUMAN_REVIEW_META[activeReview.status].color}>{HUMAN_REVIEW_META[activeReview.status].label}</Tag>
        </div>
        {mode === 'review' ? (
          <>
            <div className="audio-human-review__label">验收不合格原因（可多选）</div>
            <Checkbox.Group
              className="audio-human-review__reasons"
              options={REJECTION_REASONS}
              value={activeReview.reasons}
              onChange={(values) => updateActiveReview({ reasons: values as string[] })}
            />
            <Input.TextArea
              rows={3}
              maxLength={200}
              showCount
              placeholder="其他不合格原因，可自定义输入"
              value={activeReview.customReason}
              onChange={(event) => updateActiveReview({ customReason: event.target.value })}
            />
            <div className="audio-human-review__actions">
              <span>当前句子判定</span>
              <Space>
                <Button danger onClick={() => judgeActiveRecording('failed')}>不合格</Button>
                <Button type="primary" onClick={() => judgeActiveRecording('passed')}>合格</Button>
              </Space>
            </div>
          </>
        ) : activeReview.status === 'failed' ? (
          <div className="audio-human-review__readonly-reason">
            不合格原因：{[...activeReview.reasons, activeReview.customReason].filter(Boolean).join('、') || '未填写'}
          </div>
        ) : (
          <div className="audio-human-review__readonly-reason">
            {activeReview.status === 'passed' ? '该句子已完成人工验收。' : '该句子暂未进行人工验收。'}
          </div>
        )}
      </section>
        </main>
      </div>
  );

  const reviewActions = mode === 'review' ? (
    <div className="audio-detail-review-actions">
      <Space>
        <Button danger onClick={onReject}>整条数据驳回</Button>
        <Button type="primary" onClick={onApprove}>整条数据通过</Button>
      </Space>
      <span>请核对全部录音及机检结果后完成验收</span>
    </div>
  ) : null;

  if (presentation === 'page') {
    return (
      <div className="audio-detail-page">
        <div className="audio-detail-page__toolbar">
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={onClose}>返回数据列表</Button>
          <Tag color={mode === 'review' ? 'processing' : 'default'}>{mode === 'review' ? '数据验收' : '数据查看'}</Tag>
        </div>
        {content}
        {reviewActions}
      </div>
    );
  }

  return (
    <Drawer
      className="audio-detail-drawer"
      title={null}
      size={980}
      open={open}
      onClose={onClose}
      zIndex={1200}
      footer={reviewActions}
    >
      {content}
    </Drawer>
  );
}
