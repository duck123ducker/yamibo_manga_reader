import React, {createRef, useEffect} from "react";
import {useSnapshot} from "valtio/react";
import {appStore} from "../store/appStore";
import {WebView, WebViewNavigation} from "react-native-webview";
import {subscribe} from "valtio/esm";
import {NativeSyntheticEvent} from "react-native";
import {WebViewMessage} from "react-native-webview/lib/WebViewTypes";
import {getSignedUrl} from "../utils";

const MainWebView: React.FC = () => {
  const {webViewUrl} = useSnapshot(appStore)
  const webViewRef = createRef<WebView>();
  useEffect(() => {
    const unsubscribe = subscribe(appStore.webViewRequest, () => {
      console.log('222' + JSON.stringify(appStore.webViewRequest))
      const tmp = JSON.parse(JSON.stringify(appStore.webViewRequest))
      for (let hash in tmp) {
        delete appStore.webViewRequest[hash]
      }
      for (let hash in tmp) {
        console.log('111' + JSON.stringify(tmp[hash]))
        if (webViewRef.current) {
          const script = `
            function getRes${hash}(){
              var url = '${tmp[hash].url}';
              var timeout = ${tmp[hash].timeout};
              var xhr = new XMLHttpRequest();
              xhr.open('${tmp[hash].method}', url, true);
              xhr.setRequestHeader('Cache-Control', 'max-age=3600');
              xhr.timeout = timeout;
              xhr.responseType = 'blob';
              xhr.onload = function () {
                if (xhr.status === 200){
                  var reader = new FileReader();
                  reader.onloadend = function () {
                    var result = reader.result;
                    ${(() => {
                      switch (tmp[hash].type) {
                        case 'pic': {
                          return `
                            var img = new Image();
                            img.onload = function() {
                              var width = this.naturalWidth;
                              var height = this.naturalHeight;
                              ReactNativeWebView.postMessage(JSON.stringify({
                                'msgType': '${tmp[hash].type}',
                                'msg': {
                                  'hash': '${hash}',
                                  'url': '${tmp[hash].url}',
                                  'timeout': ${tmp[hash].timeout},
                                  'code': 200,
                                  'result': result,
                                  'width': width,
                                  'height': height
                                }
                              }));
                            };
                            img.src = result;
                          `
                        }
                        case 'doc': {
                          return `
                            ReactNativeWebView.postMessage(JSON.stringify({
                              'msgType': '${tmp[hash].type}',
                              'msg': {
                                'hash': '${hash}',
                                'url': '${tmp[hash].url}',
                                'timeout': ${tmp[hash].timeout},
                                'code': 200,
                                'result': result
                              }
                            }));
                          `
                        }
                        default: {
                          return `
                            ReactNativeWebView.postMessage(JSON.stringify({
                                'msgType': '${tmp[hash].type}',
                                'msg': {
                                    'hash': '${hash}',
                                    'url': '${tmp[hash].url}',
                                    'timeout': ${tmp[hash].timeout},
                                    'code': 200,
                                    'result': result
                                }
                            }));
                          `
                        }
                      }
                    })()}
                  };
                  reader.readAs${(() => {
                    switch (tmp[hash].type) {
                      case 'pic': {
                        return 'DataURL'
                      }
                      case 'doc': {
                        return 'Text'
                      }
                      default: {
                        return 'Text'
                      }
                    }
                  })()}(xhr.response);
                } else{
                  ReactNativeWebView.postMessage(JSON.stringify({
                    'msgType': '${tmp[hash].type}',
                    'msg': {
                      'hash': '${hash}',
                      'url': '${tmp[hash].url}',
                      'timeout': ${tmp[hash].timeout},
                      'code': xhr.status,
                      'result': String(xhr.status)
                    }
                  }));
                }
            };
            xhr.ontimeout = function () {
              ReactNativeWebView.postMessage(JSON.stringify({
                'msgType': '${tmp[hash].type}',
                'msg': {
                  'hash': '${hash}',
                  'url': '${tmp[hash].url}',
                  'timeout': ${tmp[hash].timeout},
                  'code': 600, //timeout
                  'result': 'timeoutError'
                }
              }));
            };
            xhr.onerror = function () {
              ReactNativeWebView.postMessage(JSON.stringify({
                'msgType': '${tmp[hash].type}',
                'msg': {
                  'hash': '${hash}',
                  'url': '${tmp[hash].url}',
                  'timeout': ${tmp[hash].timeout},
                  'code': 601, //unknown
                  'result': 'unknownError'
                }
              }));
            };
            xhr.send();
            }
            getRes${hash}();
            true;
          `
          webViewRef.current.injectJavaScript(script);
          delete tmp[hash]
        } else {

        }
      }
    })
    return unsubscribe
  }, [appStore.webViewRequest, webViewRef]);
  console.log('rerender')
  const onNavigationStateChange = (navigationState: WebViewNavigation) => {
    const {loading, url} = navigationState
    if (loading === false) {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          window.scrollTo(0, 0);
          try{
            ReactNativeWebView.postMessage(JSON.stringify({'msgType': 'formHash','msg':document.getElementsByName('formhash')[0].value}))
          }catch(e){}
          ReactNativeWebView.postMessage(JSON.stringify({
            'msgType': 'newUrl',
            'msg': window.location.href
          }));
          var metaTags = document.getElementsByTagName('meta');
          var robotFlag = 'noRobots'
          for (var i = 0; i < metaTags.length; i++) {
            if (metaTags[i].getAttribute('name') !== null) {
              if(metaTags[i].getAttribute('name') === 'robots'){
                robotFlag = 'robots';
                break;
              }
            }
          }
          ReactNativeWebView.postMessage(JSON.stringify({
            'msgType': 'robotFlag',
            'msg': robotFlag
          }));
          true;
        `);
      }
    }
  };
  const onMessage = (event: NativeSyntheticEvent<WebViewMessage>) => {
    const {data} = event.nativeEvent;
    const dataDecoded: WebViewPostMessage = JSON.parse(data);
    switch (dataDecoded.msgType) {
      case 'newUrl': {
        console.log(dataDecoded)
        break
      }
      case 'robotFlag': {
        console.log(dataDecoded)
        if (dataDecoded.msg === 'robots') {
          if (appStore.webViewMode !== 'login') {
            appStore.webViewShow = true
            appStore.webViewMode = 'challenge'
          }
        } else if (dataDecoded.msg === 'noRobots' && appStore.webViewMode === 'challenge') {
          appStore.webViewMode = 'common'
          appStore.webViewShow = false
        }
        if (dataDecoded.msg === 'noRobots') {
          appStore.webViewReady = true
        }
        break
      }
      case 'doc': {
        console.log(dataDecoded.msgType)
        if (dataDecoded.msg.result.startsWith('<script')) {
          getSignedUrl(dataDecoded.msg.result, dataDecoded.msg.hash, dataDecoded.msg.url, dataDecoded.msg.timeout)
        } else {
          appStore.webViewResult[dataDecoded.msg.hash] = dataDecoded.msg
        }
        break
      }
      case 'pic': {
        console.log(dataDecoded.msgType)
        appStore.webViewResult[dataDecoded.msg.hash] = dataDecoded.msg
        break
      }
      case 'formHash': {
        appStore.formHash = dataDecoded.msg
        break
      }
      default: {
        console.log(dataDecoded)
      }
    }
  };
  type WebViewPostMessage = {
    msgType: string;
    msg: any;
  };
  return <WebView
    ref={webViewRef}
    onError={(error) => {
      console.log("error", error.nativeEvent.description);
    }}
    source={{uri: webViewUrl}}
    onNavigationStateChange={onNavigationStateChange}
    onMessage={onMessage}
  />
}
export default React.memo(MainWebView);
