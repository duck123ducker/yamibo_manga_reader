import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import MangaCoverImage from "./MangaCoverImage";
import {LayoutChangeEvent, StyleSheet, View} from "react-native";


const MangaCoverImageLazyLoad: React.FC<{ mode: string, id: string, author: string, style: any, scrollViewRef: MutableRefObject<any>, scrollViewOffsetY: number, visibleHeight: number, selfVisible: Boolean }> =
  ({mode, id, author, style, scrollViewRef, scrollViewOffsetY, visibleHeight, selfVisible}) => {
    const imageRef = useRef(null);
    const [measureY, setMeasureY] = useState(null);
    const [visible, setVisible] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const handleLayout = (event: LayoutChangeEvent) => {
      if (mode === 'scrollView') {
        imageRef.current.measureLayout(
          scrollViewRef.current,
          (x, y, width, height) => {
            setMeasureY(y);
          }
        );
      }
    }
    useEffect(() => {
      if (mode === 'scrollView') {
        if (measureY !== null) {
          if (!loaded && scrollViewOffsetY + visibleHeight >= measureY) {
            setLoaded(true)
          }
          if (scrollViewOffsetY + visibleHeight + 10 * style.height >= measureY && scrollViewOffsetY - 11 * style.height <= measureY) {
            setVisible(true)
          } else {
            setVisible(false)
          }
        }
      }
    }, [scrollViewOffsetY, visibleHeight, measureY])
    useEffect(() => {
      if (mode === 'flatList') {
        if (selfVisible) {
          setLoaded(true)
          setVisible(true)
        } else {
          setVisible(false)
        }
      }
    }, [selfVisible])
    if (mode === 'scrollView') {
      return (
        <View ref={imageRef} onLayout={handleLayout} style={[styles.loading, style]}>
          {loaded ?
            <MangaCoverImage visible={visible} author={author} height={style.height} width={style.width} id={id}/> :
            <View style={style}/>}
        </View>
      );
    }
    if (mode === 'flatList') {
      return (
        <View style={[styles.loading, style]}>
          {loaded ?
            <MangaCoverImage visible={visible} author={author} height={style.height} width={style.width} id={id}/> :
            <View style={style}/>}
        </View>
      );
    }
  }

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
  }
})

export default MangaCoverImageLazyLoad;
