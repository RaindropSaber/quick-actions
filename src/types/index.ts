import { type ExtBridgeAPI } from '../core/ExtBridgeApi';
import { type HandlerType, type BuiltinType } from '../const';

export interface ActionConfig {
  name: string;
  description: string;
  type: HandlerType;
  scriptPath?: string;
  builtinType?: BuiltinType;
  aiPrompt?: string;
}

export type { ExtBridgeAPI };
