import React, {createRef, useMemo} from 'react';
import {WebView} from "react-native-webview";
import {getMobileThreadUrl} from "../constants/urls";
import {WebViewOpenWindowEvent} from "react-native-webview/lib/WebViewTypes";

const CommentScreen: React.FC<{ route, navigation }> = ({route, navigation}) => {
  const { id } = route.params as { id: string }
  const webViewRef = createRef<WebView>();
  const onOpenWindow = (e: WebViewOpenWindowEvent) => {
    const targetUrl = e.nativeEvent.targetUrl
    console.log(targetUrl)
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
        link.setAttribute('target', '_blank');
      });
    })
  `, [])
  return (
    <WebView
      ref={webViewRef}
      style={{ flex: 1 }}
      source={{uri: getMobileThreadUrl(id)}}
      onOpenWindow={onOpenWindow}
      injectedJavaScriptBeforeContentLoaded={script}
    />
  )
}

export default CommentScreen;
