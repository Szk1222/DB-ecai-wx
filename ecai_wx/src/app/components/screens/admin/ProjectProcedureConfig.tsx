import { useState } from 'react';
import { DownOutlined, DragOutlined, EditOutlined, NodeIndexOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Dropdown, Form, Input, InputNumber, message, Modal, Row, Select, Space, Switch, Table, Tag, Upload } from 'antd';

type EditingSection = 'process' | null;

interface ProjectProcessStep {
  id: string;
  name: string;
  role: string;
  enabled: boolean;
  modelReview: boolean;
}

const PROCESS_STEPS: ProjectProcessStep[] = [
  { id: 'start', name: '开始', role: '系统自动', enabled: true, modelReview: false },
  { id: 'machine-review', name: '模型智能审核', role: '系统自动', enabled: true, modelReview: true },
  { id: 'collect', name: '数据采集', role: '采集用户', enabled: true, modelReview: false },
  { id: 'acceptance', name: '项目验收', role: '项目管理员', enabled: true, modelReview: false },
  { id: 'complete', name: '完成', role: '系统自动', enabled: true, modelReview: false },
];

export function ProjectProcedureConfig({ projectName, template, projectType }: {
  projectName: string;
  template: string;
  projectType: 'voice' | 'text' | 'image' | 'mixed';
}) {
  const [editing, setEditing] = useState<EditingSection>(null);
  const [processImportListOpen, setProcessImportListOpen] = useState(false);
  const [processFileImportOpen, setProcessFileImportOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState('machine-review');
  const [draggingStepId, setDraggingStepId] = useState<string | null>(null);
  const [processForm] = Form.useForm();
  const [processConfig, setProcessConfig] = useState({
    name: '标准语音采集质检流程',
    category: projectType,
    version: 'v5',
    template,
    updatedAt: '2026-07-20 16:42',
    steps: PROCESS_STEPS.map((step) => ({ ...step })),
  });
  const [modelConfig, setModelConfig] = useState({
    abilities: ['清晰度检测', '完整度检测', '文本匹配', '噪音检测'],
    abilityThresholds: {
      清晰度检测: 80,
      完整度检测: 85,
      文本匹配: 90,
      噪音检测: 75,
    } as Record<string, number>,
    abilityEnabled: {
      清晰度检测: true,
      完整度检测: true,
      文本匹配: true,
      噪音检测: true,
    } as Record<string, boolean>,
  });
  const [collectionConfig, setCollectionConfig] = useState({
    minimumProgress: 100,
    submissionMode: 'whole_task',
    allowDraftSave: true,
    requireAllFields: true,
    allowResubmit: true,
    maxResubmissions: 3,
  });

  const beginEdit = () => {
    setEditing('process');
    processForm.setFieldsValue(processConfig);
  };

  const saveProcess = async () => {
    const values = await processForm.validateFields();
    setProcessConfig((current) => ({ ...current, ...values, updatedAt: '刚刚' }));
    setEditing(null);
    message.success('项目流程配置已更新');
  };

  const updateProcessStep = (id: string, patch: Partial<ProjectProcessStep>) => {
    setProcessConfig((current) => ({
      ...current,
      steps: current.steps.map((step) => step.id === id ? { ...step, ...patch } : step),
    }));
  };

  const reorderProcessStep = (targetId: string) => {
    if (!draggingStepId || draggingStepId === targetId) return;
    const source = processConfig.steps.find((step) => step.id === draggingStepId);
    const target = processConfig.steps.find((step) => step.id === targetId);
    if (!source || !target) return;
    setProcessConfig((current) => {
      const next = current.steps.filter((step) => step.id !== draggingStepId);
      const targetIndex = next.findIndex((step) => step.id === targetId);
      next.splice(targetIndex, 0, source);
      return { ...current, steps: next };
    });
    setDraggingStepId(null);
  };

  const importProcess = (name: string, version = 'v1') => {
    setProcessConfig((current) => ({
      ...current,
      name,
      version,
      updatedAt: '刚刚',
      steps: PROCESS_STEPS.map((step) => ({ ...step })),
    }));
    processForm.setFieldsValue({ name, category: projectType, template });
    setProcessImportListOpen(false);
    setProcessFileImportOpen(false);
    message.success(`已导入“${name}”的工序配置，请检查后保存`);
  };

  return <div className="pm-procedure-config">
    <Card
      className="pm-project-config-card"
      title={<span><NodeIndexOutlined /> 流程配置</span>}
      extra={<Space>
        {editing === 'process' && <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'file', label: '导入已有文件', icon: <UploadOutlined /> },
              { key: 'list', label: '从已有列表中选择', icon: <NodeIndexOutlined /> },
            ],
            onClick: ({ key }) => key === 'list' ? setProcessImportListOpen(true) : setProcessFileImportOpen(true),
          }}
        ><Button icon={<UploadOutlined />}>导入 <DownOutlined /></Button></Dropdown>}
        {editing !== 'process' && <Button icon={<EditOutlined />} onClick={beginEdit}>编辑</Button>}
      </Space>}
    >
      
      {editing === 'process' ? (
        <Form form={processForm} layout="vertical" requiredMark="optional">
          <div className="config-form-section">
            <div className="config-section-title"><span className="config-section-index">01</span>流程基础信息</div>
            <Row gutter={14}>
              <Col span={10}><Form.Item label="流程名称" name="name" rules={[{ required: true }]}><Input /></Form.Item></Col>
              <Col span={6}><Form.Item label="业务分类" name="category"><Select disabled options={[{ value: 'voice', label: '语音采集' }, { value: 'text', label: '文本采集' }, { value: 'image', label: '图片采集' }, { value: 'mixed', label: '多模态采集' }]} /></Form.Item></Col>
              <Col span={8}><Form.Item label="关联模板" name="template"><Input disabled /></Form.Item></Col>
            </Row>
          </div>
          <div className="config-form-section">
            <div className="config-section-title"><span className="config-section-index">02</span>工序编排</div>
            <div className="pm-process-builder">
              <div className="pm-process-builder-list">
                <div className="pm-process-builder-hint">所有工序默认开启，可拖拽调整执行顺序</div>
                {processConfig.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`pm-process-builder-item ${selectedStepId === step.id ? 'is-selected' : ''} ${!step.enabled ? 'is-disabled' : ''}`}
                    draggable
                    onDragStart={() => setDraggingStepId(step.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => reorderProcessStep(step.id)}
                    onClick={() => setSelectedStepId(step.id)}
                  >
                    <span className="pm-process-builder-index">{String(index + 1).padStart(2, '0')}</span>
                    <DragOutlined />
                    <div><b>{step.name}</b><small>{step.role}{!step.enabled ? ' · 已停用' : ''}</small></div>
                    <Tag color={step.enabled ? 'blue' : 'default'}>{step.enabled ? '已开启' : '已关闭'}</Tag>
                  </div>
                ))}
              </div>
              {(() => {
                const selectedStep = processConfig.steps.find((step) => step.id === selectedStepId) ?? processConfig.steps[0];
                return <div className="pm-process-step-settings">
                  <div className="pm-preview-section-title">工序设置</div>
                  <label><span>工序名称</span><Input value={selectedStep.name} disabled /></label>
                  <label><span>执行角色</span><Select value={selectedStep.role} disabled options={[{ value: selectedStep.role, label: selectedStep.role }]} /></label>
                  {selectedStep.modelReview ? (
                    <>
                      <label><span>启用模型智能审核</span><div className="pm-switch-setting"><Switch checked={selectedStep.enabled} onChange={(enabled) => updateProcessStep(selectedStep.id, { enabled })} /><small>{selectedStep.enabled ? '模型参与流程执行' : '已跳过模型审核'}</small></div></label>
                      <div className="pm-preview-section-title">检测能力运行参数</div>
                      {modelConfig.abilities.map((ability) => {
                        const abilityEnabled = modelConfig.abilityEnabled[ability] !== false;
                        return <label key={ability}>
                          <div className="pm-ability-setting-header">
                            <span>{ability}</span>
                            <div>
                              <small>{abilityEnabled ? '已开启，可单独设置阈值' : '该检测点不参与审核'}</small>
                            <Switch
                              checked={abilityEnabled}
                              onChange={(enabled) => setModelConfig((current) => ({
                                ...current,
                                abilityEnabled: { ...current.abilityEnabled, [ability]: enabled },
                              }))}
                            />
                            </div>
                          </div>
                          <InputNumber
                            min={0}
                            max={100}
                            disabled={!abilityEnabled}
                            value={modelConfig.abilityThresholds[ability] ?? 80}
                            suffix="分"
                            style={{ width: '100%' }}
                            onChange={(value) => setModelConfig((current) => ({
                              ...current,
                              abilityThresholds: { ...current.abilityThresholds, [ability]: value ?? 0 },
                            }))}
                          />
                        </label>;
                      })}
                    </>
                  ) : selectedStep.id === 'collect' ? (
                    <>
                      <div className="pm-preview-section-title">采集提交规则</div>
                      <label>
                        <span>最低完成进度</span>
                        <InputNumber min={1} max={100} suffix="%" value={collectionConfig.minimumProgress} style={{ width: '100%' }} onChange={(value) => setCollectionConfig((current) => ({ ...current, minimumProgress: value ?? 100 }))} />
                      </label>
                      <label>
                        <span>数据提交方式</span>
                        <Select
                          value={collectionConfig.submissionMode}
                          onChange={(submissionMode) => setCollectionConfig((current) => ({ ...current, submissionMode }))}
                          options={[
                            { value: 'single_item', label: '支持单条数据提交' },
                            { value: 'whole_task', label: '必须整条作业提交' },
                          ]}
                        />
                      </label>
                      <label><span>自动保存草稿</span><div className="pm-switch-setting"><Switch checked={collectionConfig.allowDraftSave} onChange={(allowDraftSave) => setCollectionConfig((current) => ({ ...current, allowDraftSave }))} /><small>采集过程中自动保存未提交内容</small></div></label>
                      <label><span>提交前校验必填项</span><div className="pm-switch-setting"><Switch checked={collectionConfig.requireAllFields} onChange={(requireAllFields) => setCollectionConfig((current) => ({ ...current, requireAllFields }))} /><small>存在缺失内容时阻止提交</small></div></label>
                      <label><span>允许驳回后重新提交</span><div className="pm-switch-setting"><Switch checked={collectionConfig.allowResubmit} onChange={(allowResubmit) => setCollectionConfig((current) => ({ ...current, allowResubmit }))} /><small>开启后可设置最大重提次数</small></div></label>
                      <label>
                        <span>最大重新提交次数</span>
                        <InputNumber min={1} max={10} suffix="次" disabled={!collectionConfig.allowResubmit} value={collectionConfig.maxResubmissions} style={{ width: '100%' }} onChange={(value) => setCollectionConfig((current) => ({ ...current, maxResubmissions: value ?? 1 }))} />
                      </label>
                    </>
                  ) : (
                    <label><span>启用状态</span><div className="pm-switch-setting"><Switch checked={selectedStep.enabled} onChange={(enabled) => updateProcessStep(selectedStep.id, { enabled })} /><small>{selectedStep.enabled ? '参与流程执行' : '暂不执行'}</small></div></label>
                  )}
                </div>;
              })()}
            </div>
          </div>
          <div className="pm-inline-edit-footer"><Button onClick={() => setEditing(null)}>取消</Button><Button type="primary" icon={<SaveOutlined />} onClick={saveProcess}>保存修改</Button></div>
        </Form>
      ) : (
        <>
          <Descriptions column={3} size="small" items={[
            { key: 'name', label: '流程名称', children: processConfig.name },
            { key: 'version', label: '版本', children: <Tag color="cyan">{processConfig.version}</Tag> },
            { key: 'category', label: '业务分类', children: projectType === 'image' ? '图片采集' : projectType === 'text' ? '文本采集' : projectType === 'mixed' ? '多模态采集' : '语音采集' },
            { key: 'template', label: '关联模板', children: processConfig.template, span: 2 },
            { key: 'updated', label: '最近更新', children: processConfig.updatedAt },
          ]} />
          <div className="pm-preview-section-title">工序编排</div>
          <div className="pm-process-preview">{processConfig.steps.filter((step) => step.enabled).map((step, index, list) => <span key={step.id}><Tag color="blue">{step.name}</Tag>{index < list.length - 1 && <i>›</i>}</span>)}</div>
        </>
      )}
    </Card>

    <Modal title="选择已有工序配置" open={processImportListOpen} footer={null} width={720} onCancel={() => setProcessImportListOpen(false)}>
      <Table
        rowKey="name"
        pagination={false}
        dataSource={[
          { name: '标准语音采集质检流程', version: 'v5', updatedAt: '2026-07-20 16:42' },
          { name: '自然对话采集二次复检流程', version: 'v3', updatedAt: '2026-07-18 11:08' },
          { name: '文本改写双重质检流程', version: 'v1', updatedAt: '2026-07-16 09:30' },
        ]}
        columns={[
          { title: '流程名称', dataIndex: 'name' },
          { title: '版本', dataIndex: 'version', width: 100 },
          { title: '最近更新', dataIndex: 'updatedAt', width: 170 },
          { title: '操作', width: 80, render: (_: unknown, item: { name: string; version: string }) => <Button type="link" onClick={() => importProcess(item.name, item.version)}>选择</Button> },
        ]}
      />
    </Modal>
    <Modal title="导入已有工序配置文件" open={processFileImportOpen} footer={null} onCancel={() => setProcessFileImportOpen(false)}>
      <Upload.Dragger
        accept=".json,.yaml,.yml"
        maxCount={1}
        beforeUpload={(file) => {
          importProcess(file.name.replace(/\.(json|ya?ml)$/i, ''));
          return false;
        }}
      >
        <p className="ant-upload-drag-icon"><UploadOutlined /></p>
        <p className="ant-upload-text">点击或拖拽配置文件到此处</p>
        <p className="ant-upload-hint">支持 JSON、YAML 格式，导入后可继续编辑</p>
      </Upload.Dragger>
    </Modal>
  </div>;
}
