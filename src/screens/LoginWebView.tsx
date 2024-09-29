import React, {useEffect, useState} from 'react';
import {Button, View} from "react-native";
import {appStore} from "../store/appStore";
import {useSnapshot} from "valtio/react";
import {StatusBar} from "expo-status-bar";
import {checkLogin, px2dp} from "../utils";
import LoadingModal from "../components/LoadingModal";
import MainWebView from "../components/MainWebView";
import Toast from "react-native-root-toast";
import MyText from "../components/MyText";
import {VolumeManager} from "react-native-volume-manager";

const LoginWebView: React.FC = () => {
  const [checkingLogin, setCheckingLogin] = useState(false)
  const {webViewMode} = useSnapshot(appStore)
  const webViewCheckLogin = () => {
    if (!checkingLogin) {
      setCheckingLogin(true)
      checkLogin().then(r => {
        if (r) {
          Toast.show('未登录！', {position: 0})
        } else {
          appStore.webViewShow = false;
          appStore.webViewMode = 'common';
          Toast.show('登录成功！', {position: 0})
        }
        setCheckingLogin(false)
      }).catch(error => {
        setCheckingLogin(false)
        Toast.show('检测失败！', {position: 0})
      })
    }
  }
  return (
    <View style={{flex: 1}}>
      <LoadingModal visible={checkingLogin} message={'检查登录状态...'}/>
      {webViewMode === 'login' &&
        <View style={{height: px2dp(100), flexDirection: 'row', backgroundColor: '#ffe6b7'}}>
          <View style={{flex: 1, position: 'relative',}}>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              {/*<Text onPress={()=>{*/}
              {/*    appStore.webViewShow=false;*/}
              {/*    appStore.webViewMode='common';*/}
              {/*}} style={{ position: 'absolute', left: 0 }}>{' <'}</Text>*/}
              <MyText style={{fontSize: 18}}>请先登录</MyText>
              <View style={{position: 'absolute', right: px2dp(20)}}>
                <Button onPress={webViewCheckLogin
                  //     ()=>{
                  //     appStore.loggingStatus=true;
                  //     appStore.webViewShow=false;
                  //     appStore.webViewMode='common';
                  // }
                } color={'#551200'} title={'我已登录'}/>
              </View>
            </View>
          </View>
          <StatusBar backgroundColor='#ffe6b7'/>
        </View>
      }
      {webViewMode === 'challenge' &&
        <View style={{height: px2dp(100), alignItems: 'center', justifyContent: 'center', borderBottomWidth: px2dp(1)}}>
          <MyText style={{fontSize: 18}}>人机验证中...</MyText>
        </View>
      }
      <MainWebView key={appStore.webViewUpdateFlag}/>
    </View>
  );
}

export default LoginWebView;
