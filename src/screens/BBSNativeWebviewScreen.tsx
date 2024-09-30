import React from "react";
import BrowserWebview from "../components/BrowserWebview";
import {HOME_URL} from "../constants/urls";

const BBSNativeWebviewScreen: React.FC = ({navigation}) => {

  return (
    <BrowserWebview url={HOME_URL} navigation={navigation}/>
  )
}

export default BBSNativeWebviewScreen
