import React from "react";
import {WebView} from "react-native-webview";
import {TouchableOpacity, View} from "react-native";
import MyText from "../components/MyText";
import {Image} from "expo-image";
import {px2dp} from "../utils";
import {StatusBar} from "expo-status-bar";

const MangaNativeWebviewScreen: React.FC = ({route, navigation}) => {
    const { id } = route.params
    return (
        <>
            <View style={{ height: px2dp(100), flexDirection: 'row', backgroundColor: '#ffe6b7', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <MyText style={{fontSize: 18}}>评论区</MyText>
                <TouchableOpacity onPress={navigation.goBack} style={{height: px2dp(60), width: px2dp(60), position: 'absolute', left: px2dp(20)}}>
                    <Image style={{height: px2dp(60), width: px2dp(60)}}
                           source={require('../../assets/back.png')}/>
                </TouchableOpacity>
                <StatusBar backgroundColor={'#ffe6b7'}/>
            </View>
            <WebView
                source={{ uri: `https://bbs.yamibo.com/forum.php?mod=viewthread&tid=${id}&mobile=2` }}
            />
        </>
    )
}

export default MangaNativeWebviewScreen
