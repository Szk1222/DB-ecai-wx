import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Progress,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import {
  ApiOutlined,
  CheckCircleFilled,
  CloudServerOutlined,
  EditOutlined,
  ExperimentOutlined,
  PlusOutlined,
  ReloadOutlined,
  RobotOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { ConfigCreateDrawer, CreatedConfigPayload } from './ConfigCreateDrawer';
import { DEFAULT_MODEL_THRESHOLDS, MODEL_SCORING_METRICS } from './modelScoringPolicy';
import './AdminConfig.css';

type ModelStatus = 'online' | 'offline' | 'testing';

interface ModelItem {
  id: string;
  name: string;
  code: string;
  provider: string;
  version: string;
  abilities: string[];
  endpoint: string;
  status: ModelStatus;
  isDefault: boolean;
  latency: number;
  successRate: number;
  concurrency: number;
  timeout: number;
  retries: number;
  apiKey?: string;
  updatedAt: string;
}

const INITIAL_MODELS: ModelItem[] = [
  {
    id: 'MOD-VOICE-01',
    name: '语音质量检测 Pro',
    code: 'voice-qc-pro',
    provider: '标贝智能质检',
    version: 'v3.4.2',
    abilities: ['清晰度', '噪音', '静音段', '人声检测'],
    endpoint: 'https://model-gateway.example.com/v1/voice/qc',
    status: 'online',
    isDefault: true,
    latency: 680,
    successRate: 99.7,
    concurrency: 30,
    timeout: 30,
    retries: 2,
    apiKey: 'sk-model-••••••••',
    updatedAt: '2026-07-16 19:18',
  },
  {
    id: 'MOD-ASR-02',
    name: '朗读一致性识别',
    code: 'asr-match-cn',
    provider: '内部推理服务',
    version: 'v2.8.0',
    abilities: ['语音转写', '错漏读', '重复朗读'],
    endpoint: 'https://model-gateway.example.com/v1/asr/match',
    status: 'online',
    isDefault: false,
    latency: 940,
    successRate: 99.2,
    concurrency: 20,
    timeout: 45,
    retries: 2,
    updatedAt: '2026-07-15 14:35',
  },
  {
    id: 'MOD-TEXT-03',
    name: '文本合规与完整性',
    code: 'text-qc-general',
    provider: '模型服务 A',
    version: 'v1.9.6',
    abilities: ['内容完整性', '敏感信息', '重复文本'],
    endpoint: 'https://model-gateway.example.com/v1/text/review',
    status: 'online',
    isDefault: false,
    latency: 520,
    successRate: 98.9,
    concurrency: 50,
    timeout: 20,
    retries: 1,
    apiKey: 'sk-model-••••••••',
    updatedAt: '2026-07-14 11:20',
  },
  {
    id: 'MOD-IMAGE-04',
    name: '图片质量与标签校验',
    code: 'image-quality-v2',
    provider: '内部推理服务',
    version: 'v2.1.0-rc',
    abilities: ['清晰度', '重复图片', '标签一致性'],
    endpoint: 'https://model-gateway.example.com/v1/image/qc',
    status: 'offline',
    isDefault: false,
    latency: 0,
    successRate: 0,
    concurrency: 10,
    timeout: 60,
    retries: 1,
    updatedAt: '2026-07-12 08:40',
  },
];

const STATUS_META = {
  online: { label: '运行正常', color: 'success' },
  offline: { label: '未启用', color: 'default' },
  testing: { label: '检测中', color: 'processing' },
};

export function AdminModels() {
  const [models, setModels] = useState(INITIAL_MODELS);
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ModelItem | null>(null);
  const [thresholds, setThresholds] = useState(DEFAULT_MODEL_THRESHOLDS);
  const [form] = Form.useForm();

  const filtered = useMemo(() => models.filter((model) => !search || [model.name, model.code, model.provider].some((value) => value.toLowerCase().includes(search.toLowerCase()))), [models, search]);

  const openEditor = (model?: ModelItem) => {
    setEditing(model || null);
    form.setFieldsValue(model || {
      provider: '内部推理服务',
      version: 'v1.0.0',
      status: 'offline',
      abilities: ['清晰度'],
      concurrency: 10,
      timeout: 30,
      retries: 2,
      isDefault: false,
    });
    setDrawerOpen(true);
  };

  const saveModel = async () => {
    const values = await form.validateFields();
    if (editing) {
      setModels((items) => items.map((item) => item.id === editing.id ? { ...item, ...values, updatedAt: '刚刚' } : item));
    } else {
      setModels((items) => [{
        ...values,
        id: `MOD-${Date.now().toString().slice(-6)}`,
        latency: 0,
        successRate: 0,
        updatedAt: '刚刚',
      } as ModelItem, ...items]);
    }
    message.success(editing ? '模型配置已更新' : '模型服务已添加');
    setDrawerOpen(false);
  };

  const handleModelCreated = (payload: CreatedConfigPayload) => {
    setModels((items) => [{
      ...(payload.data as Partial<ModelItem>),
      id: payload.id,
      name: payload.name,
      version: payload.version,
      status: 'offline',
      latency: 0,
      successRate: 0,
      updatedAt: '刚刚',
    } as ModelItem, ...items]);
  };

  const testConnection = (model: ModelItem) => {
    setModels((items) => items.map((item) => item.id === model.id ? { ...item, status: 'testing' } : item));
    message.loading({ content: `正在检测 ${model.name}…`, key: model.id });
    window.setTimeout(() => {
      setModels((items) => items.map((item) => item.id === model.id ? { ...item, status: 'online', latency: item.latency || 720, successRate: item.successRate || 99.1 } : item));
      message.success({ content: '连接成功，模型响应正常', key: model.id });
    }, 900);
  };

  const setDefaultModel = (id: string, checked: boolean) => {
    setModels((items) => items.map((item) => ({ ...item, isDefault: checked ? item.id === id : item.id === id ? false : item.isDefault })));
    if (checked) message.success('已设为默认质检模型');
  };

  const columns = [
    {
      title: '模型服务',
      key: 'name',
      render: (_: unknown, model: ModelItem) => (
        <div className="config-name-cell">
          <div className="config-name-icon"><RobotOutlined /></div>
          <div>
            <div className="config-name-title">{model.name} {model.isDefault && <Tag color="cyan" variant="filled" style={{ marginLeft: 5, fontSize: 10 }}>默认</Tag>}</div>
            <div className="config-name-meta">{model.code} · {model.version}</div>
          </div>
        </div>
      ),
    },
    { title: '服务商', dataIndex: 'provider', width: 125, render: (value: string) => <span style={{ fontSize: 12 }}>{value}</span> },
    { title: '检测能力', dataIndex: 'abilities', width: 240, render: (items: string[]) => <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{items.slice(0, 3).map((item) => <Tag key={item} style={{ margin: 0 }}>{item}</Tag>)}{items.length > 3 && <Tag style={{ margin: 0 }}>+{items.length - 3}</Tag>}</div> },
    {
      title: '健康度',
      key: 'health',
      width: 130,
      render: (_: unknown, model: ModelItem) => model.status === 'online' ? (
        <div>
          <div style={{ fontSize: 12, color: '#4E6075' }}>{model.successRate}% · {model.latency}ms</div>
          <Progress percent={model.successRate} showInfo={false} size="small" strokeColor="#30B894" railColor="#EDF1F4" />
        </div>
      ) : <span style={{ color: '#9AA6B5', fontSize: 12 }}>暂无运行数据</span>,
    },
    { title: '状态', dataIndex: 'status', width: 100, render: (value: ModelStatus) => <Tag color={STATUS_META[value].color}>{STATUS_META[value].label}</Tag> },
    {
      title: '默认',
      dataIndex: 'isDefault',
      width: 64,
      render: (value: boolean, model: ModelItem) => <Switch size="small" checked={value} disabled={model.status !== 'online'} onChange={(checked) => setDefaultModel(model.id, checked)} />,
    },
    {
      title: '操作',
      key: 'action',
      width: 155,
      fixed: 'right' as const,
      render: (_: unknown, model: ModelItem) => (
        <Space size={2}>
          <Tooltip title="测试连接"><Button type="text" size="small" loading={model.status === 'testing'} icon={<ApiOutlined />} onClick={() => testConnection(model)} /></Tooltip>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditor(model)}>配置</Button>
        </Space>
      ),
    },
  ];

  const registry = (
    <Card
      className="admin-config-panel"
      title="模型服务注册表"
      extra={<Input allowClear prefix={<SearchOutlined style={{ color: '#A1AAB6' }} />} placeholder="搜索名称 / 标识 / 服务商" value={search} onChange={(event) => setSearch(event.target.value)} style={{ width: 230 }} />}
    >
      <Table dataSource={filtered} columns={columns} rowKey="id" pagination={false} scroll={{ x: 980 }} />
    </Card>
  );

  const scoringPolicy = (
    <Card className="admin-config-panel" title="模型判定阈值" extra={<Space><Button onClick={() => setThresholds(DEFAULT_MODEL_THRESHOLDS)}>恢复默认</Button><Button type="primary" style={{ background: '#30B894' }} onClick={() => message.success('判定策略已保存')}>保存策略</Button></Space>}>
      <div style={{ padding: '4px 0 10px', color: '#7D8A9C', fontSize: 12 }}>模板可以覆盖部分阈值；此处作为全局默认值。模型检测结果与人工质检标签共用同一判定口径。</div>
      <Row gutter={[14, 14]} style={{ marginTop: 8 }}>
        {[
          { key: 'clarity', title: '音频清晰度', suffix: '分', min: 0, max: 100, note: '低于阈值进入人工复核' },
          { key: 'completeness', title: '内容完整性', suffix: '分', min: 0, max: 100, note: '检查空文件、截断和有效内容' },
          { key: 'transcriptMatch', title: '朗读文本一致率', suffix: '%', min: 0, max: 100, note: '用于错读、漏读、增读判断' },
          { key: 'noiseLimit', title: '环境噪音上限', suffix: 'dB', min: 0, max: 120, note: '默认与语音模板 70dB 保持一致' },
          { key: 'pauseDuration', title: '异常停顿时长', suffix: '秒', min: 0, max: 10, step: 0.5, note: '连续停顿超过此值标记异常' },
          { key: 'autoPass', title: '模型自动通过分', suffix: '分', min: 0, max: 100, note: '达到该分数且无否决项时自动通过' },
        ].map((item) => (
          <Col xs={24} md={12} xl={8} key={item.key}>
            <div className="model-score-card">
              <div className="model-score-top"><span className="model-score-title">{item.title}</span><span className="model-score-value">{(thresholds as any)[item.key]}{item.suffix}</span></div>
              <Slider min={item.min} max={item.max} step={item.step || 1} value={(thresholds as any)[item.key]} onChange={(value) => setThresholds((current) => ({ ...current, [item.key]: value }))} tooltip={{ formatter: (value) => `${value}${item.suffix}` }} />
              {MODEL_SCORING_METRICS.find((metric) => metric.key === item.key)?.model && (() => {
                const model = MODEL_SCORING_METRICS.find((metric) => metric.key === item.key)!.model;
                return <Tag icon={<RobotOutlined />} color="blue" style={{ marginBottom: 7 }}>{model.name} · {model.version}</Tag>;
              })()}
              <div className="admin-stat-note">{item.note}</div>
            </div>
          </Col>
        ))}
      </Row>
      <div style={{ marginTop: 16, padding: 16, border: '1px solid #E6ECEF', borderRadius: 12, background: '#F9FBFC' }}>
        <Row align="middle" gutter={[20, 12]}>
          <Col flex="auto"><div style={{ fontWeight: 700, color: '#30445A' }}>人工复核分流</div><div style={{ marginTop: 3, color: '#8793A2', fontSize: 12 }}>模型得分低于 {thresholds.manualReview} 分，或命中“没有人声”等否决项时，强制进入人工复核。</div></Col>
          <Col><InputNumber min={0} max={100} value={thresholds.manualReview} suffix="分" onChange={(value) => setThresholds((current) => ({ ...current, manualReview: value || 0 }))} /></Col>
        </Row>
      </div>
    </Card>
  );

  return (
    <div className="admin-config-page">
      <section className="admin-config-hero">
        <h2 className="admin-config-title">模型配置中心</h2>
        <div className="admin-config-actions">
          <Button icon={<ReloadOutlined />} onClick={() => models.filter((model) => model.status === 'online').forEach(testConnection)}>批量健康检查</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)} style={{ background: '#30B894' }}>接入模型</Button>
        </div>
      </section>

      <Row gutter={[12, 12]}>
        <Col xs={12} lg={6}><Card className="admin-stat-card"><div className="admin-stat-label">已接入模型</div><div className="admin-stat-value">{models.length}</div><div className="admin-stat-note">覆盖语音、文本、图片质检</div></Card></Col>
        <Col xs={12} lg={6}><Card className="admin-stat-card"><div className="admin-stat-label">在线服务</div><div className="admin-stat-value" style={{ color: '#30A986' }}>{models.filter((model) => model.status === 'online').length}</div><div className="admin-stat-note"><CheckCircleFilled style={{ color: '#30B894', marginRight: 4 }} />最近检查全部正常</div></Card></Col>
        <Col xs={12} lg={6}><Card className="admin-stat-card"><div className="admin-stat-label">平均成功率</div><div className="admin-stat-value">99.3%</div><div className="admin-stat-note">近 24 小时调用统计</div></Card></Col>
        <Col xs={12} lg={6}><Card className="admin-stat-card"><div className="admin-stat-label">今日调用</div><div className="admin-stat-value">12,684</div><div className="admin-stat-note">较昨日 +8.6%</div></Card></Col>
      </Row>

      <Tabs defaultActiveKey="registry" items={[
        { key: 'registry', label: <span><CloudServerOutlined /> 模型服务</span>, children: registry },
        { key: 'policy', label: <span><ExperimentOutlined /> 判定阈值</span>, children: scoringPolicy },
      ]} />

      <Drawer className="config-drawer" title={editing ? '编辑模型配置' : '接入模型服务'} size={680} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="config-drawer-body">
          <Form form={form} layout="vertical" requiredMark="optional">
            <div className="config-form-section">
              <div className="config-section-title"><span className="config-section-index">01</span>模型标识</div>
              <Row gutter={14}>
                <Col span={14}><Form.Item label="模型名称" name="name" rules={[{ required: true }]}><Input placeholder="例如：语音质量检测 Pro" /></Form.Item></Col>
                <Col span={10}><Form.Item label="版本" name="version" rules={[{ required: true }]}><Input placeholder="v1.0.0" /></Form.Item></Col>
              </Row>
              <Row gutter={14}>
                <Col span={12}><Form.Item label="模型标识" name="code" rules={[{ required: true, pattern: /^[a-z0-9-]+$/, message: '仅支持小写字母、数字和短横线' }]}><Input placeholder="voice-qc-pro" disabled={Boolean(editing)} /></Form.Item></Col>
                <Col span={12}><Form.Item label="服务商" name="provider" rules={[{ required: true }]}><Select options={['标贝智能质检', '内部推理服务', '模型服务 A', '其他兼容服务'].map((value) => ({ value, label: value }))} /></Form.Item></Col>
              </Row>
              <Form.Item label="检测能力" name="abilities" rules={[{ required: true }]}><Select mode="multiple" options={['清晰度', '噪音', '静音段', '人声检测', '语音转写', '错漏读', '重复朗读', '内容完整性', '敏感信息', '重复文本', '标签一致性'].map((value) => ({ value, label: value }))} /></Form.Item>
            </div>

            <div className="config-form-section">
              <div className="config-section-title"><span className="config-section-index">02</span>服务连接</div>
              <Form.Item label="服务地址 Endpoint" name="endpoint" rules={[{ required: true, type: 'url', message: '请输入有效的 HTTPS 地址' }]}><Input prefix={<ApiOutlined style={{ color: '#9BA6B4' }} />} placeholder="https://model-gateway.example.com/v1/..." /></Form.Item>
              <Form.Item label="API Key" name="apiKey" extra="保存后仅展示掩码；原型不会发起真实请求"><Input.Password placeholder="请输入服务鉴权密钥" /></Form.Item>
              <Row gutter={14}>
                <Col span={8}><Form.Item label="最大并发" name="concurrency"><InputNumber min={1} max={500} style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={8}><Form.Item label="超时时间" name="timeout"><InputNumber min={1} max={300} suffix="秒" style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={8}><Form.Item label="失败重试" name="retries"><InputNumber min={0} max={5} suffix="次" style={{ width: '100%' }} /></Form.Item></Col>
              </Row>
            </div>

            <div className="config-form-section">
              <div className="config-section-title"><span className="config-section-index">03</span>启用策略</div>
              <Row gutter={14}>
                <Col span={12}><Form.Item label="服务状态" name="status"><Select options={[{ value: 'online', label: '启用' }, { value: 'offline', label: '暂不启用' }]} /></Form.Item></Col>
                <Col span={12}><Form.Item label="设为默认模型" name="isDefault" valuePropName="checked"><Switch /></Form.Item></Col>
              </Row>
            </div>
          </Form>
        </div>
        <div className="config-drawer-footer">
          <Button onClick={() => setDrawerOpen(false)}>取消</Button>
          <Space>
            {editing && <Button icon={<ApiOutlined />} onClick={() => testConnection(editing)}>测试连接</Button>}
            <Button type="primary" onClick={saveModel} style={{ background: '#30B894' }}>保存配置</Button>
          </Space>
        </div>
      </Drawer>
      <ConfigCreateDrawer type="model" open={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleModelCreated} />
    </div>
  );
}
