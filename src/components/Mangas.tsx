import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity, TextInput, TextInputSubmitEditingEventData, Keyboard, ViewToken, RefreshControl
} from "react-native";
import {checkLogin, getNextSearchPage, getTitlesByWebView, px2dp, searchThread, uniqueJsonArray} from "../utils";
import MangaCoverImageLazyLoad from "./MangaCoverImageLazyLoad";
import {Image} from "expo-image";
import Toast from "react-native-root-toast";
import MyText from "./MyText";
import {StatusBar} from "expo-status-bar";
import Marquee from "./Marquee";
import {useBackHandler} from '@react-native-community/hooks'
import {appStore} from "../store/appStore";
import {MENU_ICON, SEARCH_ICON} from "../constants/images";

const Mangas: React.FC<{ route, navigation }> = ({route, navigation}) => {
  const {routeMode, keyWord} = route.params
  const [threadList, setThreadList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollViewOffsetY, setScrollViewOffsetY] = useState<number>(0);
  const scrollViewRef = useRef(null);
  const [visibleHeight, setVisibleHeight] = useState(0);
  const [requesting, setRequesting] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  // const [loading, setLoading] = useState(false)
  const textInputRef = useRef<TextInput>();
  const [mode, setMode] = useState('normal') //'search'
  const [nextSearchPage, setNextSearchPage] = useState('')
  const [searchThreadList, setSearchThreadList] = useState([])
  const [viewableIds, setViewableIds] = useState([-1, -1])
  const [refreshing, setRefreshing] = useState(false);
  const [searchThrottle, setSearchThrottle] = useState(false)
  const onRefresh = useCallback(() => {
    if (mode === 'normal') {
      setRefreshing(true);
      setCurrentPage(1)
      getTitlesByWebView(`https://bbs.yamibo.com/forum-30-${currentPage}.html?mobile=no`).then(res => {
        if (currentPage === 1) {
          res.shift();
        }
        setThreadList([...res]);
        setRefreshing(false)
      })
    } else if (mode === 'search') {
    }
  }, []);
  const getThreadsByPage = async () => {
    setRequesting(true)
    if (currentPage === 1) {//检测登录状态
      if (await checkLogin()) {
        console.log("unlogin")
        appStore.webViewReady = false//重新登录
      } else {
        console.log("checked")
      }
    }
    if (appStore.webViewReady) {//组件卸载不能立即生效故须判断
      getTitlesByWebView(`https://bbs.yamibo.com/forum-30-${currentPage}.html?mobile=no`).then(res => {
        if (currentPage === 1) {
          res.shift();
        }
        setThreadList(uniqueJsonArray([...threadList, ...res]));
        setRequesting(false)
      })
    }
  }
  const handleLayout = (event) => {
    const {height} = event.nativeEvent.layout;
    setVisibleHeight(height);
  };
  const onEndReached = () => {
    if (!requesting) {
      if (mode === 'normal') {
        setCurrentPage(prevState => prevState + 1)
      } else if (mode === 'search') {
        if (nextSearchPage === '') {
          Toast.show('到底了！', {position: 0})
        } else {
          setRequesting(true)
          getNextSearchPage(nextSearchPage).then(res => {
            setSearchThreadList(prevState => [...prevState, ...res.threadList])
            setNextSearchPage(res.nextPageUrl)
            setRequesting(false)
          })
        }
      }
    }
  }
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = e.nativeEvent;
    let {y} = contentOffset
    setScrollViewOffsetY(y)
    if (layoutMeasurement.height + y + 10 >= contentSize.height) {
      onEndReached()
    }
  }
  const handlePress = (id: string, author: string, authorName: string, title: string, date: string) => {
    navigation.push('MangaDetail', {id: id, author: author, authorName: authorName, title: title, date: date})
  }
  useEffect(() => {
    if (routeMode === 'normal') {
      if (!refreshing) {
        getThreadsByPage()
      }
    }
  }, [currentPage])
  useEffect(() => {
    if (routeMode === 'search') {
      search(keyWord)
    }
  }, [])
  const onChangeText = (e) => {
    setSearchValue(e)
  }
  const onSubmitEditing = (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    search(e.nativeEvent.text)
  }
  const search = (value) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({x: 0, y: 0, animated: false})
    }
    if (!!value.trim()) {
      if (!searchThrottle) {
        setSearchThreadList([])
        setNextSearchPage('')
        setMode('search')
        // setLoading(true)
        searchThread(value.trim()).then(res => {
          setSearchThreadList(res.threadList)
          setNextSearchPage(res.nextPageUrl)
          // setLoading(false)
          setSearchThrottle(true)
          setTimeout(() => {
            setSearchThrottle(false)
          }, 10000)
          if (res.threadList.length === 0) {
            Toast.show('无结果', {position: 0})
          }
        })
      } else {
        Toast.show('10秒内仅能搜索一次！', {position: 0})
      }
    } else {
      setSearchThreadList([])
      setNextSearchPage('')
      setMode('normal')
    }
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
  const onViewableItemsChanged = (info: { viewableItems: ViewToken[], changed: ViewToken[] }) => {
    setViewableIds([info.viewableItems[0].index, info.viewableItems[info.viewableItems.length - 1].index])
  }
  const isOdd = (number) => {
    return number % 2 !== 0;
  }
  useBackHandler(() => {
    if (navigation.isFocused()) {
      if (mode === 'search' && routeMode === 'normal') {
        setSearchThreadList([])
        setNextSearchPage('')
        setMode('normal')
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({x: 0, y: 0, animated: false})
        }
        return true
      }
      return false
    } else {
      return false
    }
  })
  return (
    <>
      <StatusBar backgroundColor={'#FFEDBC'} translucent={false}/>
      <View style={{backgroundColor: '#f8f8e0', flex: 1, position: 'relative'}}>
        {/*<LoadingModal visible={loading} message={'搜索中...'}/>*/}
        <View style={{
          backgroundColor: '#FFEDBC',
          height: px2dp(100),
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          display: routeMode === 'normal' ? 'flex' : 'none'
        }}>
          <View style={{
            borderWidth: px2dp(1),
            borderRadius: px2dp(10),
            height: px2dp(80),
            width: px2dp(730),
            flexDirection: 'row'
          }}>
            <TouchableOpacity onPress={() => {
              navigation.openDrawer()
            }}>
              <View style={{height: px2dp(78), width: px2dp(78), alignItems: 'center', justifyContent: 'center'}}>
                <Image source={{uri: MENU_ICON}} style={{height: '75%', width: '75%'}}/>
              </View>
            </TouchableOpacity>
            <TextInput allowFontScaling={false} ref={textInputRef} onFocus={onFocus} onBlur={onBlur}
                       onSubmitEditing={onSubmitEditing} onChangeText={onChangeText} style={{
              paddingLeft: px2dp(10),
              height: px2dp(78),
              width: px2dp(572),
              borderRightWidth: px2dp(1),
              borderLeftWidth: px2dp(1)
            }}/>
            <TouchableOpacity onPress={() => search(searchValue)}>
              <View style={{height: px2dp(78), width: px2dp(78), alignItems: 'center', justifyContent: 'center'}}>
                <Image source={{uri: SEARCH_ICON}} style={{height: '75%', width: '75%'}}/>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/*<FlatList onViewableItemsChanged={onViewableItemsChanged}*/}
        {/*          data={(mode === 'normal' ? threadList : (mode === 'search' ? searchThreadList : []))}*/}
        {/*          renderItem={({item, index}) => (*/}
        {/*            <TouchableOpacity key={index}*/}
        {/*                              onPress={() => handlePress(item.id, item.author, item.authorName, item.title, item.date)}>*/}
        {/*              <View style={[styles.manga]}>*/}
        {/*                <MangaCoverImageLazyLoad style={styles.cover} id={item.id} author={item.author}*/}
        {/*                                         mode={'flatList'}*/}
        {/*                                         selfVisible={index >= viewableIds[0] && index <= viewableIds[1]}/>*/}
        {/*                <View style={styles.description}>*/}
        {/*                  <MyText style={{fontSize: 16}}>{item.title}</MyText>*/}
        {/*                  <View style={styles.authorDate}>*/}
        {/*                    <MyText>{item.authorName}</MyText>*/}
        {/*                    <MyText>{item.date}</MyText>*/}
        {/*                  </View>*/}
        {/*                </View>*/}
        {/*              </View>*/}
        {/*            </TouchableOpacity>*/}
        {/*          )}*/}
        {/*          style={{flex: 1}} key={mode} ref={scrollViewRef} onEndReachedThreshold={px2dp(50)}*/}
        {/*          onEndReached={onEndReached}*/}
        {/*/>*/}
        {(mode === 'normal' ? threadList.length === 0 : searchThreadList.length === 0) ?
          <Marquee width={px2dp(750)} height={px2dp(5)} color1="#ff5d5d" color2="#8bacff" speed={2000}/> :
          <>
            <ScrollView style={{flex: 1}} key={mode} ref={scrollViewRef} onLayout={handleLayout} onScroll={handleScroll}
                        refreshControl={mode === 'normal' ?
                          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/> : <></>
                        }>
              {(mode === 'normal' ? threadList : (mode === 'search' ? searchThreadList : [])).map((thread, index) => (
                <TouchableOpacity key={thread.id}
                                  onPress={() => handlePress(thread.id, thread.author, thread.authorName, thread.title, thread.date)}>
                  <View style={[styles.manga, isOdd(index) ? {backgroundColor: '#FFEDBC'} : {}]}>
                    <MangaCoverImageLazyLoad id={thread.id} author={thread.author} visibleHeight={visibleHeight}
                                             scrollViewOffsetY={scrollViewOffsetY} scrollViewRef={scrollViewRef}
                                             style={styles.cover} mode={'scrollView'}/>
                    <View style={styles.description}>
                      <MyText style={{fontSize: 16}}>{thread.title}</MyText>
                      <View style={styles.authorDate}>
                        <MyText>{thread.authorName}</MyText>
                        <MyText>{thread.date}</MyText>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {requesting ?
              <View style={{width: px2dp(750), height: px2dp(5), position: 'absolute', bottom: px2dp(5)}}>
                <Marquee width={px2dp(750)} height={px2dp(5)} color1="#ff5d5d" color2="#8bacff" speed={2000}/>
              </View> :
              <></>
            }
          </>
        }
      </View>
    </>
  );
};

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
  cover: {
    height: px2dp(240),
    width: px2dp(170)
  },
  description: {
    flex: 1,
    paddingLeft: px2dp(10),
    justifyContent: "space-between"
  },
  authorDate: {
    flexDirection: 'row',
    justifyContent: "space-between"
  },
  hide: {
    display: "none"
  },
  show: {
    display: "flex"
  }
});

export default Mangas;
