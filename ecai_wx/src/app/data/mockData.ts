export type TaskType = 'voice' | 'text' | 'image';
export type TaskStatus = 'draft' | 'pending' | 'active' | 'paused' | 'ended' | 'archived';
export type UserTaskStatus =
  | 'available'
  | 'in_progress'
  | 'submitted'
  | 'model_review'
  | 'human_review'
  | 'rework'
  | 'passed'
  | 'failed'
  | 'expired';
export type PointStatus = 'pending' | 'available' | 'frozen' | 'redeemed' | 'deducted';
export type WithdrawStatus = 'pending_id' | 'pending_review' | 'processing' | 'paid' | 'failed' | 'closed';

export interface RecordingHint {
  id: string;
  text: string;
  status: 'success' | 'warning' | 'info';
  type?: 'guidance' | 'environment';
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  category: string;
  description: string;
  reward: number;
  totalSlots: number;
  remainingSlots: number;
  deadline: string;
  languages: string[];
  requirements: string[];
  certRequired: boolean;
  verifyRules: string[];
  sampleCount: number;
  estimatedMinutes: number;
  tags: string[];
  status: TaskStatus;
  isRecommended: boolean;
  isDirected: boolean;
  requiredCertifications?: string[];
  requiredUserTags?: string[];
  recordingHints?: RecordingHint[];
  directedAccess?: {
    userInDispatchList: boolean;
    inviteCode: string;
    issuer: string;
  };
}

export interface UserTask {
  id: string;
  taskId: string;
  task: Task;
  status: UserTaskStatus;
  progress: number;
  total: number;
  submittedAt?: string;
  reviewedAt?: string;
  earnedPoints?: number;
  reworkReason?: string;
  expiresAt: string;
}

export interface PointTransaction {
  id: string;
  type: 'earn' | 'redeem' | 'deduct' | 'freeze' | 'invite';
  amount: number;
  description: string;
  status: PointStatus;
  createdAt: string;
}

export interface InviteRecord {
  id: string;
  avatarUrl: string;
  nickname: string;
  joinedAt: string;
  firstTaskPassed: boolean;
  rewardPoints: number;
}

export interface QCRecord {
  id: string;
  taskId: string;
  taskTitle: string;
  userId: string;
  userNickname: string;
  type: TaskType;
  submittedAt: string;
  modelScore: number;
  modelPassed: boolean;
  qcStatus: 'pending' | 'passed' | 'rework' | 'rejected';
  duration?: number;
  content?: string;
  imageCount?: number;
}

export interface AdminUser {
  id: string;
  nickname: string;
  phone: string;
  language: string;
  tags: string[];
  level: number;
  points: number;
  totalEarned: number;
  taskCount: number;
  passRate: number;
  joinedAt: string;
  verified: boolean;
  status: 'active' | 'banned';
}

export interface WithdrawRecord {
  id: string;
  userId: string;
  userNickname: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: WithdrawStatus;
  appliedAt: string;
  processedAt?: string;
}

export interface AuthorizationRecord {
  id: string;
  organization: string;
  organizationShortName: string;
  project: string;
  purpose: string;
  status: 'active' | 'expired' | 'revoked';
  authorizedBy: string;
  authorizerRelation: string;
  authorizedAt: string;
  expiresAt: string;
  authorizationMethod: string;
  scopes: Array<{
    name: string;
    detail: string;
  }>;
}

