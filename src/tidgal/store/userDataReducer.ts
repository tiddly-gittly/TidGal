/**
 * 用于存储与本地存储交换的状态信息。
 * 这些状态会在指定的生命周期与本地存储发生交换，比如打开存档界面、存档、修改设置时。
 * 在引擎初始化时会将这些状态从本地存储加载到运行时状态。
 */
import cloneDeep from 'lodash/cloneDeep';
import {
  fullScreenOption,
  IAppreciationAsset,
  IOptionData,
  ISetOptionDataPayload,
  IUserData,
  playSpeed,
  textFont,
  textSize,
  voiceOption,
} from 'src/tidgal/store/userDataInterface';
import { ISetGameVar } from './stageInterface';

const initialOptionSet: IOptionData = {
  slPage: 1,
  volumeMain: 100, // 主音量
  textSpeed: playSpeed.normal, // 文字速度
  autoSpeed: playSpeed.normal, // 自动播放速度
  textSize: textSize.medium,
  vocalVolume: 100, // 语音音量
  bgmVolume: 25, // 背景音乐音量
  seVolume: 100, // 音效音量
  uiSeVolume: 50, // UI音效音量
  textboxFont: textFont.song,
  textboxOpacity: 75,
  language: $tw.wiki.filterTiddlers('[[$:/language]get[text]get[name]else[en-GB]]')[0],
  voiceInterruption: voiceOption.yes,
  fullScreen: fullScreenOption.off,
};

// 初始化用户数据
export const initState: IUserData = {
  optionData: initialOptionSet,
  globalGameVar: {},
  appreciationData: {
    bgm: [],
    cg: [],
  },
};

let localState: IUserData | undefined;
/** tw only update in next tick, so in this tick we set/get in local state, until next tick */
export const userDataUpdated = () => {
  localState = undefined;
};
export const getUserData = () => {
  const userDataTiddler = '$:/temp/tidgal/default/UserData';
  const prevState = localState ?? $tw.wiki.getTiddlerData(userDataTiddler, initState as IUserData & Record<string, any>);
  if (localState === undefined) localState = prevState;
  return prevState;
};

/**
 * 设置用户数据
 * @param action
 */
export const setUserData = (newState: IUserData) => {
  const userDataTiddler = '$:/temp/tidgal/default/UserData';
  localState = newState;
  $tw.wiki.addTiddler({ title: userDataTiddler, text: JSON.stringify(localState), type: 'application/json' });
};

/**
 * 解锁CG在用户数据中
 * @param action 要解锁的CG资源
 */
export const unlockCgInUserData = (action: IAppreciationAsset) => {
  const prevState = getUserData();
  const { url, series } = action;
  // 检查是否存在
  let isExist = false;
  prevState.appreciationData.cg.forEach((e) => {
    if (url === e.url) {
      isExist = true;
      e.url = url;
      e.series = series;
    }
  });
  if (!isExist) {
    prevState.appreciationData.cg.push(action);
  }
  setUserData(prevState);
};

/**
 * 解锁BGM在用户数据中
 * @param action 要解锁的BGM资源
 */
export const unlockBgmInUserData = (action: IAppreciationAsset) => {
  const prevState = getUserData();
  const { url, series } = action;
  // 检查是否存在
  let isExist = false;
  prevState.appreciationData.bgm.forEach((e) => {
    if (url === e.url) {
      isExist = true;
      e.url = url;
      e.series = series;
    }
  });
  if (!isExist) {
    prevState.appreciationData.bgm.push(action);
  }
  setUserData(prevState);
};

/**
 * 替换用户数据
 * @param action 新的用户数据
 */
export const resetUserData = (action: IUserData) => {
  setUserData(action);
};

/**
 * 设置选项数据
 * @param action 要设置的选项数据
 */
export const setOptionData = (action: ISetOptionDataPayload) => {
  const prevState = getUserData();
  // @ts-expect-error Type 'string' is not assignable to type 'never'.ts(2322)
  prevState.optionData[action.key] = action.value;
  setUserData(prevState);
};

/**
 * 修改不跟随存档的全局变量
 * @param action 要改变或添加的变量
 */
export const setGlobalVar = (action: ISetGameVar) => {
  const prevState = getUserData();
  prevState.globalGameVar[action.key] = action.value;
  setUserData(prevState);
};

/**
 * 设置存档/读档页面
 * @param action 要设置的页面号
 */
export const setSlPage = (action: number) => {
  const prevState = getUserData();
  prevState.optionData.slPage = action;
  setUserData(prevState);
};

/**
 * 重置选项设置为初始值
 */
export const resetOptionSet = () => {
  const prevState = getUserData();
  Object.assign(prevState.optionData, initialOptionSet);
  setUserData(prevState);
};

/**
 * 重置所有数据为初始状态
 */
export const resetAllData = () => {
  setUserData(cloneDeep(initState));
};
