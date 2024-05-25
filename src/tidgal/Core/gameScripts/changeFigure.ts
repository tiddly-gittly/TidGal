import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { generateTransformAnimationObj } from 'src/tidgal/Core/controller/stage/pixi/animations/generateTransformAnimationObj';
import { getAnimateDuration } from 'src/tidgal/Core/Modules/animationFunctions';
import { IUserAnimation } from 'src/tidgal/Core/Modules/animations';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { assetSetter, fileType } from 'src/tidgal/Core/util/gameAssetsAccess/assetSetter';
import { getSentenceArgByKey } from 'src/tidgal/Core/util/getSentenceArg';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
import { getStage, setStage, stageActions } from 'src/tidgal/store/stageReducer';
import { webgalStore } from 'src/tidgal/store/store';
/**
 * 更改立绘
 * @param sentence 语句
 */
// eslint-disable-next-line complexity
export function changeFigure(sentence: ISentence): IPerform {
  // 根据参数设置指定位置
  let pos: 'center' | 'left' | 'right' = 'center';
  let content = sentence.content;
  let isFreeFigure = false;
  let motion = '';
  let expression = '';
  let key = '';
  let duration = 500;
  let mouthOpen = '';
  let mouthClose = '';
  let mouthHalfOpen = '';
  let eyesOpen = '';
  let eyesClose = '';
  let animationFlag = '';
  let mouthAnimationKey = 'mouthAnimation';
  let eyesAnimationKey = 'blinkAnimation';

  for (const e of sentence.args) {
    switch (e.key) {
      case 'left': {
        if (e.value === true) {
          pos = 'left';
          mouthAnimationKey = 'mouthAnimationLeft';
          eyesAnimationKey = 'blinkAnimationLeft';
        }
        break;
      }
      case 'right': {
        if (e.value === true) {
          pos = 'right';
          mouthAnimationKey = 'mouthAnimationRight';
          eyesAnimationKey = 'blinkAnimationRight';
        }
        break;
      }
      case 'clear': {
        if (e.value === true) {
          content = '';
        }
        break;
      }
      case 'id': {
        isFreeFigure = true;
        key = e.value.toString();
        break;
      }
      case 'motion': {
        motion = e.value.toString();
        break;
      }
      case 'expression': {
        expression = e.value.toString();
        break;
      }
      case 'mouthOpen': {
        mouthOpen = e.value.toString();
        mouthOpen = assetSetter(mouthOpen, fileType.figure);
        break;
      }
      case 'mouthClose': {
        mouthClose = e.value.toString();
        mouthClose = assetSetter(mouthClose, fileType.figure);
        break;
      }
      case 'mouthHalfOpen': {
        mouthHalfOpen = e.value.toString();
        mouthHalfOpen = assetSetter(mouthHalfOpen, fileType.figure);
        break;
      }
      case 'eyesOpen': {
        eyesOpen = e.value.toString();
        eyesOpen = assetSetter(eyesOpen, fileType.figure);
        break;
      }
      case 'eyesClose': {
        eyesClose = e.value.toString();
        eyesClose = assetSetter(eyesClose, fileType.figure);
        break;
      }
      case 'animationFlag': {
        animationFlag = e.value.toString();
        break;
      }
      case 'none': {
        content = '';
        break;
      }
      default: {
        break;
      }
    }
  }

  const id = key || `fig-${pos}`;

  const currentFigureAssociatedAnimation = getStage().figureAssociatedAnimation;
  const filteredFigureAssociatedAnimation = currentFigureAssociatedAnimation.filter((item) => item.targetId !== id);
  const newFigureAssociatedAnimationItem = {
    targetId: id,
    animationFlag,
    mouthAnimation: {
      open: mouthOpen,
      close: mouthClose,
      halfOpen: mouthHalfOpen,
    },
    blinkAnimation: {
      open: eyesOpen,
      close: eyesClose,
    },
  };
  filteredFigureAssociatedAnimation.push(newFigureAssociatedAnimationItem);
  setStage({ key: 'figureAssociatedAnimation', value: filteredFigureAssociatedAnimation });

  /**
   * 如果 url 没变，不移除
   */
  let isRemoveEffects = true;
  if (key === '') {
    if (pos === 'center' && getStage().figName === sentence.content) {
      isRemoveEffects = false;
    }
    if (pos === 'left' && getStage().figNameLeft === sentence.content) {
      isRemoveEffects = false;
    }
    if (pos === 'right' && getStage().figNameRight === sentence.content) {
      isRemoveEffects = false;
    }
  } else {
    const figWithKey = getStage().freeFigure.find((e) => e.key === key);
    if (figWithKey && figWithKey.name === sentence.content) {
      isRemoveEffects = false;
    }
  }
  /**
   * 处理 Effects
   */
  if (isRemoveEffects) {
    const deleteKey = `fig-${pos}`;
    const deleteKey2 = `${key}`;
    stageActions.removeEffectByTargetId(deleteKey);
    stageActions.removeEffectByTargetId(deleteKey2);
  }
  const setAnimationNames = (key: string, sentence: ISentence) => {
    // 处理 transform 和 默认 transform
    const transformString = getSentenceArgByKey(sentence, 'transform');
    const durationFromArgument = getSentenceArgByKey(sentence, 'duration');
    if (durationFromArgument && typeof durationFromArgument === 'number') {
      duration = durationFromArgument;
    }
    let animationObject: Array<
      ITransform & {
        duration: number;
      }
    >;
    if (transformString) {
      console.log(transformString);
      try {
        const frame = JSON.parse(transformString.toString());
        animationObject = generateTransformAnimationObj(key, frame, duration);
        // 因为是切换，必须把一开始的 alpha 改为 0
        animationObject[0].alpha = 0;
        const animationName = (Math.random() * 10).toString(16);
        const newAnimation: IUserAnimation = { name: animationName, effects: animationObject };
        WebGAL.animationManager.addAnimation(newAnimation);
        duration = getAnimateDuration(animationName);
        WebGAL.animationManager.nextEnterAnimationName.set(key, animationName);
      } catch {
        // 解析都错误了，歇逼吧
        applyDefaultTransform();
      }
    } else {
      applyDefaultTransform();
    }

    function applyDefaultTransform() {
      // 应用默认的
      const frame = {};
      animationObject = generateTransformAnimationObj(key, frame as ITransform & { duration: number }, duration);
      // 因为是切换，必须把一开始的 alpha 改为 0
      animationObject[0].alpha = 0;
      const animationName = (Math.random() * 10).toString(16);
      const newAnimation: IUserAnimation = { name: animationName, effects: animationObject };
      WebGAL.animationManager.addAnimation(newAnimation);
      duration = getAnimateDuration(animationName);
      WebGAL.animationManager.nextEnterAnimationName.set(key, animationName);
    }
    const enterAnim = getSentenceArgByKey(sentence, 'enter');
    const exitAnim = getSentenceArgByKey(sentence, 'exit');
    if (enterAnim) {
      WebGAL.animationManager.nextEnterAnimationName.set(key, enterAnim.toString());
      duration = getAnimateDuration(enterAnim.toString());
    }
    if (exitAnim) {
      WebGAL.animationManager.nextExitAnimationName.set(key + '-off', exitAnim.toString());
      duration = getAnimateDuration(exitAnim.toString());
    }
  };
  if (isFreeFigure) {
    const currentFreeFigures = getStage().freeFigure;

    /**
     * 重设
     */
    const freeFigureItem: IFreeFigure = { key, name: content, basePosition: pos };
    setAnimationNames(key, sentence);
    if (motion) {
      dispatch(stageActions.setLive2dMotion({ target: key, motion }));
    }
    if (expression) {
      dispatch(stageActions.setLive2dExpression({ target: key, expression }));
    }
    dispatch(stageActions.setFreeFigureByKey(freeFigureItem));
  } else {
    const positionMap = {
      center: 'fig-center',
      left: 'fig-left',
      right: 'fig-right',
    };
    const dispatchMap: Record<string, keyof IStageState> = {
      center: 'figName',
      left: 'figNameLeft',
      right: 'figNameRight',
    };

    key = positionMap[pos];
    setAnimationNames(key, sentence);
    if (motion) {
      dispatch(stageActions.setLive2dMotion({ target: key, motion }));
    }
    if (expression) {
      dispatch(stageActions.setLive2dExpression({ target: key, expression }));
    }
    setStage({ key: dispatchMap[pos], value: content });
  }

  return {
    performName: 'none',
    duration,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => false,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
}
