import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { stageActions } from 'src/tidgal/Corestore/stageReducer';
import { webgalStore } from 'src/tidgal/Corestore/store';

/**
 * 语句执行的模板代码
 * @param sentence
 */
export const applyStyle = (sentence: ISentence): IPerform => {
  const { content } = sentence;
  const applyStyleSegments = content.split(',');
  for (const applyStyleSegment of applyStyleSegments) {
    const splitSegment = applyStyleSegment.split('->');
    if (splitSegment.length >= 2) {
      const classNameToBeChange = splitSegment[0];
      const classNameChangeTo = splitSegment[1];
      webgalStore.dispatch(stageActions.replaceUIlable([classNameToBeChange, classNameChangeTo]));
    }
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
