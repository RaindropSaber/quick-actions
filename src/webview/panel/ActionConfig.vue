<template>
  <div class="app">
    <div class="header">
      <h1>Smart Actions 配置</h1>
      <div class="header-buttons">
        <button @click="toggleAiConfig" class="btn-secondary">
          <span class="icon">🤖</span>
          AI 配置
        </button>
        <button @click="addAction" class="btn-primary">
          <span class="icon">+</span>
          添加Action
        </button>
      </div>
    </div>

    <!-- AI 全局配置区域 -->
    <div v-if="showAiConfig" class="ai-config-section">
      <div class="config-form">
        <div class="form-group">
          <label>API Key *</label>
          <div class="api-key-group">
            <input
              v-model="aiConfig.apiKey"
              :type="showApiKey ? 'text' : 'password'"
              placeholder="请输入您的 AI API Key (如: sk-...)"
              :class="{ error: !aiConfig.apiKey?.trim() }"
              @input="onAiConfigChange"
            />
            <button type="button" @click="toggleApiKeyVisibility" class="btn-toggle-key">
              <span class="icon">{{ showApiKey ? '🙈' : '👁️' }}</span>
            </button>
          </div>
          <div v-if="!aiConfig.apiKey?.trim()" class="error-message">API Key 不能为空</div>
        </div>

        <div class="form-group">
          <label>Base URL</label>
          <input
            v-model="aiConfig.baseURL"
            placeholder="请输入 API 基础地址，如: https://api.openai.com/v1"
            @input="onAiConfigChange"
          />
          <div class="help-text">API 服务的基础地址，根据您使用的 AI 服务提供商进行配置</div>
        </div>

        <div class="form-group">
          <label>模型</label>
          <input
            v-model="aiConfig.model"
            placeholder="请输入模型名称，如: gpt-3.5-turbo, claude-3, 等"
            @input="onAiConfigChange"
          />
          <div class="help-text">输入您要使用的 AI 模型名称，具体支持的模型取决于您的 API 提供商</div>
        </div>

        <div class="form-group">
          <label>温度 ({{ aiConfig.temperature }})</label>
          <div class="slider-group">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              v-model.number="aiConfig.temperature"
              @input="onAiConfigChange"
              class="temperature-slider"
            />
            <div class="slider-labels">
              <span>保守 (0)</span>
              <span>平衡 (1)</span>
              <span>创新 (2)</span>
            </div>
          </div>
          <div class="help-text">控制 AI 回答的创造性，0 表示更保守，2 表示更有创意</div>
        </div>

        <div class="form-actions">
          <button @click="saveAiConfig" class="btn-primary" :disabled="!isAiConfigValid">
            <span class="icon">💾</span>
            保存配置
          </button>
          <button @click="testAiConfig" class="btn-secondary" :disabled="!isAiConfigValid">
            <span class="icon">🧪</span>
            测试连接
          </button>
        </div>
      </div>
    </div>

    <!-- Action列表 -->
    <div v-if="actions.length === 0" class="empty">
      <div class="empty-icon">⚡</div>
      <p>暂无Actions</p>
      <p class="empty-desc">点击上方按钮添加您的第一个Action</p>
    </div>
    <div v-else class="actions">
      <div v-for="(action, index) in actions" :key="index" class="action">
        <!-- 保存态显示 -->
        <div v-if="editingIndex !== index" class="action-display" @click="edit(index)">
          <div class="action-header">
            <div class="action-info">
              <span class="name">{{ action.name }}</span>
              <span class="type-badge" :class="`type-${action.type}`">{{ getTypeLabel(action.type) }}</span>
            </div>
            <div class="action-buttons">
              <button @click.stop="edit(index)" class="btn-edit" title="编辑">
                <span class="icon">✏️</span>
              </button>
              <button @click.stop="deleteAction(index)" class="btn-delete" title="删除">
                <span class="icon">🗑️</span>
              </button>
            </div>
          </div>
          <div class="description">{{ action.description || '暂无描述' }}</div>
          <div class="action-details">
            <div v-if="action.type === HandlerType.SCRIPT && action.scriptPath" class="detail-item">
              <span class="detail-label">脚本路径:</span>
              <span class="detail-value">{{ action.scriptPath }}</span>
            </div>
            <div v-if="action.type === HandlerType.BUILTIN && action.builtinType" class="detail-item">
              <span class="detail-label">内置类型:</span>
              <span class="detail-value">{{ getBuiltinTypeLabel(action.builtinType) }}</span>
            </div>
            <div v-if="action.type === HandlerType.AI && action.aiPrompt" class="detail-item">
              <span class="detail-label">AI提示词:</span>
              <span class="detail-value">{{ action.aiPrompt }}</span>
            </div>
          </div>
        </div>

        <!-- 编辑态表单 -->
        <div v-else-if="!!editingAction" class="action-form">
          <div class="form-group">
            <label>Action名称 *</label>
            <input
              v-model="editingAction.name"
              placeholder="请输入Action名称"
              :class="{ error: !editingAction.name.trim() }"
              @input="validateForm"
            />
            <div v-if="!editingAction.name.trim()" class="error-message">Action名称不能为空</div>
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea v-model="editingAction.description" placeholder="请输入Action描述（可选）" rows="2"></textarea>
          </div>

          <div class="form-group">
            <label>类型 *</label>
            <select v-model="editingAction.type" @change="onTypeChange">
              <option v-for="type in HandlerType" :key="type" :value="type">{{ getTypeLabel(type) }}</option>
            </select>
          </div>

          <!-- 内置Action配置 -->
          <div v-if="editingAction.type === HandlerType.BUILTIN" class="form-group">
            <label>内置类型 *</label>
            <select v-model="editingAction.builtinType">
              <option v-for="type in BuiltinType" :key="type" :value="type">{{ getBuiltinTypeLabel(type) }}</option>
            </select>
          </div>

          <!-- AI Action配置 -->
          <div v-if="editingAction.type === HandlerType.AI" class="form-group">
            <label>AI提示词 *</label>
            <textarea
              v-model="editingAction.aiPrompt"
              placeholder="请输入AI提示词，例如：将以下文本翻译成英文"
              rows="3"
              :class="{ error: !editingAction.aiPrompt?.trim() }"
              @input="validateForm"
            ></textarea>
            <div v-if="!editingAction.aiPrompt?.trim()" class="error-message">AI提示词不能为空</div>
          </div>

          <!-- 脚本Action配置 -->
          <div v-if="editingAction.type === HandlerType.SCRIPT" class="form-group">
            <label>脚本路径 *</label>
            <div class="file-input-group">
              <input
                v-model="editingAction.scriptPath"
                placeholder="请输入脚本文件路径或点击选择文件"
                :class="{ error: !editingAction.scriptPath?.trim() }"
                @input="validateForm"
              />
              <button type="button" @click="selectScriptFile" class="btn-select-file">选择文件</button>
            </div>
            <div v-if="!editingAction.scriptPath?.trim()" class="error-message">脚本路径不能为空</div>
          </div>

          <div class="form-actions">
            <button @click="saveEdit(index)" class="btn-primary" :disabled="!isFormValid">保存</button>
            <button @click="cancelEdit(index)" class="btn-secondary">取消</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import type { ActionConfig } from '../../types';
  import { HandlerType, BuiltinType } from '../../const';
  import { BuiltinTypeLabelMap, HandlerTypeLabelMap } from '../../const';
  import { useExt } from '../useExt';

  const { ext } = useExt();
  const actions = ref<ActionConfig[]>([]);
  const editingIndex = ref<number | null>(null);
  const editingAction = ref<ActionConfig | null>(null);

  // AI 配置相关状态
  const showAiConfig = ref(false);
  const showApiKey = ref(false);
  const aiConfig = ref({
    apiKey: '',
    baseURL: '',
    model: '',
    temperature: 0.7,
  });

  // 表单验证状态
  const isFormValid = computed(() => {
    if (!editingAction.value) return false;

    const action = editingAction.value;
    if (!action.name.trim()) return false;

    switch (action.type) {
      case HandlerType.BUILTIN:
        return !!action.builtinType;
      case HandlerType.AI:
        return !!action.aiPrompt?.trim();
      case HandlerType.SCRIPT:
        return !!action.scriptPath?.trim();
      default:
        return false;
    }
  });

  // AI 配置验证
  const isAiConfigValid = computed(() => {
    return !!aiConfig.value.apiKey?.trim();
  });

  // 获取类型标签
  function getTypeLabel(type: HandlerType): string {
    return HandlerTypeLabelMap[type] || type;
  }

  // 获取内置类型标签
  function getBuiltinTypeLabel(type: BuiltinType): string {
    return BuiltinTypeLabelMap[type] || type;
  }

  // 表单验证
  function validateForm() {
    // 触发响应式更新
  }

  // 类型变更处理
  function onTypeChange() {
    if (!editingAction.value) return;

    // 清除类型特定的字段
    editingAction.value.scriptPath = undefined;
    editingAction.value.builtinType = undefined;
    editingAction.value.aiPrompt = undefined;

    // 设置默认值
    switch (editingAction.value.type) {
      case HandlerType.BUILTIN:
        editingAction.value.builtinType = BuiltinType.TRANSLATE;
        break;
      case HandlerType.AI:
        editingAction.value.aiPrompt = '';
        break;
      case HandlerType.SCRIPT:
        editingAction.value.scriptPath = '';
        break;
    }
  }

  // 选择脚本文件
  async function selectScriptFile() {
    try {
      const result = await ext.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: {
          JavaScript: ['js'],
        },
      });

      if (result && result.length > 0 && editingAction.value) {
        editingAction.value.scriptPath = result[0].path;
      }
    } catch (error) {
      console.error('选择文件失败:', error);
      // 如果文件选择失败，回退到输入框
      const path = await ext.showInputBox({
        prompt: '请输入脚本文件路径',
        placeholder: '例如: /path/to/script.js',
      });

      if (path && editingAction.value) {
        editingAction.value.scriptPath = path;
      }
    }
  }

  async function loadActions() {
    try {
      actions.value = await ext.getActions();
    } catch (error) {
      console.error('加载失败:', error);
      actions.value = [];
    }
  }

  async function addAction() {
    const newAction: ActionConfig = {
      name: `新Action ${actions.value.length}`,
      description: '',
      type: HandlerType.BUILTIN,
      builtinType: BuiltinType.TRANSLATE,
    };

    actions.value.push(newAction);
    editingIndex.value = actions.value.length - 1;
    editingAction.value = JSON.parse(JSON.stringify(newAction));
  }

  function edit(index: number) {
    editingIndex.value = index;
    editingAction.value = JSON.parse(JSON.stringify(actions.value[index]));
  }

  async function saveEdit(index: number) {
    if (!editingAction.value || !isFormValid.value) {
      return;
    }

    // 检查名称重复
    const sameNameActions = actions.value.filter(
      (action, i) => i !== index && action.name === editingAction.value?.name
    );

    if (sameNameActions.length > 0) {
      ext.showErrorMessage('Action名称已存在');
      return;
    }

    actions.value[index] = editingAction.value;
    await saveActions();
  }

  function cancelEdit(index: number) {
    editingIndex.value = null;
    editingAction.value = null;
  }

  async function deleteAction(index: number) {
    actions.value.splice(index, 1);
    await saveActions();
  }

  async function saveActions() {
    try {
      await ext.saveActions(actions.value);
      editingIndex.value = null;
      editingAction.value = null;
      await loadActions();
    } catch (error) {
      console.error('保存失败:', error);
      ext.showErrorMessage('保存失败: ' + error);
    }
  }

  // AI 配置相关方法
  function toggleAiConfig() {
    showAiConfig.value = !showAiConfig.value;
  }

  function toggleApiKeyVisibility() {
    showApiKey.value = !showApiKey.value;
  }

  function onAiConfigChange() {
    // AI 配置变更处理（如果需要的话）
  }

  async function loadAiConfig() {
    try {
      const config = await ext.getAiConfig();
      aiConfig.value = {
        apiKey: config.apiKey || '',
        baseURL: config.baseURL || '',
        model: config.model || '',
        temperature: config.temperature || 0.7,
      };
    } catch (error) {
      console.error('加载 AI 配置失败:', error);
    }
  }

  async function saveAiConfig() {
    try {
      await ext.saveAiConfig({
        apiKey: aiConfig.value.apiKey,
        baseURL: aiConfig.value.baseURL,
        model: aiConfig.value.model,
        temperature: aiConfig.value.temperature,
      });

      showAiConfig.value = false; // 保存后隐藏配置面板
      ext.showInfoMessage('AI 配置已保存');
    } catch (error) {
      console.error('保存 AI 配置失败:', error);
      ext.showErrorMessage('保存 AI 配置失败: ' + error);
    }
  }

  async function testAiConfig() {
    try {
      const testMessage = 'Hello, this is a test message.';

      const response = await fetch(`${aiConfig.value.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aiConfig.value.apiKey}`,
        },
        body: JSON.stringify({
          model: aiConfig.value.model,
          messages: [
            {
              role: 'user',
              content: 'Say "Hello, I am working!" in Chinese',
            },
          ],
          max_tokens: 50,
          temperature: aiConfig.value.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content;

      if (result) {
        ext.showInfoMessage(`AI 连接测试成功！回复: ${result}`);
      } else {
        throw new Error('AI 返回了空结果');
      }
    } catch (error) {
      console.error('AI 连接测试失败:', error);
      const errorMessage = error instanceof Error ? error.message : 'AI 连接测试失败';
      ext.showErrorMessage(`AI 连接测试失败: ${errorMessage}`);
    }
  }

  onMounted(async () => {
    await loadActions();
    await loadAiConfig();
  });
</script>

<style>
  .app {
    font-family: var(--vscode-font-family);
    padding: 24px;
    max-width: 800px;
    margin: 0 auto;
    background: var(--vscode-editor-background);
    min-height: 100vh;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid var(--vscode-panel-border);
  }

  .header h1 {
    margin: 0;
    color: var(--vscode-foreground);
    font-size: 24px;
    font-weight: 600;
  }

  .header-buttons {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .btn-primary {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
  }

  .btn-primary:hover {
    background: var(--vscode-button-hoverBackground);
  }

  .btn-primary:disabled {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    cursor: not-allowed;
  }

  .icon {
    font-size: 16px;
  }

  /* AI 配置区域样式 */
  .ai-config-section {
    background: var(--vscode-editor-background);
    border: 2px solid var(--vscode-panel-border);
    border-radius: 8px;
    margin-bottom: 24px;
    padding: 24px;
    position: relative;
  }

  .ai-config-section::before {
    content: '🤖 AI 配置';
    display: block;
    font-size: 18px;
    font-weight: 600;
    color: var(--vscode-foreground);
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--vscode-panel-border);
  }

  .config-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .api-key-group {
    display: flex;
    gap: 8px;
  }

  .api-key-group input {
    flex: 1;
  }

  .btn-toggle-key {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    border: 2px solid var(--vscode-input-border);
    padding: 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
    min-width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-toggle-key:hover {
    background: var(--vscode-button-secondaryHoverBackground);
  }

  .help-text {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    margin-top: 4px;
    line-height: 1.4;
  }

  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .temperature-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--vscode-scrollbarSlider-background);
    outline: none;
    cursor: pointer;
  }

  .temperature-slider::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--vscode-focusBorder);
    cursor: pointer;
    border: 2px solid var(--vscode-editor-background);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .temperature-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--vscode-focusBorder);
    cursor: pointer;
    border: 2px solid var(--vscode-editor-background);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    padding: 0 4px;
  }

  /* 空状态样式 */
  .empty {
    text-align: center;
    color: var(--vscode-descriptionForeground);
    padding: 60px 20px;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.6;
  }

  .empty p {
    margin: 8px 0;
    font-size: 16px;
  }

  .empty-desc {
    font-size: 14px !important;
    opacity: 0.8;
  }

  /* Action列表样式 */
  .actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .action {
    background: var(--vscode-list-itemBackground);
    border: 1px solid var(--vscode-list-border);
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .action:hover {
    border-color: var(--vscode-focusBorder);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .action-display {
    padding: 20px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .action-display:hover {
    background: var(--vscode-list-hoverBackground);
  }

  .action-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  .action-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .name {
    font-weight: 600;
    font-size: 16px;
    color: var(--vscode-foreground);
  }

  .type-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .type-builtin {
    background: #007acc;
    color: white;
  }

  .type-ai {
    background: #ff6b35;
    color: white;
  }

  .type-script {
    background: #28a745;
    color: white;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }

  .btn-edit,
  .btn-delete {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    border: none;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-edit:hover {
    background: var(--vscode-button-secondaryHoverBackground);
  }

  .btn-delete:hover {
    background: var(--vscode-errorForeground);
    color: white;
  }

  .description {
    color: var(--vscode-descriptionForeground);
    font-size: 14px;
    margin-bottom: 12px;
    line-height: 1.5;
  }

  .action-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }

  .detail-label {
    color: var(--vscode-descriptionForeground);
    font-weight: 500;
    min-width: 80px;
  }

  .detail-value {
    color: var(--vscode-foreground);
    font-family: var(--vscode-editor-font-family);
    background: var(--vscode-textCodeBlock-background);
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--vscode-textCodeBlock-border);
  }

  /* 表单样式 */
  .action-form {
    padding: 24px;
    background: var(--vscode-input-background);
    border-top: 1px solid var(--vscode-panel-border);
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--vscode-foreground);
    font-size: 14px;
  }

  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 12px;
    border: 2px solid var(--vscode-input-border);
    border-radius: 6px;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    font-family: inherit;
    font-size: 14px;
    transition: border-color 0.2s ease;
    box-sizing: border-box;
  }

  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--vscode-focusBorder);
  }

  .form-group input.error,
  .form-group textarea.error {
    border-color: var(--vscode-errorForeground);
  }

  .error-message {
    color: var(--vscode-errorForeground);
    font-size: 12px;
    margin-top: 4px;
  }

  .file-input-group {
    display: flex;
    gap: 8px;
  }

  .file-input-group input {
    flex: 1;
  }

  .btn-select-file {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    border: 2px solid var(--vscode-input-border);
    padding: 12px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn-select-file:hover {
    background: var(--vscode-button-secondaryHoverBackground);
  }

  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--vscode-panel-border);
  }

  .btn-secondary {
    background: var(--vscode-button-secondaryBackground);
    color: var(--vscode-button-secondaryForeground);
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    background: var(--vscode-button-secondaryHoverBackground);
  }

  /* 响应式设计 */
  @media (max-width: 600px) {
    .app {
      padding: 16px;
    }

    .header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .action-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }

    .action-buttons {
      justify-content: flex-end;
    }

    .file-input-group {
      flex-direction: column;
    }

    .form-actions {
      flex-direction: column;
    }
  }
</style>
