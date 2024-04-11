import React, {useCallback, useState} from "react";
import {WebView} from "react-native-webview";
import {WebViewOpenWindowEvent} from "react-native-webview/lib/WebViewTypes";
import {useFocusEffect} from '@react-navigation/native';

const NewSiteNativeWebviewScreen: React.FC = ({navigation}) => {
  const [uri, setUri] = useState('https://www.yamibo.com/')
  const onOpenWindow = (e: WebViewOpenWindowEvent) => {
    setUri(e.nativeEvent.targetUrl)
  }
  useFocusEffect(
    useCallback(() => {
      return () => {
        setUri('')
        setImmediate(() => {
          setUri('https://www.yamibo.com/')
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

export default NewSiteNativeWebviewScreen
