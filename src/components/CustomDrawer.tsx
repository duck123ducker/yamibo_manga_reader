import React from "react";
import {DrawerContentScrollView, DrawerItemList} from "@react-navigation/drawer";
import {StyleSheet, View} from "react-native";
import ImageLoader from "./ImageLoader";
import {useSnapshot} from "valtio";
import {appStore} from "../store/appStore";
import {Image} from "expo-image";
import {px2dp} from "../utils";
import MyText from "./MyText";

const CustomDrawer: React.FC = (props) => {
  const {myInfo} = useSnapshot(appStore)
  return (
    <View style={[styles.container, {backgroundColor: '#FFEDBB'}]}>
      <DrawerContentScrollView contentContainerStyle={styles.container} {...props}>
        <View style={styles.avatar}>
          {myInfo.avatarUri === '' ?
            <Image style={[{height: '100%', width: '100%'}, styles.image]}
                   source={require('../../assets/noavatar.png')}/> :
            <ImageLoader height={px2dp(150)} width={px2dp(150)} resizeMode={'cover'} imageStyle={styles.image}
                         uri={myInfo.avatarUri}/>
          }
        </View>
        <MyText style={styles.name}>{myInfo.nickName}</MyText>
        <View style={[styles.container, styles.options]}>
          <DrawerItemList {...props}/>
        </View>
      </DrawerContentScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  avatar: {
    marginLeft: px2dp(20),
    height: px2dp(150),
    width: px2dp(150),
  },
  image: {
    borderRadius: px2dp(75)
  },
  name: {
    marginLeft: px2dp(20),
    marginTop: px2dp(20),
    marginBottom: px2dp(30),
    fontSize: 15,
    fontWeight: "bold"
  },
  options: {
    backgroundColor: '#f8f8e0',
    paddingTop: px2dp(10)
  }
})

export default CustomDrawer
