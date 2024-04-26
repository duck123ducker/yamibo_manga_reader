import 'react-native-gesture-handler';
import {StyleSheet, View} from 'react-native';
import LoginWebView from "./src/screens/LoginWebView";
import React, {useEffect} from "react";
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import AppNavigation from "./src/routes";
import {NavigationContainer} from "@react-navigation/native";
import {useSnapshot} from "valtio/react";
import {appStore} from "./src/store/appStore";
import WebViewManager from "./src/components/WebViewManager";
import {RootSiblingParent} from 'react-native-root-siblings';
import Splash from "./src/components/Splash";
import UpdateModal from "./src/components/UpdateModal";
import {checkUpdate} from "./src/utils";

const App: React.FC = () => {
  const {webViewShow, webViewReady, updateProps} = useSnapshot(appStore)
  useEffect(()=>{
    checkUpdate().then(res => {
      if(res.hasUpdate){
        appStore.showUpdateModal(res.data, `${res.data.version}更新`)
      }
    })
  },[])
  return (
    <RootSiblingParent>
      <SafeAreaProvider>
        <NavigationContainer>
          <SafeAreaView style={styles.container}>
            <UpdateModal message={updateProps.message} title={updateProps.title} visible={updateProps.visible} close={appStore.closeUpdateModal}/>
            <View style={styles.hide}>
              <WebViewManager/>
            </View>
            <View style={[styles.container, webViewShow ? styles.show : styles.hide]}>
              <LoginWebView/>
            </View>
            <View style={[styles.container, webViewShow ? styles.hide : styles.show]}>
              {webViewReady ? <AppNavigation/> : <Splash/>}
            </View>
          </SafeAreaView>
        </NavigationContainer>
      </SafeAreaProvider>
    </RootSiblingParent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  hide: {
    display: "none"
  },
  show: {
    display: "flex"
  }
});

export default App;
