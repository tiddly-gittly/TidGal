/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import cloneDeep from 'lodash/cloneDeep';
import * as PIXI from 'pixi.js';
import { WebGALPixiContainer } from 'src/tidgal/Core/controller/stage/pixi/WebGALPixiContainer';
import { isIOS } from 'src/tidgal/Core/initializeScript';
import { logger } from 'src/tidgal/Core/util/logger';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { IEffect, IFigureAssociatedAnimation } from 'src/tidgal/store/stageInterface';
import { setStage, stageActions } from 'src/tidgal/store/stageReducer';
import { v4 as uuid } from 'uuid';
import 'pixi-spine'; // Do this once at the very start of your code. This registers the loader!
import { Spine } from 'pixi-spine';
import { SCREEN_CONSTANTS } from 'src/tidgal/Core/util/constants';
import { getContainer } from 'src/tidgal/Core/util/coreInitialFunction/container';
import { createTextureFromTiddler } from './textureFromTiddler';
// import { figureCash } from 'src/tidgal/Core/gameScripts/vocal/conentsCash'; // 如果要使用 Live2D，取消这里的注释
// import { Live2DModel, SoundManager } from 'pixi-live2d-display'; // 如果要使用 Live2D，取消这里的注释

export interface IAnimationObject {
  getEndFilterEffect?: CallableFunction;
  setEndState: CallableFunction;
  setStartState: CallableFunction;
  tickerFunc: PIXI.TickerCallback<number>;
}

interface IStageAnimationObject {
  animationObject: IAnimationObject;
  // 一般与作用目标有关
  key: string;
  targetKey?: string;
  type: 'common' | 'preset';
  // 唯一标识
  uuid: string;
}

export interface IStageObject {
  // 一般与作用目标有关
  key: string;
  pixiContainer: WebGALPixiContainer;
  sourceExt: string;
  sourceType: 'img' | 'live2d' | 'spine' | 'gif' | 'video';
  // 相关的源 url
  sourceUrl: string;
  // 唯一标识
  uuid: string;
}

export interface ILive2DRecord {
  expression: string;
  motion: string;
  target: string;
}

// export interface IRegisterTickerOpr {
//   tickerGeneratorFn: (targetKey: string, duration: number) => PIXI.TickerCallback<number>;
//   key: string;
//   target: string;
//   duration: number;
// }

// window.PIXI = PIXI;

export default class PixiStage {
  /**
   * 当前的 PIXI App
   */
  public currentApp: PIXI.Application | null = null;
  public readonly effectsContainer: PIXI.Container;
  public frameDuration = 16.67;
  public notUpdateBacklogEffects = false;
  private readonly figureContainer: PIXI.Container;
  private readonly figureObjects: IStageObject[] = [];
  private readonly backgroundContainer: PIXI.Container;
  private readonly backgroundObjects: IStageObject[] = [];

  // 注册到 Ticker 上的函数
  private readonly stageAnimations: IStageAnimationObject[] = [];
  private readonly assetLoader = new PIXI.Loader();
  private readonly loadQueue: Array<{ callback: () => void; name?: string; url: string }> = [];
  private readonly live2dFigureRecorder: ILive2DRecord[] = [];

  // 锁定变换对象（对象可能正在执行动画，不能应用变换）
  private readonly lockTransformTarget: string[] = [];
  private readonly stageWidth = SCREEN_CONSTANTS.width;
  private readonly stageHeight = SCREEN_CONSTANTS.height;
  /**
   * 暂时没用上，以后可能用
   * @private
   */
  private readonly MAX_TEX_COUNT = 10;

