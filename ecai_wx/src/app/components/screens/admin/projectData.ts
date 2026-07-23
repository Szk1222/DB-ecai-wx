export type ProjectStatus = 'draft' | 'pending' | 'active' | 'paused' | 'ended';
export type ProjectTaskStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed';
export type ProjectJobStatus = 'unassigned' | 'in_progress' | 'submitted' | 'machine_review' | 'human_review' | 'rework' | 'passed';
export type MachineStatus = 'pending' | 'checking' | 'passed' | 'failed' | 'error';
export type AuthorizationStatus = 'pending' | 'approved' | 'rejected' | 'revoked' | 'expired';

export interface AuthorizationConfigScope {
  name: string;
  detail: string;
}

/**
 * 后台授权配置与小程序「授权中心」使用同一组展示字段。
 * authorizedBy / authorizedAt / expiresAt 属于用户签署后生成的记录，不在模板中固化。
 */
export interface AuthorizationConfigData {
  organization: string;
  organizationShortName: string;
  projectDisplayName: string;
  purpose: string;
  authorizerRelation: string;
  verificationMethods: string[];
  validityDays: number;
  scopes: AuthorizationConfigScope[];
  agreementFileName: string;
  agreementFileUrl: string;
  signatureRequired: boolean;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  type: 'voice' | 'text' | 'image' | 'mixed';
  status: ProjectStatus;
  manager: string;
  createdAt: string;
  startAt: string;
  endAt: string;
  taskCount: number;
  jobCount: number;
  dataCount: number;
  authCoverage: number;
  progress: number;
  description: string;
}

export interface ProjectTaskItem {
  id: string;
  projectId: string;
  name: string;
  type: 'voice' | 'text' | 'image';
  template: string;
  templateVersion: string;
  process: string;
  processVersion: string;
  authVersion: string;
  target: number;
  completed: number;
  status: ProjectTaskStatus;
  manager: string;
  startAt: string;
  endAt: string;
  jobsTotal: number;
  jobsRunning: number;
  jobsReview: number;
  jobsCompleted: number;
  reward: number;
}

export interface ProjectJob {
  id: string;
  projectId: string;
  taskId: string;
  name: string;
  type: 'voice' | 'text' | 'image';
  user: string;
  target: number;
  completed: number;
  status: ProjectJobStatus;
  machineStatus: MachineStatus;
  authorizationStatus: AuthorizationStatus;
  reward: number;
  deadline: string;
  exported: boolean;
}

export interface ProjectConfigItem {
  id: string;
  projectId: string;
  type: 'authorization' | 'template' | 'process' | 'model';
  name: string;
  version: string;
  status: 'draft' | 'pending' | 'active' | 'disabled' | 'history';
  updatedBy: string;
  updatedAt: string;
  usedBy: number;
  authorization?: AuthorizationConfigData;
}

export interface CollectionDataItem {
  id: string;
  projectId: string;
  taskId: string;
  jobId: string;
  user: string;
  transcript: string;
  duration: number;
  machineStatus: MachineStatus;
  authorizationStatus: AuthorizationStatus;
  status: 'submitted' | 'machine_review' | 'human_review' | 'rework' | 'passed' | 'rejected';
  submittedAt: string;
}

