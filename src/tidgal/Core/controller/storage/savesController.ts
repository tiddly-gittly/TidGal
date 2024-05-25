import localforage from 'localforage';
import { logger } from 'src/tidgal/Core/util/logger';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { saveActions } from 'src/tidgal/Corestore/savesReducer';
import { webgalStore } from 'src/tidgal/Corestore/store';
import { ISaveData } from 'src/tidgal/Corestore/userDataInterface';

export function dumpSavesToStorage(startIndex: number, endIndex: number) {
  for (let index = startIndex; index <= endIndex; index++) {
    const save = webgalStore.getState().saveData.saveData[index];
    localforage.setItem(`${WebGAL.gameKey}-saves${index}`, save).then(() => {
      logger.log(`存档${index}写入本地存储`);
    });
  }
}

export function getSavesFromStorage(startIndex: number, endIndex: number) {
  for (let index = startIndex; index <= endIndex; index++) {
    localforage.getItem(`${WebGAL.gameKey}-saves${index}`).then((save) => {
      webgalStore.dispatch(saveActions.saveGame({ index, saveData: save as ISaveData }));
      logger.log(`存档${index}读取自本地存储`);
    });
  }
}

export async function dumpFastSaveToStorage() {
  const save = webgalStore.getState().saveData.quickSaveData;
  await localforage.setItem(`${WebGAL.gameKey}-saves-fast`, save);
  logger.log(`快速存档写入本地存储`);
}

export async function getFastSaveFromStorage() {
  const save = await localforage.getItem(`${WebGAL.gameKey}-saves-fast`);
  webgalStore.dispatch(saveActions.setFastSave(save as ISaveData));
  logger.log(`快速存档读取自本地存储`);
}
