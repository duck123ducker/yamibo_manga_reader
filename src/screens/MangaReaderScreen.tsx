import React, {memo, useEffect, useMemo, useRef} from 'react';
import {View} from "react-native";
import {appStore} from "../store/appStore";
import {StatusBar} from "expo-status-bar";
import ProgressStatusBar from "../components/progressStatusBar";
import {ENUM_READ_DIRECTION} from "../constants/types";
import WebViewReaderRow from "../components/WebViewReaderRow";
import WebViewReaderCol from "../components/WebViewReaderCol";
import {VolumeManager} from 'react-native-volume-manager';
import {storageReadProgress} from "../utils";


const MangaReaderScreen: React.FC<{ route, navigation }> = ({route, navigation}) => {
  const {imageList, id} = route.params
  const childRef = useRef();
  useEffect(() => {
    // 自己瞎改的安卓原生包，比较烂，不过能用就行
    const volPaging = appStore.config.volPaging
    let volumeListener;
    if(volPaging) {
      VolumeManager.activateKeyListener()
      VolumeManager.activateKeyListener()
      volumeListener = VolumeManager.addVolumeListener((result) => {
        console.log('Volume changed' + JSON.stringify(result));
        if(result.press === 'up') childRef.current.prev();
        else if (result.press === 'down') childRef.current.next();
      });
    }
    return () => {
      if(volPaging) {
        VolumeManager.inactivateKeyListener();
        VolumeManager.inactivateKeyListener();
        volumeListener.remove();
      }
    };
  }, [childRef]);
  // const [imageBase64Dict, setImageBase64Dict] = useState({})
  // const [scrollViewOffsetY, setScrollViewOffsetY] = useState<number>(0);
  // const scrollViewRef = useRef(null);
  // const [visibleHeight, setVisibleHeight] = useState(0);
  // const getPics = async () => {
  //   for (const [index, link] of imageList.entries()) {
  //     if (appStore.reading) {
  //       const picData = await getPicByWebView(link)
  //       setImageBase64Dict(prevState => ({
  //         ...prevState,
  //         [link]: picData
  //       }));
  //     }
  //   }
  // }
  // const handleLayout = (event) => {
  //   const {height} = event.nativeEvent.layout;
  //   setVisibleHeight(height);
  // };
  // const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
  //   let {y} = e.nativeEvent.contentOffset
  //   setScrollViewOffsetY(y)
    // console.log('scroll:' + String(y))
  // }
  // useEffect(()=>{
  //     if (webViewRef.current !== null){
  //         appStore.reading = true
  //         getPics().then()
  //     }
  //     return ()=>{appStore.reading=false}
  // },[])
  const initPage = useMemo(() => {
    const page = Math.min(appStore.readProgress[String(id)] || 1, imageList.length)
    appStore.readingPage = page
    return page
  }, [])
  useEffect(() => {
    return () => {
      appStore.reading = false
    }
  }, [])
  const paging = (msg) => {
    const page = msg.top + 1
    appStore.readingPage = page
    storageReadProgress(id, page)
  }
  // console.log('rerender')
  return (
    <View style={{flex: 1, position: 'relative'}}>
      <StatusBar hidden={true}/>
      <View style={{position: 'absolute', zIndex: 999, right: 0}}>
        <ProgressStatusBar totalPage={imageList.length}/>
      </View>
      {
        appStore.config.readDirection === ENUM_READ_DIRECTION.ROW ?
          <WebViewReaderRow ref={childRef} initPage={initPage} key={Date.now()} imageList={imageList} paging={paging} readRowDirection={appStore.config.readRowDirection}/> :
          <WebViewReaderCol ref={childRef} initPage={initPage} key={Date.now()} imageList={imageList} paging={paging}/>
      }
      {/*<ScrollView nestedScrollEnabled={true} ref={scrollViewRef} onLayout={handleLayout} onScroll={handleScroll}*/}
      {/*            showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>*/}
      {/*  <View>*/}
      {/*    {*/}
      {/*      imageList.map((link, index) => (*/}
      {/*        <View key={index}>*/}
      {/*          {Object.keys(imageBase64Dict).includes(link) ?*/}
      {/*            // <Image style={{height:px2dp(750/imageBase64Dict[link].width*imageBase64Dict[link].height), width:px2dp(750)}} source={{ uri: imageBase64Dict[link].result }}/>:*/}
      {/*            // <WebViewLargeImageLoader height={px2dp(750/imageBase64Dict[link].width*imageBase64Dict[link].height)} uri={imageBase64Dict[link].result} width={px2dp(750)}/>:*/}
      {/*            <ImageLazyLoad*/}
      {/*              visibleHeight={visibleHeight} scrollViewOffsetY={scrollViewOffsetY} scrollViewRef={scrollViewRef}*/}
      {/*              uri={imageBase64Dict[link].result} width={px2dp(750)}*/}
      {/*              height={px2dp(750 / imageBase64Dict[link].width * imageBase64Dict[link].height)}*/}
      {/*              resizeMode={'cover'} imgHeight={imageBase64Dict[link].height} imgWidth={imageBase64Dict[link].width}*/}
      {/*              hideMessage={String(index + 1)}*/}
      {/*            /> :*/}
      {/*            <ImageLoader uri={String(index + 1)} width={px2dp(750)} height={px2dp(750 / 17 * 24)}/>*/}
      {/*          }*/}
      {/*        </View>*/}
      {/*      ))*/}
      {/*    }*/}
      {/*  </View>*/}
      {/*</ScrollView>*/}
    </View>
  )
}

export default memo(MangaReaderScreen);
