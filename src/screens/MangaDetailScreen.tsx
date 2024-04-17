import React, {useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  Modal,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TextInput,
  TextInputSubmitEditingEventData,
  TouchableOpacity,
  View
} from "react-native";
import {
  getThreadAuthorComment,
  getThreadsImageListByWebView,
  initDownloadManga,
  px2dp,
  replaceNewlines
} from "../utils";
import MangaCoverImage from "../components/MangaCoverImage";
import MyText from "../components/MyText";
import {StatusBar} from "expo-status-bar";
import {appStore} from "../store/appStore";
import {Feature} from "../../types";
import {Image} from "expo-image";

const MangaDetailScreen: React.FC<{ route, navigation }> = ({route, navigation}) => {
  const [loaded, setLoaded] = useState(false)
  const [imageList, setImageList] = useState([])
  const [authorComment, setAuthorComment] = useState(null)
  const [quickSearchShow, setQuickSearchShow] = useState(false)
  const [textInputValue, setTextInputValue] = useState('')
  const textInputRef = useRef<TextInput>();
  const {id, author, authorName, title, date} = route.params
  useEffect(() => {
    getThreadsImageListByWebView(id, author).then(res => {
      setLoaded(true)
      setImageList([...res])
    })
    getThreadAuthorComment(id).then(res => {
      setAuthorComment(replaceNewlines(res))
    })
  }, [])
  const download = () => {
    initDownloadManga(id, imageList, author, authorName, title, date)
  }
  const features: Feature[] = [
    {
      title: '快捷搜索',
      operation: () => {
        setTextInputValue(title.split('】').pop().split(']').pop().split(' ').find(item => item.trim() !== ''))
        setQuickSearchShow(true)
      },
      icon: require('../../assets/search.png')
    }
  ]
  const modalButtons = [
    {
      description: "搜索",
      operation: () => {
        setQuickSearchShow(false)
        navigation.push('HomeScreen', {routeMode: 'search', keyWord: textInputValue})
      }
    },
    {
      description: "取消",
      operation: () => {
        setQuickSearchShow(false)
      }
    }
  ]
  const onChangeText = (e) => {
    setTextInputValue(e)
  }
  const onSubmitEditing = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
  }
  const onFocus = () => {
    Keyboard.addListener('keyboardDidHide', () => {
      if (textInputRef.current) {
        textInputRef.current.blur()
        Keyboard.removeAllListeners('keyboardDidHide')
      }
    })
  }
  const onBlur = () => {
    Keyboard.removeAllListeners('keyboardDidHide')
  }
  return (
    <ScrollView style={[styles.container, styles.page]}>
      <StatusBar backgroundColor={'#FFEDBB'}/>
      <Modal
        animationType="fade"
        transparent={true}
        visible={quickSearchShow}
        onRequestClose={() => {
        }}
      >
        <View style={styles.mask}>
          <View style={styles.modalContainer}>
            <TextInput allowFontScaling={false} ref={textInputRef} onFocus={onFocus} onBlur={onBlur}
                       onSubmitEditing={onSubmitEditing} onChangeText={onChangeText} value={textInputValue}
                       style={{
                         borderWidth: px2dp(1),
                         paddingLeft: px2dp(10),
                         marginBottom: px2dp(10)
                       }}
            />
            <View style={styles.modalButtons}>
              {
                modalButtons.map(item => (
                  <TouchableOpacity key={item.description} onPress={item.operation}>
                    <MyText style={styles.modalBtn}>{item.description}</MyText>
                  </TouchableOpacity>
                ))
              }
            </View>
          </View>
        </View>
      </Modal>
      {loaded &&
        <>
          <View style={[styles.head]}>
            <MangaCoverImage id={id} author={author} width={px2dp(255)} height={px2dp(360)} visible={true}/>
            <View style={[styles.container, styles.description]}>
              <MyText style={styles.title}>{title}</MyText>
              <View style={styles.infos}>
                <MyText>{authorName}</MyText>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <MyText>{date}</MyText>
                  <MyText>共{imageList.length}页</MyText>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.downloadReadBtns}>
            <TouchableOpacity onPress={() => {
              navigation.navigate('MangaReader', {imageList: imageList})
              appStore.readingPage = 1
            }} style={[styles.container]}>
              <View style={[styles.downloadReadBtn, styles.downloadBtn]}>
                <MyText>阅读</MyText>
              </View>
            </TouchableOpacity>
            <View style={styles.verticalLine}/>
            <TouchableOpacity onPress={() => navigation.navigate('MangaNativeWebview', {id: id})}
                              style={[styles.container]}>
              <View style={[styles.downloadReadBtn, styles.downloadBtn]}>
                <MyText>查看/发表评论</MyText>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.horizonLine}/>
          <View style={styles.features}>
            {
              features.map(item => (
                <TouchableOpacity onPress={item.operation} key={item.title} style={styles.feature}>
                  <Image source={item.icon} style={styles.featureIcon}/>
                  <MyText style={styles.featureDescription}>{item.title}</MyText>
                </TouchableOpacity>
              ))
            }
          </View>
          <View style={styles.horizonLine}/>
          {authorComment !== null ?
            <View style={styles.authorComment}>
              <MyText style={styles.authorCommentTitle}>贴主评论</MyText>
              <MyText style={styles.authorCommentContent}>{authorComment}</MyText>
            </View> : <></>
          }
        </>
      }
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    backgroundColor: '#f8f8e0',
    width: px2dp(600),
    padding: px2dp(20)
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  modalBtn: {
    fontWeight: "bold"
  },
  container: {
    flex: 1
  },
  page: {
    backgroundColor: '#f8f8e0'
  },
  head: {
    paddingLeft: px2dp(20),
    paddingRight: px2dp(20),
    paddingTop: px2dp(10),
    paddingBottom: px2dp(30),
    backgroundColor: '#FFEDBB',
    flexDirection: 'row',
    height: px2dp(400),
    marginBottom: px2dp(20)
  },
  description: {
    flexDirection: 'column',
    marginLeft: px2dp(10),
    justifyContent: "space-between"
  },
  title: {
    fontSize: 20
  },
  infos: {
    flexDirection: "column",
    // justifyContent: "space-between"
  },
  downloadReadBtns: {
    marginLeft: px2dp(20),
    marginRight: px2dp(20),
    marginBottom: px2dp(40),
    marginTop: px2dp(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    backgroundColor: '#FFEDBB',
    height: px2dp(90),
    borderRadius: px2dp(5),
    shadowColor: '#000',
    shadowOffset: {
      width: px2dp(2),
      height: px2dp(2),
    },
    shadowOpacity: 1,
    elevation: 5,
  },
  downloadReadBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadBtn: {},
  readBtn: {},
  verticalLine: {
    width: px2dp(2),
    height: '80%',
    backgroundColor: '#a4a4a4'
  },
  horizonLine: {
    marginLeft: px2dp(20),
    marginRight: px2dp(20),
    height: px2dp(2),
    backgroundColor: '#a4a4a4'
  },
  features: {
    paddingVertical: px2dp(10),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  feature: {
    justifyContent: "center",
    alignItems: "center"
  },
  featureIcon: {
    height: px2dp(70),
    width: px2dp(70)
  },
  featureDescription: {},
  authorComment: {
    marginTop: px2dp(20),
    marginLeft: px2dp(20),
    marginRight: px2dp(20)
  },
  authorCommentTitle: {
    fontSize: 18,
    fontWeight: "bold"
  },
  authorCommentContent: {}
})
export default MangaDetailScreen;