export const TASKS: Task[] = [
  {
    id: 't001',
    title: '普通话朗读采集（新闻类）',
    type: 'voice',
    category: '语音采集',
    description: '请用普通话朗读屏幕上显示的新闻文本，语速适中，发音清晰，每句话之间留有短暂停顿。',
    reward: 150,
    totalSlots: 500,
    remainingSlots: 213,
    deadline: '2026-07-30',
    languages: ['普通话'],
    requirements: ['安静环境', '清晰发音', '无口音'],
    certRequired: false,
    verifyRules: ['音频时长 5-15 秒', '信噪比 > 30dB', '无截断'],
    sampleCount: 20,
    estimatedMinutes: 15,
    tags: ['语音', '普通话', '新手友好'],
    status: 'active',
    isRecommended: true,
    isDirected: false,
    requiredUserTags: ['高通过率'],
    recordingHints: [
      {
        id: 't001-environment',
        text: '当前环境噪声检测合格，可以开始录音。',
        status: 'success',
        type: 'environment',
      },
      {
        id: 't001-distance',
        text: '请将手机保持在距离嘴部约 20 厘米的位置，避免遮挡麦克风。',
        status: 'info',
        type: 'guidance',
      },
      {
        id: 't001-pace',
        text: '请按自然语速完整朗读，读错时可停止并重新录制本条内容。',
        status: 'warning',
        type: 'guidance',
      },
    ],
  },
  {
    id: 't002',
    title: '图片场景标注（室内场景）',
    type: 'image',
    category: '图片采集',
    description: '拍摄您所在室内环境的照片，并标注图片中的主要物品类别。要求光线充足，画面清晰。',
    reward: 80,
    totalSlots: 1000,
    remainingSlots: 672,
    deadline: '2026-08-15',
    languages: ['中文'],
    requirements: ['室内环境', '光线充足', '无人脸'],
    certRequired: false,
    verifyRules: ['分辨率 ≥ 1080p', '无模糊', '标注完整'],
    sampleCount: 10,
    estimatedMinutes: 10,
    tags: ['图片', '标注', '新手友好'],
    status: 'active',
    isRecommended: true,
    isDirected: false,
  },
  {
    id: 't003',
    title: '多轮对话文本转写（客服场景）',
    type: 'text',
    category: '文本采集',
    description: '根据给定的客服对话场景，撰写自然流畅的多轮对话文本，要求符合真实客服语境。',
    reward: 200,
    totalSlots: 300,
    remainingSlots: 45,
    deadline: '2026-07-25',
    languages: ['中文'],
    requirements: ['大模型测评认证', '汉语文字表达能力'],
    certRequired: true,
    verifyRules: ['每轮对话 10-50 字', '至少 6 轮对话', '逻辑连贯'],
    sampleCount: 5,
    estimatedMinutes: 20,
    tags: ['文本', 'NLP', '高收益'],
    status: 'active',
    isRecommended: false,
    isDirected: false,
    requiredCertifications: ['大模型基础测评'],
  },
  {
    id: 't004',
    title: '方言采集（粤语·定向）',
    type: 'voice',
    category: '语音采集',
    description: '粤语母语者专属任务。请用粤语朗读指定文本，要求标准粤语发音，无混入普通话。',
    reward: 300,
    totalSlots: 200,
    remainingSlots: 88,
    deadline: '2026-08-01',
    languages: ['粤语'],
    requirements: ['粤语母语者', '粤语认证通过'],
    certRequired: true,
    verifyRules: ['音频时长 5-20 秒', '纯正粤语发音', '信噪比 > 35dB'],
    sampleCount: 15,
    estimatedMinutes: 20,
    tags: ['语音', '粤语', '定向', '高收益'],
    status: 'active',
    isRecommended: false,
    isDirected: true,
    requiredCertifications: ['粤语认证'],
    requiredUserTags: ['粤语母语者'],
    directedAccess: {
      userInDispatchList: false,
      inviteCode: 'YUEYU2026',
      issuer: '粤语数据项目组',
    },
    recordingHints: [
      {
        id: 't004-environment',
        text: '当前环境噪声检测合格，请保持周围安静。',
        status: 'success',
        type: 'environment',
      },
      {
        id: 't004-language',
        text: '请全程使用粤语朗读，不要混入普通话发音。',
        status: 'warning',
        type: 'guidance',
      },
    ],
  },
  {
    id: 't005',
    title: '情感标注（电商评论）',
    type: 'text',
    category: '文本采集',
    description: '对给定的电商评论文本进行情感极性标注（正向/负向/中性），并给出简短理由。',
    reward: 60,
    totalSlots: 2000,
    remainingSlots: 1543,
    deadline: '2026-09-01',
    languages: ['中文'],
    requirements: [],
    certRequired: false,
    verifyRules: ['标注准确率 > 90%', '理由 10-30 字'],
    sampleCount: 30,
    estimatedMinutes: 12,
    tags: ['文本', '标注', '新手友好'],
    status: 'active',
    isRecommended: true,
    isDirected: false,
  },
];

