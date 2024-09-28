import React, {useEffect} from "react";
import {StyleSheet, View} from "react-native";
import {fillInfoById} from "../utils";
import Toast from "react-native-root-toast";

const MangaDetailLoadingScreen: React.FC<{ route, navigation }> = ({route, navigation}) => {
  const {id} = route.params
  useEffect(() => {
    fillInfoById(id)
    .then(res => {
      navigation.replace('MangaDetail', res)
    })
    .catch(e => {
      Toast.show(e, {position: 0})
    })
  }, [])
  return <View style={[styles.container, styles.page]}/>
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  page: {
    backgroundColor: '#f8f8e0'
  },
})

export default MangaDetailLoadingScreen;
