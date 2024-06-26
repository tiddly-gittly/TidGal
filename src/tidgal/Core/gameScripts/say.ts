import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { getRandomPerformName } from 'src/tidgal/Core/Modules/perform/performController';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { getSentenceArgByKey } from 'src/tidgal/Core/util/getSentenceArg';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { getStage, setStage } from 'src/tidgal/store/stageReducer';
import { textSize, voiceOption } from 'src/tidgal/store/userDataInterface';
import { getUserData } from 'src/tidgal/store/userDataReducer';
import { getTextDelay } from 'src/tidgal/utils/getTextDelay';
import { playVocal } from './vocal';

/**
 * 进行普通对话的显示
 * @param sentence 语句
 * @return {IPerform} 执行的演出
 */
export const say = (sentence: ISentence): IPerform => {
  const stageState = getStage();
  const userDataState = getUserData();
  let dialogKey = Math.random().toString(); // 生成一个随机的key
  let dialogToShow = sentence.content; // 获取对话内容
  const isConcat = getSentenceArgByKey(sentence, 'concat'); // 是否是继承语句
  const isNotend = getSentenceArgByKey(sentence, 'notend') as boolean; // 是否有 notend 参数
  const speaker = getSentenceArgByKey(sentence, 'speaker'); // 获取说话者
  const clear = getSentenceArgByKey(sentence, 'clear'); // 是否清除说话者
  const vocal = getSentenceArgByKey(sentence, 'vocal'); // 是否播放语音

  // 如果是concat，那么就继承上一句的key，并且继承上一句对话。
  if (isConcat) {
    dialogKey = stageState.currentDialogKey;
    dialogToShow = stageState.showText + dialogToShow;
    setStage({ key: 'currentConcatDialogPrev', value: stageState.showText });
  } else {
    setStage({ key: 'currentConcatDialogPrev', value: '' });
  }

  // 设置文本显示
  setStage({ key: 'showText', value: dialogToShow });
  setStage({ key: 'vocal', value: '' });

  // 清除语音
  if (!(userDataState.optionData.voiceInterruption === voiceOption.no && vocal === null)) {
    // 只有开关设置为不中断，并且没有语音的时候，才需要不中断
    setStage({ key: 'playVocal', value: '' });
    WebGAL.gameplay.performController.unmountPerform('vocal-play', true);
  }
  // 设置key
  setStage({ key: 'currentDialogKey', value: dialogKey });
  // 计算延迟
  const textDelay = getTextDelay(userDataState.optionData.textSpeed);
  // 本句延迟
  const sentenceDelay = textDelay * sentence.content.length;

  for (const e of sentence.args) {
    if (e.key === 'fontSize') {
      switch (e.value) {
        case 'default': {
          setStage({ key: 'showTextSize', value: -1 });
          break;
        }
        case 'small': {
          setStage({ key: 'showTextSize', value: textSize.small });
          break;
        }
        case 'medium': {
          setStage({ key: 'showTextSize', value: textSize.medium });
          break;
        }
        case 'large': {
          setStage({ key: 'showTextSize', value: textSize.large });
          break;
        }
      }
    }
  }

  // 设置显示的角色名称
  let showName: string | number | boolean = stageState.showName; // 先默认继承
  if (speaker !== null) {
    showName = speaker;
  }
  if (clear) {
    showName = '';
  }
  setStage({ key: 'showName', value: showName });

  // 播放一段语音
  if (vocal) {
    playVocal(sentence);
  }

  const performInitName: string = getRandomPerformName();
  let endDelay = 750 - userDataState.optionData.textSpeed * 250;
  // 如果有 notend 参数，那么就不需要等待
  if (isNotend) {
    endDelay = 0;
  }

  return {
    performName: performInitName,
    duration: sentenceDelay + endDelay,
    isHoldOn: false,
    stopFunction: () => {
      WebGAL.events.textSettle.emit();
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    goNextWhenOver: isNotend,
  };
};