export const USER_TASKS: UserTask[] = [
  {
    id: 'ut001',
    taskId: 't001',
    task: TASKS[0],
    status: 'in_progress',
    progress: 12,
    total: 20,
    expiresAt: '2026-07-22',
  },
  {
    id: 'ut002',
    taskId: 't002',
    task: TASKS[1],
    status: 'human_review',
    progress: 10,
    total: 10,
    submittedAt: '2026-07-14',
    expiresAt: '2026-07-28',
  },
  {
    id: 'ut003',
    taskId: 't005',
    task: TASKS[4],
    status: 'passed',
    progress: 30,
    total: 30,
    submittedAt: '2026-07-10',
    reviewedAt: '2026-07-12',
    earnedPoints: 60,
    expiresAt: '2026-07-20',
  },
  {
    id: 'ut004',
    taskId: 't003',
    task: TASKS[2],
    status: 'rework',
    progress: 4,
    total: 5,
    submittedAt: '2026-07-13',
    reworkReason: '第3组对话逻辑断层，请修改后重新提交。',
    expiresAt: '2026-07-26',
  },
  {
    id: 'ut005',
    taskId: 't004',
    task: TASKS[3],
    status: 'model_review',
    progress: 15,
    total: 15,
    submittedAt: '2026-07-15',
    expiresAt: '2026-07-30',
  },
];

export const POINT_TRANSACTIONS: PointTransaction[] = [
  { id: 'p001', type: 'earn', amount: 60, description: '任务「情感标注」通过奖励', status: 'available', createdAt: '2026-07-12 14:30' },
  { id: 'p002', type: 'freeze', amount: 80, description: '任务「图片场景标注」待审冻结', status: 'frozen', createdAt: '2026-07-14 09:15' },
  { id: 'p003', type: 'invite', amount: 50, description: '邀请好友「小明」完成首单奖励', status: 'available', createdAt: '2026-07-11 18:00' },
  { id: 'p004', type: 'earn', amount: 150, description: '任务「普通话朗读」通过奖励', status: 'available', createdAt: '2026-07-08 11:20' },
  { id: 'p005', type: 'redeem', amount: -200, description: '积分兑换现金 ¥2.00', status: 'redeemed', createdAt: '2026-07-05 16:45' },
  { id: 'p006', type: 'earn', amount: 200, description: '任务「多轮对话文本转写」通过奖励', status: 'available', createdAt: '2026-06-30 10:00' },
  { id: 'p007', type: 'invite', amount: 50, description: '邀请好友「小红」完成首单奖励', status: 'available', createdAt: '2026-06-28 20:30' },
  { id: 'p008', type: 'deduct', amount: -30, description: '任务「方言采集」质检驳回扣回', status: 'deducted', createdAt: '2026-06-25 08:10' },
  { id: 'p009', type: 'earn', amount: 300, description: '任务「粤语采集」通过奖励', status: 'available', createdAt: '2026-06-20 15:55' },
  { id: 'p010', type: 'freeze', amount: 150, description: '任务「普通话朗读」进行中冻结', status: 'frozen', createdAt: '2026-07-15 08:00' },
];

export const INVITE_RECORDS: InviteRecord[] = [
  { id: 'i001', avatarUrl: '', nickname: '语言达人小明', joinedAt: '2026-07-11', firstTaskPassed: true, rewardPoints: 50 },
  { id: 'i002', avatarUrl: '', nickname: '标注小红', joinedAt: '2026-06-28', firstTaskPassed: true, rewardPoints: 50 },
  { id: 'i003', avatarUrl: '', nickname: '数据采集爱好者', joinedAt: '2026-07-01', firstTaskPassed: false, rewardPoints: 0 },
  { id: 'i004', avatarUrl: '', nickname: '小王同学', joinedAt: '2026-07-13', firstTaskPassed: false, rewardPoints: 0 },
  { id: 'i005', avatarUrl: '', nickname: '方言达人阿龙', joinedAt: '2026-06-15', firstTaskPassed: true, rewardPoints: 50 },
];

