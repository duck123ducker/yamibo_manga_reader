import React from "react";
import {View, StyleSheet} from "react-native";
import {Image} from "expo-image";
import {px2dp} from "../utils";

const Splash: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image style={{height: px2dp(256 * 750 / 144), width: px2dp(750)}} source={require('../../assets/splash.png')}/>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'white'
  }
})

export default Splash
