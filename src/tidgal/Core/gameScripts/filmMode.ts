import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { setStage } from 'src/tidgal/store/stageReducer';
import { webgalStore } from 'src/tidgal/store/store';

/**
 * 语句执行的模板代码
 * @param sentence
 */
export const filmMode = (sentence: ISentence): IPerform => {
  if (sentence.content !== '' && sentence.content !== 'none') {
    webgalStore.dispatch(setStage({ key: 'enableFilm', value: sentence.content }));
  } else {
    webgalStore.dispatch(setStage({ key: 'enableFilm', value: '' }));
  }
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
