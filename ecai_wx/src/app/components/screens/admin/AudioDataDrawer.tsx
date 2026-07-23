import { useEffect, useMemo, useState } from 'react';
import { Button, Descriptions, Drawer, Progress, Slider, Tag } from 'antd';
import {
  AudioOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  FileTextOutlined,
  PauseCircleFilled,
  PlayCircleFilled,
  SafetyCertificateFilled,
  SoundOutlined,
} from '@ant-design/icons';
import './AudioDataDrawer.css';

export type AudioMachineStatus = 'pending' | 'checking' | 'passed' | 'warning' | 'failed' | 'error';
export type AudioAuthorizationStatus = 'pending' | 'approved' | 'rejected' | 'revoked' | 'expired';

export interface AudioDataDetails {
  id: string;
  title: string;
  transcript: string;
  duration: number;
  format?: string;
  sampleRate?: string;
  bitDepth?: string;
  channels?: string;
  fileSize?: string;
  user?: string;
  taskName?: string;
  jobId?: string;
  submittedAt?: string;
  machineStatus: AudioMachineStatus;
  machineScore?: number;
  machineSummary?: string;
  authorizationStatus: AudioAuthorizationStatus;
  authorizationSummary?: string;
}

interface AudioDataDrawerProps {
  data: AudioDataDetails | null;
  open: boolean;
  onClose: () => void;
}

const MACHINE_META: Record<AudioMachineStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: '未检测', color: 'default', icon: <AudioOutlined /> },
  checking: { label: '检测中', color: 'processing', icon: <SoundOutlined /> },
  passed: { label: '机检通过', color: 'success', icon: <CheckCircleFilled /> },
  warning: { label: '需人工关注', color: 'warning', icon: <ExclamationCircleFilled /> },
  failed: { label: '机检不通过', color: 'error', icon: <CloseCircleFilled /> },
  error: { label: '检测异常', color: 'warning', icon: <ExclamationCircleFilled /> },
};

const AUTH_META: Record<AudioAuthorizationStatus, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'warning' },
  approved: { label: '授权有效', color: 'success' },
  rejected: { label: '授权驳回', color: 'error' },
  revoked: { label: '授权撤回', color: 'default' },
  expired: { label: '授权过期', color: 'default' },
};

const WAVE_HEIGHTS = [12, 22, 34, 17, 39, 27, 15, 31, 43, 21, 29, 13, 25, 38, 18, 35, 45, 24, 14, 37, 28, 17, 41, 23, 32, 15, 27, 40, 19, 30, 12, 34, 22, 42, 18, 28, 37, 16, 32, 21, 39, 24, 14, 35, 26, 41, 19, 29];

function formatTime(value: number) {
  const seconds = Math.max(0, Math.floor(value));
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export function AudioDataDrawer({ data, open, onClose }: AudioDataDrawerProps) {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setPosition(0);
  }, [data?.id, open]);

  useEffect(() => {
    if (!playing || !data) return undefined;
    const timer = window.setInterval(() => {
      setPosition((current) => {
        const next = current + 0.25;
        if (next >= data.duration) {
          window.setTimeout(() => setPlaying(false), 0);
          return 0;
        }
        return next;
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, [data, playing]);

  const waveform = useMemo(() => WAVE_HEIGHTS.map((height, index) => ({
    height: Math.max(8, height - ((data?.id.length ?? 0) + index) % 9),
    played: data?.duration ? index / WAVE_HEIGHTS.length <= position / data.duration : false,
  })), [data?.duration, data?.id, position]);

  if (!data) return null;
  const machine = MACHINE_META[data.machineStatus];
  const authorization = AUTH_META[data.authorizationStatus];

  return (
    <Drawer
      className="audio-detail-drawer"
      title={null}
      size={640}
      open={open}
      onClose={onClose}
      zIndex={1200}
    >
      <div className="audio-detail-hero">
        <span className="audio-detail-hero__icon"><AudioOutlined /></span>
        <div className="audio-detail-hero__content">
          <h2>{data.title}</h2>
          <div className="audio-detail-hero__meta">
            <span>{data.id}</span>
            {data.user && <span>采集用户：{data.user}</span>}
          </div>
        </div>
      </div>

      <section className="audio-player-card" aria-label="音频播放器">
        <div className="audio-player-card__topline">
          <div>
            <div className="audio-player-card__label">录音播放</div>
            <div className="audio-player-card__hint">点击播放按钮预览当前音频</div>
          </div>
          <Tag color="cyan">{data.format ?? 'WAV'} · {data.sampleRate ?? '16 kHz'}</Tag>
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
              max={data.duration || 1}
              step={0.1}
              value={position}
              tooltip={{ formatter: (value) => formatTime(value ?? 0) }}
              onChange={setPosition}
            />
            <div className="audio-player-card__time">
              <span>{formatTime(position)}</span>
              <span>{formatTime(data.duration)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="audio-detail-section">
        <div className="audio-detail-section__title"><FileTextOutlined /> 录音文本</div>
        <div className="audio-transcript">“{data.transcript}”</div>
      </section>

      <section className="audio-detail-section">
        <div className="audio-detail-section__title"><SoundOutlined /> 音频基础信息</div>
        <Descriptions
          className="audio-basic-info"
          size="small"
          column={2}
          items={[
            { key: 'format', label: '文件格式', children: data.format ?? 'WAV' },
            { key: 'duration', label: '音频时长', children: formatTime(data.duration) },
            { key: 'sampleRate', label: '采样率', children: data.sampleRate ?? '16 kHz' },
            { key: 'bitDepth', label: '位深', children: data.bitDepth ?? '16 bit' },
            { key: 'channels', label: '声道', children: data.channels ?? '单声道' },
            { key: 'fileSize', label: '文件大小', children: data.fileSize ?? '—' },
          ]}
        />
      </section>

      <div className="audio-status-grid">
        <section className="audio-status-card">
          <div className="audio-status-card__title">机检状态</div>
          <Tag color={machine.color} icon={machine.icon}>{machine.label}</Tag>
          {typeof data.machineScore === 'number' && (
            <Progress
              className="audio-status-card__progress"
              percent={data.machineScore}
              size="small"
              strokeColor={data.machineScore >= 80 ? '#31b895' : '#ef6b63'}
            />
          )}
          <p>{data.machineSummary ?? '暂无机检说明'}</p>
        </section>
        <section className="audio-status-card">
          <div className="audio-status-card__title">授权状态</div>
          <Tag color={authorization.color} icon={<SafetyCertificateFilled />}>{authorization.label}</Tag>
          <p>{data.authorizationSummary ?? '暂无授权说明'}</p>
        </section>
      </div>

      <section className="audio-detail-section audio-source-info">
        <div className="audio-detail-section__title">数据归属</div>
        <Descriptions
          size="small"
          column={1}
          items={[
            { key: 'task', label: '所属任务', children: data.taskName ?? '—' },
            { key: 'job', label: '所属作业', children: data.jobId ?? '—' },
            { key: 'submitted', label: '提交时间', children: data.submittedAt ?? '—' },
          ]}
        />
      </section>
    </Drawer>
  );
}
