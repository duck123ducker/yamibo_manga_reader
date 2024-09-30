import React, {useEffect, useState} from 'react';
import {Button, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import {appStore} from "../store/appStore";
import {
  clearCache, getSettingReadDirection,
  px2dp, saveConfig,
  switchVolPaging,
  webViewRedirectTo
} from "../utils";
import CookieManager from "@react-native-cookies/cookies";
import {MMKVStorage} from "../store/MKKVStorage";
import MyText from "../components/MyText";
import {Image} from "expo-image";
import {StatusBar} from "expo-status-bar";
import {ENUM_READ_DIRECTION, ENUM_ROW_DIRECTION, ENUM_SETTING_DIRECTION, Options} from "../constants/types";
import OptionsContainer from "../components/OptionsContainer";
import MyModal from "../components/MyModal";
import {subscribe} from "valtio";
import {BACK_ICON} from "../constants/images";

interface SelectModalProps {
  selections: string[],
  confirmOperate: (string) => void,
  visible: boolean,
  close: () => void,
  initial: string
  title: string
}

const SelectModal: React.FC<SelectModalProps> = (props) => {
  const { visible, selections, confirmOperate, close, initial, title } = props
  const [selected, setSelected] = useState<string>(initial)
  useEffect(()=>{
    if(visible) setSelected(initial)
  },[visible])
  const buttons = [
    {
      description: "确定",
      operation: () => {
        confirmOperate(selected)
      }
    },
    {
      description: "取消",
      operation: close
    }
  ]
  const CustomCheckbox = (isSelected: boolean) => {
    return (
      <View style={isSelected ? selectStyles.checked : selectStyles.unchecked}>
        {isSelected && <View style={selectStyles.innerCircle} />}
      </View>
    );
  };
  const selectionEle = (text: string) => {
    return (
      <TouchableOpacity key={text} onPress={()=>{setSelected(text)}}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {CustomCheckbox(selected == text)}
          <MyText style={{fontSize: 16}}>{text}</MyText>
        </View>
      </TouchableOpacity>
    )
  }
  return (
    <MyModal buttons={buttons} visible={visible}>
      <MyText style={{fontSize: 18, fontWeight: 500}}>
        {title}
      </MyText>
      <View style={{height: px2dp(20)}}/>
      {
        selections.map(selection => selectionEle(selection))
      }
      <View style={{height: px2dp(20)}}/>
    </MyModal>
  );
}

const selectStyles = StyleSheet.create({
  unchecked: {
    margin: 6,
    marginLeft: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#686868',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    margin: 6,
    marginLeft: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#551200',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  innerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#551200',
  },
})

const SettingScreen: React.FC = ({navigation}) => {
  const [key, setKey] = useState<number>(0)
  useEffect(()=>{
    return subscribe(appStore.config, () => {
      setKey(prevState => prevState + 1)
    })
  },[])

  const [selectorVisible, setSelectorVisible] = useState<boolean>(false)
  const [selectConfirmOperate, setSelectConfirmOperate] = useState<(text: string) => void>(() => {});
  const [selections, setSelections] = useState<string[]>([])
  const [selectInitial, setSelectInitial] = useState<string>('')
  const [selectTitle, setSelectTitle] = useState<string>('')
  const openDirectSelector = () => {
    setSelections(Object.values(ENUM_SETTING_DIRECTION));
    setSelectInitial(getSettingReadDirection());
    setSelectTitle('阅读方向')
    const handleSelectConfirm = (text: ENUM_SETTING_DIRECTION) => {
      switch (text) {
        case ENUM_SETTING_DIRECTION.L_TO_R:
          appStore.config.readDirection = ENUM_READ_DIRECTION.ROW;
          appStore.config.readRowDirection = ENUM_ROW_DIRECTION.L_TO_R;
          break;
        case ENUM_SETTING_DIRECTION.R_TO_L:
          appStore.config.readDirection = ENUM_READ_DIRECTION.ROW;
          appStore.config.readRowDirection = ENUM_ROW_DIRECTION.R_TO_L;
          break;
        case ENUM_SETTING_DIRECTION.T_TO_B:
          appStore.config.readDirection = ENUM_READ_DIRECTION.COL;
          break;
      }
      saveConfig();
      setSelectorVisible(false);
    };
    setSelectConfirmOperate(() => handleSelectConfirm);
    setSelectorVisible(true);
  };
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
  const settingOptions: Options = [
    {
      description: '清除缓存',
      info: '清除缓存的图片，图片加载错误时可尝试清除',
      operation: clearCache
    },
    {
      description: '阅读方向',
      info: getSettingReadDirection(),
      operation: openDirectSelector
    },
    {
      description: '音量键翻页',
      info: appStore.config.volPaging ? '启用' : '关闭',
      operation: switchVolPaging
    },
    {
      description: '更新与支持',
      operation: () => {
        navigation.navigate('AboutScreen')
      }
    }
  ]
  const isOdd = (number) => {
    return number % 2 !== 0;
  }
  return (
    <>
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
          <TouchableOpacity
            onPress={navigation.goBack}
            style={{height: px2dp(60), width: px2dp(60), position: 'absolute', left: px2dp(20)}}
          >
            <Image
              style={{height: px2dp(60), width: px2dp(60)}}
              source={{uri: BACK_ICON}}
            />
          </TouchableOpacity>
          <StatusBar backgroundColor={'#ffe6b7'}/>
        </View>
        <OptionsContainer key={key} options={settingOptions}/>
        <View style={styles.button}>
          <Button title={'退出登录'} color={'#551200'} onPress={resetCookies}/>
        </View>
      </ScrollView>
      <SelectModal
        close={()=>{setSelectorVisible(false)}}
        confirmOperate={selectConfirmOperate}
        selections={selections}
        visible={selectorVisible}
        initial={selectInitial}
        title={selectTitle}/>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    backgroundColor: '#f8f8e0'
  },
  button: {
    marginTop: px2dp(50),
    paddingLeft: px2dp(10),
    paddingRight: px2dp(10)
  },
})

export default SettingScreen;
