import React from 'react';
import {View} from "react-native";
import {WebView} from "react-native-webview";

const WebViewLargeImageLoader: React.FC<{ uri: string, width: number, height: number }> = ({uri, width, height}) => {
  return (
    <View onStartShouldSetResponder={() => true} style={{width: width, height: height}}>
      <WebView allowFileAccess={true} allowFileAccessFromFileURLs={true} source={{uri: uri}}/>
    </View>
  )
}

export default WebViewLargeImageLoader;
