import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  CheckCircleFilled,
  CopyOutlined,
  DeleteOutlined,
  DragOutlined,
  EditOutlined,
  FileTextOutlined,
  NodeIndexOutlined,
  PlusOutlined,
  RobotOutlined,
  SaveOutlined,
  SearchOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons';
import './AdminProcesses.css';
import { ConfigCreateDrawer, CreatedConfigPayload } from './ConfigCreateDrawer';

type ProcessCategory = 'voice' | 'text' | 'image';
type ProcessStatus = 'active' | 'draft' | 'disabled';
type StepType = 'start' | 'collect' | 'annotate' | 'machine_review' | 'quality' | 'acceptance' | 'complete';

interface ProcessStep {
  id: string;
  type: StepType;
  name: string;
  enabled: boolean;
  fixed: boolean;
  assignee: string;
  timeout: number;
  retry: number;
  threshold?: number;
}

interface ProcessItem {
  id: string;
  name: string;
  category: ProcessCategory;
  templateId: string;
  templateName: string;
  version: number;
  status: ProcessStatus;
  usedBy: number;
  updatedAt: string;
  updatedBy: string;
  steps: ProcessStep[];
}

const CATEGORY_META: Record<ProcessCategory, { label: string; color: string }> = {
  voice: { label: '语音采集', color: '#2eaa8b' },
  text: { label: '文本采集', color: '#4f6ef7' },
  image: { label: '图片采集', color: '#e59a2d' },
};

const STATUS_META: Record<ProcessStatus, { label: string; color: string }> = {
  active: { label: '使用中', color: 'success' },
  draft: { label: '草稿', color: 'warning' },
  disabled: { label: '已停用', color: 'default' },
};

const STEP_META: Record<StepType, { label: string; icon: React.ReactNode; color: string }> = {
  start: { label: '开始', icon: <ThunderboltOutlined />, color: '#31b895' },
  collect: { label: '采集', icon: <UserOutlined />, color: '#4f6ef7' },
  annotate: { label: '二次复检', icon: <EditOutlined />, color: '#8b6bd6' },
  machine_review: { label: '智能审核', icon: <RobotOutlined />, color: '#3679c8' },
  quality: { label: '质检', icon: <CheckCircleFilled />, color: '#e59a2d' },
  acceptance: { label: '验收', icon: <FileTextOutlined />, color: '#de6d78' },
  complete: { label: '完成', icon: <CheckCircleFilled />, color: '#269879' },
};

const TEMPLATE_OPTIONS = [
  { value: 'TPL-240716-01', label: '普通话语音采集 · 标准版 v6', category: 'voice' as const },
  { value: 'TPL-240705-03', label: '粤语自然对话录制 v3', category: 'voice' as const },
  { value: 'TPL-240711-02', label: '客服场景文本改写 v2', category: 'text' as const },
  { value: 'TPL-240529-04', label: '室内物品图片采集 v4', category: 'image' as const },
];

const STEP_DEFAULTS: Record<StepType, ProcessStep> = {
  start: { id: 'start', type: 'start', name: '开始', enabled: true, fixed: true, assignee: '系统自动', timeout: 0, retry: 0 },
  collect: { id: 'collect', type: 'collect', name: '数据采集', enabled: true, fixed: true, assignee: '采集用户', timeout: 48, retry: 1 },
  annotate: { id: 'annotate', type: 'annotate', name: '二次复检', enabled: true, fixed: false, assignee: '复检人员', timeout: 24, retry: 1 },
  machine_review: { id: 'machine-review', type: 'machine_review', name: '智能审核', enabled: true, fixed: false, assignee: '系统自动', timeout: 1, retry: 2, threshold: 80 },
  quality: { id: 'quality', type: 'quality', name: '人工质检', enabled: true, fixed: false, assignee: '质检人员', timeout: 12, retry: 1, threshold: 85 },
  acceptance: { id: 'acceptance', type: 'acceptance', name: '项目验收', enabled: true, fixed: false, assignee: '项目管理员', timeout: 24, retry: 0 },
  complete: { id: 'complete', type: 'complete', name: '完成', enabled: true, fixed: true, assignee: '系统自动', timeout: 0, retry: 0 },
};

