import {proxy} from 'valtio'
import {MMKVGetJson, MMKVSetJson} from "./MKKVStorage";
import {ENUM_READ_DIRECTION, ENUM_ROW_DIRECTION} from "../constants/types";

export const appStore = proxy({
  webViewShow: false,
  loggingStatus: false,
  webViewUrl: 'https://bbs.yamibo.com/home.php?mod=space&mobile=no',
  webViewMode: 'common', //'common','login','challenge','pic'
  webViewReady: false,
  webViewUpdateFlag: 1,
  webViewRequest: {},
  webViewResult: {},
  scriptRequest: {},
  scriptResult: {},
  reading: false,
  formHash: '',
  downloadProgress: {},
  myInfo: {
    avatarUri: (() => {
      try {
        return MMKVGetJson('myAccountInfo').avatarUri
      } catch (e) {
        return ''
      }
    })(),
    nickName: (() => {
      try {
        return MMKVGetJson('myAccountInfo').nickName
      } catch (e) {
        return ''
      }
    })()
  },
  readingPage: 1,
  updateProps: {message: {info: "", url: "", version: ""}, title: "", visible: false},
  closeUpdateModal: () => {
    appStore.updateProps = {message: {info: "", url: "", version: ""}, title: "", visible: false}
  },
  showUpdateModal: (message, title) => {
    appStore.updateProps = {message: message, title: title, visible: true}
  },
  urlRequestCache: {},
  config: (() => {
    const defaultConfig = {
      readDirection: ENUM_READ_DIRECTION.COL,
      readRowDirection: ENUM_ROW_DIRECTION.R_TO_L
    }
    try {
      return Object.assign({}, defaultConfig, MMKVGetJson('config'))
    } catch (e) {
      MMKVSetJson('config', defaultConfig)
      return defaultConfig
    }
  })()
})
