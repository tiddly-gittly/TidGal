import { IBacklogItem } from 'src/tidgal/Core/Modules/backlog';
import { ISceneEntry } from 'src/tidgal/Core/Modules/scene';
import { IGameVar, IStageState } from './stageInterface';

/**
 * 播放速度的枚举类型
 */
export enum playSpeed {
  slow, // 慢
  normal, // 中
  fast, // 快
}

export enum textSize {
  small,
  medium,
  large,
}

export enum textFont {
  song,
  hei,
  lxgw,
}

export enum voiceOption {
  yes,
  no,
}

export enum fullScreenOption {
  on,
  off,
}

/**
 * @interface IOptionData 用户设置数据接口
 */
export interface IOptionData {
  // 文字速度
  autoSpeed: playSpeed;
  // 语音音量
  bgmVolume: number;
  // 是否中断语音
  fullScreen: fullScreenOption;
  language: string;
  // 背景音乐音量
  seVolume: number;
  // 用户界面音效音量
  slPage: number;
  // 自动播放速度
  textSize: textSize;
  // 主音量
  textSpeed: playSpeed;
  // 存读档界面所在页面
  textboxFont: textFont;
  textboxOpacity: number;
  // 音效音量
  uiSeVolume: number;
  vocalVolume: number;
  voiceInterruption: voiceOption;
  volumeMain: number;
}

/**
 * 场景存档接口
 * @interface ISaveScene
 */
export interface ISaveScene {
  currentSentenceId: number;
  // 场景栈
  sceneName: string;
  // 当前语句ID
  sceneStack: ISceneEntry[]; // 场景名称
  sceneUrl: string; // 场景url
}

/**
 * @interface ISaveData 存档文件接口
 */
export interface ISaveData {
  backlog: IBacklogItem[];
  // 舞台数据
  index: number;
  nowStageState: IStageState;
  // 场景数据
  previewImage: string;
  // 存档的序号
  saveTime: string;
  // 保存时间
  sceneData: ISaveScene;
}

export interface IAppreciationAsset {
  name: string;
  series: string;
  url: string;
}

export interface IAppreciation {
  bgm: IAppreciationAsset[];
  cg: IAppreciationAsset[];
}

/**
 * @interface IUserData 用户数据接口
 */
export interface IUserData {
  // 用户设置选项数据
  appreciationData: IAppreciation;
  globalGameVar: IGameVar;
  // 不跟随存档的全局变量
  optionData: IOptionData;
}

export interface ISetUserDataPayload<K extends keyof IOptionData = keyof IOptionData> {
  key: K;
  value: IOptionData[K];
}

export interface ISetOptionDataPayload<K extends keyof IOptionData = keyof IOptionData> {
  key: K;
  value: IOptionData[K];
}

export interface IUserDataStore {
  replaceUserData: (newUserData: IUserData) => void;
  setOptionData: <K extends keyof IOptionData>(key: K, value: IOptionData[K]) => void;
  setSlPage: (index: number) => void;
  setUserData: <K extends keyof IUserData>(key: K, value: IUserData[K]) => void;
  userDataState: IUserData;
}

export type UserDataStore = IUserDataStore;
