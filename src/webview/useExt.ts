import { InjectionKey, inject, provide } from 'vue';
import RBridge from '../utils/RBridge';
import { ExtBridgeAPI } from '../types';

export type BridgeType = RBridge;

export type ExtType = {
  bridge: RBridge | null;
  vscode: any;
  ext: ExtBridgeAPI;
};

export const ExtKey: InjectionKey<ExtType> = Symbol('ext');

export const useExt = () => {
  return inject<ExtType>(ExtKey)!;
};
