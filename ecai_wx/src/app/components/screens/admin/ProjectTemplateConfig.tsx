import { useState } from 'react';
import { EditOutlined, FileTextOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, message, Space, Tag } from 'antd';
import { ConfigCreateDrawer, CreatedConfigPayload } from './ConfigCreateDrawer';

const CATEGORY_LABEL = {
  voice: '语音采集',
  text: '文本采集',
  image: '图片采集',
  mixed: '多模态采集',
};

export function ProjectTemplateConfig({
  projectId,
  projectName,
  template,
  templateVersion,
  projectType,
}: {
  projectId: string;
  projectName: string;
  template: string;
  templateVersion: string;
  projectType: 'voice' | 'text' | 'image' | 'mixed';
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState({
    id: `TPL-${projectId.replace('prj-', '').toUpperCase()}-CURRENT`,
    name: template,
    version: templateVersion,
    category: projectType,
    updatedAt: '2026-07-16 17:42',
    updatedBy: '运营管理员',
    format: projectType === 'voice' ? 'WAV' : projectType === 'image' ? 'JPG / PNG' : 'TXT',
    sampleRate: projectType === 'voice' ? '16 kHz' : '—',
    channel: projectType === 'voice' ? '单声道' : '—',
    qualityTags: projectType === 'voice'
      ? ['环境噪音检测', '录音文本一致性', '异常停顿检测', '音频完整性']
      : ['内容完整性', '格式规范', '敏感信息检测'],
  });

  const applyTemplate = (payload: CreatedConfigPayload) => {
    const values = payload.data as Record<string, unknown>;
    setCurrentTemplate((current) => ({
      ...current,
      id: payload.id,
      name: payload.name,
      version: payload.version,
      category: payload.category,
      updatedAt: '刚刚',
      updatedBy: '运营管理员',
      format: String(values.format ?? current.format),
      sampleRate: values.sampleRate ? `${Number(values.sampleRate) / 1000} kHz` : current.sampleRate,
      channel: values.channel === 'stereo' ? '双声道' : values.channel === 'mono' ? '单声道' : current.channel,
      qualityTags: Array.isArray(values.qualityTags) ? values.qualityTags as string[] : current.qualityTags,
    }));
    setCreateOpen(false);
    message.success('模板配置已应用到当前项目');
  };

  return (
    <div className="pm-procedure-config">
      <Card
        className="pm-project-config-card"
        title={<span><FileTextOutlined /> 当前模板配置</span>}
        extra={<Space>
          <Button icon={<EditOutlined />} onClick={() => setCreateOpen(true)}>编辑模板</Button>
        </Space>}
      >
        
        <div className="pm-current-template-hero">
          <div className="pm-current-template-hero__icon"><FileTextOutlined /></div>
          <div>
            <h3>{currentTemplate.name}</h3>
            <span>{currentTemplate.id}</span>
          </div>
          <Tag color="success">当前使用</Tag>
        </div>
        <Descriptions
          column={3}
          size="small"
          items={[
            { key: 'version', label: '版本', children: <Tag color="cyan">{currentTemplate.version}</Tag> },
            { key: 'category', label: '业务分类', children: CATEGORY_LABEL[currentTemplate.category] },
            { key: 'updated', label: '最近更新', children: `${currentTemplate.updatedAt} · ${currentTemplate.updatedBy}` },
            { key: 'format', label: '数据格式', children: currentTemplate.format },
            { key: 'sampleRate', label: '采样率', children: currentTemplate.sampleRate },
            { key: 'channel', label: '声道', children: currentTemplate.channel },
          ]}
        />
        <div className="pm-preview-section-title">质检关注项</div>
        <Space wrap>{currentTemplate.qualityTags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</Space>
      </Card>
      <ConfigCreateDrawer
        type={createOpen ? 'template' : null}
        open={createOpen}
        mode="edit"
        project={{ id: projectId, name: projectName, category: projectType }}
        onClose={() => setCreateOpen(false)}
        onCreated={applyTemplate}
      />
    </div>
  );
}
