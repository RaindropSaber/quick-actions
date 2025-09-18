import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import RBridge from '../utils/RBridge';
import { Extension } from '.';
import templateUrl from '../webview/index.html?url';

export class ConfigPanel {
  public readonly bridge?: RBridge;
  public readonly ext: Extension;

  get context() {
    return this.ext.context;
  }

  constructor(ext: Extension) {
    this.ext = ext;
  }

  // Webview 面板管理
  async show(): Promise<void> {
    if (!this.context) {
      throw new Error('Extension context not available');
    }

    const panel = vscode.window.createWebviewPanel('quickActionsConfig', 'Smart Actions 配置', vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(this.context.extensionUri, 'out')],
    });

    this.setWebviewContent(panel.webview);
    const bridge = this.initializeBridge(panel.webview);

    bridge.connect('webview');
  }

  private initializeBridge(webview: vscode.Webview) {
    const bridge = new RBridge('extension', async () => {
      return {
        sender: (message: any) => {
          webview.postMessage(message);
        },
        receiver: (onMessage: any) => {
          const disposable = webview.onDidReceiveMessage((message) => {
            onMessage(message);
          });
          return () => disposable.dispose();
        },
      };
    });

    // 注册API
    bridge.registerApi(this.ext.ExtBridgeAPI);

    return bridge;
  }

  private setWebviewContent(webview: vscode.Webview): void {
    if (!this.context) {
      throw new Error('Extension context not available');
    }

    // 读取HTML模板
    const htmlTemplatePath = path.join(this.context.extensionPath, 'out', 'webview', 'index.html');
    let htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8');

    // 获取脚本资源URI
    const scriptPath = vscode.Uri.joinPath(this.context.extensionUri, 'out', 'webview', 'main.js');
    const scriptUri = webview.asWebviewUri(scriptPath);

    const stylePath = vscode.Uri.joinPath(this.context.extensionUri, 'out', 'webview', 'style.css');
    const styleUri = webview.asWebviewUri(stylePath);

    // 替换模板中的占位符
    htmlTemplate = htmlTemplate
      .replace('{{SCRIPT_URI}}', scriptUri.toString())
      .replace('{{STYLE_URI}}', styleUri.toString())
      .replace('{{EXT_PANEL_NAME}}', 'ActionConfig');

    console.log(`htmlTemplate`, htmlTemplate);
    console.log(`templateUrl`, templateUrl);

    webview.html = htmlTemplate;
  }
}
