/**
 * @file 引擎初始化时会执行的脚本，包括获取游戏信息，初始化运行时变量，初始化用户数据存储
 */
import uniqWith from 'lodash/uniqWith';
import PixiStage from 'src/tidgal/Core/controller/stage/pixi/PixiController';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { sceneFetcher } from './controller/scene/sceneFetcher';
import { IUserAnimationEffects } from './Modules/animations';
import { sceneParser } from './parser/sceneParser';
import { infoFetcher } from './util/coreInitialFunction/infoFetcher';
import { assetSetter, fileType, getAssetBase, setAssetOptions } from './util/gameAssetsAccess/assetSetter';
import { logger } from './util/logger';
import { scenePrefetcher } from './util/prefetcher/scenePrefetcher';

const u = navigator.userAgent;
export const isIOS = !!/\(i[^;]+;( U;)? CPU.+Mac OS X/.test(u); // 判断是否是 iOS终端

export interface IInitializeScriptOptions {
  /**
   * The prefix of asset files. Will be concat to before standard filenames like `start.txt`.
   */
  assetBase: string;
}
/**
 * 引擎初始化函数
 */
export const initializeScript = (options: IInitializeScriptOptions): void => {
  if (!options?.assetBase) {
    throw new Error('Missing options.assetBase');
  }
  // 打印初始log信息
  logger.log('Github: https://github.com/OpenWebGAL/WebGAL ');
  logger.log('Made with ❤ by OpenWebGAL');
  // 激活强制缩放
  // 在调整窗口大小时重新计算宽高，设计稿按照 1600*900。
  if (isIOS) {
    /**
     * iOS
     */
    alert(
      `iOS 用户请横屏使用以获得最佳体验
| Please use landscape mode on iOS for the best experience
| iOS ユーザーは横画面での使用をお勧めします`,
    );
  }

  setAssetOptions(options);
  // 获得 user Animation
  getUserAnimation();
  // 获取游戏信息
  infoFetcher('config.txt');
  // 获取start场景
  const sceneUrl: string = assetSetter('start.txt', fileType.scene);
  // 场景写入到运行时
  sceneFetcher(sceneUrl).then((rawScene) => {
    WebGAL.sceneManager.sceneData.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);
    // 开始场景的预加载
    const subSceneList = WebGAL.sceneManager.sceneData.currentScene.subSceneList;
    WebGAL.sceneManager.settledScenes.push(sceneUrl); // 放入已加载场景列表，避免递归加载相同场景
    const subSceneListUniq = uniqWith(subSceneList); // 去重
    scenePrefetcher(subSceneListUniq);
  });
  /**
   * 启动Pixi
   */
  WebGAL.gameplay.pixiStage = new PixiStage();
};

function getUserAnimation() {
  const assetBase = getAssetBase();
  const animations: string[] = $tw.wiki.getTiddlerData(`${assetBase}/game/animation/animationTable.json`);
  for (const animationName of animations) {
    const effects: IUserAnimationEffects = $tw.wiki.getTiddlerData(`${assetBase}/game/animation/${animationName}.json`);
    if (effects && Array.isArray(effects)) {
      const userAnimation = {
        name: animationName,
        effects,
      };
      WebGAL.animationManager.addAnimation(userAnimation);
    }
  }
}