export interface ProjectAuthorization {
  id: string;
  projectId: string;
  user: string;
  userId: string;
  version: string;
  scope: string;
  status: AuthorizationStatus;
  appliedAt: string;
  effectiveUntil: string;
  reviewer?: string;
  authorizationMethod?: string;
  agreementFileName?: string;
  signedPdfUrl?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'prj-001', code: 'PRJ-2026-071', name: '普通话通用语音语料库建设', type: 'voice', status: 'active', manager: '周明',
    createdAt: '2026-06-18', startAt: '2026-07-01', endAt: '2026-09-30', taskCount: 3, jobCount: 8, dataCount: 428,
    authCoverage: 96, progress: 58, description: '面向通用语音识别训练的普通话朗读与自然对话数据采集项目。',
  },
  {
    id: 'prj-002', code: 'PRJ-2026-052', name: '广东方言语音采集计划', type: 'voice', status: 'active', manager: '陈佳',
    createdAt: '2026-05-22', startAt: '2026-06-01', endAt: '2026-08-31', taskCount: 2, jobCount: 4, dataCount: 216,
    authCoverage: 100, progress: 74, description: '覆盖粤语及广东地区特色方言的多场景语音采集项目。',
  },
  {
    id: 'prj-003', code: 'PRJ-2026-089', name: '电商场景多模态数据项目', type: 'mixed', status: 'pending', manager: '李婷',
    createdAt: '2026-07-12', startAt: '2026-08-01', endAt: '2026-11-15', taskCount: 2, jobCount: 0, dataCount: 0,
    authCoverage: 0, progress: 12, description: '建设电商客服、商品图片与评论文本的多模态训练数据集。',
  },
];

export const PROJECT_TASKS: ProjectTaskItem[] = [
  { id: 'TSK-071-01', projectId: 'prj-001', name: '新闻文本普通话朗读', type: 'voice', template: '普通话语音采集 · 标准版', templateVersion: 'v6', process: '语音双级质检流程', processVersion: 'v3', authVersion: 'AUTH-v2.1', target: 400, completed: 248, status: 'active', manager: '张悦', startAt: '2026-07-01', endAt: '2026-08-15', jobsTotal: 3, jobsRunning: 1, jobsReview: 1, jobsCompleted: 1, reward: 150 },
  { id: 'TSK-071-02', projectId: 'prj-001', name: '客服场景自然对话', type: 'voice', template: '普通话语音采集 · 标准版', templateVersion: 'v6', process: '语音双级质检流程', processVersion: 'v3', authVersion: 'AUTH-v2.1', target: 300, completed: 132, status: 'active', manager: '张悦', startAt: '2026-07-05', endAt: '2026-08-30', jobsTotal: 3, jobsRunning: 2, jobsReview: 0, jobsCompleted: 1, reward: 220 },
  { id: 'TSK-071-03', projectId: 'prj-001', name: '近场指令词录制', type: 'voice', template: '近场指令词录制模板', templateVersion: 'v2', process: '快速机检流程', processVersion: 'v1', authVersion: 'AUTH-v2.1', target: 160, completed: 48, status: 'paused', manager: '赵航', startAt: '2026-07-10', endAt: '2026-09-10', jobsTotal: 2, jobsRunning: 0, jobsReview: 1, jobsCompleted: 0, reward: 80 },
  { id: 'TSK-052-01', projectId: 'prj-002', name: '粤语生活短句采集', type: 'voice', template: '粤语自然对话录制', templateVersion: 'v3', process: '方言专家复核流程', processVersion: 'v2', authVersion: 'AUTH-v1.4', target: 240, completed: 192, status: 'active', manager: '陈佳', startAt: '2026-06-01', endAt: '2026-08-01', jobsTotal: 2, jobsRunning: 1, jobsReview: 0, jobsCompleted: 1, reward: 300 },
  { id: 'TSK-052-02', projectId: 'prj-002', name: '粤语多轮对话采集', type: 'voice', template: '粤语自然对话录制', templateVersion: 'v3', process: '方言专家复核流程', processVersion: 'v2', authVersion: 'AUTH-v1.4', target: 180, completed: 119, status: 'active', manager: '陈佳', startAt: '2026-06-15', endAt: '2026-08-31', jobsTotal: 2, jobsRunning: 1, jobsReview: 1, jobsCompleted: 0, reward: 360 },
  { id: 'TSK-089-01', projectId: 'prj-003', name: '电商客服对话撰写', type: 'text', template: '客服场景文本改写', templateVersion: 'v2', process: '文本合规审核流程', processVersion: 'v1', authVersion: 'AUTH-v1.0', target: 500, completed: 0, status: 'pending', manager: '李婷', startAt: '2026-08-01', endAt: '2026-10-20', jobsTotal: 0, jobsRunning: 0, jobsReview: 0, jobsCompleted: 0, reward: 200 },
  { id: 'TSK-089-02', projectId: 'prj-003', name: '商品主图标签采集', type: 'image', template: '室内物品图片采集', templateVersion: 'v4', process: '图像采集质检流程', processVersion: 'v2', authVersion: 'AUTH-v1.0', target: 800, completed: 0, status: 'draft', manager: '李婷', startAt: '2026-08-10', endAt: '2026-11-15', jobsTotal: 0, jobsRunning: 0, jobsReview: 0, jobsCompleted: 0, reward: 90 },
];

