import React, {createRef, useCallback, useEffect, useMemo, useState} from "react";
import {WebView} from "react-native-webview";
import {getMobileThreadUrl} from "../constants/urls";
import {WebViewOpenWindowEvent} from "react-native-webview/lib/WebViewTypes";
import * as Linking from "expo-linking";
import {useNavigation} from "@react-navigation/native";
import {getQueryValue} from "../utils";

const CommentsWebview: React.FC<{ tid: string, webviewHeight: number }> = ({tid, webviewHeight}) => {
  const [height, setHeight] = useState<number>(1)
  useEffect(() => {
    if(height !== 1 && webviewHeight !== 0) {
      if(webviewHeight >= height) {
        noMove()
      }
    }
  }, [webviewHeight, height])
  const webViewRef = createRef<WebView>();
  const noMove = useCallback(() => {
    webViewRef.current.injectJavaScript(`
      document.addEventListener('touchmove', function(e) {
        e.preventDefault();
      }, { passive: false });
    `)
  }, [webViewRef])
  const [uri, setUri] = useState<string>(getMobileThreadUrl(tid))
  const navigation = useNavigation()
  const onOpenWindow = (e: WebViewOpenWindowEvent) => {
    // setUri(e.nativeEvent.targetUrl)
    const targetUrl = e.nativeEvent.targetUrl
    console.log(targetUrl)
    if(targetUrl.startsWith('http') && !targetUrl.includes('yamibo.com')){
      Linking.openURL(targetUrl)
    }else {
      if(targetUrl.includes('thread-')) {
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
  const onLoadEnd = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript("")
    }
  }
  const onError = () => {
  }
  const onMessage = (e) => {
    const data = JSON.parse(e.nativeEvent.data)
    switch (data.msgType) {
      case 'webviewHeight': {
        setHeight(data.msg.height)
        break
      }
      default:
        console.log(data)
    }
  }
  const script = useMemo(() => `
    // document.addEventListener('touchmove', function(e) {
    //   e.preventDefault();
    // }, { passive: false });
    document.addEventListener('DOMContentLoaded', function() {
      var style = document.createElement('style');
      style.type = 'text/css';
      var css = \`
        div.page {
          display: none;
        }
        .view_reply.cl {
          display: none;
        }
      \`;
      style.appendChild(document.createTextNode(css));
      document.head.appendChild(style);
      document.querySelector('body').style.setProperty('--dz-BG-0', '#f8f8e0');
      document.querySelectorAll('a').forEach(function(link) {
        if(!link.href.startsWith('javascript')){
          link.setAttribute('target', '_blank');
        }
      });
      var headerPadding = document.getElementById('header-padding');
      if (headerPadding) headerPadding.remove();
      var headerCl = document.querySelector('.header.cl');
      if (headerCl) headerCl.remove();
      var viewTit = document.querySelector('.view_tit');
      if (viewTit) viewTit.remove();
      var footHeightView = document.querySelector('.foot_height_view');
      if (footHeightView) footHeightView.remove();
      var viewuiFontsize = document.getElementById('viewui_fontsize');
      if (viewuiFontsize) viewuiFontsize.remove();
      var links = document.querySelectorAll('a.orange');
      links.forEach(function(link) {
          link.remove();
      });
      const discuzElements = document.querySelectorAll('div.discuz_x.cl');
      discuzElements.forEach(el => el.remove());
      const txtlistElements = document.querySelectorAll('div.txtlist.cl');
      txtlistElements.forEach(el => el.remove());
      const plcElements = document.querySelectorAll('div.plc.cl[id^="pid"]');
      plcElements.forEach((el, index) => {
          if (index > 0) el.remove();
      });      
      const footerElements = document.querySelectorAll('div.foot.foot_reply.flex-box.cl');
      footerElements.forEach(el => el.remove());
      for (let i = 0; i < 100; i++) {
        var elements = document.querySelectorAll('font');
        elements.forEach(el => {
          if (el.innerHTML.trim() === '<br>' || el.innerHTML === '') {
            const newElement = document.createElement('br');
            el.parentNode.replaceChild(newElement, el);
          }
        });
      }
      for (let i = 0; i < 100; i++) {
        var elements = document.querySelectorAll('font');
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
      const plcClDiv = document.querySelector('div.plc.cl');
      const height = plcClDiv.offsetHeight;
      ReactNativeWebView.postMessage(JSON.stringify({
        'msgType': 'webviewHeight',
        'msg': {
          'height': height,
        }
      }));
    })
  `, [])
  return (
    <WebView
      ref={webViewRef}
      style={{ flex: 1, height: webviewHeight || 1, opacity: height === 1 ? 0 : 1 }}
      source={{uri: uri}}
      onLoadEnd={onLoadEnd}
      onError={onError}
      onMessage={onMessage}
      injectedJavaScriptBeforeContentLoaded={script}
      onOpenWindow={onOpenWindow}
    />
  )
}

export default CommentsWebview