function createSteps(types: StepType[]) {
  return types.map((type) => ({ ...STEP_DEFAULTS[type] }));
}

const INITIAL_PROCESSES: ProcessItem[] = [
  {
    id: 'PROC-202607-01', name: '标准语音采集质检流程', category: 'voice', templateId: 'TPL-240716-01', templateName: '普通话语音采集 · 标准版',
    version: 5, status: 'active', usedBy: 12, updatedAt: '2026-07-20 16:42', updatedBy: '运营管理员',
    steps: createSteps(['start', 'collect', 'machine_review', 'quality', 'acceptance', 'complete']),
  },
  {
    id: 'PROC-202607-02', name: '自然对话采集二次复检流程', category: 'voice', templateId: 'TPL-240705-03', templateName: '粤语自然对话录制',
    version: 3, status: 'active', usedBy: 6, updatedAt: '2026-07-18 11:08', updatedBy: '陈佳',
    steps: createSteps(['start', 'collect', 'annotate', 'machine_review', 'quality', 'complete']),
  },
  {
    id: 'PROC-202607-03', name: '文本改写双重质检流程', category: 'text', templateId: 'TPL-240711-02', templateName: '客服场景文本改写',
    version: 1, status: 'draft', usedBy: 0, updatedAt: '2026-07-16 09:30', updatedBy: '李婷',
    steps: createSteps(['start', 'collect', 'annotate', 'quality', 'acceptance', 'complete']),
  },
];

const cloneSteps = (steps: ProcessStep[]) => steps.map((step) => ({ ...step }));

