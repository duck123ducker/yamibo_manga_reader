import {appStore} from "../store/appStore";
import {Dimensions, Image} from "react-native";
import {parse, HTMLElement} from 'node-html-parser';
import {TextDecoder} from 'text-encoding';
import {subscribe} from "valtio";
import {getFilename} from "expo-asset/build/AssetUris";
import {MMKVGetJson, MMKVSetJson, MMKVStorage} from "../store/MKKVStorage";
import Toast from "react-native-root-toast";
import * as Application from 'expo-application';
import {
  deleteAsync,
  documentDirectory,
  EncodingType,
  getInfoAsync,
  makeDirectoryAsync,
  readDirectoryAsync,
  writeAsStringAsync
} from "expo-file-system";
import {getMobileThreadUrl, LOGIN_URL, NO_CACHE_LIST} from "../constants/urls";
import {ENUM_READ_DIRECTION, ENUM_ROW_DIRECTION, ENUM_SETTING_DIRECTION} from "../constants/types";
import {WIDTH} from "../constants/Dimensions";
import {RefObject} from "react";
import {WebView} from "react-native-webview";
import app from "../../App";


const fileReader = new FileReader();

export function webViewRedirectTo(url: String) {
  appStore.webViewUrl = '';
  setImmediate(() => {
    appStore.webViewUrl = url;
  });
}

export function getHash() {
  return Math.random().toString(36).slice(2)
}

export function getDocByWebView(url: String, method = 'GET', timeout: number = 30000, payload = null) {
  return new Promise((resolve, reject) => {
    const cacheFlag = (()=>{
      for (const flag of NO_CACHE_LIST) {
        if (url.includes(flag)) return true
      }
      return false
    })()
    if (appStore.urlRequestCache.hasOwnProperty(url) && !cacheFlag) {
      resolve(appStore.urlRequestCache[url])
    } else {
      const hash = getHash()
      appStore.webViewRequest[hash] = {
        type: 'doc',
        method: method,
        url: url,
        timeout: timeout,
        payload: payload
      }
      let timer
      const unsubscribe = subscribe(appStore.webViewResult, () => {
        if (appStore.webViewResult.hasOwnProperty(hash)) {
          clearTimeout(timer);
          unsubscribe();
          if (appStore.webViewResult[hash].code === 200) {
            appStore.urlRequestCache[url] = appStore.webViewResult[hash].result;
            resolve(appStore.webViewResult[hash].result);
          } else {
            reject(appStore.webViewResult[hash].result)
            errorHandler(appStore.webViewResult[hash].code)
          }
          delete appStore.webViewResult[hash]
        }
      });
      timer = setTimeout(() => {
        unsubscribe();
        reject('timer timeout');
      }, timeout + 3000);
    }
  })
}

export function getTitlesByWebView(url: String) {
  return new Promise((resolve, reject) => {
    getDocByWebView(url).then(res => {
      const threadTitles = []
      const root = parse(String(res));
      replaceDecryptEmail(root)
      const tbodyElements = root.querySelectorAll('tbody[id*=normalthread_]');
      tbodyElements.forEach(tbody => {
        const aElement = tbody.querySelectorAll('tr')[0].querySelectorAll('th')[0].querySelectorAll('a')[2]
        const author = tbody.querySelectorAll('tr')[0].querySelectorAll('td')[1].querySelectorAll('a')[0]
        const date = tbody.querySelectorAll('tr')[0].querySelectorAll('td')[1].querySelectorAll('span')[0].innerText.trim()
        if(aElement != undefined){
          threadTitles.push({
            id: tbody.id.split('_')[1],
            title: aElement.text.trim(),
            author: author.getAttribute('href').split('-')[2].split('.')[0],
            authorName: author.innerText.trim(),
            date: date
          })
        }
      });
      resolve(threadTitles);
    })
  })
}

