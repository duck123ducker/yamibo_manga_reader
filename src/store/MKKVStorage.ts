import {MMKV} from "react-native-mmkv";

export const MMKVStorage = new MMKV()

export function MMKVGetJson(key) {
  try {
    if (key.includes('.')) {
      const keys = key.split('.')
      return JSON.parse(MMKVStorage.getString(keys[0]))[keys[1]]
    } else {
      return JSON.parse(MMKVStorage.getString(key))
    }
  } catch (e) {
    throw new Error()
  }
}

export function MMKVSetJson(key, value) {
  if (key.includes('.')) {
    const keys = key.split('.')
    let parent: (string | object) = MMKVStorage.getString(keys[0])
    if (!parent) {
      parent = {}
    } else {
      parent = JSON.parse(parent)
    }
    MMKVStorage.set(keys[0], JSON.stringify(Object.assign({}, parent, {[keys[1]]: value})))
  } else {
    MMKVStorage.set(key, JSON.stringify(value))
  }
}
