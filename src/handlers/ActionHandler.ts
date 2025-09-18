import * as vscode from 'vscode';
import { ActionConfig } from '../types';
import { Extension } from '../core';

/**
 * ActionHandler 基类
 * 所有的 action handler 都应该继承这个基类
 */
export class ActionHandler {
  public readonly id: string = Math.random().toString(36).substring(2, 15);
  public readonly ext: Extension;

  public config: ActionConfig;

  get label() {
    return this.config.name;
  }

  get description() {
    return this.config.description;
  }

  get type() {
    return this.config.type;
  }

  constructor({ config, ext }: { config: ActionConfig; ext: Extension }) {
    this.config = config;
    this.ext = ext;
  }

  setConfig(config: ActionConfig) {
    this.config = config;
  }

  /**
   * 检测当前上下文是否可以执行该 action
   * @returns 是否可以执行
   */
  executeable(ext: Extension): boolean {
    return true;
  }

  /**
   * 执行 action 的具体逻辑
   * @returns 执行结果（可能为空）
   */
  async execute(ext: Extension): Promise<void> {
    await vscode.window.showInformationMessage('测试execute', { modal: true }, '确定');
  }
}
