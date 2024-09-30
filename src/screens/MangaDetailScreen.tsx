import React, {createRef, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Keyboard, NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TextInput,
  TextInputSubmitEditingEventData,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getThreadRateInfo,
  getThreadsImageListByWebView,
  initDownloadManga,
  px2dp, rateThread,
} from "../utils";
import MangaCoverImage from "../components/MangaCoverImage";
import MyText from "../components/MyText";
import {StatusBar} from "expo-status-bar";
import {Feature} from "../../types";
import {Image} from "expo-image";
import MyModal from "../components/MyModal";
import Toast from "react-native-root-toast";
import CommentsWebview from "../components/CommentsWebview";
import {HEIGHT, STATUS_BAR_HEIGHT} from "../constants/Dimensions";
import {getMobileThreadUrl} from "../constants/urls";
import {HEART_ICON, INTERNET_ICON, SEARCH_ICON} from "../constants/images";

const MangaDetailScreen: React.FC<{ route, navigation }> = ({route, navigation}) => {
  const [loaded, setLoaded] = useState(false)
  const [imageList, setImageList] = useState([])
  const [authorComment, setAuthorComment] = useState(null)
  const [quickSearchShow, setQuickSearchShow] = useState(false)
  const [queryRatingStatus, setQueryRatingStatus] = useState(false)
  const [ratingShow, setRatingShow] = useState(false)
  const [textInputValue, setTextInputValue] = useState('')
  const textInputRef = useRef<TextInput>();
  const {id, author, authorName, title, date} = route.params
  useEffect(() => {
    getThreadsImageListByWebView(id, author).then(res => {
      setLoaded(true)
      setImageList([...res])
    })
    // getThreadAuthorComment(id).then(res => {
    //   setAuthorComment(replaceNewlines(res))
    // })
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
      icon: {uri: SEARCH_ICON}
    },
    {
      title: '评分',
      operation: () => {
        setRatingShow(true)
        setQueryRatingStatus(true)
        getThreadRateInfo(id).then(res => {
          setQueryRatingStatus(false)
          if (res.rated) {
            setRatingShow(false)
            Toast.show('抱歉，您不能对同一个帖子重复评分', {position: 0})
          } else {
            setRatingShow(true)
          }
        }).catch(e => {
          Toast.show(e, {position: 0})
          setQueryRatingStatus(false)
        })
      },
      icon: {uri: HEART_ICON}
    },
    {
      title: '源网页',
      operation: () => {
        navigation.push('ThreadNativeWebview', {url: getMobileThreadUrl(id)})
      },
      icon: { uri: INTERNET_ICON }
    },
  ]
  const quickSearchModalButtons = [
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
  const ratingModalButtons = [
    {
      description: "确定",
      operation: () => {
        rateThread(id, ratingScoreTextInputValue, ratingReasonTextInputValue).then(res => {
          Toast.show('评分成功！', {position: 0})
        }).catch(e => {
          Toast.show(String(e), {position: 0})
        })
        setRatingShow(false)
      }
    },
    {
      description: "取消",
      operation: () => {
        setRatingShow(false)
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
      if (textInputRef.current || ratingScoreTextInputRef.current || ratingReasonTextInputRef.current) {
        try {
          textInputRef.current.blur()
        } catch (e) {
        }
        try {
          ratingScoreTextInputRef.current.blur()
          ratingReasonTextInputRef.current.blur()
        } catch (e) {
        }
        Keyboard.removeAllListeners('keyboardDidHide')
      }
    })
  }
  const onBlur = () => {
    Keyboard.removeAllListeners('keyboardDidHide')
  }
  const [ratingScoreTextInputValue, setRatingScoreTextInputValue] = useState('5')
  const ratingScoreTextInputRef = useRef<TextInput>();
  const [ratingReasonTextInputValue, setRatingReasonTextInputValue] = useState('')
  const ratingReasonTextInputRef = useRef<TextInput>();
  const onChangeRatingScoreText = (e) => {
    setRatingScoreTextInputValue(e)
  }
  const onChangeRatingReasonText = (e) => {
    setRatingReasonTextInputValue(e)
  }
  const [dragging, setDragging] = useState<boolean>(false)
  const [scrollY, setScrollY] = useState<number>(0)
  const [triggerScroll, setTriggerScroll] = useState<boolean>(false)
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    if(triggerScroll) {
      if(contentOffset.y !== scrollY) scrollBack(contentOffset.y)
      else setTriggerScroll(false)
    }else {
      if(!dragging) {
        scrollBack(contentOffset.y)
      }
      else {
        setScrollY(contentOffset.y)
      }
    }
  }
  const scrollBack = (nowScrollY: number) => {
    if(nowScrollY !== scrollY) {
      scrollViewRef.current.scrollTo({x: 0, y: scrollY, animated: false})
      setTriggerScroll(true)
    }
  }
  const onScrollBeginDrag = () => {
    setDragging(true)
  }
  const onScrollEndDrag = () => {
    setDragging(false)
  }
  const scrollViewRef = createRef<ScrollView>();
  const [nativeHeight, setNativeHeight] = useState<number>(0)
  const handleNativeLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setNativeHeight(height)
  };
  const webviewHeight =  useMemo(()=>{
    return nativeHeight === 0 ? 0 : HEIGHT - STATUS_BAR_HEIGHT - nativeHeight
  }, [nativeHeight])
  return (
      <ScrollView
        ref={scrollViewRef}
        style={[styles.container, styles.page]}
        // onScroll={onScroll}
        // onScrollBeginDrag={onScrollBeginDrag}
        // onMomentumScrollEnd={onScrollEndDrag}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <StatusBar backgroundColor={'#FFEDBB'}/>
        <MyModal buttons={quickSearchModalButtons} visible={quickSearchShow}>
          <TextInput allowFontScaling={false} ref={textInputRef} onFocus={onFocus} onBlur={onBlur}
                     onSubmitEditing={onSubmitEditing} onChangeText={onChangeText} value={textInputValue}
                     style={{
                       borderWidth: px2dp(1),
                       paddingLeft: px2dp(10),
                       marginBottom: px2dp(10)
                     }}
          />
        </MyModal>
        <MyModal buttons={ratingModalButtons} visible={ratingShow} buttonShow={!queryRatingStatus}>
          {queryRatingStatus ? <ActivityIndicator animating={queryRatingStatus} color={'#551200'}/> :
            <>
              <View style={styles.ratingTitle}>
                <MyText style={styles.ratingTitleText}>评分</MyText>
              </View>
              <View style={styles.ratingFormContainer}>
                <View style={styles.ratingOption}>
                  <MyText style={styles.ratingOptionLabel}>积分</MyText>
                  <TextInput allowFontScaling={false} ref={ratingScoreTextInputRef} onFocus={onFocus} onBlur={onBlur}
                             onChangeText={onChangeRatingScoreText} value={ratingScoreTextInputValue}
                             style={styles.ratingOptionInput} keyboardType={'number-pad'}
                  />
                </View>
                <View style={styles.ratingOption}>
                  <MyText style={styles.ratingOptionLabel}>理由</MyText>
                  <TextInput allowFontScaling={false} ref={ratingReasonTextInputRef} onFocus={onFocus} onBlur={onBlur}
                             onChangeText={onChangeRatingReasonText} value={ratingReasonTextInputValue}
                             style={styles.ratingOptionInput}
                             placeholder={'选填评分理由'}
                  />
                </View>
              </View>
            </>
          }
        </MyModal>
        {loaded &&
          <>
            <View onLayout={handleNativeLayout}>
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
                  navigation.navigate('MangaReader', {imageList: imageList, id})
                }} style={[styles.container]}>
                  <View style={[styles.downloadReadBtn, styles.downloadBtn]}>
                    <MyText>阅读</MyText>
                  </View>
                </TouchableOpacity>
                <View style={styles.verticalLine}/>
                <TouchableOpacity
                  // onPress={() => navigation.navigate('MangaNativeWebview', {id: id})}
                  onPress={() => navigation.navigate('Comment', {id: id})}
                  style={[styles.container]}
                >
                  <View style={[styles.downloadReadBtn, styles.downloadBtn]}>
                    <MyText>评论区</MyText>
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
            </View>
            <CommentsWebview webviewHeight={webviewHeight} tid={id} scrollViewRef={scrollViewRef}/>
            {/*{authorComment !== null ?*/}
            {/*  <View style={styles.authorComment}>*/}
            {/*    <MyText style={styles.authorCommentTitle}>贴主评论</MyText>*/}
            {/*    <MyText style={styles.authorCommentContent}>{authorComment}</MyText>*/}
            {/*  </View> : <></>*/}
            {/*}*/}
          </>
        }

      </ScrollView>
  )
}

const styles = StyleSheet.create({
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
    alignItems: "center"
  },
  feature: {
    flex: 1,
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
  authorCommentContent: {},
  ratingTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: px2dp(20)
  },
  ratingTitleText: {
    fontSize: 16,
    fontWeight: "bold"
  },
  ratingFormContainer: {},
  ratingOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: px2dp(10)
  },
  ratingOptionLabel: {
    marginRight: px2dp(10)
  },
  ratingOptionInput: {
    borderWidth: px2dp(1),
    paddingLeft: px2dp(10),
    marginBottom: px2dp(5),
    marginTop: px2dp(5),
    flex: 1
  },
  expandIcon: {
    marginLeft: px2dp(5),
    height: px2dp(40),
    width: px2dp(40)
  }
})
export default MangaDetailScreen;
