import {subscribe} from "valtio";
import {appStore} from "../store/appStore";
import {getPicByWebView, url2FileName} from "../utils";
import * as FileSystem from "expo-file-system";
import {MMKVGetJson, MMKVSetJson} from "../store/MKKVStorage";

let mangaQueue = []
let downloading = false
let downloadingManga = ''

subscribe(appStore.downloadProgress, () => {
  const downloadProgress = JSON.parse(JSON.stringify(appStore.downloadProgress))
  const downloadProgressList = Object.values(downloadProgress)
  downloadProgressList.sort((a, b) => a.continueTime - b.continueTime)
  const tmpQueue = [];
  downloadProgressList.forEach(item => {
    if (item.status === 'queue' || item.status === 'downloading') {
      tmpQueue.push(item.id);
    }
  });
  mangaQueue = tmpQueue
  if (!downloading) {
    downloading = true
    downloadMangas().then(() => {
      downloading = false
    })
  }
})

const downloadMangas = async () => {
  while (mangaQueue.length != 0) {
    await downloadManga(mangaQueue[0])
  }
}

const downloadManga = async (id) => {
  appStore.downloadProgress[id].status = 'downloading'
  const path = FileSystem.documentDirectory + `downloads/${id}/`
  downloadingManga = id
  for (const [index, item] of appStore.downloadProgress[id].imageList.entries()) {
    if (mangaQueue.length === 0) {
      break
    }
    if (downloadingManga !== mangaQueue[0]) {
      break
    }
    try {
      if (index === appStore.downloadProgress[id].progress) {
        const res = await getPicByWebView(item)
        const targetPath = path + url2FileName(item)
        if (mangaQueue.length === 0) {
          break
        }
        if (downloadingManga !== mangaQueue[0]) {
          break
        }
        await FileSystem.copyAsync({from: res.result, to: targetPath});
        res.result = targetPath
        console.log('图片已成功写入下载文件夹:' + targetPath)
        const tmpProgress = MMKVGetJson(`downloadMangas.${id}`)
        tmpProgress.progress += 1
        tmpProgress.imageListInfo[item] = res
        if (mangaQueue.length === 0) {
          break
        }
        if (downloadingManga !== mangaQueue[0]) {
          break
        }
        MMKVSetJson(`downloadMangas.${id}`, tmpProgress)
        appStore.downloadProgress[id].progress += 1
        if (index + 1 === appStore.downloadProgress[id].imageList.length) {
          mangaQueue.shift()
          appStore.downloadProgress[id].status = 'complete'
        }
      }
    } catch (e) {
    }
  }
}
