import React, {useEffect, useMemo, useState} from 'react';
import {Button, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {appStore} from "../store/appStore";
import {clearCache, px2dp, switchReadDirection, switchReadRowDirection, webViewRedirectTo} from "../utils";
import CookieManager from "@react-native-cookies/cookies";
import {MMKVStorage} from "../store/MKKVStorage";
import MyText from "../components/MyText";
import {Image} from "expo-image";
import {StatusBar} from "expo-status-bar";
import {ENUM_READ_DIRECTION, ENUM_ROW_DIRECTION} from "../constants/types";

const SettingScreen: React.FC = ({navigation}) => {
  const [key, setKey] = useState<number>(0)
  const resetCookies = () => {
    CookieManager.clearAll().then(r => {
      MMKVStorage.set('loginStatus', false)
      appStore.webViewUpdateFlag += 1
      webViewRedirectTo('https://bbs.yamibo.com/home.php?mod=space&mobile=no')
      appStore.loggingStatus = false
      appStore.webViewShow = true
      appStore.webViewMode = 'login'
    })
  }
  const settingOptions = useMemo(()=>{
    return [
      {
        description: '清除缓存',
        operation: clearCache
      },
      {
        description: '阅读方向' + (appStore.config.readDirection === ENUM_READ_DIRECTION.COL ? '(竖向)' : '(横向)'),
        operation: switchReadDirection
      },
      {
        description: '横向方向' + (appStore.config.readRowDirection === ENUM_ROW_DIRECTION.R_TO_L ? '(从右至左)' : '(从左至右)'),
        operation: switchReadRowDirection
      },
      {
        description: '更新与支持',
        operation: (setKey) => {
          navigation.navigate('AboutScreen')
        }
      }
    ]
  },[key])
  const isOdd = (number) => {
    return number % 2 !== 0;
  }
  return (
    <ScrollView style={[styles.container, styles.content]}>
      <View style={{
        height: px2dp(100),
        flexDirection: 'row',
        backgroundColor: '#ffe6b7',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <MyText style={{fontSize: 18}}>设置</MyText>
        <TouchableOpacity onPress={navigation.goBack}
                          style={{height: px2dp(60), width: px2dp(60), position: 'absolute', left: px2dp(20)}}>
          <Image style={{height: px2dp(60), width: px2dp(60)}}
                 source={require('../../assets/back.png')}/>
        </TouchableOpacity>
        <StatusBar backgroundColor={'#ffe6b7'}/>
      </View>
      <View style={[styles.options]}>
        <View style={styles.optionsContainer} key={key}>
          {
            settingOptions.map((option, index) => (
              <View key={option.description}>
                <TouchableOpacity
                  style={[styles.option, isOdd(index) ? styles.oddOption : {}, index + 1 === settingOptions.length ? styles.lastOption : {}]}
                  onPress={()=>{option.operation(setKey)}}>
                  <MyText style={styles.description}>{option.description}</MyText>
                  <Image style={styles.forward} source={require('../../assets/foward.png')}/>
                </TouchableOpacity>
                <View style={index + 1 !== settingOptions.length ? styles.line : {}}/>
              </View>
            ))
          }
        </View>
        <Button title={'退出登录'} color={'#551200'} onPress={resetCookies}/>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    backgroundColor: '#f8f8e0'
  },
  options: {
    paddingLeft: px2dp(10),
    paddingRight: px2dp(10)
  },
  optionsContainer: {
    borderRadius: px2dp(10),
    backgroundColor: '#f8f8e0',
    marginTop: px2dp(50),
    marginBottom: px2dp(50),
    shadowColor: '#000',
    shadowOffset: {
      width: px2dp(2),
      height: px2dp(2),
    },
    shadowOpacity: 1,
    elevation: 5,
  },
  option: {
    paddingTop: px2dp(20),
    paddingBottom: px2dp(20),
    paddingLeft: px2dp(20),
    paddingRight: px2dp(10),
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center"
  },
  oddOption: {
    // backgroundColor: '#ffe8c8'
    backgroundColor: '#f8f8e0'
  },
  lastOption: {
    borderBottomRightRadius: px2dp(10),
    borderBottomLeftRadius: px2dp(10)
  },
  description: {
    fontSize: 15
  },
  line: {
    height: px2dp(1),
    width: '100%',
    backgroundColor: '#d0d0d0'
  },
  forward: {
    height: px2dp(40),
    width: px2dp(40)
  }
})

export default SettingScreen;
