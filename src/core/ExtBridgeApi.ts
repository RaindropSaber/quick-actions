import { Extension } from '.';
import { ActionConfig } from '../types';
import * as vscode from 'vscode';

export const createExtBridgeAPI = (ext: Extension) => ({
  getActions: async () => {
    return ext.ActionManager.getActionsConfig();
  },

  saveActions: async (actions: ActionConfig[]) => {
    return ext.ActionManager.saveActionsConfig(actions);
  },

  showErrorMessage: (message: string) => {
    return vscode.window.showErrorMessage(message);
  },

  showInputBox: async (options: { prompt: string; placeholder?: string }) => {
    return vscode.window.showInputBox({
      prompt: options.prompt,
      placeHolder: options.placeholder,
      ignoreFocusOut: true,
    });
  },

  showOpenDialog: async (options: {
    canSelectFiles?: boolean;
    canSelectFolders?: boolean;
    canSelectMany?: boolean;
    filters?: { [name: string]: string[] };
  }) => {
    return vscode.window.showOpenDialog({
      canSelectFiles: options.canSelectFiles ?? true,
      canSelectFolders: options.canSelectFolders ?? false,
      canSelectMany: options.canSelectMany ?? false,
      filters: options.filters,
    });
  },

  showInfoMessage: (message: string) => {
    return vscode.window.showInformationMessage(message);
  },

  getAiConfig: async () => {
    const config = vscode.workspace.getConfiguration('smartActions.ai');
    return {
      apiKey: config.get<string>('apiKey') || '',
      baseURL: config.get<string>('baseURL') || '',
      model: config.get<string>('model') || '',
      temperature: config.get<number>('temperature') || 0.7,
    };
  },

  saveAiConfig: async (aiConfig: { apiKey: string; baseURL: string; model: string; temperature: number }) => {
    const config = vscode.workspace.getConfiguration();
    await config.update(
      'smartActions.ai',
      {
        apiKey: aiConfig.apiKey,
        baseURL: aiConfig.baseURL,
        model: aiConfig.model,
        temperature: aiConfig.temperature,
      },
      vscode.ConfigurationTarget.Global
    );
  },
});

export type ExtBridgeAPI = ReturnType<typeof createExtBridgeAPI>;
