/* eslint-disable */
/* prettier-ignore */

const IMessageType = {
  RBRIDGE_CALL: 'RBRIDGE_CALL',
  ON_RBRIDGE_CALLBACK: 'ON_RBRIDGE_CALLBACK',
};

const getId = () => '' + new Date().getTime() + ((Math.random() * 100000) | 0);

const getProxyFn = (apply: any) =>
  new Proxy(
    {},
    {
      get: (_, key) => {
        return new Proxy(() => {}, {
          apply: (target, thisArg, args) => {
            return apply(key, args);
          },
        });
      },
    }
  );

export default class RBridge {
  private _name: string;
  private _msgMap = new Map();
  private _apiMap = new Map();
  private _initFn: any;
  private _connectMap = new Map();
  private _connected = false;
  public api: any;
  public sender: any;
  public receiver: any;

  _log = (...args: any[]) => console.log.call(console, `【${this._name}】`, ...args);

  constructor(name: string, _initFn: any) {
    this._name = name;
    this._msgMap = new Map();
    this._apiMap = new Map();
    this._initFn = _initFn;
    this.api = getProxyFn(this._call.bind(this));
    this._initPrivateApi();
    this._connectMap = new Map();
  }

  _initPrivateApi() {
    this._apiMap.set('#connect', ({ to, from }: any) => {
      this._log('connect', to, from);
      if (to === this._name) {
        this._connectMap.set(from, true);
        this._msgMap.get('#connect')?.resolve(true);
        return true;
      }
      return false;
    });
  }

  _onReceive(payload: any) {
    const { type = '', from = '', data } = payload;
    if (type === IMessageType.RBRIDGE_CALL) {
      return this._onCall(payload);
    } else if (type === IMessageType.ON_RBRIDGE_CALLBACK) {
      return this._onCallback(payload);
    }
  }

  _call(api: string, args: any[], { timeout = 3000, retry = 3, customMsgId }: any = {}) {
    this._log('call', api, ...args);

    if (!this._connected && api !== '#connect') {
      return Promise.reject(new Error(`Bridge: 尚未连接，无法调用 ${api}`));
    }

    const msgId = customMsgId || getId();
    return new Promise((resolve, reject) => {
      this._send({
        type: IMessageType.RBRIDGE_CALL,
        msgId,
        from: this._name,
        data: {
          api,
          args: JSON.parse(JSON.stringify(args)),
        },
      });
      this._msgMap.set(msgId, { resolve, reject });
    });
  }

  async _onCall(payload: any) {
    const { msgId, data } = payload;
    const { api, args = [] } = data;
    this._log('onCall', api, ...args);
    const fn = this._apiMap.get(api);
    if (!fn) {
      throw new Error(`Bridge: api 「${api}」 不存在`);
    }
    Promise.resolve(fn.apply(null, args))
      .then((res) => {
        this._send({
          type: IMessageType.ON_RBRIDGE_CALLBACK,
          msgId,
          from: this._name,
          data: {
            api,
            result: res === undefined ? null : JSON.parse(JSON.stringify(res)),
            success: true,
          },
        });
      })
      .catch((err) => {
        this._send({
          type: IMessageType.ON_RBRIDGE_CALLBACK,
          msgId,
          from: this._name,
          data: {
            api,
            result: err,
            success: false,
          },
        });
      });
  }

  _onCallback(payload: any) {
    const { msgId, data } = payload;
    const { result, success, api } = data;
    this._log('onCallback', api, success, result);
    const callback = this._msgMap.get(msgId);
    if (!callback) return console.warn(`Bridge: msgId 「${msgId}」 不存在`);
    const { resolve, reject } = callback;
    success ? resolve(result) : reject(result);
    this._msgMap.delete(msgId);
  }

  private _send = (message: any) => {
    throw new Error('Bridge: 请传入 sender 方法');
  };

  private _close = () => {
    throw new Error('Bridge: 请在receiver中返回方法用于关闭监听');
  };

  async connect(to: string, options: any = { retry: 10, interval: 300 }) {
    try {
      const initResult = await this._initFn();
      this._log('initFn结果:', initResult);

      if (!initResult || typeof initResult !== 'object') {
        throw new Error('Bridge: initFn必须返回包含sender和receiver的对象');
      }

      const { sender, receiver } = initResult;

      if (!sender || typeof sender !== 'function') {
        throw new Error('Bridge: 请传入 sender 方法');
      }

      if (!receiver || typeof receiver !== 'function') {
        throw new Error('Bridge: 请传入 receiver 方法');
      }

      this.sender = sender;
      this.receiver = receiver;
      this._send = this.sender;
      this._close = (await this.receiver(this._onReceive.bind(this))) || this._close;

      this._log('连接到:', to);
      const result = await this._call('#connect', [{ to, from: this._name }], {
        customMsgId: '#connect',
      });
      this._connected = true;
      this._log('连接成功');
      return result;
    } catch (error) {
      this._log('连接失败:', error);
      throw error;
    }
  }

  disconnect() {
    return this._close();
  }

  registerApi(_apiMap: any) {
    Object.entries(_apiMap).forEach(([key, value]) => {
      this._apiMap.set(key, value);
    });
    return this;
  }
}
