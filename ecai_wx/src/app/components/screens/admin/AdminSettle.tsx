import React, { useState } from 'react';
import { Table, Tag, Button, Space, Card, Row, Col, Modal, Tabs } from 'antd';
import { CheckOutlined, CloseOutlined, DollarOutlined } from '@ant-design/icons';
import { WITHDRAW_RECORDS, POINT_TRANSACTIONS, WithdrawRecord } from '../../../data/mockData';

const W_STATUS_COLORS: Record<string, string> = {
  pending_id: 'warning',
  pending_review: 'processing',
  processing: 'purple',
  paid: 'success',
  failed: 'error',
  closed: 'default',
};
const W_STATUS_LABELS: Record<string, string> = {
  pending_id: '待实名', pending_review: '待审核', processing: '处理中', paid: '已到账', failed: '失败', closed: '已关闭',
};

export function AdminSettle() {
  const [withdrawals, setWithdrawals] = useState(WITHDRAW_RECORDS);
  const [activeTab, setActiveTab] = useState('withdraw');
  const [approveModal, setApproveModal] = useState<WithdrawRecord | null>(null);

  function approveWithdraw(id: string) {
    setWithdrawals((prev) => prev.map((w) => w.id === id ? { ...w, status: 'processing' as const } : w));
    setApproveModal(null);
  }

  function rejectWithdraw(id: string) {
    setWithdrawals((prev) => prev.map((w) => w.id === id ? { ...w, status: 'failed' as const } : w));
    setApproveModal(null);
  }

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending_review');

  const totalWithdrawn = withdrawals.filter((w) => w.status === 'paid').reduce((acc, w) => acc + w.netAmount, 0);
  const totalFees = withdrawals.filter((w) => w.status === 'paid').reduce((acc, w) => acc + w.fee, 0);

  const withdrawCols = [
    {
      title: '申请用户',
      key: 'user',
      render: (_: any, record: WithdrawRecord) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{record.userNickname}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>{record.appliedAt}</div>
        </div>
      ),
    },
    {
      title: '申请金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 90,
      render: (v: number) => <span style={{ fontWeight: 600 }}>¥{(v / 100).toFixed(2)}</span>,
    },
    {
      title: '手续费',
      dataIndex: 'fee',
      key: 'fee',
      width: 80,
      render: (v: number) => <span style={{ color: '#EF4444', fontSize: 12 }}>-¥{(v / 100).toFixed(2)}</span>,
    },
    {
      title: '实际到账',
      dataIndex: 'netAmount',
      key: 'netAmount',
      width: 90,
      render: (v: number) => <span style={{ color: '#3DBFA0', fontWeight: 700 }}>¥{(v / 100).toFixed(2)}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (s: string) => <Tag color={W_STATUS_COLORS[s]}>{W_STATUS_LABELS[s]}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: WithdrawRecord) => (
        <Space size={4}>
          {record.status === 'pending_review' && (
            <>
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                style={{ color: '#22C55E' }}
                onClick={() => setApproveModal(record)}
              />
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                style={{ color: '#EF4444' }}
                onClick={() => rejectWithdraw(record.id)}
              />
            </>
          )}
          <Button type="text" size="small" style={{ color: '#3B82F6', fontSize: 12 }}>详情</Button>
        </Space>
      ),
    },
  ];

  const pointCols = [
    { title: '描述', dataIndex: 'description', key: 'description', render: (v: string) => <span style={{ fontSize: 13 }}>{v}</span> },
    { title: '类型', dataIndex: 'type', key: 'type', width: 80, render: (v: string) => {
      const map: Record<string, { label: string; color: string }> = {
        earn: { label: '获得', color: '#22C55E' }, redeem: { label: '兑换', color: '#EF4444' },
        deduct: { label: '扣回', color: '#EF4444' }, freeze: { label: '冻结', color: '#3B82F6' }, invite: { label: '邀请', color: '#8B5CF6' },
      };
      return <Tag color={map[v]?.color || 'default'}>{map[v]?.label || v}</Tag>;
    }},
    { title: '金额', dataIndex: 'amount', key: 'amount', width: 80, render: (v: number) => <span style={{ color: v > 0 ? '#3DBFA0' : '#EF4444', fontWeight: 600 }}>{v > 0 ? `+${v}` : v}</span> },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 130, render: (v: string) => <span style={{ fontSize: 11, color: '#9CA3AF' }}>{v}</span> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <Row gutter={[12, 12]}>
        {[
          { label: '待审核提现', value: pendingWithdrawals.length, color: '#F59E0B', suffix: '笔' },
          { label: '处理中', value: withdrawals.filter((w) => w.status === 'processing').length, color: '#8B5CF6', suffix: '笔' },
          { label: '已到账金额', value: `¥${(totalWithdrawn / 100).toFixed(0)}`, color: '#22C55E', suffix: '' },
          { label: '累计手续费', value: `¥${(totalFees / 100).toFixed(0)}`, color: '#EF4444', suffix: '' },
        ].map(({ label, value, color, suffix }) => (
          <Col key={label} xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}{suffix}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card size="small" style={{ borderRadius: 12 }} title="结算管理">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="small"
          items={[
            { key: 'withdraw', label: `提现审核 (${pendingWithdrawals.length}待处理)` },
            { key: 'points', label: '积分流水' },
          ]}
          style={{ marginBottom: 12 }}
        />
        {activeTab === 'withdraw' && (
          <Table
            dataSource={withdrawals}
            columns={withdrawCols}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10, size: 'small' }}
            scroll={{ x: 600 }}
            rowClassName={(record) => record.status === 'pending_review' ? 'ant-table-row-selected' : ''}
          />
        )}
        {activeTab === 'points' && (
          <Table
            dataSource={POINT_TRANSACTIONS}
            columns={pointCols}
            rowKey="id"
            size="small"
            pagination={{ pageSize: 10, size: 'small' }}
          />
        )}
      </Card>

      {/* Approve modal */}
      <Modal
        title="确认审核通过"
        open={!!approveModal}
        onCancel={() => setApproveModal(null)}
        onOk={() => approveWithdraw(approveModal!.id)}
        okText="确认通过"
        cancelText="取消"
        okButtonProps={{ style: { background: '#3DBFA0', borderColor: '#3DBFA0' } }}
      >
        {approveModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ background: '#F5F6F8', borderRadius: 8, padding: 12 }}>
              {[
                { label: '申请用户', value: approveModal.userNickname },
                { label: '申请金额', value: `¥${(approveModal.amount / 100).toFixed(2)}` },
                { label: '手续费 (6.75%)', value: `-¥${(approveModal.fee / 100).toFixed(2)}` },
                { label: '实际到账', value: `¥${(approveModal.netAmount / 100).toFixed(2)}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
                  <span style={{ color: '#6B7280' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{value}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
              通过后将通过微信支付发起打款，无法撤回，请确认无误后操作。
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
