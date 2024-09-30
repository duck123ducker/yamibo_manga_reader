import React, {createRef, useMemo, useState} from "react";
import {WebView} from "react-native-webview";
import {View} from "react-native";
import {useBackHandler} from "@react-native-community/hooks";
import {WebViewOpenWindowEvent} from "react-native-webview/lib/WebViewTypes";
import * as Linking from "expo-linking";
import MyText from "./MyText";


const BrowserWebview: React.FC<{url: string, navigation}> = ({url, navigation}) => {
  const webViewRef = createRef<WebView>();
  const [loaded, setLoaded] = useState<boolean>(false)
  useBackHandler(() => {
    if (navigation.isFocused()) {
      webViewRef.current?.injectJavaScript(`
        ReactNativeWebView.postMessage(JSON.stringify({
          'msgType': 'referrer',
          'msg': {data: document.referrer}
        }));
        history.back();
      `)
      setLoaded(false)
      return true
    } else {
      return false
    }
  })
  const onOpenWindow = (e: WebViewOpenWindowEvent) => {
    const targetUrl = e.nativeEvent.targetUrl
    console.log(targetUrl)
    if(targetUrl.startsWith('http') && !targetUrl.includes('yamibo.com')){
      Linking.openURL(targetUrl)
    }else {
      webViewRef.current?.injectJavaScript(`
        var aEle = document.createElement('a');
        aEle.href = '${targetUrl}';
        document.body.appendChild(aEle);
        aEle.click();
        document.body.removeChild(aEle);
      `)
      setLoaded(false)
    }
  }
  const onMessage = (e) => {
    const data = JSON.parse(e.nativeEvent.data)
    switch (data.msgType) {
      case 'referrer': {
        if(data.msg.data === '') {
          navigation.goBack();
        }
        break
      }
      case 'ok': {
        setLoaded(true)
        break
      }
      default:
        console.log(data)
        break
    }
  }
  const onLoadEnd = () => {
    setLoaded(true)
  }
  const script = useMemo(() => `
    document.addEventListener('DOMContentLoaded', function() {
      ReactNativeWebView.postMessage(JSON.stringify({
        'msgType': 'ok',
        'msg': {}
      }));
      document.querySelectorAll('a').forEach(function(link) {
        if(!link.href.startsWith('javascript')){
          link.setAttribute('target', '_blank');
        }
      });
    })
  `, [])
  return (
    <View style={{ flex: 1, backgroundColor: '#fcf4cf' }}>
      { loaded ? null :
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <MyText>Loading...</MyText>
        </View>
      }
      <WebView
        ref={webViewRef}
        style={ loaded ? { flex: 1 } : { flex: 0, height: 1, opacity: 0 }}
        source={{uri: url}}
        onOpenWindow={onOpenWindow}
        onMessage={onMessage}
        onLoadEnd={onLoadEnd}
        injectedJavaScriptBeforeContentLoaded={script}
      />
    </View>
  )
}

export default BrowserWebview
