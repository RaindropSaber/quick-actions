import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { runInNewContext } from 'vm';
import { ActionHandler } from './ActionHandler';
import { Extension } from '../core';

export type Vscode = typeof vscode;

export interface Script {
  executeable?: (ctx: { ext: Extension; vscode: Vscode; [key: string]: any }) => boolean;
  execute: (ctx: { ext: Extension; vscode: Vscode; [key: string]: any }) => Promise<void>;
}

export class ScriptHandler extends ActionHandler {
  private loadScript(): Script {
    if (!this.config.scriptPath) throw new Error('脚本地址不正确');

    const absPath = path.resolve(this.config.scriptPath);
    const code = fs.readFileSync(absPath, 'utf-8');

    // 沙箱环境
    const sandbox: any = {
      console,
      vscode,
      module: {},
      exports: {},
      result: null,
    };

    // 执行脚本
    runInNewContext(code, sandbox, { filename: absPath, timeout: 1000 });

    const script: Script = sandbox.module.exports ?? sandbox.exports ?? sandbox.result;

    if (!script || typeof script.execute !== 'function') {
      throw new Error('脚本必须导出 execute 方法');
    }

    return script;
  }

  executeable(ext: Extension, extra?: Record<string, any>) {
    const script = this.loadScript();
    if (!script.executeable) return true;
    return script.executeable({ ext, vscode, ...extra });
  }

  async execute(ext: Extension, extra?: Record<string, any>) {
    const script = this.loadScript();
    script.execute({ ext, vscode, ...extra });
  }
}