export const PROJECT_JOBS: ProjectJob[] = [
  { id: 'JOB-07101-A01', projectId: 'prj-001', taskId: 'TSK-071-01', name: '新闻朗读批次 A-01', type: 'voice', user: '语言达人小明', target: 100, completed: 100, status: 'passed', machineStatus: 'passed', authorizationStatus: 'approved', reward: 1500, deadline: '2026-07-28', exported: true },
  { id: 'JOB-07101-A02', projectId: 'prj-001', taskId: 'TSK-071-01', name: '新闻朗读批次 A-02', type: 'voice', user: '用户A', target: 100, completed: 82, status: 'human_review', machineStatus: 'passed', authorizationStatus: 'approved', reward: 1230, deadline: '2026-07-30', exported: false },
  { id: 'JOB-07101-A03', projectId: 'prj-001', taskId: 'TSK-071-01', name: '新闻朗读批次 A-03', type: 'voice', user: '用户F', target: 100, completed: 66, status: 'in_progress', machineStatus: 'failed', authorizationStatus: 'pending', reward: 990, deadline: '2026-08-05', exported: false },
  { id: 'JOB-07102-B01', projectId: 'prj-001', taskId: 'TSK-071-02', name: '客服对话批次 B-01', type: 'voice', user: '采集小红', target: 80, completed: 80, status: 'passed', machineStatus: 'passed', authorizationStatus: 'approved', reward: 1760, deadline: '2026-08-08', exported: true },
  { id: 'JOB-07102-B02', projectId: 'prj-001', taskId: 'TSK-071-02', name: '客服对话批次 B-02', type: 'voice', user: '待领取', target: 80, completed: 0, status: 'unassigned', machineStatus: 'pending', authorizationStatus: 'pending', reward: 1760, deadline: '2026-08-18', exported: false },
  { id: 'JOB-07102-B03', projectId: 'prj-001', taskId: 'TSK-071-02', name: '客服对话批次 B-03', type: 'voice', user: '用户D', target: 80, completed: 52, status: 'in_progress', machineStatus: 'checking', authorizationStatus: 'approved', reward: 1144, deadline: '2026-08-20', exported: false },
  { id: 'JOB-07103-C01', projectId: 'prj-001', taskId: 'TSK-071-03', name: '指令词录制 C-01', type: 'voice', user: '数据采集爱好者', target: 80, completed: 48, status: 'rework', machineStatus: 'failed', authorizationStatus: 'approved', reward: 384, deadline: '2026-08-25', exported: false },
  { id: 'JOB-07103-C02', projectId: 'prj-001', taskId: 'TSK-071-03', name: '指令词录制 C-02', type: 'voice', user: '待领取', target: 80, completed: 0, status: 'unassigned', machineStatus: 'pending', authorizationStatus: 'pending', reward: 640, deadline: '2026-09-01', exported: false },
  { id: 'JOB-05201-A01', projectId: 'prj-002', taskId: 'TSK-052-01', name: '粤语短句 A-01', type: 'voice', user: '方言达人阿龙', target: 120, completed: 120, status: 'passed', machineStatus: 'passed', authorizationStatus: 'approved', reward: 3600, deadline: '2026-07-20', exported: true },
  { id: 'JOB-05201-A02', projectId: 'prj-002', taskId: 'TSK-052-01', name: '粤语短句 A-02', type: 'voice', user: '用户D', target: 120, completed: 72, status: 'in_progress', machineStatus: 'passed', authorizationStatus: 'approved', reward: 2160, deadline: '2026-08-01', exported: false },
  { id: 'JOB-05202-B01', projectId: 'prj-002', taskId: 'TSK-052-02', name: '粤语对话 B-01', type: 'voice', user: '用户C', target: 90, completed: 65, status: 'human_review', machineStatus: 'passed', authorizationStatus: 'approved', reward: 2340, deadline: '2026-08-20', exported: false },
  { id: 'JOB-05202-B02', projectId: 'prj-002', taskId: 'TSK-052-02', name: '粤语对话 B-02', type: 'voice', user: '粤语用户 07', target: 90, completed: 54, status: 'in_progress', machineStatus: 'checking', authorizationStatus: 'approved', reward: 1944, deadline: '2026-08-25', exported: false },
];

