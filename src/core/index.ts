import * as vscode from 'vscode';
import { ActionManager } from './ActionManager';
import { ConfigPanel } from './ConfigPanel';
import { createExtBridgeAPI } from './ExtBridgeApi';

export class Extension {
  public readonly name: string = 'quickActions';

  public readonly context: vscode.ExtensionContext;
  public readonly ActionManager: ActionManager;
  public readonly ConfigPanel: ConfigPanel;
  ExtBridgeAPI: ReturnType<typeof createExtBridgeAPI>;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.ActionManager = new ActionManager(this);
    this.ConfigPanel = new ConfigPanel(this);
    this.ExtBridgeAPI = createExtBridgeAPI(this);
  }

  async activate() {
    console.log('Extension activated');
    this.ActionManager.registerActions();

    const configureCommand = vscode.commands.registerCommand(`${this.name}.configure`, () => {
      this.ConfigPanel.show();
    });

    const runCommand = vscode.commands.registerCommand(`${this.name}.run`, () => {
      this.ActionManager.runAction();
    });

    this.context.subscriptions.push(configureCommand, runCommand);
  }

  async deactivate() {
    console.log('Extension deactivated');
  }
}
