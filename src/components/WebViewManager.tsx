import React from 'react';
import {useSnapshot} from "valtio/react";
import {appStore} from "../store/appStore";
import WebViewScriptSandBox from "./WebViewScriptSandBox";

const WebViewManager: React.FC = () => {
    const { scriptRequest } = useSnapshot(appStore)
    return (
        <>
            {
                Object.keys(scriptRequest).map(hash => {
                    return <WebViewScriptSandBox key={hash} hash={hash}/>
                })
            }
        </>
    )
}

export default WebViewManager;
