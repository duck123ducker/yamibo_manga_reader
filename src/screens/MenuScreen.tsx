import React, {createRef, useMemo} from 'react';
import {WebView} from "react-native-webview";
import {getMenuUrl} from "../constants/urls";
import {WebViewOpenWindowEvent} from "react-native-webview/lib/WebViewTypes";

const MenuScreen: React.FC<{ route, navigation }> = ({route, navigation}) => {
  const { id } = route.params as { id: string }
  const webViewRef = createRef<WebView>();
  const onOpenWindow = (e: WebViewOpenWindowEvent) => {
    const targetUrl = e.nativeEvent.targetUrl
    console.log(targetUrl)
    if((targetUrl.startsWith('http') && targetUrl.includes('yamibo.com') || !targetUrl.startsWith('http')) && targetUrl.includes('thread-')) {
      const id = targetUrl.split('-')[1]
      // @ts-ignore
      navigation.push('MangaDetailLoading', {id})
    }
  }
  const script = useMemo(() => `
    document.addEventListener('DOMContentLoaded', function() {
      var banner = document.querySelector('#hd');
      banner && banner.remove();
      var oyheader = document.querySelector('div.oyheader');
      oyheader && oyheader.remove();
      var xi1_bm_bm_c = document.querySelector('div.xi1.bm.bm_c');
      xi1_bm_bm_c && xi1_bm_bm_c.remove();
      var pt = document.querySelector('div#pt');
      pt && pt.remove();
    })
  `, [])
  return (
    <WebView
      ref={webViewRef}
      style={{ flex: 1 }}
      source={{uri: getMenuUrl(id)}}
      onOpenWindow={onOpenWindow}
      injectedJavaScriptBeforeContentLoaded={script}
    />
  )
}

export default MenuScreen;
