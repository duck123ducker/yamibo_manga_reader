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

export function webViewRedirectTo(url: String) {
  appStore.webViewUrl = '';
  setImmediate(() => {
    appStore.webViewUrl = url;
  });
}

export function getHash() {
  return Math.random().toString(36).slice(2)
}

export function getDocByWebView(url: String, method = 'GET', timeout: number = 30000) {
  const hash = getHash()
  appStore.webViewRequest[hash] = {
    type: 'doc',
    method: method,
    url: url,
    timeout: timeout
  }
  return new Promise((resolve, reject) => {
    let timer
    const unsubscribe = subscribe(appStore.webViewResult, () => {
      if (appStore.webViewResult.hasOwnProperty(hash)) {
        clearTimeout(timer);
        unsubscribe();
        if (appStore.webViewResult[hash].code === 200) {
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
  });
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
        threadTitles.push({
          id: tbody.id.split('_')[1],
          title: aElement.text.trim(),
          author: author.getAttribute('href').split('-')[2].split('.')[0],
          authorName: author.innerText.trim(),
          date: date
        })
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
            saveBase64ImageToCache(appStore.webViewResult[hash].result, url2FileName(url)).then(() => {
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
  }
}

export function checkImageListInMKKV(id) {
  // const cache = MMKVStorage.getString(`imageList.${id}`)
  let cache = null
  try {
    cache = MMKVGetJson(`imageList.${id}`)
  } catch (e) {
  }
  if (!!cache) {
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
        const zoomImages = root.querySelectorAll('img.zoom[file*="data/attachment"]');
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
  return (uiElementPx * Dimensions.get("window").width) / uiWidthPx;
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

export function saveBase64ImageToCache(base64ImageData, fileName) {
  return new Promise(async (resolve, reject) => {
    try {
      const matches = base64ImageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const base64Data = matches[2];
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
  return url.split('/').pop()
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

function replaceDecryptEmail(element){
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
      parent.set_content(replacedHtml, { decodeEntities: true });
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
    getDocByWebView('https://bbs.yamibo.com/member.php?mod=logging&action=login&mobile=2').then(res => {
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