export const QC_RECORDS: QCRecord[] = [
  { id: 'q001', taskId: 't001', taskTitle: '普通话朗读采集', userId: 'u001', userNickname: '用户A', type: 'voice', submittedAt: '2026-07-15 10:30', modelScore: 92, modelPassed: true, qcStatus: 'pending', duration: 8 },
  { id: 'q002', taskId: 't003', taskTitle: '多轮对话文本转写', userId: 'u002', userNickname: '用户B', type: 'text', submittedAt: '2026-07-15 09:15', modelScore: 75, modelPassed: false, qcStatus: 'pending', content: '客服：您好，请问有什么可以帮助您？\n用户：我买的商品还没到货...' },
  { id: 'q003', taskId: 't002', taskTitle: '图片场景标注', userId: 'u003', userNickname: '用户C', type: 'image', submittedAt: '2026-07-15 08:00', modelScore: 88, modelPassed: true, qcStatus: 'pending', imageCount: 10 },
  { id: 'q004', taskId: 't004', taskTitle: '方言采集（粤语）', userId: 'u004', userNickname: '用户D', type: 'voice', submittedAt: '2026-07-14 16:45', modelScore: 95, modelPassed: true, qcStatus: 'passed', duration: 12 },
  { id: 'q005', taskId: 't005', taskTitle: '情感标注（电商评论）', userId: 'u005', userNickname: '用户E', type: 'text', submittedAt: '2026-07-14 14:30', modelScore: 60, modelPassed: false, qcStatus: 'rework', content: '正向：这个商品质量不错，快递很快\n负向：包装有点破损，但产品本身还行' },
  { id: 'q006', taskId: 't001', taskTitle: '普通话朗读采集', userId: 'u006', userNickname: '用户F', type: 'voice', submittedAt: '2026-07-14 11:00', modelScore: 45, modelPassed: false, qcStatus: 'rejected', duration: 3 },
  { id: 'q007', taskId: 't003', taskTitle: '多轮对话文本转写', userId: 'u007', userNickname: '用户G', type: 'text', submittedAt: '2026-07-14 09:30', modelScore: 82, modelPassed: true, qcStatus: 'passed', content: '客服：感谢您的来电，请问有什么需要帮助的？' },
  { id: 'q008', taskId: 't002', taskTitle: '图片场景标注', userId: 'u008', userNickname: '用户H', type: 'image', submittedAt: '2026-07-14 08:15', modelScore: 91, modelPassed: true, qcStatus: 'passed', imageCount: 10 },
];

export const ADMIN_USERS: AdminUser[] = [
  { id: 'u001', nickname: '语言达人小明', phone: '138****0001', language: '普通话', tags: ['认证用户', '语音达人'], level: 4, points: 1580, totalEarned: 3200, taskCount: 45, passRate: 96, joinedAt: '2026-03-15', verified: true, status: 'active' },
  { id: 'u002', nickname: '标注小红', phone: '139****0002', language: '普通话', tags: ['文本标注'], level: 3, points: 860, totalEarned: 1800, taskCount: 28, passRate: 92, joinedAt: '2026-04-20', verified: true, status: 'active' },
  { id: 'u003', nickname: '数据采集爱好者', phone: '137****0003', language: '普通话/粤语', tags: ['粤语认证', '方言达人'], level: 5, points: 2340, totalEarned: 5600, taskCount: 89, passRate: 98, joinedAt: '2026-01-10', verified: true, status: 'active' },
  { id: 'u004', nickname: '小王同学', phone: '136****0004', language: '普通话', tags: [], level: 1, points: 60, totalEarned: 60, taskCount: 2, passRate: 80, joinedAt: '2026-07-13', verified: false, status: 'active' },
  { id: 'u005', nickname: '方言达人阿龙', phone: '135****0005', language: '粤语/闽南语', tags: ['粤语认证', '闽南语认证'], level: 5, points: 3100, totalEarned: 7800, taskCount: 120, passRate: 99, joinedAt: '2025-11-05', verified: true, status: 'active' },
  { id: 'u006', nickname: '新手用户李四', phone: '133****0006', language: '普通话', tags: [], level: 1, points: 0, totalEarned: 0, taskCount: 0, passRate: 0, joinedAt: '2026-07-14', verified: false, status: 'active' },
];

export const WITHDRAW_RECORDS: WithdrawRecord[] = [
  { id: 'w001', userId: 'u001', userNickname: '语言达人小明', amount: 1000, fee: 67, netAmount: 933, status: 'pending_review', appliedAt: '2026-07-15 09:00' },
  { id: 'w002', userId: 'u003', userNickname: '数据采集爱好者', amount: 2000, fee: 135, netAmount: 1865, status: 'processing', appliedAt: '2026-07-14 16:30', processedAt: '2026-07-15 10:00' },
  { id: 'w003', userId: 'u005', userNickname: '方言达人阿龙', amount: 3000, fee: 202, netAmount: 2798, status: 'paid', appliedAt: '2026-07-10 11:00', processedAt: '2026-07-12 14:00' },
  { id: 'w004', userId: 'u002', userNickname: '标注小红', amount: 500, fee: 33, netAmount: 467, status: 'paid', appliedAt: '2026-07-05 15:00', processedAt: '2026-07-07 09:00' },
  { id: 'w005', userId: 'u001', userNickname: '语言达人小明', amount: 800, fee: 54, netAmount: 746, status: 'failed', appliedAt: '2026-07-01 10:00', processedAt: '2026-07-03 10:00' },
  { id: 'w006', userId: 'u003', userNickname: '数据采集爱好者', amount: 1500, fee: 101, netAmount: 1399, status: 'paid', appliedAt: '2026-06-25 14:00', processedAt: '2026-06-27 11:00' },
];

