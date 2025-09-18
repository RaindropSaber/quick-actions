import { createApp } from 'vue';
import App from './App.vue';
import RBridge from '../utils/RBridge';
import { ExtKey } from './useExt';
import ActionConfig from './panel/ActionConfig.vue';
1;
// 类型声明
declare global {
  interface Window {
    vscode?: any;
    acquireVsCodeApi?: () => any;
    initExtPanel?: (extPanelName?: string) => void;
  }

  // VSCode webview全局函数
  function acquireVsCodeApi(): any;
}

// 初始化RBridge
const bridge = new RBridge('webview', async () => {
  return {
    sender: (message: any) => vscode.postMessage(message),
    receiver: (onMessage: any) => {
      const handler = (event: MessageEvent) => onMessage(event.data);
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    },
  };
});

const vscode = acquireVsCodeApi();

const panelMap = {
  ActionConfig,
};

export const initExtPanel = (extPanelName?: string) => {
  const panel = panelMap[extPanelName as keyof typeof panelMap];
  if (!panel) {
    throw new Error(`Panel ${extPanelName} not found`);
  }
  const app = createApp(panel);
  app.provide(ExtKey, {
    bridge,
    vscode,
    ext: bridge.api,
  });
  bridge.connect('extension').then(() => {
    app.mount('#app');
  });
};