export function getPicByWebView(url: String, method = 'GET', timeout: number = 30000) {
  return getImageInCache(url2FileName(url)).then(res => {
    if (res.exist) {
      return new Promise((resolve, reject) => {
        Image.getSize(res.uri, (width, height) => {
          resolve({
            hash: getHash(),
            url: url,
            timeout: timeout,
            code: 200,
            result: res.uri,
            width: width,
            height: height
          })
        })
      })
    } else {
      return getPic()
    }
  }).catch(err => {
    return getPic()
  })

  function getPic() {
    if (!url.startsWith('http') || url.includes('bbs.yamibo.com')) {
      const hash = getHash()
      appStore.webViewRequest[hash] = {
        type: 'pic',
        url: url,
        method: method,
        timeout: timeout
      }
      return new Promise((resolve, reject) => {
        let timer
        const unsubscribe = subscribe(appStore.webViewResult, () => {
          if (appStore.webViewResult.hasOwnProperty(hash)) {
            clearTimeout(timer);
            unsubscribe();
            if (appStore.webViewResult[hash].code === 200) {
              // resolve(appStore.webViewResult[hash]);
              saveImageToCache(appStore.webViewResult[hash].result, url2FileName(url), 'b64').then(() => {
                getPicByWebView(url, method, timeout).then(res => resolve(res))
              }).catch(err => resolve(appStore.webViewResult[hash]))
            } else {
              reject(appStore.webViewResult[hash].result);
              errorHandler(appStore.webViewResult[hash].code)
            }
            delete appStore.webViewResult[hash]
          }
        });
        timer = setTimeout(() => {
          unsubscribe();
          reject('timer timeout');
        }, timeout + 3000);
      });
    } else {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch(url);
          const imageBlob = await response.blob()
          fileReader.onload = () => {
            const base64Data = fileReader.result;
            saveImageToCache(base64Data, url2FileName(url), 'blob').then(() => {
              getPicByWebView(url, method, timeout).then(res => resolve(res))
            })
          };
          fileReader.onerror = (e) => {
            throw new Error(e.type)
          }
          fileReader.readAsDataURL(imageBlob);
        } catch (e) {
          reject({
            hash: getHash(),
            url: url,
            timeout: 0,
            code: 602, //Pic host error
            result: String(e)
          })
        }
      })
    }
  }
}

export function checkImageListInMKKV(id) {
  // const cache = MMKVStorage.getString(`imageList.${id}`)
  let cache = null
  try {
    cache = MMKVGetJson(`imageList.${id}`)
  } catch (e) {
  }
  if (!!cache && cache.length !== 0) {
    return {exist: true, data: cache}
  } else {
    return {exist: false}
  }
}

export function getThreadsImageListByWebView(id: string, author: string) {
  return new Promise((resolve, reject) => {
    const check = checkImageListInMKKV(id)
    if (check.exist) {
      resolve(check['data'])
    } else {
      getDocByWebView(`https://bbs.yamibo.com/thread-${id}-1-1.html?mobile=no&authorid=${author}`).then(res => {
        const imgList = []
        const root = parse(String(res));
        let zoomImages = root.querySelectorAll('img.zoom[file*="data/attachment"]');
        if (zoomImages.length === 0) {
          zoomImages = root.querySelectorAll('img.zoom')
        }
        zoomImages.forEach(function (img) {
          imgList.push(img.getAttribute('file'))
        });
        // MMKVStorage.set(`imageList.${id}`, JSON.stringify(imgList))
        MMKVSetJson(`imageList.${id}`, imgList)
        resolve(imgList)
      })
    }
  })
}

export function errorHandler(code) {
  switch (code) {
    case 403: {
      if (appStore.webViewMode !== 'login') {
        webViewRedirectTo('https://bbs.yamibo.com/home.php?mod=space&mobile=no')
      }
      alert('人机验证')
      break
    }
    default: {
      Toast.show(code, {position: 0})
    }
  }
}

export function px2dp(uiElementPx) {
  const uiWidthPx = 750;
  return (uiElementPx * WIDTH) / uiWidthPx;
}

export function uniqueJsonArray(array) {
  return array.reduce((accumulator, currentValue) => {
    const key = JSON.stringify(currentValue);
    if (!accumulator[key]) {
      accumulator[key] = true;
      accumulator.result.push(currentValue);
    }
    return accumulator;
  }, {result: []}).result;
}

export function getSignedUrl(script: string, hash, url, timeout) {
  const html = getScriptContent(script)
  const signHash = getHash()
  appStore.scriptRequest[signHash] = html
  const unsubscribe = subscribe(appStore.scriptResult, () => {
    if (appStore.scriptResult.hasOwnProperty(signHash)) {
      unsubscribe();
      const path = appStore.scriptResult[signHash]
      delete appStore.scriptResult[signHash]
      appStore.webViewRequest[hash] = {
        type: 'doc',
        url: replaceUrlPathAndQuery(path, url),
        method: 'GET',
        timeout: timeout
      }
    }
  });
}