  public constructor() {
    const app = new PIXI.Application({
      backgroundAlpha: 0,
      preserveDrawingBuffer: true,
    });
    // window.PIXIapp = this;
    // window.__PIXI_APP__ = app;
    // 清空原节点
    const pixiContainer = getContainer()?.querySelector?.('#pixiContainer');
    if (pixiContainer) {
      pixiContainer.innerHTML = '';
      pixiContainer.append(app.view);
    }

    // 设置样式
    // app.renderer.view.style.position = 'absolute';
    app.renderer.view.style.display = 'block';
    app.renderer.view.id = 'pixiCanvas';
    // @ts-expect-error
    app.renderer.autoResize = true;
    const appRoot = getContainer();
    if (appRoot) {
      app.renderer.resize(appRoot.clientWidth, appRoot.clientHeight);
    }
    if (isIOS) {
      app.renderer.view.style.zIndex = '-5';
    }

    // 设置可排序
    app.stage.sortableChildren = true;

    // 添加 3 个 Container 用于做渲染
    this.effectsContainer = new PIXI.Container();
    this.effectsContainer.zIndex = 3;
    this.figureContainer = new PIXI.Container();
    this.figureContainer.zIndex = 2;
    this.backgroundContainer = new PIXI.Container();
    this.backgroundContainer.zIndex = 0;
    app.stage.addChild(this.effectsContainer, this.figureContainer, this.backgroundContainer);
    this.currentApp = app;
    // 每 5s 获取帧率，并且防 loader 死
    const update = () => {
      this.updateFps();
      setTimeout(update, 10_000);
    };
    update();
    // loader 防死
    const reload = () => {
      setTimeout(reload, 500);
      this.callLoader();
    };
    reload();
  }

  public getFigureObjects() {
    return this.figureObjects;
  }

  public getAllLockedObject() {
    return this.lockTransformTarget;
  }

  /**
   * 注册动画
   * @param animationObject
   * @param key
   * @param target
   */
  public registerAnimation(animationObject: IAnimationObject | null, key: string, target = 'default') {
    if (!animationObject) return;
    this.stageAnimations.push({ uuid: uuid(), animationObject, key, targetKey: target, type: 'common' });
    // 上锁
    this.lockStageObject(target);
    animationObject.setStartState();
    this.currentApp?.ticker.add(animationObject.tickerFunc);
  }

  /**
   * 注册预设动画
   * @param animationObject
   * @param key
   * @param target
   * @param currentEffects
   */
  // eslint-disable-next-line max-params
  public registerPresetAnimation(
    animationObject: IAnimationObject | null,
    key: string,
    target = 'default',
    currentEffects: IEffect[],
  ) {
    if (!animationObject) return;
    const effect = currentEffects.find((effect) => effect.target === target);
    if (effect) {
      const targetPixiContainer = this.getStageObjByKey(target);
      if (targetPixiContainer) {
        const container = targetPixiContainer.pixiContainer;
        Object.assign(container, effect.transform);
      }
      return;
    }
    this.stageAnimations.push({ uuid: uuid(), animationObject, key, targetKey: target, type: 'preset' });
    // 上锁
    this.lockStageObject(target);
    animationObject.setStartState();
    this.currentApp?.ticker.add(animationObject.tickerFunc);
  }

  public stopPresetAnimationOnTarget(target: string) {
    const targetPresetAnimations = this.stageAnimations.find((e) => e.targetKey === target && e.type === 'preset');
    if (targetPresetAnimations) {
      this.removeAnimation(targetPresetAnimations.key);
    }
  }

  /**
   * 移除动画
   * @param key
   */
  public removeAnimation(key: string) {
    const index = this.stageAnimations.findIndex((e) => e.key === key);
    if (index >= 0) {
      const thisTickerFunction = this.stageAnimations[index];
      this.currentApp?.ticker.remove(thisTickerFunction.animationObject.tickerFunc);
      thisTickerFunction.animationObject.setEndState();
      this.unlockStageObject(thisTickerFunction.targetKey ?? 'default');
      this.stageAnimations.splice(index, 1);
    }
  }

  public removeAnimationWithSetEffects(key: string) {
    const index = this.stageAnimations.findIndex((e) => e.key === key);
    if (index >= 0) {
      const thisTickerFunction = this.stageAnimations[index];
      this.currentApp?.ticker.remove(thisTickerFunction.animationObject.tickerFunc);
      thisTickerFunction.animationObject.setEndState();
      const webgalFilters = thisTickerFunction.animationObject.getEndFilterEffect?.() ?? {};
      this.unlockStageObject(thisTickerFunction.targetKey ?? 'default');
      if (thisTickerFunction.targetKey) {
        const target = this.getStageObjByKey(thisTickerFunction.targetKey);
        if (target) {
          const targetTransform = {
            alpha: target.pixiContainer.alphaFilterVal,
            scale: {
              x: target.pixiContainer.scale.x,
              y: target.pixiContainer.scale.y,
            },
            // pivot: {
            //   x: target.pixiContainer.pivot.x,
            //   y: target.pixiContainer.pivot.y,
            // },
            position: {
              x: target.pixiContainer.x,
              y: target.pixiContainer.y,
            },
            rotation: target.pixiContainer.rotation,
            blur: target.pixiContainer.blur,
            ...webgalFilters,
          };
          const effect: IEffect = {
            target: thisTickerFunction.targetKey,
            transform: targetTransform,
          };
          stageActions.updateEffect(effect);
          // if (!this.notUpdateBacklogEffects) updateCurrentBacklogEffects(getStage().effects);
        }
      }
      this.stageAnimations.splice(index, 1);
    }
  }

