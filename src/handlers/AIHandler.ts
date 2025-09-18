import * as vscode from 'vscode';
import { Extension } from '../core';
import { ActionHandler } from './ActionHandler';
import { OpenAI } from 'openai';
import { ActionConfig } from '../types';

/**
 * ActionHandler 基类
 * 所有的 action handler 都应该继承这个基类
 */
export class AIHandler extends ActionHandler implements ActionHandler {
  public static AI_CONFIG_KEY = 'quickActions.ai';
  openai: OpenAI;

  get AIConfig() {
    return vscode.workspace.getConfiguration(AIHandler.AI_CONFIG_KEY);
  }

  constructor({ config, ext }: { config: ActionConfig; ext: Extension }) {
    super({ config, ext });
    this.openai = new OpenAI({
      apiKey: this.AIConfig.get('apiKey'),
      baseURL: this.AIConfig.get('baseURL'),
    });
  }

  executeable(ext: Extension) {
    return true;
  }

  async execute(ext: Extension) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const selection = editor.selection;
    const text = editor.document.getText(selection);

    if (!text.trim()) {
      vscode.window.showErrorMessage('请先选中要处理的文本');
      return;
    }

    // 检查 AI 配置
    const aiConfig = vscode.workspace.getConfiguration(AIHandler.AI_CONFIG_KEY);
    const apiKey = aiConfig.get('apiKey');
    if (!apiKey) {
      vscode.window.showErrorMessage('请先配置 AI API Key');
      return;
    }

    // 显示进度条
    const progressOptions: vscode.ProgressOptions = {
      location: vscode.ProgressLocation.Notification,
      title: 'AI 正在处理中...',
      cancellable: false,
    };

    try {
      const result = await vscode.window.withProgress(progressOptions, async () => {
        // 构建请求参数
        const requestParams = {
          model: this.AIConfig.get('model')!,
          messages: [
            {
              role: 'system',
              content: this.config.aiPrompt || '',
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: this.AIConfig.get('temperature')!,
        };

        // 调用 AI API
        const response = await this.openai.chat.completions.create(requestParams as any);

        const aiResult = response.choices[0]?.message?.content;
        if (!aiResult) {
          throw new Error('AI 返回了空结果');
        }

        return aiResult.trim();
      });

      // 替换选中的文本
      await editor.edit((editBuilder) => {
        editBuilder.replace(selection, result);
      });

      vscode.window.showInformationMessage('AI 处理完成');
    } catch (error) {
      console.error('AI 处理失败:', error);
      const errorMessage = error instanceof Error ? error.message : 'AI 处理失败';
      vscode.window.showErrorMessage(`AI 处理失败: ${errorMessage}`);
    }
  }
}
