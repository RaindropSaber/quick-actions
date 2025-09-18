export enum HandlerType {
  BUILTIN = 'builtin',
  AI = 'ai',
  SCRIPT = 'script',
}

export enum BuiltinType {
  TRANSLATE = 'translate',
  CAMEL_CASE = 'camelCase',
}

const HandlerTypeLabelMap = {
  [HandlerType.BUILTIN]: '内置',
  [HandlerType.AI]: 'AI',
  [HandlerType.SCRIPT]: '脚本',
};

export { HandlerTypeLabelMap };

const BuiltinTypeLabelMap = {
  [BuiltinType.TRANSLATE]: '翻译',
  [BuiltinType.CAMEL_CASE]: '驼峰命名转换',
};

export { BuiltinTypeLabelMap };