  // eslint-disable-next-line max-params
  public performMouthSyncAnimation(
    key: string,
    targetAnimation: IFigureAssociatedAnimation,
    mouthState: string,
    presetPosition: string,
  ) {
    const currentFigure = this.getStageObjByKey(key)?.pixiContainer;

    if (!currentFigure) {
      return;
    }

    const mouthTextureUrls: Record<string, string> = {
      open: targetAnimation.mouthAnimation.open,
      half_open: targetAnimation.mouthAnimation.halfOpen,
      closed: targetAnimation.mouthAnimation.close,
    };

    // Load mouth texture (reuse if already loaded)
    this.loadAsset(mouthTextureUrls[mouthState], () => {
      const texture = this.assetLoader.resources[mouthTextureUrls[mouthState]].texture ?? createTextureFromTiddler(mouthTextureUrls[mouthState]);
      if (!texture) {
        return;
      }
      const originalWidth = texture.width;
      const originalHeight = texture.height;
      const scaleX = this.stageWidth / originalWidth;
      const scaleY = this.stageHeight / originalHeight;
      const targetScale = Math.min(scaleX, scaleY);
      const figureSprite = new PIXI.Sprite(texture);
      figureSprite.scale.x = targetScale;
      figureSprite.scale.y = targetScale;
      figureSprite.anchor.set(0.5);
      figureSprite.position.y = this.stageHeight / 2;
      const targetWidth = originalWidth * targetScale;
      const targetHeight = originalHeight * targetScale;
      currentFigure.setBaseY(this.stageHeight / 2);
      if (targetHeight < this.stageHeight) {
        currentFigure.setBaseY(this.stageHeight / 2 + this.stageHeight - targetHeight / 2);
      }
      if (presetPosition === 'center') {
        currentFigure.setBaseX(this.stageWidth / 2);
      }
      if (presetPosition === 'left') {
        currentFigure.setBaseX(targetWidth / 2);
      }
      if (presetPosition === 'right') {
        currentFigure.setBaseX(this.stageWidth - targetWidth / 2);
      }
      currentFigure.pivot.set(0, this.stageHeight / 2);
      currentFigure.addChild(figureSprite);
    });
  }

  // eslint-disable-next-line max-params
  public performBlinkAnimation(
    key: string,
    targetAnimation: IFigureAssociatedAnimation,
    blinkState: string,
    presetPosition: string,
  ) {
    const currentFigure = this.getStageObjByKey(key)?.pixiContainer;

    if (!currentFigure) {
      return;
    }
    const blinkTextureUrls: Record<string, string> = {
      open: targetAnimation.blinkAnimation.open,
      closed: targetAnimation.blinkAnimation.close,
    };

    // Load eye texture (reuse if already loaded)
    this.loadAsset(blinkTextureUrls[blinkState], () => {
      const texture = this.assetLoader.resources[blinkTextureUrls[blinkState]].texture ?? createTextureFromTiddler(blinkTextureUrls[blinkState]);

      if (!texture) {
        return;
      }

      const originalWidth = texture.width;
      const originalHeight = texture.height;
      const scaleX = this.stageWidth / originalWidth;
      const scaleY = this.stageHeight / originalHeight;
      const targetScale = Math.min(scaleX, scaleY);
      const figureSprite = new PIXI.Sprite(texture);
      figureSprite.scale.x = targetScale;
      figureSprite.scale.y = targetScale;
      figureSprite.anchor.set(0.5);
      figureSprite.position.y = this.stageHeight / 2;
      const targetWidth = originalWidth * targetScale;
      const targetHeight = originalHeight * targetScale;
      currentFigure.setBaseY(this.stageHeight / 2);
      if (targetHeight < this.stageHeight) {
        currentFigure.setBaseY(this.stageHeight / 2 + this.stageHeight - targetHeight / 2);
      }
      if (presetPosition === 'center') {
        currentFigure.setBaseX(this.stageWidth / 2);
      }
      if (presetPosition === 'left') {
        currentFigure.setBaseX(targetWidth / 2);
      }
      if (presetPosition === 'right') {
        currentFigure.setBaseX(this.stageWidth - targetWidth / 2);
      }
      currentFigure.pivot.set(0, this.stageHeight / 2);
      currentFigure.addChild(figureSprite);
    });
  }