export const PROJECT_CONFIGS: ProjectConfigItem[] = [
  {
    id: 'CFG-AUTH-002', projectId: 'prj-001', type: 'authorization', name: '普通话项目签名授权协议', version: 'v2.2', status: 'draft', updatedBy: '合规管理员', updatedAt: '2026-07-22 18:46', usedBy: 0,
    authorization: {
      organization: '标贝（北京）科技有限公司', organizationShortName: '标贝科技', projectDisplayName: '普通话语音采集项目 · 补充授权',
      purpose: '用于语音识别模型训练、数据质量评估与项目验收', authorizerRelation: '本人授权', verificationMethods: ['短信确认', '签名授权'], validityDays: 365,
      agreementFileName: '普通话语音采集项目_数据使用授权协议_v2.2.pdf', agreementFileUrl: '/agreements/authorization-agreement.pdf', signatureRequired: true,
      scopes: [
        { name: '基础身份信息', detail: '昵称、年龄区间、所在地区' },
        { name: '语音样本', detail: '本项目内提交的普通话朗读与自然对话录音' },
        { name: '设备信息', detail: '设备型号、系统版本、网络类型' },
      ],
    },
  },
  {
    id: 'CFG-AUTH-001', projectId: 'prj-001', type: 'authorization', name: '普通话语料项目数据授权书', version: 'v2.1', status: 'active', updatedBy: '法务管理员', updatedAt: '2026-07-08 14:20', usedBy: 3,
    authorization: {
      organization: '标贝（北京）科技有限公司', organizationShortName: '标贝科技', projectDisplayName: '普通话语音采集项目',
      purpose: '用于语音识别模型训练与质量评估', authorizerRelation: '本人授权', verificationMethods: ['人脸核验', '短信确认'], validityDays: 365,
      agreementFileName: '普通话语音采集项目_数据使用授权协议_v2.1.pdf', agreementFileUrl: '/agreements/authorization-agreement.pdf', signatureRequired: false,
      scopes: [
        { name: '基础身份信息', detail: '昵称、年龄区间、所在地区' },
        { name: '语音样本', detail: '本项目内提交的普通话录音' },
        { name: '设备信息', detail: '设备型号、系统版本、网络类型' },
      ],
    },
  },
  { id: 'CFG-TPL-001', projectId: 'prj-001', type: 'template', name: '普通话语音采集 · 标准版', version: 'v6', status: 'active', updatedBy: '张悦', updatedAt: '2026-07-16 17:42', usedBy: 2 },
  { id: 'CFG-TPL-002', projectId: 'prj-001', type: 'template', name: '近场指令词录制模板', version: 'v2', status: 'active', updatedBy: '赵航', updatedAt: '2026-07-10 10:15', usedBy: 1 },
  { id: 'CFG-FLOW-001', projectId: 'prj-001', type: 'process', name: '语音双级质检流程', version: 'v3', status: 'active', updatedBy: '运营管理员', updatedAt: '2026-07-12 09:30', usedBy: 2 },
  { id: 'CFG-FLOW-002', projectId: 'prj-001', type: 'process', name: '快速机检流程', version: 'v1', status: 'active', updatedBy: '运营管理员', updatedAt: '2026-07-09 18:05', usedBy: 1 },
  { id: 'CFG-MOD-001', projectId: 'prj-001', type: 'model', name: '通用语音质量检测模型', version: 'v2.3.0', status: 'active', updatedBy: '算法管理员', updatedAt: '2026-07-18 16:20', usedBy: 2 },
  {
    id: 'CFG-AUTH-052', projectId: 'prj-002', type: 'authorization', name: '广东方言采集专项授权书', version: 'v1.4', status: 'active', updatedBy: '法务管理员', updatedAt: '2026-06-12 11:00', usedBy: 2,
    authorization: {
      organization: '标贝（北京）科技有限公司', organizationShortName: '标贝科技', projectDisplayName: '粤语生活语音采集项目',
      purpose: '用于粤语语音识别模型训练、方言研究与数据质量评估', authorizerRelation: '本人授权', verificationMethods: ['短信确认'], validityDays: 365,
      agreementFileName: '粤语生活语音采集项目_数据使用授权协议_v1.4.pdf', agreementFileUrl: '/agreements/authorization-agreement.pdf', signatureRequired: false,
      scopes: [
        { name: '基础身份信息', detail: '昵称、年龄区间、所在地区及语言能力标签' },
        { name: '粤语语音样本', detail: '本项目内提交的粤语朗读与自然对话录音' },
        { name: '任务结果', detail: '语音转写文本及方言标签' },
      ],
    },
  },
  { id: 'CFG-TPL-052', projectId: 'prj-002', type: 'template', name: '粤语自然对话录制', version: 'v3', status: 'active', updatedBy: '陈佳', updatedAt: '2026-06-18 15:20', usedBy: 2 },
  { id: 'CFG-FLOW-052', projectId: 'prj-002', type: 'process', name: '方言专家复核流程', version: 'v2', status: 'active', updatedBy: '陈佳', updatedAt: '2026-06-20 09:45', usedBy: 2 },
];

