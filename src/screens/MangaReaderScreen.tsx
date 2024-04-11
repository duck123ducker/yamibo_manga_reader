import React, {memo, useEffect, useRef, useState} from 'react';
import {NativeScrollEvent, NativeSyntheticEvent, View} from "react-native";
import {getPicByWebView} from "../utils";
import {appStore} from "../store/appStore";
import {StatusBar} from "expo-status-bar";
import WebViewReader from "../components/WebViewReader";
import ProgressStatusBar from "../components/progressStatusBar";


const MangaDetailScreen: React.FC<{ route, navigation }> = ({route, navigation}) => {
  const {imageList} = route.params
  const [imageBase64Dict, setImageBase64Dict] = useState({})
  const [scrollViewOffsetY, setScrollViewOffsetY] = useState<number>(0);
  const scrollViewRef = useRef(null);
  const [visibleHeight, setVisibleHeight] = useState(0);
  const getPics = async () => {
    for (const [index, link] of imageList.entries()) {
      if (appStore.reading) {
        const picData = await getPicByWebView(link)
        setImageBase64Dict(prevState => ({
          ...prevState,
          [link]: picData
        }));
      }
    }
  }
  const handleLayout = (event) => {
    const {height} = event.nativeEvent.layout;
    setVisibleHeight(height);
  };
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    let {y} = e.nativeEvent.contentOffset
    setScrollViewOffsetY(y)
    // console.log('scroll:' + String(y))
  }
  // useEffect(()=>{
  //     if (webViewRef.current !== null){
  //         appStore.reading = true
  //         getPics().then()
  //     }
  //     return ()=>{appStore.reading=false}
  // },[])
  useEffect(() => {
    return () => {
      appStore.reading = false
    }
  }, [])
  const paging = (msg) => {
    appStore.readingPage = msg.top + 1
  }
  // console.log('rerender')
  return (
    <View style={{flex: 1, position: 'relative'}}>
      <StatusBar hidden={true}/>
      <View style={{position: 'absolute', zIndex: 999, right: 0}}>
        <ProgressStatusBar totalPage={imageList.length}/>
      </View>
      <WebViewReader imageList={imageList} paging={paging}/>
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

export default memo(MangaDetailScreen);