  /**
   * 添加背景
   * @param key 背景的标识，一般和背景类型有关
   * @param url 背景图片url
   */
  public addBg(key: string, url: string) {
    // const loader = this.assetLoader;
    const loader = this.assetLoader;
    // 准备用于存放这个背景的 Container
    const thisBgContainer = new WebGALPixiContainer();

    // 是否有相同 key 的背景
    const setBgIndex = this.backgroundObjects.findIndex((e) => e.key === key);
    const isBgSet = setBgIndex >= 0;

    // 已经有一个这个 key 的背景存在了
    if (isBgSet) {
      // 挤占
      this.removeStageObjectByKey(key);
    }

    // 挂载
    this.backgroundContainer.addChild(thisBgContainer);
    const bgUuid = uuid();
    this.backgroundObjects.push({
      uuid: bgUuid,
      key,
      pixiContainer: thisBgContainer,
      sourceUrl: url,
      sourceType: 'img',
      sourceExt: this.getExtName(url),
    });

    // 完成图片加载后执行的函数
    const setup = () => {
      // TODO：找一个更好的解法，现在的解法是无论是否复用原来的资源，都设置一个延时以让动画工作正常！

      setTimeout(() => {
        const texture = loader.resources?.[url]?.texture ?? createTextureFromTiddler(url);
        if (texture && this.getStageObjByUuid(bgUuid)) {
          /**
           * 重设大小
           */
          const originalWidth = texture.width;
          const originalHeight = texture.height;
          const scaleX = this.stageWidth / originalWidth;
          const scaleY = this.stageHeight / originalHeight;
          const targetScale = Math.max(scaleX, scaleY);
          const bgSprite = new PIXI.Sprite(texture);
          bgSprite.scale.x = targetScale;
          bgSprite.scale.y = targetScale;
          bgSprite.anchor.set(0.5);
          bgSprite.position.y = this.stageHeight / 2;
          thisBgContainer.setBaseX(this.stageWidth / 2);
          thisBgContainer.setBaseY(this.stageHeight / 2);
          thisBgContainer.pivot.set(0, this.stageHeight / 2);

          // 挂载
          thisBgContainer.addChild(bgSprite);
        }
      }, 0);
    };

    /**
     * 加载器部分
     */
    this.cacheGC();
    if (loader.resources?.[url]?.texture) {
      // 复用
      setup();
    } else {
      this.loadAsset(url, setup);
    }
  }

