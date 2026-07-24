export const DEFAULT_MODEL_THRESHOLDS = {
  clarity: 85,
  completeness: 92,
  transcriptMatch: 95,
  noiseLimit: 70,
  pauseDuration: 2,
  autoPass: 90,
  manualReview: 75,
};

export const MODEL_SCORING_METRICS = [
  { key: 'clarity', title: '音频清晰度', suffix: '分', direction: 'min', model: { id: 'MOD-VOICE-01', name: '语音质量检测 Pro', code: 'voice-qc-pro', version: 'v3.4.2' } },
  { key: 'completeness', title: '内容完整性', suffix: '分', direction: 'min', model: { id: 'MOD-TEXT-03', name: '文本合规与完整性', code: 'text-qc-general', version: 'v1.9.6' } },
  { key: 'transcriptMatch', title: '朗读文本一致率', suffix: '%', direction: 'min', model: { id: 'MOD-ASR-02', name: '朗读一致性识别', code: 'asr-match-cn', version: 'v2.8.0' } },
  { key: 'noiseLimit', title: '环境噪音', suffix: 'dB', direction: 'max', model: { id: 'MOD-VOICE-01', name: '语音质量检测 Pro', code: 'voice-qc-pro', version: 'v3.4.2' } },
  { key: 'pauseDuration', title: '最长异常停顿', suffix: '秒', direction: 'max', model: { id: 'MOD-VOICE-01', name: '语音质量检测 Pro', code: 'voice-qc-pro', version: 'v3.4.2' } },
] as const;

export type ModelScoringMetricKey = typeof MODEL_SCORING_METRICS[number]['key'];
