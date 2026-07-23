import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Drawer,
  Dropdown,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Upload,
} from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { ConfigCreateDrawer, CreatedConfigPayload } from './ConfigCreateDrawer';
import './AdminConfig.css';

type TemplateStatus = 'active' | 'draft' | 'disabled';

interface TemplateItem {
  id: string;
  name: string;
  category: 'voice' | 'text' | 'image';
  version: number;
  status: TemplateStatus;
  taskCount: number;
  updatedAt: string;
  updatedBy: string;
  format: string;
  channel: string;
  sampleRate: number;
  bitDepth: number;
  noiseLimit: number;
  maxDuration: number;
  silenceDuration: number;
  qualityTags: string[];
  customNote?: string;
}

const QUALITY_OPTIONS = [
  '有电流/电子噪音',
  '有回音/空旷音',
  '中间停顿时间过长',
  '录音与文本不一致',
  '有喷麦/录音距离太近',
  '没有人声',
  '只需朗读一遍文本',
  '前后静音段预留不足',
  '语速过慢不符合描述',
  '语速过快听不清楚',
  '语速区分不清晰',
];

const INITIAL_TEMPLATES: TemplateItem[] = [
  {
    id: 'TPL-240716-01',
    name: '普通话语音采集 · 标准版',
    category: 'voice',
    version: 6,
    status: 'active',
    taskCount: 18,
    updatedAt: '2026-07-16 17:42',
    updatedBy: '运营管理员',
    format: 'WAV',
    channel: 'mono',
    sampleRate: 16000,
    bitDepth: 16,
    noiseLimit: 70,
    maxDuration: 30,
    silenceDuration: 1,
    qualityTags: QUALITY_OPTIONS.slice(0, 9),
  },
  {
    id: 'TPL-240705-03',
    name: '粤语自然对话录制',
    category: 'voice',
    version: 3,
    status: 'active',
    taskCount: 7,
    updatedAt: '2026-07-15 10:24',
    updatedBy: '陈佳',
    format: 'WAV',
    channel: 'mono',
    sampleRate: 32000,
    bitDepth: 16,
    noiseLimit: 65,
    maxDuration: 45,
    silenceDuration: 1.5,
    qualityTags: QUALITY_OPTIONS.slice(0, 7),
  },
  {
    id: 'TPL-240711-02',
    name: '客服场景文本改写',
    category: 'text',
    version: 2,
    status: 'draft',
    taskCount: 0,
    updatedAt: '2026-07-14 16:08',
    updatedBy: '李婷',
    format: 'TXT',
    channel: '-',
    sampleRate: 0,
    bitDepth: 0,
    noiseLimit: 0,
    maxDuration: 0,
    silenceDuration: 0,
    qualityTags: [],
  },
  {
    id: 'TPL-240529-04',
    name: '室内物品图片采集',
    category: 'image',
    version: 4,
    status: 'disabled',
    taskCount: 12,
    updatedAt: '2026-06-28 09:36',
    updatedBy: '运营管理员',
    format: 'JPG/PNG',
    channel: '-',
    sampleRate: 0,
    bitDepth: 0,
    noiseLimit: 0,
    maxDuration: 0,
    silenceDuration: 0,
    qualityTags: [],
  },
];

const CATEGORY_META = {
  voice: { label: '语音采集', color: '#2FB28F' },
  text: { label: '文本采集', color: '#4D7CFE' },
  image: { label: '图片采集', color: '#E59A2D' },
};

const STATUS_META = {
  active: { label: '使用中', color: 'success' },
  draft: { label: '草稿', color: 'warning' },
  disabled: { label: '已停用', color: 'default' },
};

const DEFAULT_VALUES = {
  name: `语音采集模板_${new Date().toISOString().slice(0, 10).replaceAll('-', '')}`,
  category: 'voice',
  format: 'WAV',
  channel: 'mono',
  sampleRate: 16000,
  bitDepth: 16,
  noiseLimit: 70,
  maxDuration: 30,
  silenceDuration: 1,
  qualityTags: QUALITY_OPTIONS,
};

