import React from "react";
import BrowserWebview from "../components/BrowserWebview";
import {NEW_SITE_URL} from "../constants/urls";

const NewSiteNativeWebviewScreen: React.FC = ({navigation}) => {

  return (
    <BrowserWebview url={NEW_SITE_URL} navigation={navigation}/>
  )
}

export default NewSiteNativeWebviewScreen
