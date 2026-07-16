import React, { useState } from 'react';
import { Table, Tag, Button, Space, Tabs, Progress, Modal, Card, Row, Col, Badge } from 'antd';
import { CheckOutlined, CloseOutlined, RollbackOutlined, AudioOutlined, FileTextOutlined, PictureOutlined } from '@ant-design/icons';
import { QC_RECORDS, QCRecord } from '../../../data/mockData';

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

export function AdminQC() {
  const [records, setRecords] = useState(QC_RECORDS);
  const [activeTab, setActiveTab] = useState('pending');
  const [reviewModal, setReviewModal] = useState<QCRecord | null>(null);

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
        width={560}
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
              <Card size="small" title="语音数据" style={{ borderRadius: 8 }}>
                <div style={{ background: '#E8F7F4', borderRadius: 8, padding: '16px', textAlign: 'center' }}>
                  <AudioOutlined style={{ fontSize: 32, color: '#3DBFA0' }} />
                  <div style={{ marginTop: 8, color: '#6B7280', fontSize: 13 }}>
                    时长: {reviewModal.duration}秒 | 格式: WAV 16kHz
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 4 }}>
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} style={{ width: 3, background: '#3DBFA0', borderRadius: 2, height: Math.random() * 20 + 5 }} />
                    ))}
                  </div>
                </div>
              </Card>
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
    </div>
  );
}
