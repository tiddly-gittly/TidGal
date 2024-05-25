import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { setStage } from 'src/tidgal/store/stageReducer';
import { webgalStore } from 'src/tidgal/store/store';

/**
 * 显示小头像
 * @param sentence
 */
export const miniAvatar = (sentence: ISentence): IPerform => {
  let content = sentence.content;
  if (sentence.content === 'none' || sentence.content === '') {
    content = '';
  }
  webgalStore.dispatch(setStage({ key: 'miniAvatar', value: content }));
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: true,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
