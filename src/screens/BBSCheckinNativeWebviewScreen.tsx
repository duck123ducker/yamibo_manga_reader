import React from "react";
import BrowserWebview from "../components/BrowserWebview";
import {CHECKIN_URL} from "../constants/urls";

const BBSCheckinNativeWebviewScreen: React.FC = ({navigation}) => {

  return (
    <BrowserWebview url={CHECKIN_URL} navigation={navigation}/>
  )
}

export default BBSCheckinNativeWebviewScreen