  /**
   * 添加立绘
   * @param key 立绘的标识，一般和立绘位置有关
   * @param url 立绘图片url
   * @param presetPosition
   */
  public addFigure(key: string, url: string, presetPosition: 'left' | 'center' | 'right' = 'center') {
    const loader = this.assetLoader;
    // 准备用于存放这个立绘的 Container
    const thisFigureContainer = new WebGALPixiContainer();

    // 是否有相同 key 的立绘
    const setFigIndex = this.figureObjects.findIndex((e) => e.key === key);
    const isFigSet = setFigIndex >= 0;

    // 已经有一个这个 key 的立绘存在了
    if (isFigSet) {
      this.removeStageObjectByKey(key);
    }

    // 挂载
    this.figureContainer.addChild(thisFigureContainer);
    const figureUuid = uuid();
    this.figureObjects.push({
      uuid: figureUuid,
      key,
      pixiContainer: thisFigureContainer,
      sourceUrl: url,
      sourceType: 'img',
      sourceExt: this.getExtName(url),
    });

    // 完成图片加载后执行的函数
    const setup = () => {
      // TODO：找一个更好的解法，现在的解法是无论是否复用原来的资源，都设置一个延时以让动画工作正常！
      setTimeout(() => {
        const texture = loader.resources?.[url]?.texture ?? createTextureFromTiddler(url);
        if (texture && this.getStageObjByUuid(figureUuid)) {
          /**
           * 重设大小
           */
          const originalWidth = texture.width;
          const originalHeight = texture.height;
          const scaleX = this.stageWidth / originalWidth;
          const scaleY = this.stageHeight / originalHeight;
          const targetScale = Math.min(scaleX, scaleY);
          const figureSprite = new PIXI.Sprite(texture);
          figureSprite.scale.x = targetScale;
          figureSprite.scale.y = targetScale;
          figureSprite.anchor.set(0.5);
          figureSprite.position.y = this.stageHeight / 2;
          const targetWidth = originalWidth * targetScale;
          const targetHeight = originalHeight * targetScale;
          thisFigureContainer.setBaseY(this.stageHeight / 2);
          if (targetHeight < this.stageHeight) {
            thisFigureContainer.setBaseY(this.stageHeight / 2 + this.stageHeight - targetHeight / 2);
          }
          if (presetPosition === 'center') {
            thisFigureContainer.setBaseX(this.stageWidth / 2);
          }
          if (presetPosition === 'left') {
            thisFigureContainer.setBaseX(targetWidth / 2);
          }
          if (presetPosition === 'right') {
            thisFigureContainer.setBaseX(this.stageWidth - targetWidth / 2);
          }
          thisFigureContainer.pivot.set(0, this.stageHeight / 2);
          thisFigureContainer.addChild(figureSprite);
        }
      }, 0);
    };

    /**
     * 加载器部分
     */
    this.cacheGC();
    if (loader.resources?.[url]?.texture) {
      // 复用
      setup();
    } else {
      this.loadAsset(url, setup);
    }
  }

  /**
   * 添加 Spine 立绘
   * @param key 立绘的标识，一般和立绘位置有关
   * @param url 立绘图片url
   * @param presetPosition
   */
  public addSpineFigure(key: string, url: string, presetPosition: 'left' | 'center' | 'right' = 'center') {
    const spineId = `spine-${url}`;
    const loader = this.assetLoader;
    // 准备用于存放这个立绘的 Container
    const thisFigureContainer = new WebGALPixiContainer();

    // 是否有相同 key 的立绘
    const setFigIndex = this.figureObjects.findIndex((e) => e.key === key);
    const isFigSet = setFigIndex >= 0;

    // 已经有一个这个 key 的立绘存在了
    if (isFigSet) {
      this.removeStageObjectByKey(key);
    }

    // 挂载
    this.figureContainer.addChild(thisFigureContainer);
    const figureUuid = uuid();
    this.figureObjects.push({
      uuid: figureUuid,
      key,
      pixiContainer: thisFigureContainer,
      sourceUrl: url,
      sourceType: 'live2d',
      sourceExt: this.getExtName(url),
    });

    // 完成图片加载后执行的函数
    const setup = () => {
      const spineResource = this.assetLoader.resources?.[spineId];
      // TODO：找一个更好的解法，现在的解法是无论是否复用原来的资源，都设置一个延时以让动画工作正常！
      setTimeout(() => {
        if (spineResource.spineData && this.getStageObjByUuid(figureUuid)) {
          const figureSpine = new Spine(spineResource.spineData);
          // @ts-expect-error
          const transY = spineResource?.spineData?.y ?? 0;
          /**
           * 重设大小
           */
          console.log(figureSpine);
          const originalWidth = figureSpine.width;
          const originalHeight = figureSpine.height;
          const scaleX = this.stageWidth / originalWidth;
          const scaleY = this.stageHeight / originalHeight;
          // 我也不知道为什么啊啊啊啊
          figureSpine.y = -(scaleY * transY) / 2;
          console.log(figureSpine.state);
          figureSpine.state.setAnimation(0, '07', true);
          const targetScale = Math.min(scaleX, scaleY);
          const figureSprite = new PIXI.Sprite();
          figureSprite.addChild(figureSpine);
          figureSprite.scale.x = targetScale;
          figureSprite.scale.y = targetScale;
          figureSprite.anchor.set(0.5);
          figureSprite.position.y = this.stageHeight / 2;
          const targetWidth = originalWidth * targetScale;
          const targetHeight = originalHeight * targetScale;
          thisFigureContainer.setBaseY(this.stageHeight / 2);
          if (targetHeight < this.stageHeight) {
            thisFigureContainer.setBaseY(this.stageHeight / 2 + this.stageHeight - targetHeight / 2);
          }
          if (presetPosition === 'center') {
            thisFigureContainer.setBaseX(this.stageWidth / 2);
          }
          if (presetPosition === 'left') {
            thisFigureContainer.setBaseX(targetWidth / 2);
          }
          if (presetPosition === 'right') {
            thisFigureContainer.setBaseX(this.stageWidth - targetWidth / 2);
          }
          thisFigureContainer.pivot.set(0, this.stageHeight / 2);
          thisFigureContainer.addChild(figureSprite);
        }
      }, 0);
    };

    /**
     * 加载器部分
     */
    this.cacheGC();
    if (loader.resources?.[url]) {
      // 复用
      setup();
    } else {
      this.loadAsset(url, setup, spineId);
    }
  }

