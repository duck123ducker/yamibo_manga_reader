import React, {createRef, forwardRef, memo, useImperativeHandle, useState} from "react";
import {appStore} from "../store/appStore";
import {getPicListThread} from "../utils";
import {WebView} from "react-native-webview";

const WebViewReaderCol = forwardRef(({ imageList, paging, initPage }, ref) => {
  useImperativeHandle(ref, () => ({
    prev() {
      if(appStore.readingPage !== 0)
        webViewRef.current?.injectJavaScript(`document.getElementById("${appStore.readingPage - 2}").scrollIntoView({ behavior: 'auto' });`)
    },
    next() {
      if(appStore.readingPage !== imageList.length)
        webViewRef.current?.injectJavaScript(`document.getElementById("${appStore.readingPage}").scrollIntoView({ behavior: 'auto' });`)
    }
  }));
  const webViewRef = createRef<WebView>();
  const [html, setHtml] = useState((() => {
    let tmp = ''
    imageList.forEach((item, index) => {
      tmp += `    
        <div id="${index}">
          <div style="height: calc(100vw * 24 / 17); width: 100vw; font-size: 6vw; display: flex; align-items: center; justify-content: center;">
            ${index + 1}
          </div>
        </div>
      `
    })
    const tmpHtml = `
      <body style="padding: 0; margin: 0;">
        ${tmp}
        <script>
          var scrolling = false;
          window.onload = function() {
            setTimeout(() => {
              const element = document.getElementById("${initPage - 1}");
              if (element) {
                  element.scrollIntoView({ behavior: 'auto' });
              }
            }, 300);
          };
          function throttleScroll() {
            if (!scrolling) {
              scrolling = true;
              setTimeout(function() {
                scrolling = false;
              }, 10);
              ReactNativeWebView.postMessage(JSON.stringify({
                'msgType': 'scrollProgress',
                'msg': {
                  'top': Number(document.elementFromPoint(0, 0).parentNode.id),
                  'bottom': Number(document.elementFromPoint(window.innerWidth-1, window.innerHeight-1).parentNode.id)
                }
              }));
            }
          }
          window.addEventListener('scroll', throttleScroll);
        </script>
      </body>
    `
    return tmpHtml
  })());
  const onLoadEnd = async () => {
    await getPicListThread(imageList, webViewRef)
  }
  const onError = () => {
    console.log('error')
  }
  const onMessage = (e) => {
    const data = JSON.parse(e.nativeEvent.data)
    switch (data.msgType) {
      case 'scrollProgress': {
        paging(data.msg)
        break
      }
    }
  }

  console.log('rerender')
  return (
    <WebView
      ref={webViewRef}
      // style={{width:px2dp(700)}}
      source={{html: html}}
      onLoadEnd={onLoadEnd}
      onError={onError}
      onMessage={onMessage}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      allowFileAccessFromFileURLs={true}
      allowFileAccess={true}
      allowUniversalAccessFromFileURLs={true}
    />
  )
})

export default memo(WebViewReaderCol)
