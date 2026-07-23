import React, { useMemo, useState } from 'react';
import { Table, Tag, Button, Space, Tabs, Progress, Modal, Card, Row, Col, Badge } from 'antd';
import {
  AudioOutlined,
  CheckOutlined,
  CloseOutlined,
  FileTextOutlined,
  PictureOutlined,
  PlayCircleFilled,
  RollbackOutlined,
} from '@ant-design/icons';
import { QC_RECORDS, QCRecord, VoiceSample } from '../../../data/mockData';
import { AudioDataDetails, AudioDataDrawer } from './AudioDataDrawer';
import './AdminQC.css';

const STATUS_COLORS: Record<string, string> = {
  pending: 'warning',
  passed: 'success',
  rework: 'orange',
  rejected: 'error',
};
const STATUS_LABELS: Record<string, string> = {
  pending: '待审核', passed: '已通过', rework: '需返工', rejected: '已驳回',
};

function ScoreTag({ score, passed }: { score: number; passed: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div
        style={{
          width: 36, height: 36, borderRadius: '50%', border: `2px solid ${passed ? '#3DBFA0' : '#EF4444'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: passed ? '#3DBFA0' : '#EF4444', fontWeight: 700, fontSize: 12,
        }}
      >
        {score}
      </div>
      <Tag color={passed ? 'success' : 'error'} style={{ fontSize: 11 }}>
        {passed ? 'AI通过' : 'AI拒绝'}
      </Tag>
    </div>
  );
}

const WAVE_HEIGHTS = [8, 15, 22, 11, 26, 18, 10, 24, 29, 14, 20, 8, 17, 27, 13, 23, 31, 16, 9, 25, 19, 12, 28, 16, 22, 10, 18, 26, 13, 21];

function formatPlaybackTime(value: number) {
  const seconds = Math.max(0, Math.floor(value));
  return `00:${seconds.toString().padStart(2, '0')}`;
}

function VoiceDataPreview({ record, onPreview }: { record: QCRecord; onPreview: (sample: VoiceSample, index: number) => void }) {
  const samples = useMemo<VoiceSample[]>(() => record.voiceSamples ?? [{
    id: `${record.id}-voice`,
    text: '该条录音暂未关联朗读文本。',
    duration: record.duration ?? 0,
    machineStatus: record.modelPassed ? 'passed' : 'failed',
    machineScore: record.modelScore,
    authorized: false,
    authorizationLabel: '暂无授权记录',
  }], [record]);
  const totalDuration = samples.reduce((sum, sample) => sum + sample.duration, 0);

  return (
    <section className="qc-voice-preview" aria-label="语音数据预览">
      <header className="qc-voice-preview__header">
        <div className="qc-voice-preview__title">
          <span className="qc-voice-preview__icon"><AudioOutlined /></span>
          <span>语音数据预览</span>
        </div>
        <div className="qc-voice-preview__meta">共 {samples.length} 条 · WAV / 16kHz · 总时长 {totalDuration} 秒</div>
      </header>

      <div className="qc-voice-list">
        {samples.map((sample, index) => {
          return (
            <article className="qc-voice-item" key={sample.id}>
              <div className="qc-voice-player">
                <Button
                  className="qc-play-button"
                  type="text"
                  shape="circle"
                  icon={<PlayCircleFilled />}
                  aria-label={`播放并查看第 ${index + 1} 条录音`}
                  onClick={() => onPreview(sample, index)}
                />

                <div className="qc-wave-wrap">
                  <div className="qc-wave-row" aria-hidden="true">
                    {WAVE_HEIGHTS.map((height, barIndex) => (
                      <span
                        className="qc-wave-bar"
                        key={`${sample.id}-${barIndex}`}
                        style={{ height: `${Math.max(4, height - ((index * 3 + barIndex) % 7))}px` }}
                      />
                    ))}
                  </div>
                  <div className="qc-time-row">
                    <span>00:00 / {formatPlaybackTime(sample.duration)}</span>
                    <span className="qc-sample-index">录音 {String(index + 1).padStart(2, '0')}</span>
                  </div>
                </div>

                <div className="qc-voice-statuses">
                  <Tag color="cyan">点击播放查看详情</Tag>
                </div>
              </div>

              <div className="qc-transcript">
                <span className="qc-transcript__label">录音文本</span>
                <span className="qc-transcript__text">{sample.text}</span>
              </div>
              <div className="qc-transcript" style={{ marginTop: 8, paddingTop: 8 }}>
                <span className="qc-transcript__label">授权状态</span>
                <span className="qc-transcript__text" style={{ color: sample.authorized ? '#348D76' : '#D14343' }}>{sample.authorizationLabel}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function AdminQC() {
  const [records, setRecords] = useState(QC_RECORDS);
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewModal, setReviewModal] = useState<QCRecord | null>(null);
  const [audioDrawerData, setAudioDrawerData] = useState<AudioDataDetails | null>(null);

  function openVoiceSample(sample: VoiceSample, index: number, record: QCRecord) {
    const machineSummary = sample.machineStatus === 'passed'
      ? '音频完整度、清晰度与文本匹配度均符合当前机检规则。'
      : sample.machineStatus === 'warning'
        ? '检测到轻微环境噪声，建议质检人员结合录音文本复核。'
        : '音频存在明显质量问题，未通过当前机检规则。';
    setAudioDrawerData({
      id: sample.id,
      title: `${record.taskTitle} · 录音 ${String(index + 1).padStart(2, '0')}`,
      transcript: sample.text,
      duration: sample.duration,
      format: 'WAV',
      sampleRate: '16 kHz',
      bitDepth: '16 bit',
      channels: '单声道',
      fileSize: `${Math.max(96, Math.round(sample.duration * 31.25))} KB`,
      user: record.userNickname,
      taskName: record.taskTitle,
      jobId: record.id,
      submittedAt: record.submittedAt,
      machineStatus: sample.machineStatus,
      machineScore: sample.machineScore,
      machineSummary,
      authorizationStatus: sample.authorized ? 'approved' : 'pending',
      authorizationSummary: sample.authorizationLabel,
    });
  }

  function updateStatus(id: string, status: QCRecord['qcStatus']) {
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, qcStatus: status } : r));
    setReviewModal(null);
  }

  const filtered = records.filter((r) => {
    if (activeTab === 'all') return true;
    return r.qcStatus === activeTab;
  });

  const pendingCount = records.filter((r) => r.qcStatus === 'pending').length;

  const columns = [
    {
      title: '提交信息',
      key: 'info',
      render: (_: any, record: QCRecord) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{record.taskTitle}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
            {record.userNickname} · {record.submittedAt}
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 70,
      render: (type: string) => {
        const icons: Record<string, React.ReactNode> = {
          voice: <AudioOutlined style={{ color: '#3DBFA0' }} />,
          text: <FileTextOutlined style={{ color: '#3B82F6' }} />,
          image: <PictureOutlined style={{ color: '#F59E0B' }} />,
        };
        const labels: Record<string, string> = { voice: '语音', text: '文本', image: '图片' };
        return <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>{icons[type]} {labels[type]}</span>;
      },
    },
    {
      title: 'AI评分',
      key: 'score',
      width: 120,
      render: (_: any, record: QCRecord) => (
        <ScoreTag score={record.modelScore} passed={record.modelPassed} />
      ),
    },
    {
      title: '状态',
      dataIndex: 'qcStatus',
      key: 'qcStatus',
      width: 90,
      render: (s: string) => <Tag color={STATUS_COLORS[s]}>{STATUS_LABELS[s]}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: any, record: QCRecord) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            onClick={() => setReviewModal(record)}
            style={{ color: '#3B82F6', fontSize: 12 }}
          >
            查看详情
          </Button>
          {record.qcStatus === 'pending' && (
            <>
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                style={{ color: '#22C55E' }}
                onClick={() => updateStatus(record.id, 'passed')}
              />
              <Button
                type="text"
                size="small"
                icon={<RollbackOutlined />}
                style={{ color: '#F59E0B' }}
                onClick={() => updateStatus(record.id, 'rework')}
              />
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                style={{ color: '#EF4444' }}
                onClick={() => updateStatus(record.id, 'rejected')}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'pending', label: <Badge count={pendingCount} size="small">待审核</Badge> },
    { key: 'passed', label: '已通过' },
    { key: 'rework', label: '需返工' },
    { key: 'rejected', label: '已驳回' },
    { key: 'all', label: '全部' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <Row gutter={[12, 12]}>
        {[
          { label: '待审核', value: records.filter((r) => r.qcStatus === 'pending').length, color: '#F59E0B' },
          { label: '已通过', value: records.filter((r) => r.qcStatus === 'passed').length, color: '#22C55E' },
          { label: '需返工', value: records.filter((r) => r.qcStatus === 'rework').length, color: '#F97316' },
          { label: '已驳回', value: records.filter((r) => r.qcStatus === 'rejected').length, color: '#EF4444' },
        ].map(({ label, value, color }) => (
          <Col key={label} xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card size="small" style={{ borderRadius: 12 }} title="质检队列">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="small"
          items={tabItems}
          style={{ marginBottom: 12 }}
        />
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10, size: 'small' }}
          scroll={{ x: 600 }}
        />
      </Card>

      {/* Review modal */}
      <Modal
        title="质检详情"
        open={!!reviewModal}
        onCancel={() => setReviewModal(null)}
        footer={
          reviewModal?.qcStatus === 'pending' ? (
            <Space>
              <Button danger onClick={() => updateStatus(reviewModal!.id, 'rejected')}>驳回</Button>
              <Button style={{ color: '#F59E0B', borderColor: '#F59E0B' }} onClick={() => updateStatus(reviewModal!.id, 'rework')}>需返工</Button>
              <Button type="primary" style={{ background: '#3DBFA0', borderColor: '#3DBFA0' }} onClick={() => updateStatus(reviewModal!.id, 'passed')}>通过</Button>
            </Space>
          ) : null
        }
        width={780}
      >
        {reviewModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Tag>{reviewModal.taskTitle}</Tag>
              <Tag color="blue">{reviewModal.userNickname}</Tag>
              <Tag>{reviewModal.submittedAt}</Tag>
            </div>

            <Card size="small" style={{ background: '#F5F6F8', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>AI 检测结果</span>
                <Tag color={reviewModal.modelPassed ? 'success' : 'error'}>
                  {reviewModal.modelPassed ? `通过 ${reviewModal.modelScore}分` : `拒绝 ${reviewModal.modelScore}分`}
                </Tag>
              </div>
              <Progress
                percent={reviewModal.modelScore}
                strokeColor={reviewModal.modelScore >= 80 ? '#3DBFA0' : '#EF4444'}
                size="small"
              />
            </Card>

            {reviewModal.type === 'voice' && (
              <VoiceDataPreview record={reviewModal} onPreview={(sample, index) => openVoiceSample(sample, index, reviewModal)} />
            )}

            {reviewModal.type === 'text' && reviewModal.content && (
              <Card size="small" title="文本内容" style={{ borderRadius: 8 }}>
                <div style={{ background: '#F5F6F8', borderRadius: 8, padding: 12, fontSize: 13, lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-wrap' }}>
                  {reviewModal.content}
                </div>
              </Card>
            )}

            {reviewModal.type === 'image' && (
              <Card size="small" title="图片数据" style={{ borderRadius: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                  {Array.from({ length: reviewModal.imageCount ?? 5 }).map((_, i) => (
                    <div key={i} style={{ aspectRatio: '1', borderRadius: 6, background: `hsl(${i * 40}, 40%, 85%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#6B7280' }}>
                      <PictureOutlined />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>
      <AudioDataDrawer data={audioDrawerData} open={Boolean(audioDrawerData)} onClose={() => setAudioDrawerData(null)} />
    </div>
  );
}
