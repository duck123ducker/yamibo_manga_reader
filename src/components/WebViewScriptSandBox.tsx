import React, {createRef, useState} from 'react';
import {appStore} from "../store/appStore";
import {WebView} from "react-native-webview";
import {NativeSyntheticEvent} from "react-native";
import {WebViewMessage} from "react-native-webview/lib/WebViewTypes";

const WebViewScriptSandBox: React.FC<{hash: string}> = ({hash}) => {
    const [loaded, setLoaded] = useState(false)
    const webViewRef = createRef<WebView>();
    const script = appStore.scriptRequest[hash]
    const html = `
        <script>
            (function() {
                let location = {
                    set href(url) {
                        window.ReactNativeWebView.postMessage(url);
                        return;
                    },
                    get href() {},
                    replace: function(url) {
                        window.ReactNativeWebView.postMessage(url);
                        return;
                    },
                    assign: function(url) {
                        window.ReactNativeWebView.postMessage(url);
                        return;
                    },
                };
                ${script}
                window.ReactNativeWebView.postMessage(location);
                return
            })();
        </script>
    `;
    // const onNavigationStateChange = (navigationState: WebViewNavigation) => {
    //     if(navigationState.url !== 'https://www.baidu.com/'){
    //         const path = getUrlPathWithQuery(navigationState.url)
    //         setLoaded(true)
    //         appStore.scriptResult[hash] = path
    //         delete appStore.scriptRequest[hash]
    //     }
    // }
    const onMessage = (event: NativeSyntheticEvent<WebViewMessage>) => {
        if(!loaded){
            const { data } = event.nativeEvent;
            setLoaded(true)
            appStore.scriptResult[hash] = data
            delete appStore.scriptRequest[hash]
        }
    }
    return (
        <>
            {!loaded &&
                <WebView
                    ref={webViewRef}
                    onError={(error) => {
                        console.log("error", error.nativeEvent);
                    }}
                    // source={{uri: 'https://www.baidu.com/'}}
                    source={{html:html}}
                    // onNavigationStateChange={onNavigationStateChange}
                    onMessage={onMessage}
                    // injectedJavaScript={script}
                />
            }
        </>
    )
}

export default WebViewScriptSandBox;
