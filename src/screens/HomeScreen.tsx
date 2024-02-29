import React from 'react';
import {View} from "react-native";
import {useSnapshot} from "valtio/react";
import {appStore} from "../store/appStore";
import Mangas from "../components/Mangas";
import {webViewRedirectTo} from "../utils";
import MyText from "../components/MyText";
import {MMKVStorage} from "../store/MKKVStorage";

const HomeScreen: React.FC = ({ navigation }) => {
    const { loggingStatus } = useSnapshot(appStore)
    if(!MMKVStorage.getBoolean('loginStatus')){
        appStore.webViewMode = 'login'
        appStore.loggingStatus = false
        webViewRedirectTo('https://bbs.yamibo.com/home.php?mod=space&mobile=no')
        appStore.webViewShow = true
    }else{
        appStore.loggingStatus = true
    }
    return (
        <View style={{flex: 1}}>
            {loggingStatus ?
                <Mangas navigation={navigation}/>:
                <MyText>未登录</MyText>
            }
        </View>
    )
}

export default HomeScreen;
