import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Dropdown,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  AuditOutlined,
  BankOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CloudDownloadOutlined,
  DatabaseOutlined,
  DownOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  NodeIndexOutlined,
  PlayCircleFilled,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  RobotOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import {
  AuthorizationConfigData,
  AuthorizationStatus,
  COLLECTION_DATA,
  CollectionDataItem,
  MachineStatus,
  PROJECT_AUTHORIZATIONS,
  PROJECT_CONFIGS,
  PROJECT_JOBS,
  PROJECT_TASKS,
  PROJECTS,
  Project,
  ProjectAuthorization,
  ProjectConfigItem,
  ProjectJob,
  ProjectJobStatus,
  ProjectStatus,
  ProjectTaskItem,
} from './projectData';
import { AudioDataDetails, AudioDataDrawer } from './AudioDataDrawer';
import { CONFIG_CREATE_OPTIONS, ConfigCreateDrawer, ConfigCreateType, CreatedConfigPayload } from './ConfigCreateDrawer';
import { useApp } from '../../../context/AppContext';
import { resolveAgreementUrl } from '../../../data/authorizationAgreement';
import { AgreementPdfPreview } from '../../common/AgreementPdfPreview';
import './AdminProjects.css';

const PROJECT_STATUS = {
  draft: { label: '草稿', color: 'default' },
  pending: { label: '待启动', color: 'warning' },
  active: { label: '进行中', color: 'success' },
  paused: { label: '已暂停', color: 'orange' },
  ended: { label: '已结束', color: 'default' },
};

const TYPE_META = {
  voice: { label: '语音', color: '#2EAD8B' },
  text: { label: '文本', color: '#4F6EF7' },
  image: { label: '图片', color: '#E79B2D' },
  mixed: { label: '多模态', color: '#8C68D6' },
};

const TASK_STATUS = {
  draft: { label: '草稿', color: 'default' },
  pending: { label: '待启动', color: 'warning' },
  active: { label: '进行中', color: 'success' },
  paused: { label: '已暂停', color: 'orange' },
  completed: { label: '已完成', color: 'blue' },
};

const JOB_STATUS: Record<ProjectJobStatus, { label: string; color: string }> = {
  unassigned: { label: '待领取', color: 'default' },
  in_progress: { label: '进行中', color: 'processing' },
  submitted: { label: '已提交', color: 'cyan' },
  machine_review: { label: '机检中', color: 'geekblue' },
  human_review: { label: '质检中', color: 'purple' },
  rework: { label: '返工', color: 'orange' },
  passed: { label: '已通过', color: 'success' },
};

const MACHINE_STATUS: Record<MachineStatus, { label: string; color: string }> = {
  pending: { label: '未检测', color: 'default' },
  checking: { label: '检测中', color: 'processing' },
  passed: { label: '机检通过', color: 'success' },
  failed: { label: '机检不通过', color: 'error' },
  error: { label: '检测异常', color: 'warning' },
};

const AUTH_STATUS: Record<AuthorizationStatus, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'warning' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已驳回', color: 'error' },
  revoked: { label: '已撤回', color: 'default' },
  expired: { label: '已过期', color: 'default' },
};

const CONFIG_TYPE = {
  authorization: { label: '授权配置', icon: <FileProtectOutlined />, color: '#2EAD8B', bg: '#EAF8F4' },
  template: { label: '模板配置', icon: <FileTextOutlined />, color: '#4F6EF7', bg: '#EEF1FF' },
  process: { label: '流程配置', icon: <NodeIndexOutlined />, color: '#8C68D6', bg: '#F4EFFE' },
  model: { label: '模型配置', icon: <RobotOutlined />, color: '#2EAD8B', bg: '#EAF8F4' },
};

const CONFIG_STATUS = {
  draft: { label: '草稿', color: 'default' },
  pending: { label: '待生效', color: 'warning' },
  active: { label: '生效中', color: 'success' },
  disabled: { label: '已停用', color: 'orange' },
  history: { label: '历史版本', color: 'default' },
};

function percent(completed: number, target: number) {
  return target > 0 ? Math.min(100, Math.round((completed / target) * 100)) : 0;
}

function AuthorizationConfigDetail({ config, projectName }: { config: ProjectConfigItem; projectName: string }) {
  const detail = config.authorization;
  if (!detail) return <div className="auth-detail-empty">该历史配置暂无结构化授权信息</div>;

  return <div className="auth-detail">
    <section className="auth-detail-preview">
      <div className="auth-detail-preview__top"><span><EyeOutlined /> 小程序授权中心展示预览</span><Tag color="success">{CONFIG_STATUS[config.status].label}</Tag></div>
      <div className="auth-detail-preview__card">
        <div className="auth-detail-preview__icon"><BankOutlined /></div>
        <div className="auth-detail-preview__main"><b>{detail.projectDisplayName}</b><span>授权给：{detail.organizationShortName}</span></div>
        <Tag color={CONFIG_STATUS[config.status].color}>{CONFIG_STATUS[config.status].label}</Tag>
      </div>
      <div className="auth-detail-preview__scopes">
        {detail.scopes.map((scope) => <span key={scope.name}>{scope.name}</span>)}
      </div>
      <div className="auth-detail-preview__footer"><span>授权人 · 用户签署后生成</span><b>查看详情</b></div>
    </section>

    <section className="auth-detail-section">
      <div className="auth-detail-section__title"><span>01</span>配置概览</div>
      <Descriptions size="small" column={2} items={[
        { key: 'name', label: '配置名称', children: config.name },
        { key: 'id', label: '配置编号', children: <span className="project-code">{config.id}</span> },
        { key: 'version', label: '版本', children: <Tag color="cyan">{config.version}</Tag> },
        { key: 'status', label: '状态', children: <Tag color={CONFIG_STATUS[config.status].color}>{CONFIG_STATUS[config.status].label}</Tag> },
        { key: 'project', label: '后台项目', children: projectName, span: 2 },
      ]} />
    </section>

    <section className="auth-detail-section">
      <div className="auth-detail-section__title"><span>02</span>用户端展示信息</div>
      <Descriptions size="small" column={1} items={[
        { key: 'projectDisplayName', label: '项目名称', children: detail.projectDisplayName },
        { key: 'organization', label: '被授权机构', children: `${detail.organization}（${detail.organizationShortName}）` },
        { key: 'purpose', label: '授权用途', children: detail.purpose },
        { key: 'agreement', label: '授权协议', children: <Space size={6}><FileTextOutlined />{detail.agreementFileName}{detail.signatureRequired && <Tag color="cyan">需签名</Tag>}</Space> },
      ]} />
    </section>

    <section className="auth-detail-section">
      <div className="auth-detail-section__title"><span>03</span>授权范围</div>
      <div className="auth-detail-scope-list">{detail.scopes.map((scope, index) => <div key={`${scope.name}-${index}`}><i>{String(index + 1).padStart(2, '0')}</i><span><b>{scope.name}</b><small>{scope.detail}</small></span></div>)}</div>
    </section>

    <section className="auth-detail-section">
      <div className="auth-detail-section__title"><span>04</span>签署与有效期</div>
      <div className="auth-detail-rules">
        <div><SafetyCertificateOutlined /><span><small>授权方式</small><b>{detail.verificationMethods.join(' + ')}</b></span></div>
        <div><CalendarOutlined /><span><small>有效期规则</small><b>签署之日起 {detail.validityDays} 天</b></span></div>
      </div>
      <p className="auth-detail-runtime-note">授权人按“{detail.authorizerRelation}”记录；授权时间与到期日在用户签署后自动写入授权记录。</p>
    </section>
  </div>;
}

