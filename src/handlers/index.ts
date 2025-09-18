import { ActionHandler } from './ActionHandler';
import { AIHandler } from './AIHandler';
import { BuildInHandler } from './BuildInHandler';
import { ScriptHandler } from './ScriptHandler';
import { HandlerType } from '../const';

export const handlerMap = {
  [HandlerType.BUILTIN]: BuildInHandler,
  [HandlerType.AI]: AIHandler,
  [HandlerType.SCRIPT]: ScriptHandler,
};

export { ActionHandler, AIHandler, BuildInHandler, ScriptHandler };
