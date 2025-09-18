import * as vscode from 'vscode';
import { Extension } from '../core';
import { ActionHandler } from './ActionHandler';
import { BuiltinType } from '../const';

/**
 * ActionHandler 基类
 * 所有的 action handler 都应该继承这个基类
 */
export class BuildInHandler extends ActionHandler implements ActionHandler {
  executeable(ext: Extension) {
    // 有选中的文本
    const editor = vscode.window.activeTextEditor;
    if (!editor) return false;
    const selection = editor.selection;
    if (selection.isEmpty) return false;
    const text = editor.document.getText(selection);
    if (!text) return false;
    return map[this.config.builtinType || BuiltinType.TRANSLATE].executeable(text);
  }

  async execute(ext: Extension) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    const selection = editor.selection;
    const text = editor.document.getText(selection);
    const result = map[this.config.builtinType || BuiltinType.TRANSLATE].execute(text);

    editor.edit((editBuilder) => {
      editBuilder.replace(selection, result);
    });
  }
}

const translate = (text: string) => {
  return text + '翻译';
};

const camelCase = (text: string) => {
  return text + '驼峰命名转换';
};

const map = {
  [BuiltinType.TRANSLATE]: {
    execute: translate,
    executeable: (text: string) => {
      return text.length > 0;
    },
  },
  [BuiltinType.CAMEL_CASE]: {
    execute: camelCase,
    executeable: (text: string) => {
      return text.length > 0;
    },
  },
};
