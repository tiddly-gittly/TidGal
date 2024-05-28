/**
 * 所有会被Save和Backlog记录下的信息，构成当前的舞台状态（也包括游戏运行时变量）
 * 舞台状态是演出结束后的“终态”，在读档时不发生演出，只是将舞台状态替换为读取的状态。
 */

import { commandType } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IEffect, IFreeFigure, ILive2DExpression, ILive2DMotion, IRunPerform, ISetGameVar, ISetStagePayload, IStageState } from 'src/tidgal/store/stageInterface';

// 初始化舞台数据

export const initStageState: IStageState = {
  assetBase: '',
  oldBgName: '',
  bgName: '', // 背景文件地址（相对或绝对）
  figName: '', // 立绘_中 文件地址（相对或绝对）
  figNameLeft: '', // 立绘_左 文件地址（相对或绝对）
  figNameRight: '', // 立绘_右 文件地址（相对或绝对）
  freeFigure: [],
  figureAssociatedAnimation: [],
  showText: '', // 文字
  showTextSize: -1,
  showName: '', // 人物名
  command: '', // 语句指令
  choose: [], // 选项列表，现在不用，先预留
  vocal: '', // 语音 文件地址（相对或绝对）
  playVocal: '', // 语音，真实的播放音频
  vocalVolume: 100, // 语音 音量调整（0 - 100）
  bgm: {
    // 背景音乐
    src: '', // 背景音乐 文件地址（相对或绝对）
    enter: 0, // 背景音乐 淡入或淡出的毫秒数
    volume: 100, // 背景音乐 音量调整（0 - 100）
  },
  uiSe: '', // 用户界面音效 文件地址（相对或绝对）
  miniAvatar: '', // 小头像 文件地址（相对或绝对）
  GameVar: {}, // 游戏内变量
  effects: [], // 应用的效果
  bgFilter: '', // 现在不用，先预留
  bgTransform: '', // 现在不用，先预留
  PerformList: [], // 要启动的演出列表
  currentDialogKey: 'initial',
  live2dMotion: [],
  live2dExpression: [],
  // currentPerformDelay: 0
  currentConcatDialogPrev: '',
  enableFilm: '',
  isDisableTextbox: false,
  replacedUIlable: {},
};

// TODO: allow add id to this
const stageTempTiddler = '$:/temp/tidgal/default/StageState';
let localState: IStageState | undefined;
/** tw only update in next tick, so in this tick we set/get in local state, until next tick */
export const stageUpdated = () => {
  localState = undefined;
};
/**
 * 创建舞台的状态管理
 */
export function setStage(param: ISetStagePayload | Partial<IStageState>) {
  const prevState = localState ?? $tw.wiki.getTiddlerData(stageTempTiddler, initStageState as IStageState & Record<string, string>);
  if (localState === undefined) localState = prevState;
  if ('key' in param && 'value' in param) {
    const { key, value } = param;
    localState = { ...prevState, [key]: value } satisfies IStageState;
    $tw.wiki.addTiddler({ title: stageTempTiddler, text: JSON.stringify(localState), type: 'application/json' });
  } else {
    localState = { ...prevState, ...param } satisfies IStageState;
    $tw.wiki.addTiddler({ title: stageTempTiddler, text: JSON.stringify(localState), type: 'application/json' });
  }
}

export function getStage(): IStageState {
  const prevState = localState ?? $tw.wiki.getTiddlerData(stageTempTiddler, initStageState as IStageState & Record<string, string>);
  if (localState === undefined) localState = prevState;
  return prevState;
}

export const stageActions = {
  /**
   * 替换舞台状态
   * @param action 替换的状态
   */
  resetStageState: (action: IStageState) => {
    setStage(action);
  },
  /**
   * 设置舞台状态
   * @param action 要替换的键值对
   */
  setStage: (action: ISetStagePayload) => {
    setStage(action);
  },
  /**
   * 修改舞台状态变量
   * @param action 要改变或添加的变量
   */
  setStageVar: (action: ISetGameVar) => {
    const prevState = getStage();
    const newState = { ...prevState, GameVar: { ...prevState.GameVar, [action.key]: action.value } };
    setStage(newState);
  },
  updateEffect: (action: IEffect) => {
    const prevState = getStage();
    const { target, transform } = action;
    const effectIndex = prevState.effects.findIndex((e) => e.target === target);
    if (effectIndex >= 0) {
      // Update the existing effect
      prevState.effects[effectIndex].transform = transform;
    } else {
      // Add a new effect
      prevState.effects.push({
        target,
        transform,
      });
    }
    setStage(prevState);
  },
  removeEffectByTargetId: (action: string) => {
    const prevState = getStage();
    const index = prevState.effects.findIndex((e) => e.target === action);
    if (index >= 0) {
      prevState.effects.splice(index, 1);
    }
    setStage(prevState);
  },
  addPerform: (action: IRunPerform) => {
    const prevState = getStage();
    prevState.PerformList.push(action);
    setStage(prevState);
  },
  removePerformByName: (action: string) => {
    const prevState = getStage();
    for (let i = 0; i < prevState.PerformList.length; i++) {
      const performItem: IRunPerform = prevState.PerformList[i];
      if (performItem.id === action) {
        prevState.PerformList.splice(i, 1);
        i--;
      }
    }
    setStage(prevState);
  },
  removeAllPixiPerforms: () => {
    const prevState = getStage();
    for (let i = 0; i < prevState.PerformList.length; i++) {
      const performItem: IRunPerform = prevState.PerformList[i];
      if (performItem.script.command === commandType.pixi) {
        prevState.PerformList.splice(i, 1);
        i--;
      }
    }
    setStage(prevState);
  },
  setFreeFigureByKey: (action: IFreeFigure) => {
    const prevState = getStage();
    const currentFreeFigures = prevState.freeFigure;
    const newFigure = action;
    const index = currentFreeFigures.findIndex((figure) => figure.key === newFigure.key);
    if (index >= 0) {
      currentFreeFigures[index].basePosition = newFigure.basePosition;
      currentFreeFigures[index].name = newFigure.name;
    } else {
      // 新加
      if (newFigure.name !== '') currentFreeFigures.push(newFigure);
    }
    setStage(prevState);
  },
  setLive2dMotion: (action: ILive2DMotion) => {
    const prevState = getStage();
    const { target, motion } = action;

    const index = prevState.live2dMotion.findIndex((e) => e.target === target);

    if (index < 0) {
      // Add a new motion
      prevState.live2dMotion.push({ target, motion });
    } else {
      // Update the existing motion
      prevState.live2dMotion[index].motion = motion;
    }
    setStage(prevState);
  },
  setLive2dExpression: (action: ILive2DExpression) => {
    const prevState = getStage();
    const { target, expression } = action;

    const index = prevState.live2dExpression.findIndex((e) => e.target === target);

    if (index < 0) {
      // Add a new expression
      prevState.live2dExpression.push({ target, expression });
    } else {
      // Update the existing expression
      prevState.live2dExpression[index].expression = expression;
    }
    setStage(prevState);
  },
  replaceUIlable: (action: [string, string]) => {
    const prevState = getStage();
    prevState.replacedUIlable[action[0]] = action[1];
    setStage(prevState);
  },
};
