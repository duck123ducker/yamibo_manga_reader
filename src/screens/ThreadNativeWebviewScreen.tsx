import React from "react";
import BrowserWebview from "../components/BrowserWebview";

const ThreadNativeWebviewScreen: React.FC = ({route, navigation}) => {

  return (
    <BrowserWebview url={route.params.url} navigation={navigation}/>
  )
}

export default ThreadNativeWebviewScreen
