import defer from 'defer-promise'

interface VsCodeApi {
  postMessage(message: any): void;
  setState(state: any): void;
  getState(): any;
}

let vscode: VsCodeApi | Window;

if ((window as any).acquireVsCodeApi) {
  vscode = (window as any).acquireVsCodeApi() as VsCodeApi;
  (window as any).vscode = vscode;
} else {
  vscode = window.parent;
}

// 目前只实现了单个请求发起
let deferred = defer();
export const post = async (config: { key: string; command: string; }) => {
  vscode.postMessage(config)
  deferred = defer();
  let res;
  try {
    res = await deferred.promise
  } catch (error) {
    res = {
      type: 'error',
      message: error
    }
  }
  return res
}

// 处理消息返回
window.addEventListener('message', event => {
  const message = event.data;
  // console.log('allmessage', message)
  if (message.type === 'receiveData') {
    if (!message.result) {
      deferred.resolve(false)
    }
    if (message.result && message.result.inline && message.result.inline.indexOf('ERROR') > -1) {
      deferred.resolve(false)
    }
    deferred.resolve(message)
  } else {
    deferred.resolve(message)
  }
});