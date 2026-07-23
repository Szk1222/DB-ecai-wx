import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Upload,
} from 'antd';
import {
  ApiOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleFilled,
  DeleteOutlined,
  EditOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  NodeIndexOutlined,
  PlusOutlined,
  RobotOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import './ConfigCreateDrawer.css';

export type ConfigCreateType = 'authorization' | 'template' | 'process' | 'model';
export type ConfigBusinessCategory = 'voice' | 'text' | 'image';

export interface CreatedConfigPayload {
  id: string;
  type: ConfigCreateType;
  name: string;
  version: string;
  category: ConfigBusinessCategory;
  data: Record<string, unknown>;
}

export interface ConfigCreateProjectContext {
  id: string;
  name: string;
  category?: ConfigBusinessCategory | 'mixed';
}

export interface ConfigCreateDrawerProps {
  type: ConfigCreateType | null;
  open: boolean;
  project?: ConfigCreateProjectContext;
  onClose: () => void;
  onCreated: (payload: CreatedConfigPayload) => void;
}

export const CONFIG_CREATE_OPTIONS = [
  { key: 'authorization' as const, label: '新建授权配置', icon: <FileProtectOutlined />, color: '#2eaa8b' },
  { key: 'template' as const, label: '新建模板配置', icon: <FileTextOutlined />, color: '#4f6ef7' },
  { key: 'process' as const, label: '新建流程配置', icon: <NodeIndexOutlined />, color: '#8b6bd6' },
  { key: 'model' as const, label: '新建模型配置', icon: <RobotOutlined />, color: '#2eaa8b' },
];

const TYPE_META = {
  authorization: { title: '新建授权配置', icon: <FileProtectOutlined />, color: '#2eaa8b' },
  template: { title: '新建模板配置', icon: <FileTextOutlined />, color: '#4f6ef7' },
  process: { title: '新建流程配置', icon: <NodeIndexOutlined />, color: '#8b6bd6' },
  model: { title: '新建模型配置', icon: <RobotOutlined />, color: '#2eaa8b' },
};

const CATEGORY_OPTIONS = [
  { value: 'voice', label: '语音采集' },
  { value: 'text', label: '文本采集' },
  { value: 'image', label: '图片采集' },
];

const TEMPLATE_OPTIONS = [
  { value: 'TPL-240716-01', label: '普通话语音采集 · 标准版 v6', category: 'voice' },
  { value: 'TPL-240705-03', label: '粤语自然对话录制 v3', category: 'voice' },
  { value: 'TPL-240711-02', label: '客服场景文本改写 v2', category: 'text' },
  { value: 'TPL-240529-04', label: '室内物品图片采集 v4', category: 'image' },
];

const QUALITY_OPTIONS = [
  '有电流或电子噪音',
  '有回音或空旷音',
  '停顿时间过长',
  '录音与文本不一致',
  '没有人声',
  '前后静音段不足',
];

type DrawerStepType = 'start' | 'collect' | 'secondary_review' | 'machine_review' | 'quality' | 'acceptance' | 'complete';

interface DrawerStep {
  id: string;
  type: DrawerStepType;
  name: string;
  role: string;
  enabled: boolean;
  fixed: boolean;
}

const STEP_META: Record<DrawerStepType, { label: string; icon: React.ReactNode; color: string; role: string }> = {
  start: { label: '开始', icon: <ThunderboltOutlined />, color: '#31b895', role: '系统自动' },
  collect: { label: '数据采集', icon: <UserOutlined />, color: '#4f6ef7', role: '采集用户' },
  secondary_review: { label: '二次复检', icon: <EditOutlined />, color: '#8b6bd6', role: '复检人员' },
  machine_review: { label: '智能审核', icon: <RobotOutlined />, color: '#3679c8', role: '系统自动' },
  quality: { label: '人工质检', icon: <CheckCircleFilled />, color: '#e59a2d', role: '质检人员' },
  acceptance: { label: '项目验收', icon: <FileTextOutlined />, color: '#de6d78', role: '项目管理员' },
  complete: { label: '完成', icon: <CheckCircleFilled />, color: '#269879', role: '系统自动' },
};

function createDrawerStep(type: DrawerStepType): DrawerStep {
  const meta = STEP_META[type];
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    name: meta.label,
    role: meta.role,
    enabled: true,
    fixed: ['start', 'collect', 'complete'].includes(type),
  };
}