export function AdminTemplates() {
  const [templates, setTemplates] = useState(INITIAL_TEMPLATES);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TemplateItem | null>(null);
  const [preview, setPreview] = useState<any>(null);
  const [form] = Form.useForm();

  const filtered = useMemo(() => templates.filter((item) => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (!status || item.status === status);
  }), [search, status, templates]);

  const openEditor = (item?: TemplateItem) => {
    setEditing(item || null);
    form.setFieldsValue(item || DEFAULT_VALUES);
    setDrawerOpen(true);
  };

  const saveTemplate = async () => {
    const values = await form.validateFields();
    if (editing) {
      setTemplates((items) => items.map((item) => item.id === editing.id ? {
        ...item,
        ...values,
        version: item.version + 1,
        updatedAt: '刚刚',
        updatedBy: '运营管理员',
      } : item));
      message.success('已保存为新版本');
    } else {
      const newItem: TemplateItem = {
        ...DEFAULT_VALUES,
        ...values,
        id: `TPL-${Date.now().toString().slice(-8)}`,
        version: 1,
        status: 'draft',
        taskCount: 0,
        updatedAt: '刚刚',
        updatedBy: '运营管理员',
      } as TemplateItem;
      setTemplates((items) => [newItem, ...items]);
      message.success('模板草稿已创建');
    }
    setDrawerOpen(false);
    form.resetFields();
  };

  const duplicateTemplate = (item: TemplateItem) => {
    setTemplates((items) => [{
      ...item,
      id: `TPL-${Date.now().toString().slice(-8)}`,
      name: `${item.name} - 副本`,
      version: 1,
      status: 'draft',
      taskCount: 0,
      updatedAt: '刚刚',
      updatedBy: '运营管理员',
    }, ...items]);
    message.success('已复制为新草稿');
  };

  const handleTemplateCreated = (payload: CreatedConfigPayload) => {
    const values = payload.data as Partial<TemplateItem>;
    setTemplates((items) => [{
      ...DEFAULT_VALUES,
      ...values,
      id: payload.id,
      name: payload.name,
      category: payload.category,
      version: 1,
      status: 'draft',
      taskCount: 0,
      updatedAt: '刚刚',
      updatedBy: '运营管理员',
    } as TemplateItem, ...items]);
  };

  const columns = [
    {
      title: '模板',
      key: 'name',
      render: (_: unknown, item: TemplateItem) => (
        <div className="config-name-cell">
          <div className="config-name-icon"><FileTextOutlined /></div>
          <div>
            <div className="config-name-title">{item.name}</div>
            <div className="config-name-meta">{item.id}</div>
          </div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 100,
      render: (value: keyof typeof CATEGORY_META) => <Tag color={CATEGORY_META[value].color}>{CATEGORY_META[value].label}</Tag>,
    },
    {
      title: '版本',
      dataIndex: 'version',
      width: 76,
      render: (value: number) => <span style={{ fontWeight: 650, color: '#4E6075' }}>v{value}</span>,
    },
    {
      title: '关联任务',
      dataIndex: 'taskCount',
      width: 90,
      render: (value: number) => <span>{value} 个</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (value: TemplateStatus) => <Tag color={STATUS_META[value].color}>{STATUS_META[value].label}</Tag>,
    },
    {
      title: '最近更新',
      key: 'updatedAt',
      width: 170,
      render: (_: unknown, item: TemplateItem) => (
        <div>
          <div style={{ fontSize: 12, color: '#53657A' }}>{item.updatedAt}</div>
          <div style={{ fontSize: 11, color: '#9AA6B5', marginTop: 2 }}>{item.updatedBy}</div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 148,
      fixed: 'right' as const,
      render: (_: unknown, item: TemplateItem) => (
        <Space size={2}>
          <Tooltip title="预览"><Button type="text" size="small" icon={<EyeOutlined />} onClick={() => setPreview(item)} /></Tooltip>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditor(item)}>编辑</Button>
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'copy', icon: <CopyOutlined />, label: '复制为草稿', onClick: () => duplicateTemplate(item) },
                { key: 'toggle', label: item.status === 'disabled' ? '重新启用' : '停用模板', onClick: () => setTemplates((items) => items.map((row) => row.id === item.id ? { ...row, status: row.status === 'disabled' ? 'active' : 'disabled' } : row)) },
                { type: 'divider' },
                { key: 'delete', danger: true, icon: <DeleteOutlined />, label: '删除草稿', disabled: item.status !== 'draft', onClick: () => setTemplates((items) => items.filter((row) => row.id !== item.id)) },
              ],
            }}
          >
            <Button type="text" size="small" icon={<EllipsisOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-config-page">
      <section className="admin-config-hero">
        <h2 className="admin-config-title">采集模板配置</h2>
        <div className="admin-config-actions">
          <Button icon={<EyeOutlined />} onClick={() => setPreview(INITIAL_TEMPLATES[0])}>查看示例</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)} style={{ background: '#30B894' }}>新建模板</Button>
        </div>
      </section>

      <Row gutter={[12, 12]}>
        {[
          { label: '模板总数', value: templates.length, note: '覆盖语音、文本、图片采集' },
          { label: '使用中', value: templates.filter((item) => item.status === 'active').length, note: '正在被正式任务引用' },
          { label: '草稿', value: templates.filter((item) => item.status === 'draft').length, note: '待补充或待发布' },
          { label: '关联任务', value: templates.reduce((sum, item) => sum + item.taskCount, 0), note: '历史与当前任务合计' },
        ].map((stat) => (
          <Col xs={12} lg={6} key={stat.label}>
            <Card className="admin-stat-card" size="small">
              <div className="admin-stat-label">{stat.label}</div>
              <div className="admin-stat-value">{stat.value}</div>
              <div className="admin-stat-note">{stat.note}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        className="admin-config-panel"
        title="模板列表"
        extra={
          <Space wrap>
            <Input allowClear prefix={<SearchOutlined style={{ color: '#A1AAB6' }} />} placeholder="搜索模板名称 / 编号" value={search} onChange={(event) => setSearch(event.target.value)} style={{ width: 210 }} />
            <Select allowClear placeholder="全部状态" value={status} onChange={setStatus} style={{ width: 118 }} options={Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: meta.label }))} />
          </Space>
        }
      >
        <Table dataSource={filtered} columns={columns} rowKey="id" pagination={{ pageSize: 8, size: 'small' }} scroll={{ x: 920 }} />
      </Card>

      <Drawer
        className="config-drawer"
        title={editing ? `编辑模板 · v${editing.version}` : '新建采集模板'}
        size={760}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        destroyOnClose={false}
      >
        <div className="config-drawer-body">
          <Form form={form} layout="vertical" requiredMark="optional">
            <div className="config-form-section">
              <div className="config-section-title"><span className="config-section-index">01</span>模板信息</div>
              <Row gutter={14}>
                <Col span={15}><Form.Item label="模板名称" name="name" rules={[{ required: true, message: '请输入模板名称' }]}><Input maxLength={40} showCount placeholder="请输入便于识别的模板名称" /></Form.Item></Col>
                <Col span={9}><Form.Item label="模板分类" name="category" rules={[{ required: true }]}><Select options={Object.entries(CATEGORY_META).map(([value, meta]) => ({ value, label: meta.label }))} /></Form.Item></Col>
              </Row>
              <Form.Item label="模板规范文件" extra="支持 PDF，单文件不超过 10MB">
                <Upload beforeUpload={() => false} maxCount={1} accept=".pdf"><Button icon={<UploadOutlined />}>上传规范文件</Button></Upload>
              </Form.Item>
            </div>

            <div className="config-form-section">
              <div className="config-section-title"><span className="config-section-index">02</span>基础音频配置</div>
              <Row gutter={14}>
                <Col span={8}><Form.Item label="音频格式" name="format" rules={[{ required: true }]}><Select options={['WAV', 'PCM', 'MP3', 'FLAC'].map((value) => ({ value, label: value }))} /></Form.Item></Col>
                <Col span={8}><Form.Item label="声道" name="channel" rules={[{ required: true }]}><Select options={[{ value: 'mono', label: '单声道 Mono' }, { value: 'stereo', label: '双声道 Stereo' }]} /></Form.Item></Col>
                <Col span={8}><Form.Item label="采样率" name="sampleRate" rules={[{ required: true }]}><Select options={[16000, 32000, 44100, 48000].map((value) => ({ value, label: `${value / 1000} kHz` }))} /></Form.Item></Col>
              </Row>
              <Row gutter={14}>
                <Col span={6}><Form.Item label="位深" name="bitDepth"><Select options={[16, 32].map((value) => ({ value, label: `${value} bit` }))} /></Form.Item></Col>
                <Col span={6}><Form.Item label="噪音上限" name="noiseLimit"><InputNumber min={0} max={120} suffix="dB" style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={6}><Form.Item label="最大时长" name="maxDuration"><InputNumber min={1} max={600} suffix="秒" style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={6}><Form.Item label="预留静音段" name="silenceDuration"><InputNumber min={0} max={10} step={0.5} suffix="秒" style={{ width: '100%' }} /></Form.Item></Col>
              </Row>
            </div>

            <div className="config-form-section">
              <div className="config-section-title"><span className="config-section-index">03</span>质检批注项</div>
              <Form.Item name="qualityTags">
                <Checkbox.Group style={{ width: '100%' }}>
                  <div className="quality-chip-grid">
                    {QUALITY_OPTIONS.map((option) => <div className="quality-chip" key={option}><Checkbox value={option}>{option}</Checkbox></div>)}
                  </div>
                </Checkbox.Group>
              </Form.Item>
              <Form.Item label="DIY 自定义说明" name="customNote"><Input.TextArea rows={4} maxLength={500} showCount placeholder="填写默认批注无法覆盖的补充要求；内容将同步到预览与质检端。" /></Form.Item>
            </div>
          </Form>
        </div>
        <div className="config-drawer-footer">
          <Button onClick={() => setDrawerOpen(false)}>取消</Button>
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => setPreview({ ...editing, ...form.getFieldsValue(true), version: editing?.version || 1, status: editing?.status || 'draft' })}>预览采集端</Button>
            <Button type="primary" onClick={saveTemplate} style={{ background: '#30B894' }}>{editing ? '保存为新版本' : '保存草稿'}</Button>
          </Space>
        </div>
      </Drawer>

      <ConfigCreateDrawer type="template" open={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleTemplateCreated} />

      <Modal title="模板预览" width={720} open={Boolean(preview)} onCancel={() => setPreview(null)} footer={<Button type="primary" onClick={() => setPreview(null)} style={{ background: '#30B894' }}>完成预览</Button>}>
        {preview && (
          <div style={{ paddingTop: 8 }}>
            <div style={{ padding: 20, borderRadius: 14, background: 'linear-gradient(135deg, #EEF8F5, #F8FAFC)', marginBottom: 16 }}>
              <Tag color={CATEGORY_META[preview.category as keyof typeof CATEGORY_META]?.color || '#30B894'}>{CATEGORY_META[preview.category as keyof typeof CATEGORY_META]?.label || '采集模板'}</Tag>
              <h3 style={{ margin: '10px 0 5px', fontSize: 20, color: '#24374B' }}>{preview.name}</h3>
              <span style={{ color: '#8592A3', fontSize: 12 }}>版本 v{preview.version || 1} · 当前表单实时预览</span>
            </div>
            {preview.category === 'voice' && <Descriptions bordered size="small" column={3} items={[
              { key: 'format', label: '音频格式', children: preview.format },
              { key: 'channel', label: '声道', children: preview.channel === 'mono' ? '单声道' : '双声道' },
              { key: 'rate', label: '采样率', children: `${preview.sampleRate / 1000} kHz` },
              { key: 'depth', label: '位深', children: `${preview.bitDepth} bit` },
              { key: 'noise', label: '噪音上限', children: `${preview.noiseLimit} dB` },
              { key: 'duration', label: '最大时长', children: `${preview.maxDuration} 秒` },
            ]} />}
            <div style={{ marginTop: 18, color: '#34475C', fontWeight: 700 }}>质检关注项</div>
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {(preview.qualityTags || []).map((tag: string) => <Tag key={tag}>{tag}</Tag>)}
              {!preview.qualityTags?.length && <span style={{ color: '#98A3B2' }}>当前分类暂无音频质检批注项</span>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