export const COLLECTION_DATA: CollectionDataItem[] = [
  { id: 'DAT-071-000428', projectId: 'prj-001', taskId: 'TSK-071-01', jobId: 'JOB-07101-A02', user: '用户A', transcript: '清晨的阳光穿过窗帘，房间里渐渐明亮起来。', duration: 8, machineStatus: 'passed', authorizationStatus: 'approved', status: 'human_review', submittedAt: '2026-07-21 16:42:18' },
  { id: 'DAT-071-000427', projectId: 'prj-001', taskId: 'TSK-071-01', jobId: 'JOB-07101-A03', user: '用户F', transcript: '科技正在改变我们的生活，也带来了更多新的可能。', duration: 11, machineStatus: 'failed', authorizationStatus: 'pending', status: 'rework', submittedAt: '2026-07-21 16:38:02' },
  { id: 'DAT-071-000426', projectId: 'prj-001', taskId: 'TSK-071-02', jobId: 'JOB-07102-B03', user: '用户D', transcript: '您好，请问有什么可以帮助您？', duration: 6, machineStatus: 'checking', authorizationStatus: 'approved', status: 'machine_review', submittedAt: '2026-07-21 15:55:44' },
  { id: 'DAT-071-000425', projectId: 'prj-001', taskId: 'TSK-071-02', jobId: 'JOB-07102-B01', user: '采集小红', transcript: '感谢您的耐心等待，订单正在配送途中。', duration: 9, machineStatus: 'passed', authorizationStatus: 'approved', status: 'passed', submittedAt: '2026-07-21 15:10:29' },
  { id: 'DAT-071-000424', projectId: 'prj-001', taskId: 'TSK-071-03', jobId: 'JOB-07103-C01', user: '数据采集爱好者', transcript: '打开客厅的灯。', duration: 3, machineStatus: 'failed', authorizationStatus: 'approved', status: 'rework', submittedAt: '2026-07-21 14:48:07' },
  { id: 'DAT-052-000216', projectId: 'prj-002', taskId: 'TSK-052-01', jobId: 'JOB-05201-A02', user: '用户D', transcript: '今日天气几好，好适合出去行下。', duration: 9, machineStatus: 'passed', authorizationStatus: 'approved', status: 'passed', submittedAt: '2026-07-21 13:40:12' },
  { id: 'DAT-052-000215', projectId: 'prj-002', taskId: 'TSK-052-02', jobId: 'JOB-05202-B01', user: '用户C', transcript: '多谢你参与今次嘅语音采集任务。', duration: 10, machineStatus: 'passed', authorizationStatus: 'approved', status: 'human_review', submittedAt: '2026-07-21 13:22:06' },
];

