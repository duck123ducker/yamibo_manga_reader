import { proxy } from 'valtio'
import {MMKVGetJson} from "./MKKVStorage";

export const appStore = proxy({
    webViewShow: false,
    loggingStatus: false,
    webViewUrl: 'https://bbs.yamibo.com/home.php?mod=space&mobile=no',
    webViewMode: 'common', //'common','login','challenge','pic'
    webViewReady: false,
    webViewUpdateFlag: 1,
    webViewRequest: {
    },
    webViewResult: {
    },
    scriptRequest: {
    },
    scriptResult: {
    },
    reading: false,
    formHash: '',
    downloadProgress: {
    },
    myInfo: {
        avatarUri: (()=>{
            try{
                return MMKVGetJson('myAccountInfo').avatarUri
            }catch (e) {
                return ''
            }
        })(),
        nickName: (()=>{
            try{
                return MMKVGetJson('myAccountInfo').nickName
            }catch (e) {
                return ''
            }
        })()
    },
    readingPage: 1
})
