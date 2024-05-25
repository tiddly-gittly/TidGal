import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { setStage } from 'src/tidgal/Corestore/stageReducer';
import { webgalStore } from 'src/tidgal/Corestore/store';

/**
 * 语句执行的模板代码
 * @param sentence
 */
export function setTextbox(sentence: ISentence): IPerform {
  if (sentence.content === 'hide') {
    webgalStore.dispatch(setStage({ key: 'isDisableTextbox', value: true }));
  } else {
    webgalStore.dispatch(setStage({ key: 'isDisableTextbox', value: false }));
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
}
