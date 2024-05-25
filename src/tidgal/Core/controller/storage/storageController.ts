import * as localforage from 'localforage';
import { webgalStore } from 'src/tidgal/store/store';
import { IUserData } from 'src/tidgal/store/userDataInterface';
import { initState, resetUserData } from 'src/tidgal/store/userDataReducer';
import { logger } from '../../util/logger';

import { WebGAL } from 'src/tidgal/Core/WebGAL';

/**
 * 写入本地存储
 */
export const setStorage = debounce(() => {
  const userDataState = webgalStore.getState().userData;
  localforage.setItem(WebGAL.gameKey, userDataState).then(() => {
    logger.log('写入本地存储');
  });
}, 100);

/**
 * 从本地存储获取数据
 */
export const getStorage = debounce(() => {
  localforage.getItem(WebGAL.gameKey).then((newUserData) => {
    // 如果没有数据或者属性不完全，重新初始化
    if (!newUserData || !checkUserDataProperty(newUserData)) {
      logger.log('现在重置数据');
      setStorage();
      return;
    }
    resetUserData(newUserData as IUserData);
  });
}, 100);

/**
 * 防抖函数
 * @param func 要执行的函数
 * @param wait 防抖等待时间
 */
function debounce<T, K>(function_: (...arguments_: T[]) => K, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;

  function context(...arguments_: T[]): K {
    clearTimeout(timeout);
    let returnValue: K;
    timeout = setTimeout(() => {
      returnValue = function_.apply(context, arguments_);
    }, wait);
    return returnValue;
  }

  return context;
}

export const dumpToStorageFast = () => {
  const userDataState = webgalStore.getState().userData;
  localforage.setItem(WebGAL.gameKey, userDataState).then(() => {
    localforage.getItem(WebGAL.gameKey).then((newUserData) => {
      // 如果没有数据，初始化
      if (!newUserData) {
        setStorage();
        return;
      }
      resetUserData(newUserData as IUserData);
    });
    logger.log('同步本地存储');
  });
};

/**
 * 检查用户数据属性是否齐全
 * @param userData 需要检查的数据
 */
function checkUserDataProperty(userData: any) {
  let result = true;
  for (const key in initState) {
    if (!userData.hasOwnProperty(key)) {
      result = false;
    }
  }
  return result;
}

export async function setStorageAsync() {
  const userDataState = webgalStore.getState().userData;
  return await localforage.setItem(WebGAL.gameKey, userDataState);
}

export async function getStorageAsync() {
  const newUserData = await localforage.getItem(WebGAL.gameKey);
  if (!newUserData || !checkUserDataProperty(newUserData)) {
    const userDataState = webgalStore.getState().userData;
    logger.log('现在重置数据');
    return await localforage.setItem(WebGAL.gameKey, userDataState);
  } else resetUserData(newUserData as IUserData);
}
