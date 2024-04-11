import React, {useEffect, useState} from "react";
import {View, FlatList, TouchableOpacity, StyleSheet} from "react-native";
import {appStore} from "../store/appStore";
import {useSnapshot} from "valtio/react";
import {px2dp} from "../utils";
import MangaCoverImage from "../components/MangaCoverImage";
import MyText from "../components/MyText";
import {MMKVStorage} from "../store/MKKVStorage";


const DownloadManagerScreen: React.FC = ({navigation}) => {
  const [downloadProgressList, setDownloadProgressList] = useState([])
  const {downloadProgress} = useSnapshot(appStore)
  useEffect(() => {
    try {
      const tmpProgress = JSON.parse(MMKVStorage.getString(`downloadMangas`))
      for (const key in appStore.downloadProgress) {
        tmpProgress[key].status = downloadProgress[key].status
      }
      const tmpProgressList = Object.values(tmpProgress)
      tmpProgressList.sort((a, b) => b.createTime - a.createTime)
      setDownloadProgressList(tmpProgressList)
    } catch (e) {
      console.log(e)
      setDownloadProgressList([])
    }
  }, [downloadProgress])
  const getStatusText = (item) => {
    switch (item.status) {
      case 'pause': {
        return '暂停';
      }
      case 'complete': {
        return '完成';
      }
      case 'downloading': {
        return '下载中';
      }
      case 'queue': {
        return '等待中';
      }
      case '': {
        if (item.progress === item.imageList.length) return '完成';
        else return '未完成'
      }
      default: {
        return '未知';
      }
    }
  };
  return (
    <View>
      <FlatList data={downloadProgressList}
                renderItem={({item, index}) => (
                  <View>
                    <TouchableOpacity key={item.id} onPress={() => {
                    }}>
                      <View style={[styles.manga]}>
                        <MangaCoverImage id={item.id} author={item.author} width={px2dp(170)} height={px2dp(240)}
                                         visible={true}/>
                        <View style={styles.description}>
                          <MyText style={{fontSize: 16}}>{item.title}</MyText>
                          <View style={styles.progressControl}>
                            <MyText>{item.progress}/{item.imageList.length}</MyText>
                            <MyText>{getStatusText(item)}</MyText>
                            <MyText>继续</MyText>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}/>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  manga: {
    flex: 1,
    flexDirection: "row",
    height: px2dp(251),
    borderStyle: "solid",
    borderBottomWidth: px2dp(1),
    borderBottomColor: '#666',
    paddingVertical: px2dp(5),
    paddingHorizontal: px2dp(8)
  },
  description: {
    flex: 1,
    paddingLeft: px2dp(10),
    justifyContent: "space-between"
  },
  progressControl: {
    flexDirection: 'row',
    justifyContent: "space-between"
  }
});
export default DownloadManagerScreen;