  /**
   * Live2d立绘，如果要使用 Live2D，取消这里的注释
   * @param jsonPath
   */
  // eslint-disable-next-line max-params
  // public addLive2dFigure(key: string, jsonPath: string, pos: string, motion: string, expression: string) {
  //   let stageWidth = this.stageWidth;
  //   let stageHeight = this.stageHeight;
  //   logger.log('Using motion:', motion);
  //
  //   figureCash.push(jsonPath);
  //
  //   const loader = this.assetLoader;
  //   // 准备用于存放这个立绘的 Container
  //   const thisFigureContainer = new WebGALPixiContainer();
  //
  //   // 是否有相同 key 的立绘
  //   const setFigIndex = this.figureObjects.findIndex((e) => e.key === key);
  //   const isFigSet = setFigIndex >= 0;
  //
  //   // 已经有一个这个 key 的立绘存在了
  //   if (isFigSet) {
  //     this.removeStageObjectByKey(key);
  //   }
  //
  //   // 挂载
  //   this.figureContainer.addChild(thisFigureContainer);
  //   this.figureObjects.push({
  //     uuid: uuid(),
  //     key: key,
  //     pixiContainer: thisFigureContainer,
  //     sourceUrl: jsonPath,
  //     sourceType: 'live2d',
  //     sourceExt: 'json',
  //   });
  //   // eslint-disable-next-line @typescript-eslint/no-this-alias
  //   const instance = this;
  //
  //   const setup = () => {
  //     if (thisFigureContainer) {
  //       (async function () {
  //         const models = await Promise.all([Live2DModel.from(jsonPath, { autoInteract: false })]);
  //
  //         models.forEach((model) => {
  //           const scaleX = stageWidth / model.width;
  //           const scaleY = stageHeight / model.height;
  //           const targetScale = Math.min(scaleX, scaleY) * 1.5;
  //           const targetWidth = model.width * targetScale;
  //           // const targetHeight = model.height * targetScale;
  //
  //           model.scale.set(targetScale);
  //           model.anchor.set(0.5);
  //           model.position.x = stageWidth / 2;
  //           model.position.y = stageHeight / 1.2;
  //
  //           if (pos === 'left') {
  //             model.position.x = targetWidth / 2;
  //           }
  //           if (pos === 'right') {
  //             model.position.x = stageWidth - targetWidth / 2;
  //           }
  //
  //           let motionToSet = motion;
  //           let animation_index = 0;
  //           let priority_number = 3;
  //           // var audio_link = voiceCash.pop();
  //
  //           // model.motion(category_name, animation_index, priority_number,location.href + audio_link);
  //           /**
  //            * 检查 Motion 和 Expression
  //            */
  //           const motionFromState = getStage().live2dMotion.find((e) => e.target === key);
  //           const expressionFromState = getStage().live2dExpression.find((e) => e.target === key);
  //           if (motionFromState) {
  //             motionToSet = motionFromState.motion;
  //           }
  //           instance.updateL2dMotionByKey(key, motionToSet);
  //           model.motion(motionToSet, animation_index, priority_number);
  //           let expressionToSet = expression;
  //           if (expressionFromState) {
  //             expressionToSet = expressionFromState.expression;
  //           }
  //           instance.updateL2dExpressionByKey(key, expressionToSet);
  //           model.expression(expressionToSet);
  //           // @ts-ignore
  //           if (model.internalModel.eyeBlink) {
  //             // @ts-ignore
  //             model.internalModel.eyeBlink.blinkInterval = 1000 * 60 * 60 * 24; // @ts-ignore
  //             model.internalModel.eyeBlink.nextBlinkTimeLeft = 1000 * 60 * 60 * 24;
  //           }
  //
  //           // lip-sync is still a problem and you can not.
  //           SoundManager.volume = 0; // @ts-ignore
  //           if (model.internalModel.angleXParamIndex !== undefined) model.internalModel.angleXParamIndex = 999; // @ts-ignore
  //           if (model.internalModel.angleYParamIndex !== undefined) model.internalModel.angleYParamIndex = 999; // @ts-ignore
  //           if (model.internalModel.angleZParamIndex !== undefined) model.internalModel.angleZParamIndex = 999;
  //           thisFigureContainer.addChild(model);
  //         });
  //       })();
  //     }
  //   };
  //
  //   /**
  //    * 加载器部分
  //    */
  //   const resourses = Object.keys(loader.resources);
  //   this.cacheGC();
  //   if (!resourses.includes(jsonPath)) {
  //     this.loadAsset(jsonPath, setup);
  //   } else {
  //     // 复用
  //     setup();
  //   }
  // }

