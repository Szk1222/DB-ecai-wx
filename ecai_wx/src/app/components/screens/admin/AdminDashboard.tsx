import React from 'react';
import { Card, Row, Col, Statistic, Tag } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  RiseOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { DASHBOARD_STATS } from '../../../data/mockData';

const KPI_CARDS = [
  { label: '注册用户数', value: DASHBOARD_STATS.totalUsers.toLocaleString(), icon: <UserOutlined />, color: '#3DBFA0', bg: '#E8F7F4', change: '+128 今日' },
  { label: '活跃用户', value: DASHBOARD_STATS.activeUsers.toLocaleString(), icon: <RiseOutlined />, color: '#3B82F6', bg: '#EEF4FF', change: '最近7天' },
  { label: '总提交条数', value: DASHBOARD_STATS.totalSubmissions.toLocaleString(), icon: <FileTextOutlined />, color: '#8B5CF6', bg: '#F5F3FF', change: '+280 今日' },
  { label: '待质检', value: DASHBOARD_STATS.pendingQC, icon: <AuditOutlined />, color: '#F59E0B', bg: '#FFF7E6', change: '需处理' },
  { label: '已发放积分', value: `${(DASHBOARD_STATS.totalPointsIssued / 10000).toFixed(1)}万`, icon: <CheckCircleOutlined />, color: '#22C55E', bg: '#F0FDF4', change: '累计' },
  { label: '已提现金额', value: `¥${(DASHBOARD_STATS.totalWithdrawn / 100).toFixed(0)}`, icon: <DollarOutlined />, color: '#EF4444', bg: '#FEF2F2', change: '累计' },
];

const PIE_COLORS = ['#3DBFA0', '#3B82F6', '#F59E0B'];

export function AdminDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* KPI cards */}
      <Row gutter={[16, 16]}>
        {KPI_CARDS.map((card) => (
          <Col key={card.label} xs={24} sm={12} lg={8} xl={4}>
            <Card size="small" style={{ borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ color: '#9CA3AF', fontSize: 12, margin: 0 }}>{card.label}</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: '4px 0 0' }}>
                    {card.value}
                  </p>
                  <p style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>{card.change}</p>
                </div>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: card.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: card.color, fontSize: 18,
                  }}
                >
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Daily submissions chart */}
        <Col xs={24} lg={16}>
          <Card
            title="每日提交量趋势"
            size="small"
            style={{ borderRadius: 12 }}
            extra={<Tag color="green">近7天</Tag>}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={DASHBOARD_STATS.dailySubmissions} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#3DBFA0" radius={[4, 4, 0, 0]} name="提交数" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Type distribution */}
        <Col xs={24} lg={8}>
          <Card
            title="采集类型分布"
            size="small"
            style={{ borderRadius: 12 }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={DASHBOARD_STATS.taskTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={false}
                >
                  {DASHBOARD_STATS.taskTypeDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Pass rate trend */}
      <Card
        title="质检通过率趋势"
        size="small"
        style={{ borderRadius: 12 }}
        extra={<Tag color="blue">近7天</Tag>}
      >
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={DASHBOARD_STATS.passRateTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(v) => [`${v}%`, '通过率']}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#3DBFA0"
              strokeWidth={2.5}
              dot={{ fill: '#3DBFA0', r: 4 }}
              name="通过率"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