export const DASHBOARD_STATS = {
  totalUsers: 8432,
  activeUsers: 1205,
  totalTasks: 5,
  activeTasks: 5,
  totalSubmissions: 24580,
  pendingQC: 8,
  totalPointsIssued: 1248600,
  totalWithdrawn: 89450,
  dailySubmissions: [
    { date: '07-09', count: 320 },
    { date: '07-10', count: 450 },
    { date: '07-11', count: 380 },
    { date: '07-12', count: 520 },
    { date: '07-13', count: 490 },
    { date: '07-14', count: 610 },
    { date: '07-15', count: 280 },
  ],
  taskTypeDistribution: [
    { name: '语音采集', value: 45 },
    { name: '文本采集', value: 35 },
    { name: '图片采集', value: 20 },
  ],
  passRateTrend: [
    { date: '07-09', rate: 88 },
    { date: '07-10', rate: 91 },
    { date: '07-11', rate: 87 },
    { date: '07-12', rate: 93 },
    { date: '07-13', rate: 90 },
    { date: '07-14', rate: 94 },
    { date: '07-15', rate: 92 },
  ],
};

export const TEXT_SAMPLES = [
  '今天的天气格外晴朗，阳光照耀大地，让人心情愉悦。',
  '科技的发展日新月异，人工智能正在改变我们的生活方式。',
  '数据是人工智能的燃料，高质量的数据集对模型训练至关重要。',
  '语言是人类智慧的结晶，也是机器学习理解世界的桥梁。',
  '标贝科技致力于构建高质量的语音和语言数据采集平台。',
];

export const USER_PROFILE = {
  id: 'me',
  nickname: '采集达人',
  avatar: '',
  phone: '138****8888',
  gender: '保密',
  birthday: '1996-08-18',
  region: '北京市 朝阳区',
  language: '普通话',
  tags: ['高通过率', '语音达人', '北京地区'],
  level: 3,
  levelName: '银牌采集员',
  exp: 680,
  expToNext: 1000,
  points: 760,
  frozenPoints: 230,
  totalEarned: 2060,
  taskCount: 28,
  passRate: 94,
  inviteCount: 5,
  certifications: ['大模型基础测评', '普通话水平认证'],
  badges: ['新手上路', '首单达成', '连续7天', '邀请达人'],
  verified: false,
  inviteCode: 'BB88888',
};

export const AUTHORIZATION_RECORDS: AuthorizationRecord[] = [
  {
    id: 'auth001',
    organization: '标贝（北京）科技有限公司',
    organizationShortName: '标贝科技',
    project: '普通话语音采集项目',
    purpose: '用于语音识别模型训练与质量评估',
    status: 'active',
    authorizedBy: '张 *',
    authorizerRelation: '本人授权',
    authorizedAt: '2026-07-08 10:32',
    expiresAt: '2027-07-08',
    authorizationMethod: '人脸核验 + 短信确认',
    scopes: [
      { name: '基础身份信息', detail: '昵称、年龄区间、所在地区' },
      { name: '语音样本', detail: '本项目内提交的 20 条普通话录音' },
      { name: '设备信息', detail: '设备型号、系统版本、网络类型' },
    ],
  },
  {
    id: 'auth002',
    organization: '灵犀智能研究院',
    organizationShortName: '灵犀研究院',
    project: '中文情感标注研究',
    purpose: '用于非商业学术研究及数据质量复核',
    status: 'active',
    authorizedBy: '张 *',
    authorizerRelation: '本人授权',
    authorizedAt: '2026-06-21 16:08',
    expiresAt: '2026-12-31',
    authorizationMethod: '短信验证码确认',
    scopes: [
      { name: '任务结果', detail: '情感标签与标注理由' },
      { name: '能力标签', detail: '语言能力、任务通过率' },
    ],
  },
  {
    id: 'auth003',
    organization: '云图数据服务有限公司',
    organizationShortName: '云图数据',
    project: '室内场景图像数据集',
    purpose: '用于室内物体识别模型训练',
    status: 'expired',
    authorizedBy: '张 *',
    authorizerRelation: '本人授权',
    authorizedAt: '2025-05-12 09:20',
    expiresAt: '2026-05-12',
    authorizationMethod: '隐私协议勾选确认',
    scopes: [
      { name: '图像样本', detail: '该项目内提交的 10 张室内场景照片' },
      { name: '标注结果', detail: '物体分类标签与场景标签' },
    ],
  },
];
