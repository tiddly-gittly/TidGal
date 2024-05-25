import localforage from 'localforage';
import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { logger } from 'src/tidgal/Core/util/logger';
import { webgalStore } from 'src/tidgal/store/store';
import { unlockCgInUserData } from 'src/tidgal/store/userDataReducer';

import { WebGAL } from 'src/tidgal/Core/WebGAL';

/**
 * 解锁cg
 * @param sentence
 */
export const unlockCg = (sentence: ISentence): IPerform => {
  const url = sentence.content;
  let name = sentence.content;
  let series = 'default';
  sentence.args.forEach((e) => {
    if (e.key === 'name') {
      name = e.value.toString();
    }
    if (e.key === 'series') {
      series = e.value.toString();
    }
  });
  logger.log(`解锁CG：${name}，路径：${url}，所属系列：${series}`);
  webgalStore.dispatch(unlockCgInUserData({ name, url, series }));
  const userDataState = webgalStore.getState().userData;
  localforage.setItem(WebGAL.gameKey, userDataState).then(() => {});
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
