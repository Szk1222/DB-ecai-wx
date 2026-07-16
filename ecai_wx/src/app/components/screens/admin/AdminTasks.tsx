import React, { useState } from 'react';
import { Table, Tag, Button, Space, Progress, Modal, Form, Input, Select, InputNumber, Card, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { TASKS, Task } from '../../../data/mockData';

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  pending: 'warning',
  active: 'success',
  paused: 'orange',
  ended: 'error',
  archived: 'default',
};
const STATUS_LABELS: Record<string, string> = {
  draft: '草稿', pending: '待发布', active: '进行中', paused: '已暂停', ended: '已结束', archived: '已下架',
};
const TYPE_COLORS: Record<string, string> = {
  voice: '#3DBFA0', text: '#3B82F6', image: '#F59E0B',
};
const TYPE_LABELS: Record<string, string> = {
  voice: '语音', text: '文本', image: '图片',
};

export function AdminTasks() {
  const [tasks, setTasks] = useState(TASKS);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Task) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 13 }}>{text}</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            {record.tags.slice(0, 2).map((tag) => (
              <Tag key={tag} style={{ fontSize: 11, padding: '0 4px', margin: 0 }}>{tag}</Tag>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 70,
      render: (type: string) => (
        <Tag color={TYPE_COLORS[type] || 'default'} style={{ fontWeight: 600 }}>
          {TYPE_LABELS[type]}
        </Tag>
      ),
    },
    {
      title: '奖励',
      dataIndex: 'reward',
      key: 'reward',
      width: 90,
      render: (v: number) => <span style={{ color: '#3DBFA0', fontWeight: 700 }}>+{v} 积分</span>,
    },
    {
      title: '名额进度',
      key: 'slots',
      width: 140,
      render: (_: any, record: Task) => {
        const pct = Math.round(((record.totalSlots - record.remainingSlots) / record.totalSlots) * 100);
        return (
          <div>
            <Progress percent={pct} size="small" strokeColor="#3DBFA0" />
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>{record.totalSlots - record.remainingSlots}/{record.totalSlots}</div>
          </div>
        );
      },
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 100,
      render: (d: string) => <span style={{ fontSize: 12, color: '#6B7280' }}>{d}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: Task) => (
        <Space size={4}>
          <Button type="text" size="small" icon={<EditOutlined />} style={{ color: '#3B82F6' }} />
          {record.status === 'active' ? (
            <Button type="text" size="small" icon={<PauseCircleOutlined />} style={{ color: '#F59E0B' }} />
          ) : (
            <Button type="text" size="small" icon={<PlayCircleOutlined />} style={{ color: '#22C55E' }} />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary cards */}
      <Row gutter={[12, 12]}>
        {[
          { label: '全部任务', value: tasks.length, color: '#3DBFA0' },
          { label: '进行中', value: tasks.filter((t) => t.status === 'active').length, color: '#22C55E' },
          { label: '已暂停', value: tasks.filter((t) => t.status === 'paused').length, color: '#F59E0B' },
          { label: '语音任务', value: tasks.filter((t) => t.type === 'voice').length, color: '#8B5CF6' },
        ].map(({ label, value, color }) => (
          <Col key={label} xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Table */}
      <Card
        size="small"
        style={{ borderRadius: 12 }}
        title="任务列表"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            style={{ background: '#3DBFA0', borderColor: '#3DBFA0' }}
            onClick={() => setShowModal(true)}
          >
            新建任务
          </Button>
        }
      >
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10, size: 'small' }}
          scroll={{ x: 700 }}
        />
      </Card>

      {/* Create modal */}
      <Modal
        title="新建任务"
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={() => {
          form.validateFields().then(() => {
            setShowModal(false);
            form.resetFields();
          });
        }}
        okText="创建"
        cancelText="取消"
        okButtonProps={{ style: { background: '#3DBFA0', borderColor: '#3DBFA0' } }}
      >
        <Form form={form} layout="vertical" size="small">
          <Form.Item label="任务名称" name="title" rules={[{ required: true }]}>
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="采集类型" name="type" rules={[{ required: true }]}>
                <Select placeholder="选择类型">
                  <Select.Option value="voice">语音采集</Select.Option>
                  <Select.Option value="text">文本采集</Select.Option>
                  <Select.Option value="image">图片采集</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="奖励积分" name="reward" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="总名额" name="totalSlots" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="截止日期" name="deadline" rules={[{ required: true }]}>
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="任务说明" name="description">
            <Input.TextArea rows={3} placeholder="请输入任务说明" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
