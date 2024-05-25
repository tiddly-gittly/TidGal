import cloneDeep from 'lodash/cloneDeep';
import { loadGameFromStageData } from 'src/tidgal/Core/controller/storage/loadGame';
import { generateCurrentStageData } from 'src/tidgal/Core/controller/storage/saveGame';
import { dumpFastSaveToStorage, getFastSaveFromStorage } from 'src/tidgal/Core/controller/storage/savesController';
import { getStorageAsync, setStorageAsync } from 'src/tidgal/Core/controller/storage/storageController';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { saveActions } from 'src/tidgal/store/savesReducer';
import { webgalStore } from 'src/tidgal/store/store';
import { ISaveData } from 'src/tidgal/store/userDataInterface';

export let fastSaveGameKey = '';
export let isFastSaveKey = '';
let lock = true;

export function initKey() {
  lock = false;
  fastSaveGameKey = `FastSaveKey-${WebGAL.gameName}-${WebGAL.gameKey}`;
  isFastSaveKey = `FastSaveActive-${WebGAL.gameName}-${WebGAL.gameKey}`;
}

/**
 * 用于紧急回避时的数据存储 & 快速保存
 */
export async function fastSaveGame() {
  const saveData: ISaveData = generateCurrentStageData(-1, false);
  const newSaveData = cloneDeep(saveData);
  saveActions.setFastSave(newSaveData);
  await dumpFastSaveToStorage();
}

/**
 * 判断是否有无存储紧急回避时的数据
 */
export async function hasFastSaveRecord() {
  // return await localforage.getItem(isFastSaveKey);
  await getStorageAsync();
  return webgalStore.getState().saveData.quickSaveData !== null;
}

/**
 * 加载紧急回避时的数据
 */
export async function loadFastSaveGame() {
  // 获得存档文件
  // const loadFile: ISaveData | null = await localforage.getItem(fastSaveGameKey);
  await getFastSaveFromStorage();
  const loadFile: ISaveData | null = webgalStore.getState().saveData.quickSaveData;
  if (!loadFile) {
    return;
  }
  loadGameFromStageData(loadFile);
}

/**
 * 移除紧急回避的数据
 */
export async function removeFastSaveGameRecord() {
  saveActions.resetFastSave();
  await setStorageAsync();
  // await localforage.setItem(isFastSaveKey, false);
  // await localforage.setItem(fastSaveGameKey, null);
}