export function getScriptContent(script: string) {
  const root = parse(script);
  const scriptTags = root.querySelectorAll('script');
  return scriptTags[0].innerHTML
}

export function addQueryParam(url, params) {
  const separator = url.includes('?') ? '&' : '?';
  const queryParams = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');
  return `${url}${separator}${queryParams}`;
}

export function getUrlPathWithQuery(url) {
  const parsedUrl = new URL(url);
  return parsedUrl.pathname + parsedUrl.search;
}

export function replaceUrlPathAndQuery(pathWithQuery, newUrl) {
  const parsedUrl = new URL(newUrl);
  const [newPath, newQuery] = pathWithQuery.split('?');
  parsedUrl.pathname = newPath;
  if (newQuery) {
    parsedUrl.search = `?${newQuery}`;
  } else {
    parsedUrl.search = '';
  }
  return parsedUrl.toString();
}

export async function ensureDirExists(dir) {
  const dirInfo = await getInfoAsync(dir);
  if (!dirInfo.exists) {
    console.log("directory doesn't exist, creating…");
    await makeDirectoryAsync(dir, {intermediates: true});
  }
}

export function saveImageToCache(data, fileName, type) {
  return new Promise(async (resolve, reject) => {
    try {
      let base64Data = '';
      if (type === 'b64') {
        const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        base64Data = matches[2];
      } else if (type === 'blob') {
        base64Data = data.split(',')[1];
      }
      const cacheDirectory = documentDirectory + 'cache/images/';
      await ensureDirExists(cacheDirectory);
      const cachePath = cacheDirectory + fileName;
      writeAsStringAsync(cachePath, base64Data, {
        encoding: EncodingType.Base64,
      }).then(() => {
        console.log('图片已成功写入缓存文件夹:', cachePath);
        resolve('success');
      })
    } catch (error) {
      console.error('保存图片到缓存文件夹时发生错误:', error);
      reject(error);
    }
  });
}

export function getImageInCache(fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      const fileUri = documentDirectory + 'cache/images/' + fileName;
      const fileInfo = await getInfoAsync(fileUri, {md5: false});
      if (fileInfo.exists) {
        resolve({exist: true, uri: fileInfo.uri});
      } else {
        resolve({exist: false});
      }
    } catch (error) {
      reject(new Error('检查文件时出错: ' + error.message));
    }
  });
}