export function AdminProcesses() {
  const [processes, setProcesses] = useState(INITIAL_PROCESSES);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>();
  const [editing, setEditing] = useState<ProcessItem | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [steps, setSteps] = useState<ProcessStep[]>(createSteps(['start', 'collect', 'machine_review', 'quality', 'complete']));
  const [selectedStepId, setSelectedStepId] = useState('collect');
  const [dirty, setDirty] = useState(false);
  const [stepErrors, setStepErrors] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [modal, modalContextHolder] = Modal.useModal();

  const filtered = useMemo(() => processes.filter((item) => {
    const matchesText = !search || item.name.includes(search) || item.id.toLowerCase().includes(search.toLowerCase());
    return matchesText && (!status || item.status === status);
  }), [processes, search, status]);

  const selectedStep = steps.find((step) => step.id === selectedStepId) ?? steps[0];
  const availableSteps = (Object.keys(STEP_DEFAULTS) as StepType[]).filter((type) => !steps.some((step) => step.type === type) && !['start', 'collect', 'complete'].includes(type));
  const currentCategory = Form.useWatch('category', form) as ProcessCategory | undefined;

  const openEditor = (item?: ProcessItem) => {
    const target = item ?? null;
    setEditing(target);
    form.setFieldsValue({
      name: target?.name ?? '',
      category: target?.category ?? 'voice',
      templateId: target?.templateId,
    });
    const nextSteps = target ? cloneSteps(target.steps) : createSteps(['start', 'collect', 'machine_review', 'quality', 'complete']);
    setSteps(nextSteps);
    setSelectedStepId(nextSteps.find((step) => step.type === 'collect')?.id ?? nextSteps[0].id);
    setStepErrors([]);
    setDirty(false);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    const close = () => {
      setEditorOpen(false);
      setEditing(null);
      setStepErrors([]);
      form.resetFields();
    };
    if (!dirty) {
      close();
      return;
    }
    modal.confirm({
      title: '存在未保存的修改',
      content: '退出后本次流程编排内容将不会保存。',
      okText: '退出编辑',
      cancelText: '继续编辑',
      okButtonProps: { danger: true },
      onOk: close,
    });
  };

  const normalizeSteps = (items: ProcessStep[]) => {
    const middle = items.filter((step) => !['start', 'collect', 'complete'].includes(step.type));
    return [
      items.find((step) => step.type === 'start') ?? { ...STEP_DEFAULTS.start },
      items.find((step) => step.type === 'collect') ?? { ...STEP_DEFAULTS.collect },
      ...middle,
      items.find((step) => step.type === 'complete') ?? { ...STEP_DEFAULTS.complete },
    ];
  };

  const moveStep = (sourceId: string, targetId: string) => {
    const source = steps.find((step) => step.id === sourceId);
    if (!source || source.fixed || sourceId === targetId) return;
    const next = steps.filter((step) => step.id !== sourceId);
    const targetIndex = next.findIndex((step) => step.id === targetId);
    next.splice(Math.max(0, targetIndex), 0, source);
    setSteps(normalizeSteps(next));
    setDirty(true);
  };

  const addStep = (type: StepType) => {
    const nextStep = { ...STEP_DEFAULTS[type], id: `${STEP_DEFAULTS[type].id}-${Date.now()}` };
    const completeIndex = steps.findIndex((step) => step.type === 'complete');
    const next = [...steps];
    const insertAt = type === 'machine_review' ? 2 : completeIndex;
    next.splice(insertAt, 0, nextStep);
    setSteps(normalizeSteps(next));
    setSelectedStepId(nextStep.id);
    setDirty(true);
  };

  const removeStep = (id: string) => {
    const step = steps.find((item) => item.id === id);
    if (!step || step.fixed) return;
    const next = steps.filter((item) => item.id !== id);
    setSteps(next);
    setSelectedStepId(next.find((item) => item.type === 'collect')?.id ?? next[0].id);
    setStepErrors((current) => current.filter((item) => item !== id));
    setDirty(true);
  };

  const updateSelectedStep = (patch: Partial<ProcessStep>) => {
    setSteps((current) => current.map((step) => step.id === selectedStepId ? { ...step, ...patch } : step));
    setStepErrors((current) => current.filter((id) => id !== selectedStepId));
    setDirty(true);
  };

  const saveProcess = async () => {
    let values: { name: string; category: ProcessCategory; templateId: string };
    try {
      values = await form.validateFields();
    } catch {
      message.error('请先补全流程基础信息');
      return;
    }

    const invalidSteps = steps
      .filter((step) => step.enabled && !step.assignee.trim())
      .map((step) => step.id);
    if (invalidSteps.length) {
      setStepErrors(invalidSteps);
      setSelectedStepId(invalidSteps[0]);
      message.error('存在未配置执行角色的工序，已为你定位');
      return;
    }

    const duplicate = processes.some((item) => item.name === values.name.trim() && item.id !== editing?.id);
    if (duplicate) {
      form.setFields([{ name: 'name', errors: ['同项目内流程名称不能重复'] }]);
      message.error('流程名称已存在');
      return;
    }

    const template = TEMPLATE_OPTIONS.find((item) => item.value === values.templateId)!;
    const nextVersion = editing ? editing.version + (editing.usedBy > 0 ? 1 : 0) : 1;
    const nextItem: ProcessItem = {
      id: editing?.id ?? `PROC-${Date.now().toString().slice(-10)}`,
      name: values.name.trim(),
      category: values.category,
      templateId: values.templateId,
      templateName: template.label.replace(/ v\d+$/, ''),
      version: nextVersion,
      status: editing?.status ?? 'draft',
      usedBy: editing?.usedBy ?? 0,
      updatedAt: '2026-07-22 18:30',
      updatedBy: '运营管理员',
      steps: cloneSteps(steps),
    };
    setProcesses((current) => editing
      ? current.map((item) => item.id === editing.id ? nextItem : item)
      : [nextItem, ...current]);
    setDirty(false);
    setEditorOpen(false);
    message.success(editing?.usedBy ? `流程已保存为 v${nextVersion} 新版本` : '流程保存成功');
  };

  const duplicateProcess = (item: ProcessItem) => {
    setProcesses((current) => [{
      ...item,
      id: `PROC-${Date.now().toString().slice(-10)}`,
      name: `${item.name}（副本）`,
      version: 1,
      status: 'draft',
      usedBy: 0,
      updatedAt: '2026-07-22 18:30',
      steps: cloneSteps(item.steps),
    }, ...current]);
    message.success('已复制为新的草稿流程');
  };

  const handleProcessCreated = (payload: CreatedConfigPayload) => {
    const rawSteps = (payload.data.steps as Array<{ id: string; type: string; name: string; role: string; enabled: boolean; fixed: boolean }>) ?? [];
    const mappedSteps = rawSteps.map((step) => {
      const stepType = (step.type === 'secondary_review' ? 'annotate' : step.type) as StepType;
      return {
        ...STEP_DEFAULTS[stepType],
        id: step.id,
        name: step.name,
        assignee: step.role,
        enabled: step.enabled,
        fixed: step.fixed,
      };
    });
    const template = TEMPLATE_OPTIONS.find((item) => item.value === payload.data.templateId);
    setProcesses((current) => [{
      id: payload.id,
      name: payload.name,
      category: payload.category,
      templateId: String(payload.data.templateId),
      templateName: template?.label.replace(/ v\d+$/, '') ?? '未命名模板',
      version: 1,
      status: 'draft',
      usedBy: 0,
      updatedAt: '2026-07-22 18:30',
      updatedBy: '运营管理员',
      steps: mappedSteps,
    }, ...current]);
  };

  const columns = [
    {
      title: '流程', key: 'process', width: 250,
      render: (_: unknown, item: ProcessItem) => <div className="process-name-cell"><span className="process-name-icon"><NodeIndexOutlined /></span><div><button onClick={() => openEditor(item)}>{item.name}</button><div>{item.id} · v{item.version}</div></div></div>,
    },
    { title: '流程分类', dataIndex: 'category', width: 105, render: (value: ProcessCategory) => <Tag color={CATEGORY_META[value].color}>{CATEGORY_META[value].label}</Tag> },
    { title: '关联模板', key: 'template', width: 205, render: (_: unknown, item: ProcessItem) => <div><div className="process-template-name">{item.templateName}</div><div className="process-table-meta">{item.templateId}</div></div> },
    {
      title: '工序编排', key: 'steps', width: 315,
      render: (_: unknown, item: ProcessItem) => <div className="process-mini-flow">{item.steps.filter((step) => step.enabled).map((step, index, list) => <React.Fragment key={step.id}><Tooltip title={step.name}><span style={{ '--step-color': STEP_META[step.type].color } as React.CSSProperties}>{STEP_META[step.type].icon}</span></Tooltip>{index < list.length - 1 && <i>›</i>}</React.Fragment>)}</div>,
    },
    { title: '关联任务', dataIndex: 'usedBy', width: 90, render: (value: number) => `${value} 个` },
    { title: '状态', dataIndex: 'status', width: 90, render: (value: ProcessStatus) => <Tag color={STATUS_META[value].color}>{STATUS_META[value].label}</Tag> },
    { title: '最近更新', key: 'updatedAt', width: 160, render: (_: unknown, item: ProcessItem) => <div><div>{item.updatedAt}</div><div className="process-table-meta">{item.updatedBy}</div></div> },
    { title: '操作', key: 'action', width: 125, fixed: 'right' as const, render: (_: unknown, item: ProcessItem) => <Space size={2}><Button type="link" size="small" onClick={() => openEditor(item)}>编辑</Button><Button type="text" size="small" icon={<CopyOutlined />} onClick={() => duplicateProcess(item)} /></Space> },
  ];

  if (editorOpen) {
    return (
      <div className="process-editor">
        {modalContextHolder}
        <header className="process-editor-header">
          <div>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={closeEditor}>返回流程列表</Button>
            <div className="process-editor-heading">
              <h2>{editing ? '编辑流程' : '新建流程'}</h2>
              {editing && <Tag color={STATUS_META[editing.status].color}>{editing.usedBy > 0 ? `已使用 · 保存生成 v${editing.version + 1}` : STATUS_META[editing.status].label}</Tag>}
              {dirty && <Badge status="warning" text="有未保存修改" />}
            </div>
          </div>
          <Space>
            <Button onClick={closeEditor}>关闭</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={saveProcess} style={{ background: '#31b895' }}>保存流程</Button>
          </Space>
        </header>

        <Card className="process-basic-card" title="流程基础信息">
          <Form
            form={form}
            layout="vertical"
            onValuesChange={(changed) => {
              setDirty(true);
              if (changed.category) form.setFieldValue('templateId', undefined);
            }}
          >
            <Row gutter={14}>
              <Col xs={24} lg={10}><Form.Item label="流程名称" name="name" rules={[{ required: true, whitespace: true, message: '请输入流程名称' }, { max: 128, message: '最多 128 个字符' }]}><Input showCount maxLength={128} placeholder="用于流程列表及项目任务识别" /></Form.Item></Col>
              <Col xs={12} lg={6}><Form.Item label="流程分类" name="category" rules={[{ required: true }]}><Select options={Object.entries(CATEGORY_META).map(([value, meta]) => ({ value, label: meta.label }))} /></Form.Item></Col>
              <Col xs={12} lg={8}><Form.Item label="关联模板" name="templateId" rules={[{ required: true, message: '请选择同分类有效模板' }]}><Select placeholder="请选择有效模板" options={TEMPLATE_OPTIONS.filter((item) => item.category === currentCategory)} /></Form.Item></Col>
            </Row>
          </Form>
        </Card>

        <div className="process-workbench">
          <aside className="process-step-library">
            <div className="process-panel-title"><PlusOutlined /> 可添加工序</div>
            <p>仅展示当前流程尚未添加的可用工序。</p>
            <div className="process-library-list">
              {availableSteps.length ? availableSteps.map((type) => {
                const meta = STEP_META[type];
                return <button key={type} onClick={() => addStep(type)}><span style={{ color: meta.color }}>{meta.icon}</span><div><b>{meta.label}</b><small>点击添加到流程</small></div><PlusOutlined /></button>;
              }) : <div className="process-library-empty">全部可用工序均已添加</div>}
            </div>
            <div className="process-rule-note"><b>编排规则</b><span>采集固定在首位，智能审核必须位于采集之后；开始与完成不可删除或移动。</span></div>
          </aside>

          <section className="process-canvas">
            <div className="process-canvas-header"><div><div className="process-panel-title"><ApartmentOutlined /> 流程工序</div><p>拖拽带手柄的工序调整执行顺序</p></div><Tag color="cyan">{steps.filter((step) => step.enabled).length} 个启用工序</Tag></div>
            <div className="process-step-sequence">
              {steps.map((step, index) => {
                const meta = STEP_META[step.type];
                const hasError = stepErrors.includes(step.id);
                return (
                  <article
                    key={step.id}
                    className={`process-step-card${selectedStepId === step.id ? ' is-selected' : ''}${!step.enabled ? ' is-disabled' : ''}${hasError ? ' has-error' : ''}`}
                    draggable={!step.fixed}
                    onDragStart={(event) => event.dataTransfer.setData('text/plain', step.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => moveStep(event.dataTransfer.getData('text/plain'), step.id)}
                    onClick={() => setSelectedStepId(step.id)}
                  >
                    <span className="process-step-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="process-step-icon" style={{ color: meta.color, background: `${meta.color}15` }}>{meta.icon}</span>
                    <div className="process-step-copy"><b>{step.name}</b><span>{meta.label} · {step.assignee}{!step.enabled ? ' · 已停用' : ''}</span></div>
                    {hasError && <Tag color="error">待配置</Tag>}
                    {step.fixed ? <Tag>固定工序</Tag> : <DragOutlined className="process-drag-handle" />}
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="process-step-settings">
            <div className="process-panel-title"><SettingOutlined /> 工序配置</div>
            {selectedStep && <>
              <div className="process-settings-heading"><span className="process-step-icon" style={{ color: STEP_META[selectedStep.type].color, background: `${STEP_META[selectedStep.type].color}15` }}>{STEP_META[selectedStep.type].icon}</span><div><b>{STEP_META[selectedStep.type].label}</b><span>{selectedStep.fixed ? '系统固定工序' : '可配置工序'}</span></div></div>
              <div className="process-settings-form">
                <label><span>工序名称</span><Input value={selectedStep.name} maxLength={32} onChange={(event) => updateSelectedStep({ name: event.target.value })} /></label>
                <label><span>启用状态</span><div className="process-switch-row"><Switch checked={selectedStep.enabled} disabled={selectedStep.fixed} onChange={(enabled) => updateSelectedStep({ enabled })} /><small>{selectedStep.enabled ? '参与流程执行' : '暂不参与执行'}</small></div></label>
                <label className={stepErrors.includes(selectedStep.id) ? 'has-error' : ''}><span>执行角色</span><Select value={selectedStep.assignee || undefined} status={stepErrors.includes(selectedStep.id) ? 'error' : undefined} onChange={(assignee) => updateSelectedStep({ assignee })} options={['系统自动', '采集用户', '复检人员', '质检人员', '项目管理员'].map((value) => ({ value, label: value }))} /></label>
                {!['start', 'complete'].includes(selectedStep.type) && <Row gutter={10}><Col span={12}><label><span>处理时限</span><div className="process-number-field"><InputNumber min={1} max={168} value={selectedStep.timeout} onChange={(timeout) => updateSelectedStep({ timeout: timeout ?? 1 })} /><span>小时</span></div></label></Col><Col span={12}><label><span>重试次数</span><div className="process-number-field"><InputNumber min={0} max={5} value={selectedStep.retry} onChange={(retry) => updateSelectedStep({ retry: retry ?? 0 })} /><span>次</span></div></label></Col></Row>}
                {['machine_review', 'quality'].includes(selectedStep.type) && <label><span>通过阈值</span><div className="process-number-field"><InputNumber min={0} max={100} value={selectedStep.threshold} onChange={(threshold) => updateSelectedStep({ threshold: threshold ?? 0 })} /><span>分</span></div></label>}
              </div>
              {!selectedStep.fixed && <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeStep(selectedStep.id)}>从流程中移除</Button>}
            </>}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-config-page process-config-page">
      {modalContextHolder}
      <section className="admin-config-hero">
        <h2 className="admin-config-title">流程配置</h2>
        <div className="admin-config-actions"><Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)} style={{ background: '#30b894' }}>新建流程</Button></div>
      </section>
      <Row gutter={[12, 12]}>
        {[
          { label: '流程总数', value: processes.length, note: '覆盖全部业务分类' },
          { label: '使用中', value: processes.filter((item) => item.status === 'active').length, note: '已被正式项目引用' },
          { label: '草稿流程', value: processes.filter((item) => item.status === 'draft').length, note: '等待完善或发布' },
          { label: '关联任务', value: processes.reduce((sum, item) => sum + item.usedBy, 0), note: '当前引用任务合计' },
        ].map((stat) => <Col xs={12} lg={6} key={stat.label}><Card className="admin-stat-card"><div className="admin-stat-label">{stat.label}</div><div className="admin-stat-value">{stat.value}</div><div className="admin-stat-note">{stat.note}</div></Card></Col>)}
      </Row>
      <Card className="admin-config-panel" title="流程列表" extra={<Space><Input prefix={<SearchOutlined />} placeholder="流程名称 / 编号" value={search} onChange={(event) => setSearch(event.target.value)} allowClear style={{ width: 220 }} /><Select placeholder="全部状态" allowClear value={status} onChange={setStatus} style={{ width: 120 }} options={Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: meta.label }))} /></Space>}>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 8, size: 'small' }} scroll={{ x: 1350 }} />
      </Card>
      <ConfigCreateDrawer type="process" open={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleProcessCreated} />
    </div>
  );
}