  public changeModelMotionByKey(key: string, motion: string) {
    // logger.log(`Applying motion ${motion} to ${key}`);
    const target = this.figureObjects.find((e) => e.key === key);
    if (target?.sourceType !== 'live2d') return;
    const figureRecordTarget = this.live2dFigureRecorder.find((e) => e.target === key);
    if (target && figureRecordTarget?.motion !== motion) {
      const container = target.pixiContainer;
      const children = container.children;
      for (const model of children) {
        const category_name = motion;
        const animation_index = 0;
        const priority_number = 3; // @ts-expect-error
        const internalModel = model?.internalModel ?? undefined; // 安全访问
        internalModel?.motionManager?.stopAllMotions?.();
        // @ts-expect-error
        model.motion(category_name, animation_index, priority_number);
      }
      this.updateL2dMotionByKey(key, motion);
    }
  }

  public changeModelExpressionByKey(key: string, expression: string) {
    // logger.log(`Applying expression ${expression} to ${key}`);
    const target = this.figureObjects.find((e) => e.key === key);
    if (target?.sourceType !== 'live2d') return;
    const figureRecordTarget = this.live2dFigureRecorder.find((e) => e.target === key);
    if (target && figureRecordTarget?.expression !== expression) {
      const container = target.pixiContainer;
      const children = container.children;
      for (const model of children) {
        // @ts-expect-error
        model.expression(expression);
      }
      this.updateL2dExpressionByKey(key, expression);
    }
  }

  public setModelMouthY(key: string, y: number) {
    function mapToZeroOne(value: number) {
      return value < 50 ? 0 : (value - 50) / 50;
    }

    const parameterY = mapToZeroOne(y);
    const target = this.figureObjects.find((e) => e.key === key);
    if (target) {
      const container = target.pixiContainer;
      const children = container.children;
      for (const model of children) {
        // @ts-expect-error
        if (model?.internalModel) {
          // @ts-expect-error
          if (model?.internalModel?.coreModel?.setParamFloat) {
            // @ts-expect-error
            model?.internalModel?.coreModel?.setParamFloat?.('PARAM_MOUTH_OPEN_Y', parameterY);
          }
          // @ts-expect-error
          if (model?.internalModel?.coreModel?.setParameterValueById) {
            // @ts-expect-error
            model?.internalModel?.coreModel?.setParameterValueById('ParamMouthOpenY', parameterY);
          }
        }
      }
    }
  }

  /**
   * 根据 key 获取舞台上的对象
   * @param key
   */
  public getStageObjByKey(key: string) {
    return [...this.figureObjects, ...this.backgroundObjects].find((e) => e.key === key);
  }

  public getStageObjByUuid(objectUuid: string) {
    return [...this.figureObjects, ...this.backgroundObjects].find((e) => e.uuid === objectUuid);
  }

  public getAllStageObj() {
    return [...this.figureObjects, ...this.backgroundObjects];
  }

