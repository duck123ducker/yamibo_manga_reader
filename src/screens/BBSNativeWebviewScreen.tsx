import React, {useCallback, useState} from "react";
import {WebView} from "react-native-webview";
import {WebViewOpenWindowEvent} from "react-native-webview/lib/WebViewTypes";
import {useFocusEffect} from "@react-navigation/native";

const BBSNativeWebviewScreen: React.FC = ({navigation}) => {
  const [uri, setUri] = useState('https://bbs.yamibo.com/forum.php?mobile=2')
  const onOpenWindow = (e: WebViewOpenWindowEvent) => {
    setUri(e.nativeEvent.targetUrl)
  }
  useFocusEffect(
    useCallback(() => {
      return () => {
        setUri('')
        setImmediate(() => {
          setUri('https://bbs.yamibo.com/forum.php?mobile=2')
        })
      };
    }, [])
  );
  return (
    <>
      <WebView
        onOpenWindow={onOpenWindow}
        source={{uri: uri}}
      />
    </>
  )
}

export default BBSNativeWebviewScreen
