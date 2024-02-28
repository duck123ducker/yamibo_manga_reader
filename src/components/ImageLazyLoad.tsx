import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import {ImageResizeMode, LayoutChangeEvent, View} from "react-native";
import ImageLoader from "./ImageLoader";
import {ImageContentFit} from "expo-image";
import {px2dp} from "../utils";

const ImageLazyLoad: React.FC<{ uri: string, width: number, height: number, resizeMode: ImageContentFit, imgWidth:number,
    imgHeight:number, visible:boolean, hideMessage:string, scrollViewRef: MutableRefObject<any>, scrollViewOffsetY: number, visibleHeight: number }> =
    ({ uri, width=0, height=0, resizeMode = 'cover' as ImageContentFit, imgWidth,
     imgHeight, visible=true, hideMessage='Loading',scrollViewRef, scrollViewOffsetY, visibleHeight}) => {
    const [measureY, setMeasureY] = useState(null);
    const imageRef = useRef(null);
    const [myVisible, setMyVisible] = useState(false);
    const handleLayout = (event: LayoutChangeEvent)=>{
        imageRef.current.measureLayout(
            scrollViewRef.current,
            (x, y, width, height) => {
                setMeasureY(y);
            }
        );
    }
    useEffect(()=>{
        if(measureY !== null) {
            if(scrollViewOffsetY + visibleHeight + px2dp(width) >= measureY && scrollViewOffsetY - height - px2dp(width) <= measureY){
                setMyVisible(true)
            }else{
                setMyVisible(false)
            }
        }
    }, [scrollViewOffsetY, visibleHeight, measureY])
    return (
        <View ref={imageRef} onLayout={handleLayout}>
            <ImageLoader uri={uri} width={width} height={height} resizeMode={resizeMode} imgWidth={imgWidth} imgHeight={imgHeight} visible={myVisible} hideMessage={hideMessage}/>
        </View>
    )
}

export default ImageLazyLoad