export const PROJECT_AUTHORIZATIONS: ProjectAuthorization[] = [
  { id: 'AUT-071-0098', projectId: 'prj-001', user: '语言达人小明', userId: 'u001', version: 'v2.1', scope: '语音样本、朗读文本及必要设备信息', status: 'approved', appliedAt: '2026-07-02 09:20', effectiveUntil: '2027-07-01', reviewer: '合规管理员', authorizationMethod: '人脸核验 + 短信确认', agreementFileName: 'AUT-071-0098_已签署授权协议.pdf', signedPdfUrl: '/agreements/signed-authorization-agreement.pdf' },
  { id: 'AUT-071-0097', projectId: 'prj-001', user: '用户A', userId: 'u006', version: 'v2.1', scope: '语音样本、朗读文本及必要设备信息', status: 'approved', appliedAt: '2026-07-08 14:05', effectiveUntil: '2027-07-07', reviewer: '合规管理员', authorizationMethod: '签名授权', agreementFileName: 'AUT-071-0097_已签署授权协议.pdf', signedPdfUrl: '/agreements/signed-authorization-agreement.pdf' },
  { id: 'AUT-071-0096', projectId: 'prj-001', user: '用户F', userId: 'u010', version: 'v2.1', scope: '语音样本、朗读文本及必要设备信息', status: 'pending', appliedAt: '2026-07-20 17:28', effectiveUntil: '-', reviewer: undefined, authorizationMethod: '签名授权', agreementFileName: 'AUT-071-0096_待审核授权协议.pdf', signedPdfUrl: '/agreements/signed-authorization-agreement.pdf' },
  { id: 'AUT-071-0095', projectId: 'prj-001', user: '数据采集爱好者', userId: 'u003', version: 'v2.1', scope: '语音样本、朗读文本及必要设备信息', status: 'approved', appliedAt: '2026-07-05 10:12', effectiveUntil: '2027-07-04', reviewer: '合规管理员' },
  { id: 'AUT-052-0042', projectId: 'prj-002', user: '方言达人阿龙', userId: 'u005', version: 'v1.4', scope: '粤语语音样本、转写文本及方言标签', status: 'approved', appliedAt: '2026-06-03 09:15', effectiveUntil: '2027-06-02', reviewer: '合规管理员' },
  { id: 'AUT-052-0041', projectId: 'prj-002', user: '用户C', userId: 'u003', version: 'v1.4', scope: '粤语语音样本、转写文本及方言标签', status: 'approved', appliedAt: '2026-06-17 14:28', effectiveUntil: '2027-06-16', reviewer: '合规管理员' },
];
