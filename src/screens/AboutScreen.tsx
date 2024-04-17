import React, {useState} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {checkUpdate, px2dp} from "../utils";
import MyText from "../components/MyText";
import {Image} from "expo-image";
import {StatusBar} from "expo-status-bar";
import LoadingModal from "../components/LoadingModal";
import Toast from "react-native-root-toast";
import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
import {appStore} from "../store/appStore";

const AboutScreen: React.FC = ({navigation}) => {
  const [checking, setChecking] = useState(false)
  const checkUpdateExplicitly = async () => {
    if (!checking) {
      setChecking(true)
      checkUpdate()
      .then(res => {
        setChecking(false)
        Toast.show('已是最新版本！', {position: 0})
        if(res.hasUpdate){
          appStore.showUpdateModal(res.data, `${res.data.version}更新`)
        }
      })
      .catch(err => {
        setChecking(false)
        Toast.show('检查更新失败！', {position: 0})
      })
    }
  }
  const aboutOptions = [
    {
      description: '300阅读器',
      info: '300阅读器为第三方客户端，与百合会论坛无直接关系'
    },
    {
      description: '作者',
      info: 'duck123ducker <huster@ducker.com>',
      operation: () => {
        Linking.openURL('huster@ducker.com')
      }
    },
    {
      description: '最新版本',
      info: 'https://github.com/duck123ducker/yamibo_manga_reader/releases/latest',
      operation: () => {
        Linking.openURL('https://github.com/duck123ducker/yamibo_manga_reader/releases/latest')
      }
    },
    {
      description: '问题反馈',
      info: 'https://github.com/duck123ducker/yamibo_manga_reader/issues',
      operation: () => {
        Linking.openURL('https://github.com/duck123ducker/yamibo_manga_reader/issues')
      }
    },
    {
      description: '版本号',
      info: Application.nativeApplicationVersion
    },
    {
      description: '检查更新',
      operation: checkUpdateExplicitly
    }
  ]
  return (
    <ScrollView style={[styles.container, styles.content]}>
      <LoadingModal visible={checking} message={'检查更新中...'}/>
      <View style={{
        height: px2dp(100),
        flexDirection: 'row',
        backgroundColor: '#ffe6b7',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <MyText style={{fontSize: 18}}>更新与支持</MyText>
        <TouchableOpacity onPress={navigation.goBack}
                          style={{height: px2dp(60), width: px2dp(60), position: 'absolute', left: px2dp(20)}}>
          <Image style={{height: px2dp(60), width: px2dp(60)}}
                 source={require('../../assets/back.png')}/>
        </TouchableOpacity>
        <StatusBar backgroundColor={'#ffe6b7'}/>
      </View>
      {
        aboutOptions.map(option => (
          <View key={option.description}>
            <TouchableOpacity
              style={[styles.option]}
              onPress={() => {
                option.hasOwnProperty('operation') ? option.operation() : null
              }}>
              <MyText style={styles.description}>{option.description}</MyText>
              {option.hasOwnProperty('info') ? <MyText style={styles.info}>{option.info}</MyText> : null}
            </TouchableOpacity>
            <View style={styles.line}/>
          </View>
        ))
      }
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
  option: {
    paddingTop: px2dp(30),
    paddingBottom: px2dp(30),
    paddingLeft: px2dp(30),
    paddingRight: px2dp(30)
  },
  description: {
    fontSize: 16
  },
  info: {
    fontSize: 14,
    color: '#454545'
  },
  line: {
    height: px2dp(1),
    width: '100%',
    backgroundColor: '#d0d0d0'
  }
})

export default AboutScreen;
