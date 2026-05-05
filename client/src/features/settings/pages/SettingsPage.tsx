import { useEffect, useState } from 'react';
import type { ClientConfig, FileParserProvider, ImageModelProvider } from '../../../shared/types';
import type { SettingsPageState } from '../types';

type SettingsTab = 'general' | 'text-model' | 'image-model' | 'file-parser' | 'about';

const settingsTabs: Array<{ id: SettingsTab; label: string }> = [
  { id: 'general', label: '通用' },
  { id: 'text-model', label: '文本模型' },
  { id: 'image-model', label: '生图模型' },
  { id: 'file-parser', label: '文件解析' },
  { id: 'about', label: '关于' },
];

const imageProviders: Array<{ value: ImageModelProvider; label: string }> = [
  { value: 'volcengine', label: '火山方舟' },
  { value: 'google-ai-studio', label: 'Google AI Studio' },
];

const fileParserProviders: Array<{ value: FileParserProvider; label: string }> = [
  { value: 'local', label: '本地解析' },
  { value: 'mineru-accurate-api', label: 'MinerU-精准解析 API' },
  { value: 'mineru-agent-api', label: 'MinerU-Agent 轻量解析 API' },
];

const parserOptions = [
  {
    title: '本地解析',
    badge: '推荐默认',
    tone: 'primary',
    summary: '覆盖大多数 Word 和带文字层 PDF，速度快、无调用限制。',
    items: [
      ['Token', '无需'],
      ['解析速度', '快'],
      ['支持格式', 'pdf、jpeg、png、docx、doc、wps、ofd'],
      ['大小/页数', '无限制'],
      ['解析质量', '高'],
      ['扫描件', '不支持'],
    ],
  },
  {
    title: 'MinerU 精准解析 API',
    badge: '扫描件兜底',
    tone: 'accent',
    summary: '解析质量高，适合本地解析失败或扫描件质量要求高的文档。',
    items: [
      ['Token', '需要'],
      ['解析速度', '慢'],
      ['支持格式', 'pdf、jpeg、png、docx'],
      ['大小/页数', '≤ 200MB / ≤ 200 页'],
      ['解析质量', '高'],
      ['扫描件', '支持'],
    ],
  },
  {
    title: 'MinerU-Agent 轻量解析 API',
    badge: '轻量备用',
    tone: 'muted',
    summary: '无需 Token 但存在 IP 限频，适合轻量文档的备用解析。',
    items: [
      ['Token', '无需（IP 限频）'],
      ['解析速度', '中等'],
      ['支持格式', 'pdf、jpeg、png、docx'],
      ['大小/页数', '≤ 10MB / ≤ 20 页'],
      ['解析质量', '中'],
      ['扫描件', '质量差'],
    ],
  },
];

const initialState: SettingsPageState = {
  textModel: {
    api_key: '',
    base_url: '',
    model_name: 'gpt-3.5-turbo',
  },
  imageModel: {
    provider: 'volcengine',
    api_key: '',
    model_name: '',
  },
  fileParser: {
    provider: 'local',
    mineru_token: '',
  },
};

