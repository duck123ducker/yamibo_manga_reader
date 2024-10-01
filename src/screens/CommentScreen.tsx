import React, {createRef, useMemo, useState} from 'react';
import {WebView} from "react-native-webview";
import {getMobileThreadUrl} from "../constants/urls";
import {WebViewOpenWindowEvent} from "react-native-webview/lib/WebViewTypes";
import {View} from "react-native";
import * as Linking from "expo-linking";
import MyText from "../components/MyText";
import {useBackHandler} from "@react-native-community/hooks";
import {StatusBar} from "expo-status-bar";
import {getQueryValue} from "../utils";

const CommentScreen: React.FC<{ route, navigation }> = ({route, navigation}) => {
  const { id } = route.params as { id: string }
  const [url, setUrl] = useState<string>(getMobileThreadUrl(id))
  const webViewRef = createRef<WebView>();
  const [prepared, setPrepared] = useState<boolean>(false)
  const [loaded, setLoaded] = useState<boolean>(false)
  useBackHandler(() => {
    if (navigation.isFocused()) {
      // webViewRef.current?.goBack()
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
      if(targetUrl.includes('action=reply')) {
        webViewRef.current?.injectJavaScript(`
          var aEle = document.createElement('a');
          aEle.href = '${targetUrl}';
          document.body.appendChild(aEle);
          aEle.click();
          document.body.removeChild(aEle);
        `)
        setLoaded(false)
      }else if(targetUrl.includes('thread-')) {
        const id = targetUrl.split('-')[1]
        // @ts-ignore
        navigation.push('MangaDetailLoading', {id})
      }else if(targetUrl.includes('mod=tag')) {
        const id = getQueryValue(targetUrl, 'id')
        // @ts-ignore
        navigation.push('Menu', {id})
      }
    }
  }
  const onMessage = (e) => {
    const data = JSON.parse(e.nativeEvent.data)
    switch (data.msgType) {
      case 'ok': {
        setPrepared(true)
        break
      }
      case 'referrer': {
        if(data.msg.data === '') {
          navigation.goBack();
        }
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
      var style = document.createElement('style');
      style.type = 'text/css';
      var css = \`
        div.view_tit,
        div#header-padding,
        div.header.cl,
        div#viewui_fontsize {
          display: none !important;
        }
      \`;
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
      document.querySelectorAll('a').forEach(function(link) {
        if(!link.href.startsWith('javascript')){
          link.setAttribute('target', '_blank');
        }
      });
      var author = document.querySelector('div.plc.cl');
      var links = author.querySelectorAll('a.orange');
      links.forEach(function(link) {
          link.remove();
      });
      for (let i = 0; i < 100; i++) {
        var elements = author.querySelectorAll('font');
        elements.forEach(el => {
          if (el.innerHTML.trim() === '<br>' || el.innerHTML === '') {
            const newElement = document.createElement('br');
            el.parentNode.replaceChild(newElement, el);
          }
        });
      }
      for (let i = 0; i < 100; i++) {
        var elements = author.querySelectorAll('font');
        elements.forEach(font => {
            const lastChild = font.lastElementChild;
            if (lastChild && lastChild.nodeName === 'BR') {
                const br = lastChild.cloneNode();
                font.removeChild(lastChild);
                font.parentNode.insertBefore(br, font.nextSibling);
            }
        });
      }
      document.body.innerHTML = document.body.innerHTML.replace(/(<br\\s*\\/?>\\s*){3,}/g, "<br><br>");
      ReactNativeWebView.postMessage(JSON.stringify({
        'msgType': 'ok',
        'msg': {}
      }));
    })
  `, [])
  return (
    <View style={{ flex: 1, backgroundColor: '#fcf4cf' }}>
      <StatusBar backgroundColor={'#551200'}/>
      {prepared && loaded ? null :
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <MyText>Loading...</MyText>
        </View>
      }
      <WebView
        ref={webViewRef}
        style={prepared && loaded ? { flex: 1 } : { flex: 0, height: 1, opacity: 0 }}
        source={{uri: url}}
        onOpenWindow={onOpenWindow}
        onMessage={onMessage}
        onLoadEnd={onLoadEnd}
        injectedJavaScriptBeforeContentLoaded={script}
      />
    </View>
  )
}

export default CommentScreen;