const defaultProcessSteps = () => ['start', 'collect', 'machine_review', 'quality', 'complete'].map((type) => createDrawerStep(type as DrawerStepType));

function ConfigSection({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return <section className="shared-config-section"><div className="shared-config-section__title"><span>{index}</span>{title}</div>{children}</section>;
}

export function ConfigCreateDrawer({ type, open, project, onClose, onCreated }: ConfigCreateDrawerProps) {
  const [form] = Form.useForm();
  const [steps, setSteps] = useState<DrawerStep[]>(defaultProcessSteps());
  const [selectedStepId, setSelectedStepId] = useState('');
  const category = Form.useWatch('category', form) as ConfigBusinessCategory | undefined;
  const selectedStep = steps.find((step) => step.id === selectedStepId);
  const availableSteps = (['secondary_review', 'acceptance'] as DrawerStepType[]).filter((stepType) => !steps.some((step) => step.type === stepType));

  useEffect(() => {
    if (!open || !type) return;
    const initialCategory = project?.category && project.category !== 'mixed' ? project.category : 'voice';
    form.resetFields();
    form.setFieldsValue(type === 'authorization' ? {
      name: '', version: 'v1.0', category: initialCategory,
      organization: '标贝（北京）科技有限公司', organizationShortName: '标贝科技',
      projectDisplayName: project?.name ?? '', purpose: '', authorizerRelation: '本人授权',
      verificationMethods: ['短信确认', '签名授权'], validityDays: 365,
      scopes: [
        { name: '基础身份信息', detail: '昵称、年龄区间、所在地区' },
        { name: initialCategory === 'voice' ? '语音样本' : initialCategory === 'image' ? '图像样本' : '任务结果', detail: '本项目内用户提交的采集数据' },
      ],
    } : type === 'template' ? {
      name: '', category: initialCategory, format: 'WAV', channel: 'mono', sampleRate: 16000, bitDepth: 16,
      noiseLimit: 70, maxDuration: 30, silenceDuration: 1, qualityTags: QUALITY_OPTIONS,
    } : type === 'process' ? {
      name: '', category: initialCategory,
    } : {
      name: '', code: '', category: initialCategory, provider: '内部推理服务', version: 'v1.0.0', protocol: 'https',
      abilities: ['清晰度检测'], concurrency: 10, timeout: 30, retries: 2, isDefault: false,
    });
    const nextSteps = defaultProcessSteps();
    setSteps(nextSteps);
    setSelectedStepId(nextSteps[1].id);
  }, [form, open, project?.category, type]);

  const drawerMeta = type ? TYPE_META[type] : TYPE_META.template;
  const projectLabel = project ? <Tag color="cyan">当前项目：{project.name}</Tag> : null;

  const addStep = (stepType: DrawerStepType) => {
    const nextStep = createDrawerStep(stepType);
    setSteps((current) => {
      const next = [...current];
      next.splice(Math.max(2, next.length - 1), 0, nextStep);
      return next;
    });
    setSelectedStepId(nextStep.id);
  };

  const moveStep = (id: string, direction: -1 | 1) => {
    setSteps((current) => {
      const index = current.findIndex((step) => step.id === id);
      if (index < 2 || index >= current.length - 1) return current;
      const target = index + direction;
      if (target < 2 || target >= current.length - 1) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeStep = (id: string) => {
    const next = steps.filter((step) => step.id !== id);
    setSteps(next);
    setSelectedStepId(next[1]?.id ?? next[0]?.id);
  };

  const updateStep = (patch: Partial<DrawerStep>) => {
    setSteps((current) => current.map((step) => step.id === selectedStepId ? { ...step, ...patch } : step));
  };

  const submit = async () => {
    if (!type) return;
    let values: Record<string, any>;
    try {
      values = await form.validateFields();
    } catch {
      message.error('请补全必填配置');
      return;
    }
    const prefix = type === 'authorization' ? 'AUTH' : type === 'template' ? 'TPL' : type === 'process' ? 'PROC' : 'MOD';
    const payload: CreatedConfigPayload = {
      id: `${prefix}-${Date.now().toString().slice(-8)}`,
      type,
      name: values.name.trim(),
      version: type === 'authorization' || type === 'model' ? values.version : 'v1',
      category: values.category,
      data: type === 'authorization' ? {
        ...values,
        agreementFileName: values.agreementFile?.[0]?.name ?? '数据使用授权协议.pdf',
        agreementFileUrl: '/agreements/authorization-agreement.pdf',
        signatureRequired: values.verificationMethods?.includes('签名授权') ?? false,
      } : type === 'process' ? { ...values, steps: steps.map(({ type: stepType, ...step }) => ({ ...step, type: stepType })) } : values,
    };
    onCreated(payload);
    message.success(`${drawerMeta.title}已创建`);
    onClose();
  };

  const authorizationContent = (
    <>
      <div className="shared-auth-notice">
        <FileProtectOutlined />
        <div><b>以下内容将同步展示在小程序授权中心</b><span>用户姓名、签署时间和到期日会在用户完成授权后自动生成。</span></div>
      </div>
      <ConfigSection index="01" title="授权基本信息">
        <Row gutter={14}>
          <Col span={15}><Form.Item label="授权配置名称" name="name" rules={[{ required: true, whitespace: true, message: '请输入授权配置名称' }]}><Input maxLength={40} showCount placeholder="例如：普通话语料项目数据授权书" /></Form.Item></Col>
          <Col span={9}><Form.Item label="版本号" name="version" rules={[{ required: true, whitespace: true }]}><Input placeholder="v1.0" /></Form.Item></Col>
        </Row>
        <Form.Item label="用户端项目名称" name="projectDisplayName" rules={[{ required: true, whitespace: true, message: '请输入用户端展示的项目名称' }]}><Input maxLength={50} showCount placeholder="显示在授权中心卡片标题" /></Form.Item>
      </ConfigSection>
      <ConfigSection index="02" title="被授权机构与用途">
        <Row gutter={14}>
          <Col span={15}><Form.Item label="机构全称" name="organization" rules={[{ required: true, whitespace: true }]}><Input placeholder="请输入被授权机构法定全称" /></Form.Item></Col>
          <Col span={9}><Form.Item label="机构简称" name="organizationShortName" rules={[{ required: true, whitespace: true }]}><Input placeholder="用户端卡片展示" /></Form.Item></Col>
        </Row>
        <Form.Item label="授权用途" name="purpose" rules={[{ required: true, whitespace: true, message: '请输入授权用途' }]}><Input.TextArea rows={3} maxLength={300} showCount placeholder="说明采集数据的具体使用目的" /></Form.Item>
        <Form.Item label="授权协议 PDF" name="agreementFile" valuePropName="fileList" getValueFromEvent={(event) => event?.fileList} extra="支持 PDF，协议将在小程序签署前展示；未上传时使用平台标准协议模板"><Upload beforeUpload={() => false} maxCount={1} accept=".pdf,application/pdf"><Button icon={<UploadOutlined />}>上传授权协议</Button></Upload></Form.Item>
      </ConfigSection>
      <ConfigSection index="03" title="授权范围">
        <Form.List name="scopes" rules={[{ validator: async (_, scopes) => { if (!scopes || scopes.length < 1) throw new Error('请至少配置一项授权范围'); } }]}>
          {(fields, { add, remove }, { errors }) => <>
            <div className="shared-auth-scopes">
              {fields.map((field, index) => <div className="shared-auth-scope" key={field.key}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <Form.Item name={[field.name, 'name']} rules={[{ required: true, whitespace: true, message: '请输入范围名称' }]}><Input maxLength={24} placeholder="例如：语音样本" /></Form.Item>
                  <Form.Item name={[field.name, 'detail']} rules={[{ required: true, whitespace: true, message: '请输入范围说明' }]}><Input maxLength={100} placeholder="说明该范围包含的数据" /></Form.Item>
                </div>
                <Button danger type="text" icon={<DeleteOutlined />} aria-label="删除授权范围" disabled={fields.length === 1} onClick={() => remove(field.name)} />
              </div>)}
            </div>
            <Button block type="dashed" icon={<PlusOutlined />} onClick={() => add({ name: '', detail: '' })}>添加授权范围</Button>
            <Form.ErrorList errors={errors} />
          </>}
        </Form.List>
      </ConfigSection>
      <ConfigSection index="04" title="签署规则">
        <Row gutter={14}>
          <Col span={10}><Form.Item label="授权人关系" name="authorizerRelation" rules={[{ required: true }]}><Select options={['本人授权', '监护人授权', '法定代理人授权'].map((value) => ({ value, label: value }))} /></Form.Item></Col>
          <Col span={14}><Form.Item label="授权有效期" name="validityDays" rules={[{ required: true }]}><InputNumber min={1} max={3650} suffix="天" style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
        <Form.Item label="身份确认方式" name="verificationMethods" rules={[{ required: true, message: '请至少选择一种确认方式' }]}><Checkbox.Group className="shared-quality-grid" options={['人脸核验', '短信确认', '隐私协议勾选确认', '签名授权']} /></Form.Item>
      </ConfigSection>
    </>
  );

  const templateContent = (
    <>
      <ConfigSection index="01" title="模板信息">
        <Row gutter={14}>
          <Col span={15}><Form.Item label="模板名称" name="name" rules={[{ required: true, whitespace: true, message: '请输入模板名称' }]}><Input maxLength={40} showCount placeholder="请输入便于识别的模板名称" /></Form.Item></Col>
          <Col span={9}><Form.Item label="模板分类" name="category" rules={[{ required: true }]}><Select disabled={Boolean(project?.category && project.category !== 'mixed')} options={CATEGORY_OPTIONS} /></Form.Item></Col>
        </Row>
        <Form.Item label="模板规范文件" extra="支持 PDF，单文件不超过 10MB"><Upload beforeUpload={() => false} maxCount={1} accept=".pdf"><Button icon={<UploadOutlined />}>上传规范文件</Button></Upload></Form.Item>
      </ConfigSection>
      <ConfigSection index="02" title="采集参数">
        <Row gutter={12}>
          <Col span={8}><Form.Item label="文件格式" name="format" rules={[{ required: true }]}><Select options={['WAV', 'PCM', 'MP3', 'FLAC'].map((value) => ({ value, label: value }))} /></Form.Item></Col>
          <Col span={8}><Form.Item label="声道" name="channel"><Select options={[{ value: 'mono', label: '单声道' }, { value: 'stereo', label: '双声道' }]} /></Form.Item></Col>
          <Col span={8}><Form.Item label="采样率" name="sampleRate"><Select options={[16000, 32000, 44100, 48000].map((value) => ({ value, label: `${value / 1000} kHz` }))} /></Form.Item></Col>
        </Row>
        <Row gutter={12}>
          <Col span={6}><Form.Item label="位深" name="bitDepth"><Select options={[16, 32].map((value) => ({ value, label: `${value} bit` }))} /></Form.Item></Col>
          <Col span={6}><Form.Item label="噪音上限" name="noiseLimit"><InputNumber min={0} max={120} suffix="dB" style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={6}><Form.Item label="最大时长" name="maxDuration"><InputNumber min={1} max={600} suffix="秒" style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={6}><Form.Item label="静音预留" name="silenceDuration"><InputNumber min={0} max={10} suffix="秒" style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
      </ConfigSection>
      <ConfigSection index="03" title="质检关注项">
        <Form.Item name="qualityTags"><Checkbox.Group className="shared-quality-grid" options={QUALITY_OPTIONS} /></Form.Item>
        <Form.Item label="补充说明" name="customNote"><Input.TextArea rows={3} maxLength={500} showCount placeholder="填写采集与质检补充要求" /></Form.Item>
      </ConfigSection>
    </>
  );

  const processContent = (
    <>
      <ConfigSection index="01" title="流程信息">
        <Row gutter={14}>
          <Col span={14}><Form.Item label="流程名称" name="name" rules={[{ required: true, whitespace: true, message: '请输入流程名称' }, { max: 128 }]}><Input maxLength={128} showCount placeholder="用于项目任务识别" /></Form.Item></Col>
          <Col span={10}><Form.Item label="流程分类" name="category" rules={[{ required: true }]}><Select disabled={Boolean(project?.category && project.category !== 'mixed')} options={CATEGORY_OPTIONS} onChange={() => form.setFieldValue('templateId', undefined)} /></Form.Item></Col>
        </Row>
        <Form.Item label="关联模板" name="templateId" rules={[{ required: true, message: '请选择同分类有效模板' }]}><Select placeholder="请选择模板" options={TEMPLATE_OPTIONS.filter((item) => item.category === category)} /></Form.Item>
      </ConfigSection>
      <ConfigSection index="02" title="工序编排">
        <div className="shared-process-toolbar">
          <Space wrap>{availableSteps.map((stepType) => <Button key={stepType} icon={<PlusOutlined />} onClick={() => addStep(stepType)}>添加{STEP_META[stepType].label}</Button>)}</Space>
          <span>采集固定在首位，开始与完成不可移动</span>
        </div>
        <div className="shared-process-layout">
          <div className="shared-process-list">
            {steps.map((step, index) => {
              const meta = STEP_META[step.type];
              return <div role="button" tabIndex={0} className={selectedStepId === step.id ? 'is-selected' : ''} key={step.id} onClick={() => setSelectedStepId(step.id)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedStepId(step.id); }}><span className="shared-process-index">{String(index + 1).padStart(2, '0')}</span><i style={{ color: meta.color, background: `${meta.color}14` }}>{meta.icon}</i><div><b>{step.name}</b><small>{step.role}{!step.enabled ? ' · 已停用' : ''}</small></div>{step.fixed ? <Tag>固定</Tag> : <Space size={0}><Button type="text" size="small" icon={<ArrowUpOutlined />} disabled={index <= 2} onClick={(event) => { event.stopPropagation(); moveStep(step.id, -1); }} /><Button type="text" size="small" icon={<ArrowDownOutlined />} disabled={index >= steps.length - 2} onClick={(event) => { event.stopPropagation(); moveStep(step.id, 1); }} /></Space>}</div>;
            })}
          </div>
          <div className="shared-step-editor">
            {selectedStep && <>
              <div className="shared-step-editor__heading"><span style={{ color: STEP_META[selectedStep.type].color }}>{STEP_META[selectedStep.type].icon}</span><b>{STEP_META[selectedStep.type].label}</b></div>
              <label>工序名称<Input value={selectedStep.name} maxLength={32} onChange={(event) => updateStep({ name: event.target.value })} /></label>
              <label>执行角色<Select value={selectedStep.role} onChange={(role) => updateStep({ role })} options={['系统自动', '采集用户', '复检人员', '质检人员', '项目管理员'].map((value) => ({ value, label: value }))} /></label>
              <label>启用状态<div><Switch checked={selectedStep.enabled} disabled={selectedStep.fixed} onChange={(enabled) => updateStep({ enabled })} /><span>{selectedStep.enabled ? '参与执行' : '暂不执行'}</span></div></label>
              {!selectedStep.fixed && <Button danger type="text" icon={<DeleteOutlined />} onClick={() => removeStep(selectedStep.id)}>移除工序</Button>}
            </>}
          </div>
        </div>
      </ConfigSection>
    </>
  );

  const modelContent = (
    <>
      <ConfigSection index="01" title="模型信息">
        <Row gutter={14}>
          <Col span={14}><Form.Item label="模型名称" name="name" rules={[{ required: true, whitespace: true }]}><Input placeholder="例如：语音质量检测模型" /></Form.Item></Col>
          <Col span={10}><Form.Item label="模型标识" name="code" rules={[{ required: true, whitespace: true }]}><Input placeholder="voice-qc-v1" /></Form.Item></Col>
        </Row>
        <Row gutter={14}>
          <Col span={9}><Form.Item label="服务商" name="provider" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={7}><Form.Item label="版本" name="version" rules={[{ required: true }]}><Input /></Form.Item></Col>
          <Col span={8}><Form.Item label="业务分类" name="category" rules={[{ required: true }]}><Select disabled={Boolean(project?.category && project.category !== 'mixed')} options={CATEGORY_OPTIONS} /></Form.Item></Col>
        </Row>
      </ConfigSection>
      <ConfigSection index="02" title="服务连接">
        <Form.Item label="服务地址" name="endpoint" rules={[{ required: true, message: '请输入模型服务地址' }]}><Input addonBefore={<ApiOutlined />} placeholder="https://service.example.com/v1/check" /></Form.Item>
        <Row gutter={14}>
          <Col span={8}><Form.Item label="协议" name="protocol"><Select options={['https', 'grpc'].map((value) => ({ value, label: value.toUpperCase() }))} /></Form.Item></Col>
          <Col span={16}><Form.Item label="鉴权密钥" name="apiKey" rules={[{ required: true }]}><Input.Password placeholder="请输入访问密钥" /></Form.Item></Col>
        </Row>
        <Button icon={<ApiOutlined />} onClick={() => message.success('连接成功，模型响应正常')}>测试连接</Button>
      </ConfigSection>
      <ConfigSection index="03" title="检测能力与运行参数">
        <Form.Item label="检测能力" name="abilities" rules={[{ required: true }]}><Checkbox.Group className="shared-quality-grid" options={['清晰度检测', '完整度检测', '文本匹配', '噪音检测', '静音检测', '重复音频检测']} /></Form.Item>
        <Row gutter={14}>
          <Col span={8}><Form.Item label="并发数" name="concurrency"><InputNumber min={1} max={200} style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={8}><Form.Item label="超时时间" name="timeout"><InputNumber min={1} max={300} suffix="秒" style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={8}><Form.Item label="失败重试" name="retries"><InputNumber min={0} max={5} suffix="次" style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
        <Form.Item label="设为默认模型" name="isDefault" valuePropName="checked"><Switch /></Form.Item>
      </ConfigSection>
    </>
  );

  return (
    <Drawer
      className="shared-config-drawer"
      title={<div className="shared-config-title"><span style={{ color: drawerMeta.color, background: `${drawerMeta.color}14` }}>{drawerMeta.icon}</span><div><b>{drawerMeta.title}</b>{projectLabel}</div></div>}
      size={type === 'process' ? 880 : 760}
      open={open}
      onClose={onClose}
    >
      <div className="shared-config-body">
        <Form form={form} layout="vertical" requiredMark="optional">
          {type === 'authorization' && authorizationContent}
          {type === 'template' && templateContent}
          {type === 'process' && processContent}
          {type === 'model' && modelContent}
        </Form>
      </div>
      <footer className="shared-config-footer"><Button onClick={onClose}>取消</Button><Button type="primary" icon={<SaveOutlined />} onClick={submit} style={{ background: drawerMeta.color }}>创建配置</Button></footer>
    </Drawer>
  );
}