function SettingsPage() {
  const [state, setState] = useState<SettingsPageState>(initialState);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [textModels, setTextModels] = useState<string[]>([]);
  const [imageModels, setImageModels] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadTextConfig();
  }, []);

  const loadTextConfig = async () => {
    try {
      const config = await window.yibiao?.config.load();
      if (!config) {
        return;
      }

      setState((prev) => ({
        ...prev,
        textModel: {
          api_key: config.api_key,
          base_url: config.base_url || '',
          model_name: config.model_name,
        },
        imageModel: config.image_model,
        fileParser: config.file_parser,
      }));
    } catch (error) {
      console.warn('加载客户端配置失败:', error);
    }
  };

  const createClientConfig = (): ClientConfig => ({
    api_key: state.textModel.api_key,
    base_url: state.textModel.base_url,
    model_name: state.textModel.model_name,
    image_model: state.imageModel,
    file_parser: state.fileParser,
  });

  const saveTextConfig = async () => {
    const result = await window.yibiao?.config.save(createClientConfig());
    setMessage(result?.success ? '文本模型配置已保存' : result?.message || '文本模型配置已保存');
  };

  const saveImageConfig = async () => {
    const result = await window.yibiao?.config.save(createClientConfig());
    setMessage(result?.success ? '生图模型配置已保存' : result?.message || '生图模型配置已保存');
  };

  const saveFileParserConfig = async () => {
    const result = await window.yibiao?.config.save(createClientConfig());
    setMessage(result?.success ? '文件解析配置已保存' : result?.message || '文件解析配置已保存');
  };

  const fetchTextModels = async () => {
    const result = await window.yibiao?.config.listModels();
    setTextModels(result?.models || []);
    setMessage(result?.message || `获取到 ${result?.models.length || 0} 个文本模型`);
  };

  const fetchImageModels = async () => {
    setImageModels([]);
    setMessage('生图模型列表接口已预留，后续按服务商分别接入。');
  };

  return (
    <div className="settings-page">
      <div className="settings-tab-shell" role="tablist" aria-label="设置分类">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`settings-tab ${activeTab === tab.id ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message && <div className="settings-message">{message}</div>}

      {activeTab === 'general' && (
        <section className="settings-page-section">
          <div className="settings-section-title">
            <span />
            <strong>通用</strong>
          </div>
          <div className="settings-list">
            <div className="settings-row">
              <div className="settings-row-copy">
                <strong>显示语言</strong>
                <span>选择界面的显示语言</span>
              </div>
              <select value="zh-CN" disabled>
                <option value="zh-CN">简体中文</option>
              </select>
            </div>
            <div className="settings-row">
              <div className="settings-row-copy">
                <strong>应用主题</strong>
                <span>切换深色或浅色模式</span>
              </div>
              <select value="system" disabled>
                <option value="system">跟随系统</option>
              </select>
            </div>
            <div className="settings-row">
              <div className="settings-row-copy">
                <strong>侧边栏布局</strong>
                <span>保持当前经典布局，后续可扩展为紧凑布局</span>
              </div>
              <select value="classic" disabled>
                <option value="classic">经典布局</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'text-model' && (
        <section className="settings-page-section">
          <div className="settings-section-title">
            <span />
            <strong>文本模型配置</strong>
          </div>
          <div className="settings-list">
            <label className="settings-row">
              <div className="settings-row-copy">
                <strong>Base URL</strong>
                <span>OpenAI Like 接口地址，用于文本生成和分析任务</span>
              </div>
              <input
                type="text"
                value={state.textModel.base_url}
              placeholder="例如 https://api.openai.com/v1"
              onChange={(event) => setState((prev) => ({
                ...prev,
                  textModel: { ...prev.textModel, base_url: event.target.value },
                }))}
              />
            </label>
            <label className="settings-row">
              <div className="settings-row-copy">
                <strong>API Key</strong>
                <span>仅保存在本机配置文件中，不暴露给 Renderer 以外的原始能力</span>
              </div>
              <input
                type="password"
                value={state.textModel.api_key}
              placeholder="请输入文本模型 API Key"
              onChange={(event) => setState((prev) => ({
                ...prev,
                  textModel: { ...prev.textModel, api_key: event.target.value },
                }))}
              />
            </label>
            <label className="settings-row">
              <div className="settings-row-copy">
                <strong>模型名称</strong>
                <span>可手动录入，也可从当前 Base URL 拉取可用模型</span>
              </div>
              <div className="settings-control-with-action">
                {textModels.length > 0 ? (
                  <select
                    value={state.textModel.model_name}
                    onChange={(event) => setState((prev) => ({
                      ...prev,
                      textModel: { ...prev.textModel, model_name: event.target.value },
                    }))}
                  >
                    {textModels.map((model) => <option value={model} key={model}>{model}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={state.textModel.model_name}
                    placeholder="例如 deepseek-chat"
                    onChange={(event) => setState((prev) => ({
                      ...prev,
                      textModel: { ...prev.textModel, model_name: event.target.value },
                    }))}
                  />
                )}
                <button type="button" className="inline-action" onClick={fetchTextModels}>获取</button>
              </div>
            </label>
          </div>
          <div className="settings-actions">
            <button type="button" className="primary-action" onClick={saveTextConfig}>保存文本模型配置</button>
          </div>
        </section>
      )}

      {activeTab === 'image-model' && (
        <section className="settings-page-section">
          <div className="settings-section-title">
            <span />
            <strong>生图模型配置</strong>
          </div>
          <div className="settings-list">
            <label className="settings-row">
              <div className="settings-row-copy">
                <strong>服务提供商</strong>
                <span>各家生图接口不统一，先选择服务商再配置模型</span>
              </div>
              <select
                value={state.imageModel.provider}
                onChange={(event) => setState((prev) => ({
                ...prev,
                imageModel: { ...prev.imageModel, provider: event.target.value as ImageModelProvider },
              }))}
            >
              {imageProviders.map((provider) => (
                  <option value={provider.value} key={provider.value}>{provider.label}</option>
                ))}
              </select>
            </label>
            <label className="settings-row">
              <div className="settings-row-copy">
                <strong>API Key</strong>
                <span>用于图片生成能力，当前仅保存配置，调用接口后续接入</span>
              </div>
              <input
                type="password"
                value={state.imageModel.api_key}
              placeholder="请输入生图服务 API Key"
              onChange={(event) => setState((prev) => ({
                ...prev,
                  imageModel: { ...prev.imageModel, api_key: event.target.value },
                }))}
              />
            </label>
            <label className="settings-row">
              <div className="settings-row-copy">
                <strong>模型名称</strong>
                <span>可手动录入，也可按服务商拉取模型列表</span>
              </div>
              <div className="settings-control-with-action">
                {imageModels.length > 0 ? (
                  <select
                    value={state.imageModel.model_name}
                    onChange={(event) => setState((prev) => ({
                      ...prev,
                      imageModel: { ...prev.imageModel, model_name: event.target.value },
                    }))}
                  >
                    {imageModels.map((model) => <option value={model} key={model}>{model}</option>)}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={state.imageModel.model_name}
                    placeholder="可手动录入模型名称"
                    onChange={(event) => setState((prev) => ({
                      ...prev,
                      imageModel: { ...prev.imageModel, model_name: event.target.value },
                    }))}
                  />
                )}
                <button type="button" className="inline-action" onClick={fetchImageModels}>获取</button>
              </div>
            </label>
          </div>
          <div className="settings-actions">
            <button type="button" className="primary-action" onClick={saveImageConfig}>保存生图模型配置</button>
          </div>
        </section>
      )}

      {activeTab === 'file-parser' && (
        <section className="settings-page-section">
          <div className="settings-section-title">
            <span />
            <strong>文件解析配置</strong>
          </div>
          <div className="settings-list">
            <label className="settings-row">
              <div className="settings-row-copy">
                <strong>文件解析方式</strong>
                <span>优先使用本地解析，复杂扫描件可尝试 MinerU 精准解析 API</span>
              </div>
              <select
                value={state.fileParser.provider}
                onChange={(event) => setState((prev) => ({
                ...prev,
                fileParser: { ...prev.fileParser, provider: event.target.value as FileParserProvider },
              }))}
            >
              {fileParserProviders.map((provider) => (
                  <option value={provider.value} key={provider.value}>{provider.label}</option>
                ))}
              </select>
            </label>
            {state.fileParser.provider === 'mineru-accurate-api' && (
              <label className="settings-row">
                <div className="settings-row-copy">
                  <strong>MinerU Token</strong>
                  <span>仅精准解析 API 需要 Token；轻量解析和本地解析无需填写</span>
                </div>
                <input
                  type="password"
                  value={state.fileParser.mineru_token || ''}
                  placeholder="请输入 MinerU Token"
                  onChange={(event) => setState((prev) => ({
                    ...prev,
                    fileParser: { ...prev.fileParser, mineru_token: event.target.value },
                  }))}
                />
              </label>
            )}
          </div>

          <div className="parser-compare">
            {parserOptions.map((option) => (
              <article className={`parser-card parser-card-${option.tone}`} key={option.title}>
                <div className="parser-card-head">
                  <div>
                    <strong>{option.title}</strong>
                    <p>{option.summary}</p>
                  </div>
                  <span>{option.badge}</span>
                </div>
                <dl className="parser-metrics">
                  {option.items.map(([label, value]) => (
                    <div key={`${option.title}-${label}`}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
          <div className="parser-note">
            招标文件大多数是 Word 或 Word 导出的带文字层 PDF，本地解析可以适应 95% 以上的情况；如果解析失败，再尝试 MinerU 精准解析 API。
          </div>
          <div className="settings-actions">
            <button type="button" className="primary-action" onClick={saveFileParserConfig}>保存文件解析配置</button>
          </div>
        </section>
      )}

      {activeTab === 'about' && (
        <section className="settings-page-section about-section">
          <div className="settings-section-title">
            <span />
            <strong>关于</strong>
          </div>
          <div className="about-grid">
            <div><span>当前版本</span><strong>0.1.0</strong></div>
            <div><span>GitHub 仓库</span><a href="https://github.com/yibiaoai/yibiao-simple" target="_blank" rel="noreferrer">yibiaoai/yibiao-simple</a></div>
            <div><span>自动更新</span><strong>暂未接入，接口已预留</strong></div>
            <div><span>运行模式</span><strong>独立 Electron 客户端</strong></div>
          </div>
        </section>
      )}
    </div>
  );
}

export default SettingsPage;
