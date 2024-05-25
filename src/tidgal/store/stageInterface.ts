import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';

/**
 * 游戏内变量
 * @interface IGameVar
 */
export type IGameVar = Record<string, string | boolean | number>;

export interface ISetGameVar {
  key: string;
  value: string | boolean | number;
}

/**
 * 单个选项
 * @interface IChooseItem
 */
export interface IChooseItem {
  // 选项target
  isSubScene: boolean;
  key: string;
  // 选项名称
  targetScene: string; // 是否是子场景调用
}

export interface ITransform {
  alpha: number;
  blur: number;
  // pivot: {
  //   x: number;
  //   y: number;
  // };
  position: {
    x: number;
    y: number;
  };
  rotation: number;
  scale: {
    x: number;
    y: number;
  };
}

/**
 * 基本效果接口
 * @interface IEffect
 */
export interface IEffect {
  target: string; // 作用目标
  transform?: ITransform; // 变换
}

/**
 * 基本变换预设
 */
export const baseTransform: ITransform = {
  alpha: 1,
  scale: {
    x: 1,
    y: 1,
  },
  // pivot: {
  //   x: 0.5,
  //   y: 0.5,
  // },
  position: {
    x: 0,
    y: 0,
  },
  rotation: 0,
  blur: 0,
};

export interface IFreeFigure {
  basePosition: 'left' | 'center' | 'right';
  key: string;
  name: string;
}

export interface IFigureAssociatedAnimation {
  animationFlag: string;
  blinkAnimation: IEyesAnimationFile;
  mouthAnimation: IMouthAnimationFile;
  targetId: string;
}

export interface IMouthAnimationFile {
  close: string;
  halfOpen: string;
  open: string;
}

export interface IEyesAnimationFile {
  close: string;
  open: string;
}

/**
 * 启动演出接口
 * @interface IRunPerform
 */
export interface IRunPerform {
  id: string;
  isHoldOn: boolean; // 演出类型
  script: ISentence; // 演出脚本
}

export interface ILive2DMotion {
  motion: string;
  target: string;
}

export interface ILive2DExpression {
  expression: string;
  target: string;
}

/**
 * @interface IStageState 游戏舞台数据接口
 */
export interface IStageState {
  // 小头像 文件地址（相对或绝对）
  GameVar: IGameVar;
  PerformList: IRunPerform[];
  /**
   * The prefix of asset files. Will be concat to before standard filenames like `start.txt`.
   */
  assetBase: string;
  bgFilter: string;
  // 旧背景的文件路径
  bgName: string;
  // 应用的变换
  bgTransform: string;
  // 语音 音量调整（0 - 100）
  bgm: {
    // 背景音乐 文件地址（相对或绝对）
    enter: number;
    // 背景音乐
    src: string; // 背景音乐 淡入或淡出的毫秒数
    volume: number; // 背景音乐 音量调整（0 - 100）
  };
  // 语句指令
  choose: IChooseItem[];
  // 人物名
  command: string;
  // 当前演出的延迟，用于做对话插演出！
  // currentPerformDelay:number
  currentConcatDialogPrev: string;
  // 要启动的演出列表
  currentDialogKey: string;
  // 游戏内变量
  effects: IEffect[];
  // 测试：电影叙事
  enableFilm: string;
  // 背景文件地址（相对或绝对）
  figName: string;
  // 立绘_中 文件地址（相对或绝对）
  figNameLeft: string;
  // 立绘_左 文件地址（相对或绝对）
  figNameRight: string;
  figureAssociatedAnimation: IFigureAssociatedAnimation[];
  // 立绘_右 文件地址（相对或绝对）
  // 自由立绘
  freeFigure: IFreeFigure[];
  isDisableTextbox: boolean;
  live2dExpression: ILive2DExpression[];
  // 当前对话的key
  live2dMotion: ILive2DMotion[];
  // 用户界面音效 文件地址（相对或绝对）
  miniAvatar: string;
  oldBgName: string;
  // 语音 文件地址（相对或绝对）
  playVocal: string;
  replacedUIlable: Record<string, string>;
  // 文字
  showName: string;
  showText: string;
  // 文字
  showTextSize: number;
  uiSe: string;
  // 选项列表
  vocal: string;
  // 真实播放语音
  vocalVolume: number;
}

/**
 * @interface ISetStagePayload 设置舞台状态的Action的Payload的数据接口
 */
export interface ISetStagePayload<K extends keyof IStageState = keyof IStageState> {
  key: K;
  value: IStageState[K];
}

export interface IStageStore {
  getStageState: () => IStageState;
  restoreStage: (newState: IStageState) => void;
  setStage: <K extends keyof IStageState>(key: K, value: IStageState[K]) => void;
  stageState: IStageState;
}

export type StageStore = IStageStore;
