import React, {createRef, memo, useState} from "react";
import {appStore} from "../store/appStore";
import {getPicByWebView} from "../utils";
import {WebView} from "react-native-webview";

const WebViewReader: React.FC = ({imageList, paging}) => {
    const webViewRef = createRef<WebView>();
    const [html, setHtml] = useState((()=>{
        let tmp = ''
        imageList.forEach((item, index)=>{
            tmp += `
                <div id="${index}">
                    <div style="aspect-ratio: 17/24; width: 100vw; font-size: 6vw; display: flex; align-items: center; justify-content: center;">
                       ${index}
                    </div>
                </div>
            `
        })
        const tmpHtml = `
        <body style="padding: 0; margin: 0;">
            ${tmp}
            <script>
                var scrolling = false;
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
        appStore.reading = true
        for (const [index, link] of imageList.entries()) {
            if(appStore.reading){
                const picData = await getPicByWebView(link)
                if(webViewRef.current){
                    webViewRef.current.injectJavaScript(`
                    try{
                        var divElement = document.querySelector('div[id="${index}"]');
                        var imgElement = document.createElement('img');
                        imgElement.src = '${picData.result}';
                        imgElement.style.width = '100vw';
                        while (divElement.firstChild) {
                            divElement.removeChild(divElement.firstChild);
                        }
                        divElement.appendChild(imgElement);
                        }catch(e){ReactNativeWebView.postMessage(e.toString())}
                        true;
                    `)
                }
            }
        }
    }
    const onError =()=>{
        console.log('error')
    }
    const onMessage=(e)=>{
        const data = JSON.parse(e.nativeEvent.data)
        switch(data.msgType) {
            case 'scrollProgress':{
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
}

export default memo(WebViewReader)