export function AdminProjects() {
  const { signedAgreements } = useApp();
  const [projects, setProjects] = useState(PROJECTS);
  const [jobs, setJobs] = useState(PROJECT_JOBS);
  const [authorizations, setAuthorizations] = useState(PROJECT_AUTHORIZATIONS);
  const [projectConfigs, setProjectConfigs] = useState(PROJECT_CONFIGS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatus, setProjectStatus] = useState<string>();
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatus, setJobStatus] = useState<string>();
  const [taskFilter, setTaskFilter] = useState<string>();
  const [jobDrawer, setJobDrawer] = useState<ProjectJob | null>(null);
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [audioDrawerData, setAudioDrawerData] = useState<AudioDataDetails | null>(null);
  const [configCreateType, setConfigCreateType] = useState<ConfigCreateType | null>(null);
  const [configDetail, setConfigDetail] = useState<ProjectConfigItem | null>(null);
  const [authorizationPdfRecord, setAuthorizationPdfRecord] = useState<ProjectAuthorization | null>(null);
  const [projectForm] = Form.useForm();
  const [taskForm] = Form.useForm();

  const selectedTasks = useMemo(() => PROJECT_TASKS.filter((task) => task.projectId === selectedProject?.id), [selectedProject]);
  const selectedJobs = useMemo(() => jobs.filter((job) => job.projectId === selectedProject?.id), [jobs, selectedProject]);
  const selectedConfigs = useMemo(() => projectConfigs.filter((config) => config.projectId === selectedProject?.id), [projectConfigs, selectedProject]);
  const selectedData = useMemo(() => COLLECTION_DATA.filter((item) => item.projectId === selectedProject?.id), [selectedProject]);
  const selectedAuths = useMemo(() => {
    const signedRows: ProjectAuthorization[] = Object.values(signedAgreements).map((agreement) => ({
      id: agreement.id,
      projectId: agreement.projectId,
      user: agreement.user,
      userId: agreement.userId,
      version: agreement.version,
      scope: '基础身份信息、语音样本及必要设备信息',
      status: 'approved',
      appliedAt: agreement.signedAt,
      effectiveUntil: agreement.expiresAt,
      reviewer: '系统自动确认',
      authorizationMethod: agreement.authorizationMethod,
      agreementFileName: agreement.fileName,
      signedPdfUrl: agreement.pdfUrl,
    }));
    return [...signedRows, ...authorizations].filter((item) => item.projectId === selectedProject?.id);
  }, [authorizations, selectedProject, signedAgreements]);

  const taskMap = useMemo(() => Object.fromEntries(PROJECT_TASKS.map((task) => [task.id, task])), []);

  const handleProjectConfigCreated = (payload: CreatedConfigPayload) => {
    if (!selectedProject) return;
    const item: ProjectConfigItem = {
      id: `CFG-${payload.id}`,
      projectId: selectedProject.id,
      type: payload.type,
      name: payload.name,
      version: payload.version,
      status: 'draft',
      updatedBy: '运营管理员',
      updatedAt: '2026-07-22 18:30',
      usedBy: 0,
      authorization: payload.type === 'authorization' ? payload.data as unknown as AuthorizationConfigData : undefined,
    };
    setProjectConfigs((current) => [item, ...current]);
  };

  const openCollectionAudio = (item: CollectionDataItem) => {
    const machineScores: Partial<Record<MachineStatus, number>> = { passed: 94, failed: 62, error: 0 };
    const machineSummaries: Record<MachineStatus, string> = {
      pending: '音频已提交，等待进入自动检测队列。',
      checking: '正在检测音频完整度、清晰度与文本匹配度。',
      passed: '音频完整度、清晰度与文本匹配度均符合当前机检规则。',
      failed: '检测到语音质量或文本匹配问题，需要人工复核。',
      error: '自动检测过程出现异常，请稍后重试或转人工处理。',
    };
    const authorizationSummaries: Record<AuthorizationStatus, string> = {
      pending: '用户授权资料正在审核，暂不可进入正式数据集。',
      approved: '用户已完成语音采集及训练用途授权，可按项目范围使用。',
      rejected: '用户授权申请已驳回，当前音频不可用于项目交付。',
      revoked: '用户已撤回授权，当前音频需停止后续使用。',
      expired: '授权已超过有效期，需要重新获取用户授权。',
    };
    setAudioDrawerData({
      id: item.id,
      title: `${taskMap[item.taskId]?.name ?? '语音采集任务'} · ${item.id}`,
      transcript: item.transcript,
      duration: item.duration,
      format: 'WAV',
      sampleRate: '16 kHz',
      bitDepth: '16 bit',
      channels: '单声道',
      fileSize: `${Math.max(96, Math.round(item.duration * 31.25))} KB`,
      user: item.user,
      taskName: taskMap[item.taskId]?.name,
      jobId: item.jobId,
      submittedAt: item.submittedAt,
      machineStatus: item.machineStatus,
      machineScore: machineScores[item.machineStatus],
      machineSummary: machineSummaries[item.machineStatus],
      authorizationStatus: item.authorizationStatus,
      authorizationSummary: authorizationSummaries[item.authorizationStatus],
    });
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('jobs');
    setTaskFilter(undefined);
    setJobStatus(undefined);
    setJobSearch('');
  };

  const createProject = async () => {
    const values = await projectForm.validateFields();
    const item: Project = {
      id: `prj-${Date.now().toString().slice(-6)}`,
      code: `PRJ-2026-${String(projects.length + 90).padStart(3, '0')}`,
      name: values.name,
      type: values.type,
      status: 'draft',
      manager: values.manager,
      createdAt: '2026-07-22',
      startAt: values.startAt,
      endAt: values.endAt,
      taskCount: 0,
      jobCount: 0,
      dataCount: 0,
      authCoverage: 0,
      progress: 0,
      description: values.description || '暂无项目说明',
    };
    setProjects((current) => [item, ...current]);
    setNewProjectOpen(false);
    projectForm.resetFields();
    message.success('项目草稿已创建');
  };

  const createTask = async () => {
    await taskForm.validateFields();
    setNewTaskOpen(false);
    taskForm.resetFields();
    message.success('任务草稿已创建，已归属当前项目');
  };

  const createJob = () => {
    if (!selectedProject || selectedTasks.length === 0) return;
    const task = selectedTasks[0];
    const item: ProjectJob = {
      id: `JOB-${Date.now().toString().slice(-8)}`,
      projectId: selectedProject.id,
      taskId: task.id,
      name: `${task.name} · 新作业`,
      type: task.type,
      user: '待领取',
      target: 50,
      completed: 0,
      status: 'unassigned',
      machineStatus: 'pending',
      authorizationStatus: 'pending',
      reward: task.reward * 5,
      deadline: task.endAt,
      exported: false,
    };
    setJobs((current) => [item, ...current]);
    message.success('已基于任务配置生成 1 条待领取作业');
  };

  const reviewAuthorization = (id: string, status: 'approved' | 'rejected') => {
    setAuthorizations((current) => current.map((item) => item.id === id ? {
      ...item,
      status,
      reviewer: '运营管理员',
      effectiveUntil: status === 'approved' ? '2027-07-21' : '-',
    } : item));
    message.success(status === 'approved' ? '授权审核已通过' : '授权申请已驳回');
  };

  const enterTaskJobs = (taskId: string) => {
    setTaskFilter(taskId);
    setActiveTab('jobs');
  };

  const filteredProjects = projects.filter((project) => {
    const matchesText = !projectSearch || project.name.includes(projectSearch) || project.code.toLowerCase().includes(projectSearch.toLowerCase());
    return matchesText && (!projectStatus || project.status === projectStatus);
  });

  const projectColumns = [
    {
      title: '项目',
      key: 'project',
      width: 285,
      render: (_: unknown, project: Project) => (
        <div className="project-name-cell">
          <div className="project-symbol"><FolderOpenOutlined /></div>
          <div>
            <Button type="link" size="small" style={{ padding: 0, height: 'auto' }} onClick={() => openProject(project)}><span className="project-name">{project.name}</span></Button>
            <div className="project-code">{project.code}</div>
          </div>
        </div>
      ),
    },
    { title: '类型', dataIndex: 'type', width: 90, render: (value: keyof typeof TYPE_META) => <Tag color={TYPE_META[value].color}>{TYPE_META[value].label}</Tag> },
    { title: '负责人', dataIndex: 'manager', width: 90 },
    {
      title: '任务 / 作业 / 数据',
      key: 'hierarchy',
      width: 170,
      render: (_: unknown, project: Project) => <span style={{ color: '#53657A', fontSize: 12 }}><b>{project.taskCount}</b> / <b>{project.jobCount}</b> / <b>{project.dataCount}</b></span>,
    },
    {
      title: '项目进度',
      dataIndex: 'progress',
      width: 150,
      render: (value: number) => <div className="pm-mini-progress"><Progress percent={value} size="small" strokeColor="#31B895" railColor="#EDF1F3" /></div>,
    },
    { title: '授权覆盖率', dataIndex: 'authCoverage', width: 110, render: (value: number) => <span style={{ color: value >= 95 ? '#279D80' : '#D9931E', fontWeight: 680 }}>{value}%</span> },
    { title: '周期', key: 'period', width: 176, render: (_: unknown, project: Project) => <span style={{ color: '#738196', fontSize: 12 }}>{project.startAt} — {project.endAt}</span> },
    { title: '状态', dataIndex: 'status', width: 90, render: (value: ProjectStatus) => <Tag color={PROJECT_STATUS[value].color}>{PROJECT_STATUS[value].label}</Tag> },
    {
      title: '操作',
      key: 'action',
      width: 130,
      fixed: 'right' as const,
      render: (_: unknown, project: Project) => <Button type="link" size="small" onClick={() => openProject(project)}>详情</Button>,
    },
  ];

  const jobColumns = [
    {
      title: '作业',
      key: 'job',
      width: 220,
      render: (_: unknown, job: ProjectJob) => <div><div className="pm-dimension-name">{job.name}</div><div className="pm-dimension-meta">{job.id}</div></div>,
    },
    {
      title: '所属任务',
      dataIndex: 'taskId',
      width: 190,
      render: (taskId: string) => <div><div style={{ fontSize: 12, color: '#405368' }}>{taskMap[taskId]?.name || '-'}</div><div className="pm-dimension-meta">{taskId}</div></div>,
    },
    { title: '执行用户', dataIndex: 'user', width: 120, render: (value: string) => <span style={{ color: value === '待领取' ? '#9AA5B2' : '#42566C' }}>{value}</span> },
    {
      title: '完成进度',
      key: 'progress',
      width: 150,
      render: (_: unknown, job: ProjectJob) => <div className="pm-mini-progress"><Progress percent={percent(job.completed, job.target)} size="small" strokeColor="#31B895" railColor="#EDF1F3" /><div className="pm-dimension-meta">{job.completed} / {job.target} 条</div></div>,
    },
    { title: '作业状态', dataIndex: 'status', width: 100, render: (value: ProjectJobStatus) => <Tag color={JOB_STATUS[value].color}>{JOB_STATUS[value].label}</Tag> },
    { title: '机检状态', dataIndex: 'machineStatus', width: 110, render: (value: MachineStatus) => <Tag color={MACHINE_STATUS[value].color}>{MACHINE_STATUS[value].label}</Tag> },
    { title: '授权状态', dataIndex: 'authorizationStatus', width: 100, render: (value: AuthorizationStatus) => <Tag color={AUTH_STATUS[value].color}>{AUTH_STATUS[value].label}</Tag> },
    { title: '是否导出', dataIndex: 'exported', width: 90, render: (value: boolean) => <span style={{ color: value ? '#2EAD8B' : '#8E99A7' }}>{value ? '已导出' : '未导出'}</span> },
    {
      title: '操作',
      key: 'action',
      width: 130,
      fixed: 'right' as const,
      render: (_: unknown, job: ProjectJob) => <Space size={2}><Button type="link" size="small" onClick={() => setJobDrawer(job)}>查看</Button><Button type="link" size="small" disabled={job.status === 'passed'}>重新分配</Button></Space>,
    },
  ];

  const taskColumns = [
    {
      title: '任务',
      key: 'task',
      width: 230,
      render: (_: unknown, task: ProjectTaskItem) => <div><div className="pm-dimension-name">{task.name}</div><div className="pm-dimension-meta">{task.id}</div></div>,
    },
    { title: '类型', dataIndex: 'type', width: 80, render: (value: 'voice' | 'text' | 'image') => <Tag color={TYPE_META[value].color}>{TYPE_META[value].label}</Tag> },
    { title: '关联模板', key: 'template', width: 185, render: (_: unknown, task: ProjectTaskItem) => <span style={{ fontSize: 12 }}>{task.template} <Tag>{task.templateVersion}</Tag></span> },
    { title: '关联流程', key: 'process', width: 170, render: (_: unknown, task: ProjectTaskItem) => <span style={{ fontSize: 12 }}>{task.process} <Tag>{task.processVersion}</Tag></span> },
    { title: '授权版本', dataIndex: 'authVersion', width: 105, render: (value: string) => <Tag color="cyan">{value}</Tag> },
    {
      title: '作业数量',
      key: 'jobs',
      width: 130,
      render: (_: unknown, task: ProjectTaskItem) => <Button type="link" size="small" style={{ padding: 0 }} onClick={() => enterTaskJobs(task.id)}>{task.jobsTotal} 个 <span style={{ color: '#9AA5B2' }}>({task.jobsCompleted} 完成)</span></Button>,
    },
    { title: '目标进度', key: 'progress', width: 150, render: (_: unknown, task: ProjectTaskItem) => <div className="pm-mini-progress"><Progress percent={percent(task.completed, task.target)} size="small" strokeColor="#4F6EF7" railColor="#EDF1F3" /><div className="pm-dimension-meta">{task.completed} / {task.target}</div></div> },
    { title: '负责人', dataIndex: 'manager', width: 90 },
    { title: '状态', dataIndex: 'status', width: 90, render: (value: keyof typeof TASK_STATUS) => <Tag color={TASK_STATUS[value].color}>{TASK_STATUS[value].label}</Tag> },
    { title: '操作', key: 'action', width: 110, fixed: 'right' as const, render: () => <Space size={2}><Button type="link" size="small">详情</Button><Button type="text" size="small" icon={<EditOutlined />} /></Space> },
  ];

  const renderProjectList = () => (
    <>
      <section className="pm-hero">
        <h2 className="pm-title">项目管理</h2>
        <div className="pm-hero-actions"><Button type="primary" icon={<PlusOutlined />} style={{ background: '#31B895' }} onClick={() => setNewProjectOpen(true)}>新建项目</Button></div>
      </section>

      <Row gutter={[12, 12]}>
        {[
          { label: '项目总数', value: projects.length, note: '含草稿与历史项目' },
          { label: '进行中项目', value: projects.filter((project) => project.status === 'active').length, note: '当前执行中的项目' },
          { label: '任务总数', value: projects.reduce((sum, project) => sum + project.taskCount, 0), note: '项目下第二级业务单元' },
          { label: '作业总数', value: projects.reduce((sum, project) => sum + project.jobCount, 0), note: '用户实际执行单元' },
        ].map((stat) => <Col xs={12} lg={6} key={stat.label}><Card className="pm-stat-card"><div className="pm-stat-label">{stat.label}</div><div className="pm-stat-value">{stat.value}</div><div className="pm-stat-note">{stat.note}</div></Card></Col>)}
      </Row>

      <Card
        className="pm-panel"
        title="项目列表"
        extra={<Space wrap><Input allowClear prefix={<SearchOutlined style={{ color: '#A2ACB8' }} />} placeholder="搜索项目名称 / 编号" value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} style={{ width: 220 }} /><Select allowClear placeholder="全部状态" value={projectStatus} onChange={setProjectStatus} style={{ width: 118 }} options={Object.entries(PROJECT_STATUS).map(([value, meta]) => ({ value, label: meta.label }))} /></Space>}
      >
        <Table dataSource={filteredProjects} columns={projectColumns} rowKey="id" size="small" pagination={{ pageSize: 8, size: 'small' }} scroll={{ x: 1280 }} />
      </Card>
    </>
  );

  const renderJobs = () => {
    const visibleJobs = selectedJobs.filter((job) => {
      const matchesText = !jobSearch || job.id.toLowerCase().includes(jobSearch.toLowerCase()) || job.name.includes(jobSearch) || job.user.includes(jobSearch);
      return matchesText && (!jobStatus || job.status === jobStatus) && (!taskFilter || job.taskId === taskFilter);
    });
    const stats = [
      { label: '总作业', value: selectedJobs.length, color: '#4F6EF7' },
      { label: '已分配', value: selectedJobs.filter((job) => job.user !== '待领取').length, color: '#31B895' },
      { label: '未分配', value: selectedJobs.filter((job) => job.status === 'unassigned').length, color: '#E6A129' },
      { label: '已完成', value: selectedJobs.filter((job) => job.status === 'passed').length, color: '#2EAD8B' },
      { label: '已导出', value: selectedJobs.filter((job) => job.exported).length, color: '#8C68D6' },
      { label: '未导出', value: selectedJobs.filter((job) => !job.exported).length, color: '#7A8798' },
    ];
    return <div className="pm-tab-content">
      <Row gutter={[10, 10]}>{stats.map((stat) => <Col xs={12} sm={8} xl={4} key={stat.label}><Card className="pm-stat-card"><div className="pm-stat-label">{stat.label}</div><div className="pm-stat-value" style={{ color: stat.color }}>{stat.value}</div></Card></Col>)}</Row>
      <Card className="pm-panel" title="项目作业">
        <div className="pm-toolbar" style={{ marginBottom: 12 }}>
          <Space wrap><Button type="primary" style={{ background: '#4F6EF7' }}>作业分配</Button><Button icon={<PlusOutlined />} onClick={createJob}>批量生成作业</Button><Button icon={<CloudDownloadOutlined />}>新建导出</Button></Space>
          {taskFilter && <Tag closable color="blue" onClose={() => setTaskFilter(undefined)}>已从任务穿透：{taskMap[taskFilter]?.name}</Tag>}
        </div>
        <div className="pm-filter-strip">
          <Input allowClear prefix={<SearchOutlined />} placeholder="作业编号 / 名称 / 执行用户" value={jobSearch} onChange={(event) => setJobSearch(event.target.value)} style={{ width: 250 }} />
          <Select allowClear placeholder="所属任务" value={taskFilter} onChange={setTaskFilter} style={{ width: 190 }} options={selectedTasks.map((task) => ({ value: task.id, label: task.name }))} />
          <Select allowClear placeholder="作业状态" value={jobStatus} onChange={setJobStatus} style={{ width: 130 }} options={Object.entries(JOB_STATUS).map(([value, meta]) => ({ value, label: meta.label }))} />
          <Button icon={<ReloadOutlined />} onClick={() => { setJobSearch(''); setJobStatus(undefined); setTaskFilter(undefined); }}>重置</Button>
        </div>
        <Table dataSource={visibleJobs} columns={jobColumns} rowKey="id" size="small" pagination={{ pageSize: 8, size: 'small' }} scroll={{ x: 1280 }} style={{ marginTop: 12 }} />
      </Card>
    </div>;
  };

  const renderTasks = () => <div className="pm-tab-content">
    <Card className="pm-panel" title="项目任务" extra={<Button type="primary" icon={<PlusOutlined />} style={{ background: '#31B895' }} onClick={() => setNewTaskOpen(true)}>新建任务</Button>}>
      <div style={{ marginBottom: 12, padding: '11px 13px', borderRadius: 10, background: '#F2F7FF', color: '#58708E', fontSize: 12 }}>
        当前项目包含 {selectedTasks.length} 个任务；每个任务可配置独立模板、流程、授权版本和目标量，并直接生成多条执行作业。
      </div>
      <Table dataSource={selectedTasks} columns={taskColumns} rowKey="id" size="small" pagination={false} scroll={{ x: 1320 }} />
    </Card>
  </div>;

  const renderConfigs = () => {
    const columns = [
      { title: '配置', key: 'config', render: (_: unknown, item: (typeof selectedConfigs)[number]) => { const meta = CONFIG_TYPE[item.type]; return <div className="config-name-cell"><span className="pm-config-type" style={{ color: meta.color, background: meta.bg }}>{meta.icon}</span><div><div className="pm-dimension-name">{item.name}</div><div className="pm-dimension-meta">{item.id}</div></div></div>; } },
      { title: '类型', dataIndex: 'type', width: 105, render: (value: keyof typeof CONFIG_TYPE) => <Tag>{CONFIG_TYPE[value].label}</Tag> },
      { title: '版本', dataIndex: 'version', width: 85, render: (value: string) => <b>{value}</b> },
      { title: '被任务引用', dataIndex: 'usedBy', width: 105, render: (value: number) => `${value} 个任务` },
      { title: '状态', dataIndex: 'status', width: 100, render: (value: keyof typeof CONFIG_STATUS) => <Tag color={CONFIG_STATUS[value].color}>{CONFIG_STATUS[value].label}</Tag> },
      { title: '最近更新', key: 'updatedAt', width: 180, render: (_: unknown, item: (typeof selectedConfigs)[number]) => <div><div style={{ fontSize: 12 }}>{item.updatedAt}</div><div className="pm-dimension-meta">{item.updatedBy}</div></div> },
      { title: '操作', key: 'action', width: 150, render: (_: unknown, item: ProjectConfigItem) => <Space size={2}><Button type="link" size="small" onClick={() => item.type === 'authorization' ? setConfigDetail(item) : message.info('该类型详情正在沿用原配置页面')}>查看</Button><Button type="link" size="small" onClick={() => setConfigCreateType(item.type)}>新建版本</Button></Space> },
    ];
    const createMenu = {
      items: CONFIG_CREATE_OPTIONS.map((option) => ({ key: option.key, icon: option.icon, label: option.label })),
      onClick: ({ key }: { key: string }) => setConfigCreateType(key as ConfigCreateType),
    };
    return <div className="pm-tab-content"><Card className="pm-panel" title="项目配置" extra={<Dropdown menu={createMenu} trigger={['click']}><Button type="primary" icon={<PlusOutlined />} style={{ background: '#31B895' }}>新增配置 <DownOutlined /></Button></Dropdown>}><Table dataSource={selectedConfigs} columns={columns} rowKey="id" size="small" pagination={false} /></Card></div>;
  };

  const renderCollectionData = () => {
    const columns = [
      { title: '数据编号', dataIndex: 'id', width: 150, render: (value: string) => <span className="project-code">{value}</span> },
      { title: '所属任务 / 作业', key: 'relation', width: 220, render: (_: unknown, item: (typeof selectedData)[number]) => <div><div className="pm-dimension-name">{taskMap[item.taskId]?.name}</div><div className="pm-dimension-meta">{item.jobId}</div></div> },
      { title: '采集用户', dataIndex: 'user', width: 100 },
      { title: '音频', key: 'audio', width: 100, render: (_: unknown, item: (typeof selectedData)[number]) => <Button className="pm-audio-button" size="small" shape="round" icon={<PlayCircleFilled />} aria-label={`播放并查看 ${item.id}`} onClick={() => openCollectionAudio(item)}>{item.duration}s</Button> },
      { title: '机检状态', dataIndex: 'machineStatus', width: 110, render: (value: MachineStatus) => <Tag color={MACHINE_STATUS[value].color}>{MACHINE_STATUS[value].label}</Tag> },
      { title: '授权状态', dataIndex: 'authorizationStatus', width: 100, render: (value: AuthorizationStatus) => <Tag color={AUTH_STATUS[value].color}>{AUTH_STATUS[value].label}</Tag> },
      { title: '提交时间', dataIndex: 'submittedAt', width: 160 },
      { title: '操作', key: 'action', width: 90, fixed: 'right' as const, render: (_: unknown, item: (typeof selectedData)[number]) => <Button type="link" size="small" onClick={() => openCollectionAudio(item)}>查看详情</Button> },
    ];
    return <div className="pm-tab-content"><Card className="pm-panel" title="采集数据" extra={<Button icon={<CloudDownloadOutlined />}>导出数据</Button>}><div className="pm-filter-strip"><Input prefix={<SearchOutlined />} placeholder="数据编号 / 作业编号 / 用户" style={{ width: 250 }} /><Select placeholder="机检状态" allowClear style={{ width: 130 }} options={Object.entries(MACHINE_STATUS).map(([value, meta]) => ({ value, label: meta.label }))} /><Select placeholder="授权状态" allowClear style={{ width: 130 }} options={Object.entries(AUTH_STATUS).map(([value, meta]) => ({ value, label: meta.label }))} /><Button type="primary" style={{ background: '#4F6EF7' }}>查询</Button></div><Table dataSource={selectedData} columns={columns} rowKey="id" size="small" pagination={{ pageSize: 8, size: 'small', total: selectedProject?.dataCount || selectedData.length, showTotal: (total) => `共 ${total} 条` }} scroll={{ x: 1030 }} style={{ marginTop: 12 }} /></Card></div>;
  };

  const renderAuthorizations = () => {
    const renderAgreementAction = (item: ProjectAuthorization) => {
      const hasAgreement = Boolean(item.signedPdfUrl);
      const button = (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          disabled={!hasAgreement}
          onClick={() => hasAgreement && setAuthorizationPdfRecord(item)}
        >
          查看授权协议
        </Button>
      );

      return hasAgreement ? button : (
        <Tooltip title="暂无已签署的授权协议文件">
          <span>{button}</span>
        </Tooltip>
      );
    };

    const columns = [
      { title: '授权记录', dataIndex: 'id', width: 145, render: (value: string) => <span className="project-code">{value}</span> },
      { title: '授权用户', key: 'user', width: 135, render: (_: unknown, item: ProjectAuthorization) => <div><div className="pm-dimension-name">{item.user}</div><div className="pm-dimension-meta">{item.userId}</div></div> },
      { title: '授权内容摘要', dataIndex: 'scope', ellipsis: true },
      { title: '版本', dataIndex: 'version', width: 85, render: (value: string) => <Tag color="cyan">{value}</Tag> },
      { title: '申请时间', dataIndex: 'appliedAt', width: 155 },
      { title: '有效期至', dataIndex: 'effectiveUntil', width: 110 },
      { title: '状态', dataIndex: 'status', width: 95, render: (value: AuthorizationStatus) => <Tag color={AUTH_STATUS[value].color}>{AUTH_STATUS[value].label}</Tag> },
      { title: '审核人', dataIndex: 'reviewer', width: 100, render: (value?: string) => value || '-' },
      {
        title: '操作',
        key: 'action',
        width: 270,
        fixed: 'right' as const,
        render: (_: unknown, item: ProjectAuthorization) => item.status === 'pending' ? (
          <Space size={2}>
            {renderAgreementAction(item)}
            <Button type="link" size="small" onClick={() => reviewAuthorization(item.id, 'approved')}>通过</Button>
            <Button danger type="link" size="small" onClick={() => reviewAuthorization(item.id, 'rejected')}>驳回</Button>
          </Space>
        ) : renderAgreementAction(item),
      },
    ];
    return <div className="pm-tab-content"><Card className="pm-panel" title="项目授权信息" extra={<Badge count={selectedAuths.filter((item) => item.status === 'pending').length}><Button icon={<AuditOutlined />}>待审核授权</Button></Badge>}><Table dataSource={selectedAuths} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 1200 }} /></Card></div>;
  };

  const renderStatistics = () => {
    const jobCount = selectedJobs.length;
    const completedJobs = selectedJobs.filter((job) => job.status === 'passed').length;
    const abnormalJobs = selectedJobs.filter((job) => job.status === 'rework' || job.machineStatus === 'failed').length;
    const columns = [
      { title: '任务', key: 'task', render: (_: unknown, task: ProjectTaskItem) => <div><div className="pm-dimension-name">{task.name}</div><div className="pm-dimension-meta">{task.id}</div></div> },
      { title: '作业数', dataIndex: 'jobsTotal', width: 85 },
      { title: '完成作业', dataIndex: 'jobsCompleted', width: 90 },
      { title: '目标数据量', dataIndex: 'target', width: 100 },
      { title: '已采集量', dataIndex: 'completed', width: 90 },
      { title: '完成率', key: 'completion', width: 150, render: (_: unknown, task: ProjectTaskItem) => <Progress percent={percent(task.completed, task.target)} size="small" strokeColor="#31B895" railColor="#EDF1F3" /> },
      { title: '机检通过率', key: 'machine', width: 115, render: (_: unknown, task: ProjectTaskItem) => `${Math.max(82, 98 - task.jobsReview * 4)}%` },
      { title: '质检通过率', key: 'qc', width: 115, render: (_: unknown, task: ProjectTaskItem) => `${Math.max(79, 96 - task.jobsRunning * 3)}%` },
      { title: '授权覆盖率', key: 'auth', width: 115, render: () => `${selectedProject?.authCoverage || 0}%` },
      { title: '穿透', key: 'action', width: 80, render: (_: unknown, task: ProjectTaskItem) => <Button type="link" size="small" onClick={() => enterTaskJobs(task.id)}>看作业</Button> },
    ];
    return <div className="pm-tab-content">
      <Row gutter={[12, 12]}>{[
        { label: '作业总数', value: jobCount, note: '当前项目全部作业' },
        { label: '已完成作业', value: completedJobs, note: `完成率 ${jobCount ? Math.round(completedJobs / jobCount * 100) : 0}%` },
        { label: '异常作业', value: abnormalJobs, note: '返工或机检不通过' },
        { label: '授权覆盖率', value: `${selectedProject?.authCoverage || 0}%`, note: '参与用户有效授权' },
      ].map((stat) => <Col xs={12} lg={6} key={stat.label}><Card className="pm-stat-card"><div className="pm-stat-label">{stat.label}</div><div className="pm-stat-value">{stat.value}</div><div className="pm-stat-note">{stat.note}</div></Card></Col>)}</Row>
      <Card className="pm-panel" title="任务分组作业统计" extra={<Button icon={<CloudDownloadOutlined />}>导出统计</Button>}><Table dataSource={selectedTasks} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 1050 }} /></Card>
    </div>;
  };

  const renderProjectDetail = () => {
    if (!selectedProject) return null;
    const tabs = [
      { key: 'jobs', label: <span><UnorderedListOutlined /> 项目作业 <Badge count={selectedJobs.length} showZero /></span>, children: renderJobs() },
      { key: 'configs', label: <span><SettingOutlined /> 项目配置 <Badge count={selectedConfigs.length} showZero /></span>, children: renderConfigs() },
      { key: 'data', label: <span><DatabaseOutlined /> 采集数据 <Badge count={selectedProject.dataCount} showZero /></span>, children: renderCollectionData() },
      { key: 'authorizations', label: <span><FileProtectOutlined /> 授权信息 <Badge count={selectedAuths.length} showZero /></span>, children: renderAuthorizations() },
      { key: 'tasks', label: <span><ApartmentOutlined /> 项目任务 <Badge count={selectedTasks.length} showZero /></span>, children: renderTasks() },
      { key: 'statistics', label: <span><BarChartOutlined /> 作业统计</span>, children: renderStatistics() },
    ];
    return <>
      <section className="pm-detail-header">
        <button className="pm-back" onClick={() => setSelectedProject(null)} style={{ border: 0, background: 'none', padding: 0 }}><ArrowLeftOutlined /> 返回项目列表</button>
        <div className="pm-project-heading"><h2>{selectedProject.name}</h2><Tag color={PROJECT_STATUS[selectedProject.status].color}>{PROJECT_STATUS[selectedProject.status].label}</Tag><Tag color={TYPE_META[selectedProject.type].color}>{TYPE_META[selectedProject.type].label}</Tag></div>
        <div className="pm-project-meta"><span>项目编号：{selectedProject.code}</span><span>负责人：{selectedProject.manager}</span><span>项目周期：{selectedProject.startAt} — {selectedProject.endAt}</span><span>整体进度：{selectedProject.progress}%</span></div>
        <div className="pm-hierarchy">
          <div className="pm-hierarchy-node"><span className="pm-hierarchy-icon"><FolderOpenOutlined /></span><div><div className="pm-hierarchy-value">1</div><div className="pm-hierarchy-label">当前项目 · 上级容器</div></div></div>
          <div className="pm-hierarchy-node"><span className="pm-hierarchy-icon"><ApartmentOutlined /></span><div><div className="pm-hierarchy-value">{selectedTasks.length}</div><div className="pm-hierarchy-label">项目任务 · 业务配置与目标</div></div></div>
          <div className="pm-hierarchy-node"><span className="pm-hierarchy-icon"><UnorderedListOutlined /></span><div><div className="pm-hierarchy-value">{selectedJobs.length}</div><div className="pm-hierarchy-label">执行作业 · 用户最小执行单元</div></div></div>
        </div>
      </section>
      <Tabs className="pm-tabs" activeKey={activeTab} onChange={setActiveTab} items={tabs} />
    </>;
  };

  return <div className="project-management">
    {selectedProject ? renderProjectDetail() : renderProjectList()}

    <Modal title="新建项目" open={newProjectOpen} onCancel={() => setNewProjectOpen(false)} onOk={createProject} okText="创建草稿" cancelText="取消" okButtonProps={{ style: { background: '#31B895' } }} width={680}>
      <Form form={projectForm} layout="vertical" style={{ marginTop: 14 }}>
        <Row gutter={14}><Col span={16}><Form.Item label="项目名称" name="name" rules={[{ required: true }]}><Input placeholder="请输入项目名称" /></Form.Item></Col><Col span={8}><Form.Item label="项目类型" name="type" rules={[{ required: true }]}><Select options={Object.entries(TYPE_META).map(([value, meta]) => ({ value, label: meta.label }))} /></Form.Item></Col></Row>
        <Row gutter={14}><Col span={8}><Form.Item label="负责人" name="manager" rules={[{ required: true }]}><Input placeholder="项目负责人" /></Form.Item></Col><Col span={8}><Form.Item label="开始日期" name="startAt" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col><Col span={8}><Form.Item label="结束日期" name="endAt" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col></Row>
        <Form.Item label="项目说明" name="description"><Input.TextArea rows={3} placeholder="说明项目目标、数据范围和交付要求" /></Form.Item>
      </Form>
    </Modal>

    <Modal title={`新建任务 · ${selectedProject?.name || ''}`} open={newTaskOpen} onCancel={() => setNewTaskOpen(false)} onOk={createTask} okText="创建任务" cancelText="取消" okButtonProps={{ style: { background: '#31B895' } }} width={720}>
      <Form form={taskForm} layout="vertical" style={{ marginTop: 14 }}>
        <Row gutter={14}><Col span={16}><Form.Item label="任务名称" name="name" rules={[{ required: true }]}><Input placeholder="请输入任务名称" /></Form.Item></Col><Col span={8}><Form.Item label="采集类型" name="type" rules={[{ required: true }]}><Select options={['voice', 'text', 'image'].map((value) => ({ value, label: TYPE_META[value as 'voice' | 'text' | 'image'].label }))} /></Form.Item></Col></Row>
        <Row gutter={14}><Col span={8}><Form.Item label="授权版本" name="auth" rules={[{ required: true }]}><Select options={selectedConfigs.filter((item) => item.type === 'authorization').map((item) => ({ value: item.id, label: `${item.name} ${item.version}` }))} /></Form.Item></Col><Col span={8}><Form.Item label="采集模板" name="template" rules={[{ required: true }]}><Select options={selectedConfigs.filter((item) => item.type === 'template').map((item) => ({ value: item.id, label: `${item.name} ${item.version}` }))} /></Form.Item></Col><Col span={8}><Form.Item label="执行流程" name="process" rules={[{ required: true }]}><Select options={selectedConfigs.filter((item) => item.type === 'process').map((item) => ({ value: item.id, label: `${item.name} ${item.version}` }))} /></Form.Item></Col></Row>
        <Row gutter={14}><Col span={8}><Form.Item label="目标数据量" name="target" rules={[{ required: true }]}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col><Col span={8}><Form.Item label="单作业奖励" name="reward" rules={[{ required: true }]}><InputNumber min={1} suffix="积分" style={{ width: '100%' }} /></Form.Item></Col><Col span={8}><Form.Item label="任务负责人" name="manager" rules={[{ required: true }]}><Input /></Form.Item></Col></Row>
      </Form>
    </Modal>

    <Drawer title="作业详情" size={560} open={Boolean(jobDrawer)} onClose={() => setJobDrawer(null)}>
      {jobDrawer && <div>
        <div className="pm-drawer-section"><div className="pm-drawer-title">层级归属</div><Descriptions size="small" column={1} items={[
          { key: 'project', label: '所属项目', children: selectedProject?.name },
          { key: 'task', label: '所属任务', children: `${taskMap[jobDrawer.taskId]?.name}（${jobDrawer.taskId}）` },
          { key: 'job', label: '作业编号', children: jobDrawer.id },
        ]} /></div>
        <div className="pm-drawer-section"><div className="pm-drawer-title">执行情况</div><Descriptions size="small" column={1} items={[
          { key: 'user', label: '执行用户', children: jobDrawer.user },
          { key: 'progress', label: '完成量', children: `${jobDrawer.completed} / ${jobDrawer.target} 条` },
          { key: 'status', label: '作业状态', children: <Tag color={JOB_STATUS[jobDrawer.status].color}>{JOB_STATUS[jobDrawer.status].label}</Tag> },
          { key: 'machine', label: '机检状态', children: <Tag color={MACHINE_STATUS[jobDrawer.machineStatus].color}>{MACHINE_STATUS[jobDrawer.machineStatus].label}</Tag> },
          { key: 'auth', label: '授权状态', children: <Tag color={AUTH_STATUS[jobDrawer.authorizationStatus].color}>{AUTH_STATUS[jobDrawer.authorizationStatus].label}</Tag> },
          { key: 'deadline', label: '截止日期', children: jobDrawer.deadline },
        ]} /></div>
        <Space><Button type="primary" style={{ background: '#31B895' }} disabled={jobDrawer.status === 'passed'}>重新分配</Button><Button disabled={jobDrawer.status === 'passed'}>回收作业</Button></Space>
      </div>}
    </Drawer>
    <Drawer
      className="signed-agreement-drawer"
      title={<div className="auth-detail-title"><span><SafetyCertificateOutlined /></span><div><b>用户签署授权协议</b><small>{authorizationPdfRecord?.id}</small></div></div>}
      size={760}
      open={Boolean(authorizationPdfRecord)}
      onClose={() => setAuthorizationPdfRecord(null)}
      extra={authorizationPdfRecord?.signedPdfUrl ? <Button type="primary" icon={<DownloadOutlined />} href={resolveAgreementUrl(authorizationPdfRecord.signedPdfUrl)} download={authorizationPdfRecord.agreementFileName} style={{ background: '#31B895' }}>下载协议</Button> : null}
    >
      {authorizationPdfRecord && <div className="signed-agreement-detail">
        <div className="signed-agreement-meta">
          <div><span>签署用户</span><b>{authorizationPdfRecord.user}</b><small>{authorizationPdfRecord.userId}</small></div>
          <div><span>授权版本</span><b>{authorizationPdfRecord.version}</b><small>{authorizationPdfRecord.authorizationMethod ?? '电子确认'}</small></div>
          <div><span>签署时间</span><b>{authorizationPdfRecord.appliedAt}</b><small>有效期至 {authorizationPdfRecord.effectiveUntil}</small></div>
          <Tag color="success" icon={<SafetyCertificateOutlined />}>签名有效 · 只读</Tag>
        </div>
        <div className="signed-agreement-file"><FileTextOutlined /><span><b>{authorizationPdfRecord.agreementFileName}</b><small>用户签名已固化至 PDF 签署页，后台不可修改</small></span></div>
        {authorizationPdfRecord.signedPdfUrl && <AgreementPdfPreview compact signed signatureDataUrl={Object.values(signedAgreements).find((agreement) => agreement.id === authorizationPdfRecord.id)?.signatureDataUrl} signedAt={authorizationPdfRecord.appliedAt} />}
      </div>}
    </Drawer>
    <Drawer
      className="auth-config-detail-drawer"
      title={<div className="auth-detail-title"><span><FileProtectOutlined /></span><div><b>授权配置信息详情</b><small>{configDetail?.name}</small></div></div>}
      size={680}
      open={Boolean(configDetail)}
      onClose={() => setConfigDetail(null)}
      extra={configDetail ? <Button type="primary" icon={<PlusOutlined />} style={{ background: '#31B895' }} onClick={() => { setConfigDetail(null); setConfigCreateType('authorization'); }}>新建授权配置</Button> : null}
    >
      {configDetail && <AuthorizationConfigDetail config={configDetail} projectName={selectedProject?.name ?? '-'} />}
    </Drawer>
    <AudioDataDrawer data={audioDrawerData} open={Boolean(audioDrawerData)} onClose={() => setAudioDrawerData(null)} />
    <ConfigCreateDrawer
      type={configCreateType}
      open={Boolean(configCreateType)}
      project={selectedProject ? { id: selectedProject.id, name: selectedProject.name, category: selectedProject.type } : undefined}
      onClose={() => setConfigCreateType(null)}
      onCreated={handleProjectConfigCreated}
    />
  </div>;
}