  /**
   * 根据 key 删除舞台上的对象
   * @param key
   */
  public removeStageObjectByKey(key: string) {
    const indexFig = this.figureObjects.findIndex((e) => e.key === key);
    const indexBg = this.backgroundObjects.findIndex((e) => e.key === key);
    if (indexFig >= 0) {
      const bgSprite = this.figureObjects[indexFig];
      for (const element of bgSprite.pixiContainer.children) {
        element.destroy();
      }
      bgSprite.pixiContainer.destroy();
      this.figureContainer.removeChild(bgSprite.pixiContainer);
      this.figureObjects.splice(indexFig, 1);
    }
    if (indexBg >= 0) {
      const bgSprite = this.backgroundObjects[indexBg];
      for (const element of bgSprite.pixiContainer.children) {
        element.destroy();
      }
      bgSprite.pixiContainer.destroy();
      this.backgroundContainer.removeChild(bgSprite.pixiContainer);
      this.backgroundObjects.splice(indexBg, 1);
    }
    // /**
    //  * 删掉相关 Effects，因为已经移除了
    //  */
    // const prevEffects = getStage().effects;
    // const newEffects = __.cloneDeep(prevEffects);
    // const index = newEffects.findIndex((e) => e.target === key);
    // if (index >= 0) {
    //   newEffects.splice(index, 1);
    // }
    // updateCurrentEffects(newEffects);
  }

  public cacheGC() {
    PIXI.utils.clearTextureCache();
  }

  private updateL2dMotionByKey(target: string, motion: string) {
    const figureTargetIndex = this.live2dFigureRecorder.findIndex((e) => e.target === target);
    if (figureTargetIndex >= 0) {
      this.live2dFigureRecorder[figureTargetIndex].motion = motion;
    } else {
      this.live2dFigureRecorder.push({ target, motion, expression: '' });
    }
  }

  private updateL2dExpressionByKey(target: string, expression: string) {
    const figureTargetIndex = this.live2dFigureRecorder.findIndex((e) => e.target === target);
    if (figureTargetIndex >= 0) {
      this.live2dFigureRecorder[figureTargetIndex].expression = expression;
    } else {
      this.live2dFigureRecorder.push({ target, motion: '', expression });
    }
  }

  private loadAsset(url: string, callback: () => void, name?: string) {
    /**
     * Loader 复用疑似有问题，转而采用先前的单独方式
     */
    this.loadQueue.unshift({ url, callback, name });
    /**
     * 尝试启动加载
     */
    this.callLoader();
  }

  private callLoader() {
    if (!this.assetLoader.loading) {
      const front = this.loadQueue.shift();
      if (front) {
        try {
          if (this.assetLoader.resources[front.url]) {
            front.callback();
            this.callLoader();
          } else {
            if (front.name) {
              this.assetLoader.add(front.name, front.url).load(() => {
                front.callback();
                this.callLoader();
              });
            } else {
              this.assetLoader.add(front.url).load(() => {
                front.callback();
                this.callLoader();
              });
            }
          }
        } catch (error) {
          logger.alert('PIXI Loader 故障', error);
          front.callback();
          // this.assetLoader.reset(); // 暂时先不用重置
          this.callLoader();
        }
      }
    }
  }

  private updateFps() {
    getScreenFps?.(120).then((fps) => {
      this.frameDuration = 1000 / (fps as number);
      // logger.log('当前帧率', fps);
    });
  }

  private lockStageObject(targetName: string) {
    this.lockTransformTarget.push(targetName);
  }

  private unlockStageObject(targetName: string) {
    const index = this.lockTransformTarget.indexOf(targetName);
    if (index >= 0) this.lockTransformTarget.splice(index, 1);
  }

  private getExtName(url: string) {
    return url.split('.').pop() ?? 'png';
  }
}

function updateCurrentBacklogEffects(newEffects: IEffect[]) {
  /**
   * 更新当前 backlog 条目的 effects 记录
   */
  setTimeout(() => {
    WebGAL.backlogManager.editLastBacklogItemEffect(cloneDeep(newEffects));
  }, 50);

  setStage({ key: 'effects', value: newEffects });
}

/**
 * @param {number} targetCount 不小于1的整数，表示经过targetCount帧之后返回结果
 * @return {Promise<number>}
 */
const getScreenFps = (() => {
  return async (targetCount = 60) => {
    // 判断参数是否合规
    if (targetCount < 1) throw new Error('targetCount cannot be less than 1.');
    const beginDate = Date.now();
    let count = 0;
    return await new Promise((resolve) => {
      (function log() {
        requestAnimationFrame(() => {
          if (++count >= targetCount) {
            const diffDate = Date.now() - beginDate;
            const fps = (count / diffDate) * 1000;
            resolve(fps);
            return;
          }
          log();
        });
      })();
    });
  };
})();
