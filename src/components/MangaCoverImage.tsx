import React, {useEffect, useState} from 'react';
import {getThreadsImageListByWebView} from "../utils";
import ImageLoader from "./ImageLoader";

const MangaCoverImage: React.FC<{ id: string, author:string, width: number, height: number, visible:boolean }> = ({ id, author, width, height, visible }) => {
    const [loaded, setLoaded] = useState(false);
    const [url, setUrl] = useState('')
    useEffect(()=>{
        getThreadsImageListByWebView(id, author).then(imgList=>{
            if(imgList[0].endsWith('gif')){
                setUrl(String(imgList[1]))
            }else{
                setUrl(String(imgList[0]))
            }
            setLoaded(true)
        })
    },[])
    if (!loaded) {
        return <></>;
    }
    return <ImageLoader visible={visible} resizeMode={'contain'} uri={url} width={width} height={height} fade={true}/>
};
export default React.memo(MangaCoverImage);