export function url2FileName(url) {
  // return url.split('/').pop()
  const lastDotIndex = url.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return url.replace(/[\/\:\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\% \<\>\"\\\{\}\|\^\`]/g, '_');
  } else {
    let firstPart = url.substring(0, lastDotIndex);
    let secondPart = url.substring(lastDotIndex);
    firstPart = firstPart.replace(/[\/\:\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\% \<\>\"\\\{\}\|\^\`\.]/g, '_');
    secondPart = secondPart.replace(/[\/\:\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=\% \<\>\"\\\{\}\|\^\`]/g, '_');
    return firstPart + secondPart;
  }
}

export function parseSearchResult(res) {
  const root = parse(String(res));
  let nextPageUrl = ''
  try {
    nextPageUrl = root.querySelector('div.pg').querySelector('a.nxt').getAttribute('href');
  } catch (e) {
  }
  const threads = root.querySelectorAll('li.pbw')
  const threadsInfos = threads.map(thread => {
    return {
      id: thread.getAttribute('id'),
      title: thread.querySelector('h3').innerText.trim(),
      author: thread.querySelectorAll('p')[2].querySelectorAll('span')[1].querySelector('a').getAttribute('href').split('-')[2].split('.')[0],
      authorName: thread.querySelectorAll('p')[2].querySelectorAll('span')[1].querySelector('a').innerText.trim(),
      date: thread.querySelectorAll('p')[2].querySelectorAll('span')[0].innerText.trim()
    }
  })
  return {
    threadList: threadsInfos,
    nextPageUrl: nextPageUrl
  }
}

export function getNextSearchPage(url) {
  return new Promise((resolve, reject) => {
    getDocByWebView(url).then(res => {
      resolve(parseSearchResult(res))
    })
  })
}

export function searchThread(keyWords) {
  const url = addQueryParam('/search.php', {
    mod: 'forum',
    formhash: appStore.formHash,
    srchtxt: keyWords,
    'srchfid[]': 30,
    mobile: 'no',
    searchsubmit: 'yes'
  })
  return new Promise((resolve, reject) => {
    getDocByWebView(url, 'POST').then(res => {
      resolve(parseSearchResult(res))
    })
  })
}

export function rateThreadPost(tid, pid, score, reason) {
  const url = addQueryParam('/forum.php', {
    mod: 'misc',
    action: 'rate',
    ratesubmit: 'yes',
    infloat: 'yes',
    inajax: '1'
  })
  const payload = new URLSearchParams({
    formhash: appStore.formHash,
    tid: tid,
    pid: pid,
    referer: `https://bbs.yamibo.com/forum.php?mod=viewthread&tid=${tid}#pid${pid}`,
    handlekey: "rate",
    score1: score,
    reason: reason
  });
  return new Promise((resolve, reject) => {
    getDocByWebView(url, 'POST', 30000, payload.toString()).then(res => {
      if(res.includes('感谢您的参与')) resolve('success')
      else reject('error')
    }).catch(e => {
      reject(e)
    })
  })
}

export function rateThread(tid, score, reason) {
  return new Promise((resolve, reject) => {
    getDocByWebView(`https://bbs.yamibo.com/forum.php?mod=viewthread&tid=${tid}&mobile=2`).then(res => {
      const root = parse(String(res));
      const pid = root.querySelector('div[id*=pid]').getAttribute('id').slice(3).trim()
      rateThreadPost(tid, pid, score, reason).then(res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    })
  })
}

export function initDownloadManga(id, imageList, author, authorName, title, date) {
  MMKVSetJson(`downloadMangas.${id}`, {
    id: id,
    imageList: imageList,
    title: title,
    author: author,
    authorName: authorName,
    date: date,
    progress: 0,
    createTime: Date.now(),
    imageListInfo: {},
    status: ''
  })
  continueDownloadManga(id, imageList, author, authorName, title, date)
}

export function continueDownloadManga(id, imageList, author, authorName, title, date) {
  const path = documentDirectory + `downloads/${id}/`
  ensureDirExists(path).then(() => {
    const info = MMKVGetJson(`downloadMangas.${id}`)
    appStore.downloadProgress[id] = {
      id: id,
      imageList: info.imageList,
      progress: info.progress,
      createTime: info.createTime,
      continueTime: Date.now(),
      status: 'queue' //pause,complete,downloading,''
    }
  })
}

function decodeEmail(encodedString) {
  let result = "";
  let key = parseInt(encodedString.substr(0, 2), 16);
  let encodedChars = encodedString.slice(2).match(/.{1,2}/g);
  for (let i = 0; i < encodedChars.length;) {
    let hex = encodedChars[i];
    let charCode = parseInt(hex, 16) ^ key;
    if (charCode >= 0x80) {
      let bytesCount;
      if (charCode >= 0xF0) bytesCount = 4;
      else if (charCode >= 0xE0) bytesCount = 3;
      else bytesCount = 2;
      let multibyte = [charCode];
      for (let j = 1; j < bytesCount; j++) {
        i++;
        multibyte.push(parseInt(encodedChars[i], 16) ^ key);
      }
      let charBytes = new Uint8Array(multibyte);
      let decoder = new TextDecoder();
      result += decoder.decode(charBytes);
    } else {
      result += String.fromCharCode(charCode);
    }
    i++;
  }
  return result;
}

function replaceDecryptEmail(element) {
  let elements = element.querySelectorAll('a.__yjs_email__');
  for (let i = 0; i < elements.length; i++) {
    let encryptedEmail = elements[i].attributes['data-yjsemail'];
    let decryptedEmail = decodeEmail(encryptedEmail);
    let span = new HTMLElement('span', {}, '', null);
    span.text = decryptedEmail;
    let parent = elements[i].parentNode;
    if (parent) {
      let html = parent.innerHTML;
      let oldElementHtml = elements[i].outerHTML;
      let newElementHtml = span.outerHTML;
      let replacedHtml = html.replace(oldElementHtml, newElementHtml);
      parent.set_content(replacedHtml, {decodeEntities: true});
    }
  }
}

export function getThreadAuthorComment(id) {
  return new Promise((resolve, reject) => {
    getDocByWebView(`https://bbs.yamibo.com/forum.php?mod=viewthread&tid=${id}&mobile=2`).then(res => {
      const root = parse(String(res));
      replaceDecryptEmail(root)
      resolve(root.querySelector('div[id*=pid]').querySelector('div.message').innerText.trim());
    })
  })
}

export function getThreadRateInfo(id) {
  return new Promise((resolve, reject) => {
    getDocByWebView(`https://bbs.yamibo.com/forum.php?mod=viewthread&tid=${id}&mobile=2`).then(res => {
      const root = parse(String(res));
      const pid = root.querySelector('div[id*=pid]').getAttribute('id').slice(3).trim()
      getDocByWebView(`https://bbs.yamibo.com/forum.php?mod=misc&action=rate&tid=${id}&pid=${pid}&mobile=2&inajax=1`).then(res => {
        if (String(res).includes('抱歉，您不能对同一个帖子重复评分')) {
          resolve({
            rated: true
          })
        } else {
          resolve({
            rated: false
          })
        }
      }).catch(e => {
        reject(e)
      })
    }).catch(e => {
      reject(e)
    })
  })
}

export function replaceNewlines(inputString) {
  return inputString.replace(/(\n|\r|\r\n|&nbsp;){3,}/g, '\n\n').replace(/&nbsp;/g, ' ');
}

export function getMyInfo() {
  getDocByWebView('https://bbs.yamibo.com/home.php?mod=space&mobile=no').then(res => {
    const document = parse(String(res))
    const name = document.querySelector('div.hm').innerText.trim()
    let avatarUri = document.querySelector('img.user_avatar').getAttribute('src')
    if (getFilename(avatarUri) === 'noavatar.svg') avatarUri = ''
    Object.assign(appStore.myInfo, {
      avatarUri: avatarUri,
      nickName: name
    })
    MMKVSetJson('myAccountInfo', {
      avatarUri: avatarUri,
      nickName: name
    })
  })
}

const clearDirectory = async (directoryUri) => {
  try {
    const fileInfoArray = await readDirectoryAsync(directoryUri);
    for (const fileInfo of fileInfoArray) {
      const fileUri = `${directoryUri}/${fileInfo}`;
      await deleteAsync(fileUri, {idempotent: true});
    }
    console.log('All files in directory cleared successfully.');
  } catch (error) {
    console.error('Error while clearing directory:', error);
  }
};

export async function clearCache() {
  await clearDirectory(documentDirectory + `cache/`)
  await clearDirectory(documentDirectory + `downloads/`)
  MMKVStorage.getAllKeys().forEach(key => {
    if (key.includes('imageList.')) {
      MMKVStorage.delete(key)
    }
  })
  MMKVStorage.delete('imageList')
  Toast.show('清除成功！', {position: 0})
}

export async function checkLogin() {
  return new Promise((resolve, reject) => {
    getDocByWebView(LOGIN_URL).then(res => {
      const root = parse(String(res));
      const loginBtn = root.querySelector('div.btn_login');
      if (!loginBtn) {
        MMKVStorage.set('loginStatus', true)
        appStore.loggingStatus = true;
        getMyInfo()
      } else {
        MMKVStorage.set('loginStatus', false)
        appStore.loggingStatus = false;
        appStore.webViewMode = 'login'
      }
      resolve(loginBtn)
    }).catch(error => {
      reject(error)
    })
  })
}

export async function checkUpdate() {
  return new Promise<any>((resolve, reject) => {
    fetch('https://api.github.com/repos/duck123ducker/yamibo_manga_reader/releases/latest').then(response => {
      if (!response.ok) {
        reject('网络请求错误')
      }
      return response.json();
    })
    .then(data => {
      if (Application.nativeApplicationVersion !== data.tag_name.slice(1)) {
        resolve({hasUpdate: true, data: {version: data.tag_name, info: data.body, url: data.html_url}})
      } else {
        resolve({hasUpdate: false})
      }
    })
  })
}

export async function switchReadDirection() {
  appStore.config.readDirection = appStore.config.readDirection ? ENUM_READ_DIRECTION.COL : ENUM_READ_DIRECTION.ROW;
  saveConfig()
}

export async function switchReadRowDirection() {
  appStore.config.readRowDirection = appStore.config.readRowDirection ? ENUM_ROW_DIRECTION.R_TO_L : ENUM_ROW_DIRECTION.L_TO_R;
  saveConfig()
}

export async function switchVolPaging() {
  appStore.config.volPaging = !appStore.config.volPaging;
  saveConfig()
}

export function saveConfig() {
  MMKVSetJson('config', appStore.config)
}

export const fillInfoById = async (id: string): Promise<{ id: string; author: string; authorName: string; title: string; date: string }> => {
  return new Promise((resolve, reject) => {
    getDocByWebView(getMobileThreadUrl(id)).then(res => {
      try{
        const document = parse(String(res));
        const authUlEle = document.querySelector('ul.authi');
        const authorNameEle = authUlEle.querySelector('span.z').querySelector('a')
        const authorName = authorNameEle.innerText.trim()
        const author = authorNameEle.getAttribute('href').split('uid=')[1].split('&')[0]
        const titleEle = document.querySelector('div.view_tit')
        const title = titleEle.lastChild.textContent.trim()
        const dateEle = document.querySelector('li.mtime')
        const date = dateEle.lastChild.textContent.trim()
        const result = {
          id,
          author,
          authorName,
          title,
          date
        }
        resolve(result)
      }catch (e) {
        reject(e)
      }
    }).catch(e => { reject(e) })
  })
};

export function getQueryValue(url, key) {
  const queryString = url.split('?').pop().split('#')[0];
  const regex = /([^&=]+)=([^&]*)/g;
  let match;
  while ((match = regex.exec(queryString))) {
    if (decodeURIComponent(match[1]) === key) {
      return decodeURIComponent(match[2]);
    }
  }
  const simpleParams = queryString.split('&');
  for (const param of simpleParams) {
    const [k, v] = param.split('=');
    if (decodeURIComponent(k) === key) {
      return decodeURIComponent(v);
    }
  }
  return null;
}

export const storageReadProgress = (id: string, page: number) => {
  appStore.readProgress[String(id)] = page
  MMKVSetJson('readProgress', appStore.readProgress)
}

export const insertImageToWebview = (webViewRef: RefObject<WebView>, index: number, picData) => {
  if (webViewRef.current) {
    webViewRef.current.injectJavaScript(`
      try{
        var divElement = document.querySelector('div[id="${index}"]');
        var imgElement = document.createElement('img');
        imgElement.src = '${picData.result}';
        imgElement.style.width = '100vw';
        while (divElement.firstChild) {
          divElement.removeChild(divElement.firstChild);
        }
        divElement.appendChild(imgElement);
      }catch(e){
      // ReactNativeWebView.postMessage(e.toString())
      }
    `)
  }
}

export const getPicListThread = async (imageList: string[], webViewRef: RefObject<WebView>) => {
  appStore.reading = true
  let errCount = 0;
  const finishMap = {};
  while(Object.keys(finishMap).length < imageList.length && errCount < 5 && appStore.reading) {
    try{
      let index = appStore.readingPage - 1
      const target = imageList[index]
      if(!finishMap[target]) {
        console.log(index)
        const picData = await getPicByWebView(target)
        insertImageToWebview(webViewRef, index, picData)
        finishMap[target] = true
      }else {
        // 优先往后找
        let behindFinish = index + 1 === imageList.length;
        while(index + 1 < imageList.length) {
          index++
          const target = imageList[index]
          if(!finishMap[target]) {
            console.log(index)
            const picData = await getPicByWebView(target)
            insertImageToWebview(webViewRef, index, picData)
            finishMap[target] = true
            if(index === imageList.length - 1) behindFinish = true
            break
          }else if(index === imageList.length - 1) behindFinish = true
        }
        // 其次往前找
        if(behindFinish) {
          index = appStore.readingPage - 1
          while(index >= 1) {
            index--
            const target = imageList[index]
            if(!finishMap[target]) {
              console.log(index)
              const picData = await getPicByWebView(target)
              insertImageToWebview(webViewRef, index, picData)
              finishMap[target] = true
              break
            }
          }
        }
      }
    }catch (e) {
      errCount++
    }
  }
}

export const getSettingReadDirection = (): ENUM_SETTING_DIRECTION => {
  if(appStore.config.readDirection === ENUM_READ_DIRECTION.COL) {
    return ENUM_SETTING_DIRECTION.T_TO_B
  }else if(appStore.config.readDirection === ENUM_READ_DIRECTION.ROW) {
    if(appStore.config.readRowDirection === ENUM_ROW_DIRECTION.R_TO_L) {
      return ENUM_SETTING_DIRECTION.R_TO_L
    }else if(appStore.config.readRowDirection === ENUM_ROW_DIRECTION.L_TO_R) {
      return ENUM_SETTING_DIRECTION.L_TO_R
    }
  }
}
