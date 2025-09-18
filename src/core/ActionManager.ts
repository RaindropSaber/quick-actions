import * as vscode from 'vscode';
import { ActionConfig } from '../types';
import { ActionHandler, handlerMap } from '../handlers';
import { Extension } from '.';

export class ActionManager {
  public static readonly ACTIONS_CONFIG_KEY = 'smartActions.actions';
  public handlers: Map<string, ActionHandler>;
  public readonly ext: Extension;

  get context() {
    return this.ext.context;
  }

  get actions() {
    return Array.from(this.handlers.values());
  }

  constructor(ext: Extension) {
    this.ext = ext;
    this.handlers = new Map();
  }

  registerActions(actions: ActionConfig[] = this.getActionsConfig()) {
    this.handlers.clear();

    actions.forEach((action: ActionConfig) => {
      console.log(`registerActions`, action.name);
      let Handler = handlerMap[action.type] || ActionHandler;
      this.handlers.set(action.name, new Handler({ config: action, ext: this.ext }));
    });
  }

  getExecutableActions() {
    const actions = this.actions.filter((action) => {
      const result = action.executeable(this.ext);
      return result;
    });

    return actions;
  }

  async runAction() {
    const actions = this.getExecutableActions();

    if (actions.length === 0) return this.gotoConfigPanel();

    const selectedAction = await vscode.window.showQuickPick(
      [
        ...actions,
        {
          label: '$(gear) 打开配置界面',
          description: '添加、编辑或删除Actions',
          execute: null,
        },
      ],
      {
        placeHolder: '选择一个action执行',
      }
    );
    if (selectedAction) {
      if (selectedAction.execute) {
        // 执行Action
        try {
          await this.handlers.get(selectedAction.label)?.execute(this.ext);
          vscode.window.showInformationMessage(`Action "${selectedAction.label}" 执行成功`);
        } catch (error) {
          vscode.window.showErrorMessage(`Action执行失败: ${error}`);
        }
      } else {
        // 打开配置界面
        await this.ext.ConfigPanel.show();
      }
    }
  }

  async gotoConfigPanel() {
    const result = await vscode.window.showInformationMessage(
      '还没有配置任何 Action，是否现在去配置？',
      { modal: true },
      '去配置'
    );
    if (result === '去配置') {
      await this.ext.ConfigPanel.show();
    }
    return;
  }

  // 配置管理方法
  getActionsConfig(): ActionConfig[] {
    const config = vscode.workspace.getConfiguration();
    return config.get(ActionManager.ACTIONS_CONFIG_KEY, []);
  }

  saveActionsConfig(actions: ActionConfig[]) {
    this.registerActions(actions);
    const config = vscode.workspace.getConfiguration();
    return config.update(ActionManager.ACTIONS_CONFIG_KEY, actions, vscode.ConfigurationTarget.Global);
  }
}
