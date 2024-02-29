import React, {useEffect, useState} from 'react';
import {View, Animated} from "react-native";
import {getPicByWebView, px2dp} from "../utils";
import {Image, ImageContentFit} from 'expo-image'
import MyText from "./MyText";

const ImageLoader: React.FC<{ uri: string, width: number, height: number, resizeMode: ImageContentFit, imgWidth:number, imgHeight:number, visible:boolean, hideMessage:string, fade: boolean, loadingMessage: string, imageStyle }> =
    ({ uri, width, height, resizeMode = 'cover' as ImageContentFit, imgWidth,imgHeight, visible=true, hideMessage='', fade=false, loadingMessage='Loading...', imageStyle}) => {
    const [loaded, setLoaded] = useState(false);
    const [imgData, setImgData] = useState<any>(null);
    const [picWidth, setWidth] = useState(0);
    const [picHeight, setHeight] = useState(0);
    const [opacity, setOpacity] = useState(new Animated.Value(0));
    useEffect(() => {
        if(uri.startsWith('data:')){
            setImgData({
                result: uri,
                width: imgWidth,
                height: imgHeight
            });
            setLoaded(true);
        }else if(uri.startsWith('data/')||uri.startsWith('http')||uri.startsWith('file://')){
            getPicByWebView(uri).then(data=>{
                setImgData(data);
                setLoaded(true);
            })
        }
    }, [uri]);
    useEffect(() => {
        Animated.timing(opacity, {
            toValue: 1,
            duration: 500, // 调整动画持续时间
            useNativeDriver: true,
        }).start();
    }, [loaded]);
    if(!uri.startsWith('data')&&!uri.startsWith('http')&&!uri.startsWith('file://')){
        return (
            <View style={{height: height, width: width, alignItems: 'center', justifyContent: 'center'}}>
                <MyText>{uri}</MyText>
            </View>
        );
    }else{
        if (!loaded) {
            return (
                <View style={{height: height, width: width, alignItems: 'center', justifyContent: 'center'}}>
                    <MyText>{loadingMessage}</MyText>
                </View>
            );
        }else{
            if(visible){
                return (fade?
                    <Animated.View style={{opacity}}>
                        <Image style={[{height: height===undefined?px2dp(imgData.height):height, width: width===undefined?px2dp(imgData.width):width},imageStyle]}
                               source={{ uri: imgData.result }} contentFit={resizeMode} />
                    </Animated.View>:
                    <Image style={[{height: height===undefined?px2dp(imgData.height):height, width: width===undefined?px2dp(imgData.width):width},imageStyle]}
                           source={{ uri: imgData.result }} contentFit={resizeMode} />
                )//expo-image
                // return <Image resizeMethod={'resize'} resizeMode={resizeMode} style={{height: height, width: width}} source={{ uri: imgData.result }} />;
            }else{
                return (
                    <View style={{height: height, width: width, alignItems: 'center', justifyContent: 'center'}}>
                        <MyText>{hideMessage}</MyText>
                    </View>
                )
            }
        }
    }
};
export default React.memo(ImageLoader);
