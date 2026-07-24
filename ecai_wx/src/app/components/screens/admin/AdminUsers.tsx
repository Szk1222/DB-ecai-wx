import React, { useState } from 'react';
import { Table, Tag, Button, Input, Select, Space, Card, Row, Col, Avatar, Progress } from 'antd';
import { SearchOutlined, FilterOutlined, UserOutlined } from '@ant-design/icons';
import { ADMIN_USERS, AdminUser } from '../../../data/mockData';

const LEVEL_COLORS = ['', '#CD7F32', '#C0C0C0', '#FFD700', '#3DBFA0', '#8B5CF6'];
const LEVEL_NAMES = ['', '铜牌', '银牌', '金牌', '白金', '钻石'];

export function AdminUsers() {
  const [users] = useState(ADMIN_USERS);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string | undefined>(undefined);

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.nickname.includes(search) || u.phone.includes(search);
    const matchTag = !tagFilter || u.tags.includes(tagFilter);
    return matchSearch && matchTag;
  });

  const allTags = Array.from(new Set(users.flatMap((u) => u.tags)));

  const columns = [
    {
      title: '用户',
      key: 'user',
      render: (_: any, record: AdminUser) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar
            size={32}
            style={{ background: LEVEL_COLORS[record.level], flexShrink: 0, fontSize: 12 }}
          >
            {record.nickname[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a2e' }}>{record.nickname}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>{record.phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      width: 100,
      render: (v: string) => <span style={{ fontSize: 12 }}>{v}</span>,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 160,
      render: (tags: string[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {tags.length === 0 ? <span style={{ color: '#D1D5DB', fontSize: 11 }}>无标签</span> : tags.map((tag) => (
            <Tag key={tag} style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>{tag}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      hidden: true,
      width: 80,
      render: (level: number) => (
        <Tag style={{ background: `${LEVEL_COLORS[level]}20`, color: LEVEL_COLORS[level], borderColor: LEVEL_COLORS[level], fontWeight: 600 }}>
          Lv.{level} {LEVEL_NAMES[level]}
        </Tag>
      ),
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      hidden: true,
      width: 80,
      render: (v: number) => <span style={{ color: '#3DBFA0', fontWeight: 600 }}>{v.toLocaleString()}</span>,
    },
    {
      title: '任务/通过率',
      key: 'tasks',
      width: 120,
      render: (_: any, record: AdminUser) => (
        <div>
          <span style={{ fontSize: 12 }}>{record.taskCount}个任务</span>
          <Progress percent={record.passRate} size="small" strokeColor="#3DBFA0" style={{ marginTop: 2 }} />
        </div>
      ),
    },
    {
      title: '认证',
      dataIndex: 'verified',
      key: 'verified',
      width: 70,
      render: (v: boolean) => (
        <Tag color={v ? 'success' : 'default'}>{v ? '已实名' : '未实名'}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 70,
      render: (s: string) => (
        <Tag color={s === 'active' ? 'success' : 'error'}>{s === 'active' ? '正常' : '封禁'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, record: AdminUser) => (
        <Button type="text" size="small" style={{ color: '#3B82F6', fontSize: 12 }}>详情</Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <Row gutter={[12, 12]}>
        {[
          { label: '总用户数', value: users.length, color: '#3DBFA0' },
          { label: '已实名', value: users.filter((u) => u.verified).length, color: '#22C55E' },
          { label: '有标签', value: users.filter((u) => u.tags.length > 0).length, color: '#3B82F6' },
          { label: '高等级(Lv4+)', value: users.filter((u) => u.level >= 4).length, color: '#8B5CF6' },
        ].map(({ label, value, color }) => (
          <Col key={label} xs={12} sm={6}>
            <Card size="small" style={{ borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        size="small"
        style={{ borderRadius: 12 }}
        title="用户列表"
        extra={
          <Space size={8}>
            <Input
              prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
              placeholder="搜索用户"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 160 }}
            />
            <Select
              placeholder="标签筛选"
              size="small"
              allowClear
              value={tagFilter}
              onChange={setTagFilter}
              style={{ width: 120 }}
            >
              {allTags.map((tag) => (
                <Select.Option key={tag} value={tag}>{tag}</Select.Option>
              ))}
            </Select>
          </Space>
        }
      >
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 10, size: 'small' }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}
