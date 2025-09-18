import * as vscode from 'vscode';
import { Extension } from './core';

export async function activate(context: vscode.ExtensionContext) {
  console.log('Quick Actions插件已激活');
  const extension = new Extension(context);
  await extension.activate();
}

export function deactivate() {
  console.log('Quick Actions插件已卸载');
}
