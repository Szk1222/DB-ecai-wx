import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
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
  ArrowLeftOutlined,
  BankOutlined,
  CalendarOutlined,
  CloudDownloadOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  NodeIndexOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  RobotOutlined,
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
  ProjectJobStatus,
  ProjectStatus,
} from './projectData';
import { AudioDataDetails, AudioDataDrawer } from './AudioDataDrawer';
import { ProjectTemplateConfig } from './ProjectTemplateConfig';
import { ProjectProcedureConfig } from './ProjectProcedureConfig';
import { ConfigCreateDrawer, ConfigCreateType, CreatedConfigPayload } from './ConfigCreateDrawer';
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

const CONFIG_STATUS = {
  draft: { label: '草稿', color: 'default' },
  pending: { label: '待生效', color: 'warning' },
  active: { label: '生效中', color: 'success' },
  disabled: { label: '已停用', color: 'orange' },
  history: { label: '历史版本', color: 'default' },
};

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
  const [collectionData, setCollectionData] = useState(COLLECTION_DATA);
  const [authorizations, setAuthorizations] = useState(PROJECT_AUTHORIZATIONS);
  const [projectConfigs, setProjectConfigs] = useState(PROJECT_CONFIGS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('data');
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatus, setProjectStatus] = useState<string>();
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [audioDrawerData, setAudioDrawerData] = useState<AudioDataDetails | null>(null);
  const [audioDrawerMode, setAudioDrawerMode] = useState<'view' | 'review'>('view');
  const [configCreateType, setConfigCreateType] = useState<ConfigCreateType | null>(null);
  const [configDetail, setConfigDetail] = useState<ProjectConfigItem | null>(null);
  const [authorizationPdfRecord, setAuthorizationPdfRecord] = useState<ProjectAuthorization | null>(null);
  const [selectedCollectionDataIds, setSelectedCollectionDataIds] = useState<React.Key[]>([]);
  const [collectionFilterDraft, setCollectionFilterDraft] = useState<{
    keyword: string;
    jobStatus?: ProjectJobStatus;
    machineStatus?: MachineStatus;
    authorizationStatus?: AuthorizationStatus;
  }>({ keyword: '' });
  const [collectionFilters, setCollectionFilters] = useState(collectionFilterDraft);
  const [selectedAuthorizationIds, setSelectedAuthorizationIds] = useState<React.Key[]>([]);
  const [projectForm] = Form.useForm();

  const selectedJobs = useMemo(() => jobs.filter((job) => job.projectId === selectedProject?.id), [jobs, selectedProject]);
  const selectedConfigs = useMemo(() => projectConfigs.filter((config) => config.projectId === selectedProject?.id), [projectConfigs, selectedProject]);
  const selectedData = useMemo(() => collectionData.filter((item) => item.projectId === selectedProject?.id), [collectionData, selectedProject]);
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
  const jobMap = useMemo(() => Object.fromEntries(jobs.map((job) => [job.id, job])), [jobs]);

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

  const openCollectionAudio = (item: CollectionDataItem, mode: 'view' | 'review' = 'view') => {
    setAudioDrawerMode(mode);
    const machineScores: Partial<Record<MachineStatus, number>> = { passed: 94, failed: 62, error: 0 };
    const machineMetrics = {
      passed: { clarity: 94, completeness: 97, transcriptMatch: 96, noiseLimit: 48, pauseDuration: 0.8 },
      failed: { clarity: 72, completeness: 88, transcriptMatch: 82, noiseLimit: 76, pauseDuration: 2.8 },
      checking: { clarity: 88, completeness: 94, transcriptMatch: 93, noiseLimit: 62, pauseDuration: 1.4 },
      pending: {},
      error: {},
    } satisfies Record<MachineStatus, Partial<Record<'clarity' | 'completeness' | 'transcriptMatch' | 'noiseLimit' | 'pauseDuration', number>>>;
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
    const recordingTexts = [
      item.transcript,
      '请保持自然语速，在安静环境中完整朗读当前屏幕显示的内容。',
      '本条语音用于项目数据质量评估，请确认录音内容清晰且没有截断。',
    ];
    const recordingStatuses: MachineStatus[] = [
      item.machineStatus,
      item.machineStatus === 'failed' ? 'failed' : 'passed',
      item.machineStatus === 'checking' ? 'checking' : 'passed',
    ];
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
      machineMetrics: machineMetrics[item.machineStatus],
      machineSummary: machineSummaries[item.machineStatus],
      authorizationStatus: item.authorizationStatus,
      authorizationSummary: authorizationSummaries[item.authorizationStatus],
      recordings: recordingTexts.map((transcript, index) => {
        const status = recordingStatuses[index];
        const duration = index === 0 ? item.duration : item.duration + index * 3;
        return {
          id: `${item.id}-R${String(index + 1).padStart(2, '0')}`,
          label: `录音 ${String(index + 1).padStart(2, '0')}`,
          transcript,
          duration,
          format: 'WAV',
          sampleRate: '16 kHz',
          bitDepth: '16 bit',
          channels: '单声道',
          fileSize: `${Math.max(96, Math.round(duration * 31.25))} KB`,
          machineStatus: status,
          machineScore: machineScores[status],
          machineMetrics: machineMetrics[status],
          machineSummary: machineSummaries[status],
          humanReviewStatus: index === 0 && item.status === 'passed' ? 'passed' : index === 1 && status === 'failed' ? 'failed' : 'pending',
          rejectionReason: index === 1 && status === 'failed' ? '语音与文本不匹配' : undefined,
        };
      }),
    });
  };

  const reviewCollectionData = (status: 'approved' | 'rejected') => {
    message.success(status === 'approved' ? '采集数据验收已通过' : '采集数据已驳回');
    setAudioDrawerData(null);
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setActiveTab('data');
    setSelectedCollectionDataIds([]);
    setSelectedAuthorizationIds([]);
  };

  const createProject = async () => {
    const values = await projectForm.validateFields();
    const [template, templateVersion] = values.template.split('|');
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
      template,
      templateVersion,
    };
    setProjects((current) => [item, ...current]);
    setNewProjectOpen(false);
    projectForm.resetFields();
    message.success('项目草稿已创建');
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

  const exportAuthorizations = (records: ProjectAuthorization[]) => {
    if (!records.length) return;

    const escapeCsvCell = (value?: string) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [
      ['授权记录', '授权用户', '用户ID', '授权内容摘要', '授权版本', '申请时间', '有效期至', '状态', '审核人', '授权方式', '协议文件'],
      ...records.map((item) => [
        item.id,
        item.user,
        item.userId,
        item.scope,
        item.version,
        item.appliedAt,
        item.effectiveUntil,
        AUTH_STATUS[item.status].label,
        item.reviewer ?? '-',
        item.authorizationMethod ?? '-',
        item.agreementFileName ?? '-',
      ]),
    ];
    const content = `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')}`;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selectedProject?.code ?? '项目'}_授权信息_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    message.success(`已导出 ${records.length} 条授权信息`);
  };

  const exportCollectionData = (records: CollectionDataItem[]) => {
    if (!records.length) return;

    const escapeCsvCell = (value?: string | number) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = [
      ['数据编号', '数据内容', '采集用户', '作业编号', '作业状态', '机检状态', '授权状态', '提交时间'],
      ...records.map((item) => {
        const jobStatus = jobMap[item.jobId]?.status ?? 'submitted';
        return [
          item.id,
          item.transcript,
          item.user,
          item.jobId,
          JOB_STATUS[jobStatus].label,
          MACHINE_STATUS[item.machineStatus].label,
          AUTH_STATUS[item.authorizationStatus].label,
          item.submittedAt,
        ];
      }),
    ];
    const content = `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')}`;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selectedProject?.code ?? '项目'}_采集数据_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    message.success(`已导出 ${records.length} 条采集数据`);
  };

  const recheckSelectedCollectionData = () => {
    const selectedRecords = selectedData.filter((item) => selectedCollectionDataIds.includes(item.id));
    if (!selectedRecords.length) {
      message.warning('请先选择需要重新机检的数据');
      return;
    }
    const selectedIds = new Set(selectedRecords.map((item) => item.id));
    const selectedJobIds = new Set(selectedRecords.map((item) => item.jobId));
    setCollectionData((current) => current.map((item) => selectedIds.has(item.id) ? { ...item, machineStatus: 'checking', status: 'machine_review' } : item));
    setJobs((current) => current.map((job) => selectedJobIds.has(job.id) ? { ...job, machineStatus: 'checking', status: 'machine_review' } : job));
    setSelectedCollectionDataIds([]);
    message.success(`已使用最新模型配置提交 ${selectedRecords.length} 条数据重新机检`);
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
      title: '关联模板',
      key: 'template',
      width: 210,
      render: (_: unknown, project: Project) => <div><div className="pm-dimension-name">{project.template}</div><div className="pm-dimension-meta">{project.templateVersion}</div></div>,
    },
    {
      title: '采集数据',
      key: 'hierarchy',
      width: 100,
      render: (_: unknown, project: Project) => <b style={{ color: '#53657A' }}>{project.dataCount}</b>,
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
          { label: '采集数据总量', value: projects.reduce((sum, project) => sum + project.dataCount, 0), note: '项目下全部采集数据' },
          { label: '录音总量', value: COLLECTION_DATA.length * 3, note: '每条采集数据可含多条录音' },
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

  const renderCollectionData = () => {
    const selectedCollectionRecords = selectedData.filter((item) => selectedCollectionDataIds.includes(item.id));
    const normalizedKeyword = collectionFilters.keyword.trim().toLowerCase();
    const filteredData = selectedData.filter((item) => {
      const jobStatus = jobMap[item.jobId]?.status;
      const matchesKeyword = !normalizedKeyword || [item.id, item.transcript, item.user, item.jobId].some((value) => value.toLowerCase().includes(normalizedKeyword));
      return matchesKeyword
        && (!collectionFilters.jobStatus || jobStatus === collectionFilters.jobStatus)
        && (!collectionFilters.machineStatus || item.machineStatus === collectionFilters.machineStatus)
        && (!collectionFilters.authorizationStatus || item.authorizationStatus === collectionFilters.authorizationStatus);
    });
    const stats = [
      { label: '采集数据', value: selectedProject?.dataCount ?? selectedData.length, color: '#4F6EF7' },
      { label: '录音数量', value: selectedData.length * 3, color: '#31B895' },
      { label: '进行中', value: selectedJobs.filter((job) => job.status === 'in_progress' || job.status === 'machine_review' || job.status === 'human_review').length, color: '#E6A129' },
      { label: '已完成', value: selectedJobs.filter((job) => job.status === 'passed').length, color: '#2EAD8B' },
      { label: '已导出', value: selectedJobs.filter((job) => job.exported).length, color: '#8C68D6' },
      { label: '未导出', value: selectedJobs.filter((job) => !job.exported).length, color: '#7A8798' },
    ];
    const columns = [
      { title: '数据编号', dataIndex: 'id', width: 150, render: (value: string) => <span className="project-code">{value}</span> },
      { title: '数据内容', key: 'content', width: 250, render: (_: unknown, item: (typeof selectedData)[number]) => <div><div className="pm-dimension-name">{item.transcript}</div><div className="pm-dimension-meta">包含 3 条录音 · {item.jobId}</div></div> },
      { title: '采集用户', dataIndex: 'user', width: 100 },
      { title: '作业状态', key: 'jobStatus', width: 100, render: (_: unknown, item: (typeof selectedData)[number]) => { const status = jobMap[item.jobId]?.status ?? 'submitted'; return <Tag color={JOB_STATUS[status].color}>{JOB_STATUS[status].label}</Tag>; } },
      { title: '机检状态', dataIndex: 'machineStatus', width: 110, render: (value: MachineStatus) => <Tag color={MACHINE_STATUS[value].color}>{MACHINE_STATUS[value].label}</Tag> },
      { title: '授权状态', dataIndex: 'authorizationStatus', width: 100, render: (value: AuthorizationStatus) => <Tag color={AUTH_STATUS[value].color}>{AUTH_STATUS[value].label}</Tag> },
      { title: '提交时间', dataIndex: 'submittedAt', width: 160 },
      { title: '操作', key: 'action', width: 120, fixed: 'right' as const, render: (_: unknown, item: (typeof selectedData)[number]) => <Space size={2}><Button type="link" size="small" onClick={() => openCollectionAudio(item, 'view')}>查看</Button><Button type="link" size="small" onClick={() => openCollectionAudio(item, 'review')}>验收</Button></Space> },
    ];
    const exportButton = (
      <Button
        icon={<CloudDownloadOutlined />}
        disabled={!selectedCollectionRecords.length}
        onClick={() => exportCollectionData(selectedCollectionRecords)}
      >
        导出数据{selectedCollectionRecords.length ? `（${selectedCollectionRecords.length}）` : ''}
      </Button>
    );

    return <div className="pm-tab-content">
      <Row gutter={[10, 10]}>{stats.map((stat) => <Col xs={12} sm={8} xl={4} key={stat.label}><Card className="pm-stat-card"><div className="pm-stat-label">{stat.label}</div><div className="pm-stat-value" style={{ color: stat.color }}>{stat.value}</div></Card></Col>)}</Row>
      <Card
        className="pm-panel"
        title="采集数据"
        extra={<Space>
          <Button type="primary" icon={<PlusOutlined />} style={{ background: '#31B895' }} onClick={() => message.success('已创建一条待录入的采集数据')}>新增数据</Button>
          <Tooltip title={selectedCollectionRecords.length ? `将使用最新模型配置重新检测 ${selectedCollectionRecords.length} 条数据` : '请先勾选需要重新机检的数据'}>
            <span>
              <Button icon={<ReloadOutlined />} disabled={!selectedCollectionRecords.length} onClick={recheckSelectedCollectionData}>
                重新机检{selectedCollectionRecords.length ? `（${selectedCollectionRecords.length}）` : ''}
              </Button>
            </span>
          </Tooltip>
          {selectedCollectionRecords.length ? exportButton : <Tooltip title="请先勾选需要导出的采集数据"><span>{exportButton}</span></Tooltip>}
        </Space>}
      >
        <div className="pm-filter-strip">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="数据编号 / 录音内容 / 用户"
            style={{ width: 250 }}
            value={collectionFilterDraft.keyword}
            onChange={(event) => setCollectionFilterDraft((current) => ({ ...current, keyword: event.target.value }))}
            onPressEnter={() => setCollectionFilters(collectionFilterDraft)}
          />
          <Select
            placeholder="作业状态"
            allowClear
            style={{ width: 130 }}
            value={collectionFilterDraft.jobStatus}
            onChange={(value) => setCollectionFilterDraft((current) => ({ ...current, jobStatus: value }))}
            options={Object.entries(JOB_STATUS).map(([value, meta]) => ({ value, label: meta.label }))}
          />
          <Select
            placeholder="机检状态"
            allowClear
            style={{ width: 130 }}
            value={collectionFilterDraft.machineStatus}
            onChange={(value) => setCollectionFilterDraft((current) => ({ ...current, machineStatus: value }))}
            options={Object.entries(MACHINE_STATUS).map(([value, meta]) => ({ value, label: meta.label }))}
          />
          <Select
            placeholder="授权状态"
            allowClear
            style={{ width: 130 }}
            value={collectionFilterDraft.authorizationStatus}
            onChange={(value) => setCollectionFilterDraft((current) => ({ ...current, authorizationStatus: value }))}
            options={Object.entries(AUTH_STATUS).map(([value, meta]) => ({ value, label: meta.label }))}
          />
          <Button type="primary" style={{ background: '#31B895' }} onClick={() => setCollectionFilters(collectionFilterDraft)}>查询</Button>
          <Button onClick={() => {
            const emptyFilters = { keyword: '' };
            setCollectionFilterDraft(emptyFilters);
            setCollectionFilters(emptyFilters);
          }}>重置</Button>
        </div>
        <Table
          dataSource={filteredData}
          columns={columns}
          rowKey="id"
          rowSelection={{ fixed: true, selectedRowKeys: selectedCollectionDataIds, onChange: setSelectedCollectionDataIds, columnWidth: 48 }}
          size="small"
          pagination={{ pageSize: 8, size: 'small', total: filteredData.length, showTotal: (total) => `共 ${total} 条` }}
          scroll={{ x: 1128 }}
          style={{ marginTop: 12 }}
        />
      </Card>
    </div>;
  };

  const renderAuthorizations = () => {
    const selectedAuthorizationRecords = selectedAuths.filter((item) => selectedAuthorizationIds.includes(item.id));
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
    const exportButton = (
      <Button
        icon={<CloudDownloadOutlined />}
        disabled={!selectedAuthorizationRecords.length}
        onClick={() => exportAuthorizations(selectedAuthorizationRecords)}
      >
        批量导出{selectedAuthorizationRecords.length ? `（${selectedAuthorizationRecords.length}）` : ''}
      </Button>
    );

    return (
      <div className="pm-tab-content">
        <Card
          className="pm-panel"
          title="项目授权信息"
          extra={(
            <Space>
              {selectedAuthorizationRecords.length ? exportButton : (
                <Tooltip title="请先勾选需要导出的授权记录">
                  <span>{exportButton}</span>
                </Tooltip>
              )}
              <Button
                type="primary"
                icon={<FileProtectOutlined />}
                style={{ background: '#31B895' }}
                onClick={() => setConfigCreateType('authorization')}
              >
                配置授权功能
              </Button>
            </Space>
          )}
        >
          <Table
            dataSource={selectedAuths}
            columns={columns}
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selectedAuthorizationIds,
              onChange: setSelectedAuthorizationIds,
              columnWidth: 48,
            }}
            size="small"
            pagination={false}
            scroll={{ x: 1248 }}
          />
        </Card>
      </div>
    );
  };

  const renderProjectDetail = () => {
    if (!selectedProject) return null;
    if (audioDrawerData) {
      return (
        <AudioDataDrawer
          data={audioDrawerData}
          open
          presentation="page"
          mode={audioDrawerMode}
          onClose={() => setAudioDrawerData(null)}
          onApprove={() => reviewCollectionData('approved')}
          onReject={() => reviewCollectionData('rejected')}
        />
      );
    }
    const tabs = [
      { key: 'data', label: <span><DatabaseOutlined /> 采集数据 <Badge count={selectedProject.dataCount} showZero /></span>, children: renderCollectionData() },
      {
        key: 'templates',
        label: <span><FileTextOutlined /> 模板配置</span>,
        children: <ProjectTemplateConfig projectId={selectedProject.id} projectName={selectedProject.name} template={selectedProject.template} templateVersion={selectedProject.templateVersion} projectType={selectedProject.type} />,
      },
      {
        key: 'procedures',
        label: <span><NodeIndexOutlined /> 工序配置</span>,
        children: <ProjectProcedureConfig projectName={selectedProject.name} template={`${selectedProject.template} ${selectedProject.templateVersion}`} projectType={selectedProject.type} />,
      },
      { key: 'authorizations', label: <span><FileProtectOutlined /> 授权信息 <Badge count={selectedAuths.length} showZero /></span>, children: renderAuthorizations() },
    ];
    return <>
      <section className="pm-detail-header">
        <button className="pm-back" onClick={() => { setSelectedProject(null); setSelectedCollectionDataIds([]); setSelectedAuthorizationIds([]); }} style={{ border: 0, background: 'none', padding: 0 }}><ArrowLeftOutlined /> 返回项目列表</button>
        <div className="pm-project-heading"><h2>{selectedProject.name}</h2><Tag color={PROJECT_STATUS[selectedProject.status].color}>{PROJECT_STATUS[selectedProject.status].label}</Tag><Tag color={TYPE_META[selectedProject.type].color}>{TYPE_META[selectedProject.type].label}</Tag></div>
        <div className="pm-project-meta"><span>项目编号：{selectedProject.code}</span><span>负责人：{selectedProject.manager}</span><span>项目周期：{selectedProject.startAt} — {selectedProject.endAt}</span><span>整体进度：{selectedProject.progress}%</span></div>
      </section>
      <Tabs className="pm-tabs" activeKey={activeTab} onChange={setActiveTab} items={tabs} />
    </>;
  };

  return <div className="project-management">
    {selectedProject ? renderProjectDetail() : renderProjectList()}

    <Modal title="新建项目" open={newProjectOpen} onCancel={() => setNewProjectOpen(false)} onOk={createProject} okText="创建草稿" cancelText="取消" okButtonProps={{ style: { background: '#31B895' } }} width={680}>
      <Form form={projectForm} layout="vertical" style={{ marginTop: 14 }}>
        <Row gutter={14}><Col span={16}><Form.Item label="项目名称" name="name" rules={[{ required: true }]}><Input placeholder="请输入项目名称" /></Form.Item></Col><Col span={8}><Form.Item label="项目类型" name="type" rules={[{ required: true }]}><Select options={Object.entries(TYPE_META).map(([value, meta]) => ({ value, label: meta.label }))} /></Form.Item></Col></Row>
        <Form.Item label="关联模板" name="template" rules={[{ required: true, message: '请选择项目固定使用的模板' }]}><Select placeholder="一个项目固定关联一套模板" options={[
          { value: '普通话语音采集 · 标准版|v6', label: '普通话语音采集 · 标准版（v6）' },
          { value: '粤语自然对话录制|v3', label: '粤语自然对话录制（v3）' },
          { value: '电商多模态数据采集|v1', label: '电商多模态数据采集（v1）' },
        ]} /></Form.Item>
        <Row gutter={14}><Col span={8}><Form.Item label="负责人" name="manager" rules={[{ required: true }]}><Input placeholder="项目负责人" /></Form.Item></Col><Col span={8}><Form.Item label="开始日期" name="startAt" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col><Col span={8}><Form.Item label="结束日期" name="endAt" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col></Row>
        <Form.Item label="项目说明" name="description"><Input.TextArea rows={3} placeholder="说明项目目标、数据范围和交付要求" /></Form.Item>
      </Form>
    </Modal>

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
    <ConfigCreateDrawer
      type={configCreateType}
      open={Boolean(configCreateType)}
      project={selectedProject ? { id: selectedProject.id, name: selectedProject.name, category: selectedProject.type } : undefined}
      onClose={() => setConfigCreateType(null)}
      onCreated={handleProjectConfigCreated}
    />
  </div>;
}
