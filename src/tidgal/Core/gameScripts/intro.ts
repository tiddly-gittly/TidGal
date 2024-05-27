/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable unicorn/prefer-number-properties */
import { nextSentence } from 'src/tidgal/Core/controller/gamePlay/nextSentence';
import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { WebGAL } from 'src/tidgal/Core/WebGAL';
// import styles from 'src/tidgal/Stage/FullScreenPerform/fullScreenPerform.module.scss';
import { IPerform } from '../Modules/perform/performInterface';
import { getContainer } from '../util/coreInitialFunction/container';
import { objectToInlineStyle } from '../util/css';
/**
 * 显示一小段黑屏演示
 * @param sentence
 */
export const intro = (sentence: ISentence): IPerform => {
  /**
   * intro 内部控制
   */

  const performName = `introPerform${Math.random().toString()}`;
  let fontSize: string | undefined;
  let backgroundColor = 'rgba(0, 0, 0, 1)';
  let color = 'rgba(255, 255, 255, 1)';
  const animationClass = (type: string, length = 0) => {
    switch (type) {
      case 'fadeIn': {
        return 'tidgal-fadeIn';
      }
      case 'slideIn': {
        return 'tidgal-slideIn';
      }
      case 'typingEffect': {
        return `${'tidgal-typingEffect'} ${length}`;
      }
      case 'pixelateEffect': {
        return 'tidgal-pixelateEffect';
      }
      case 'revealAnimation': {
        return 'tidgal-revealAnimation';
      }
      default: {
        return 'tidgal-fadeIn';
      }
    }
  };
  let chosenAnimationClass = 'tidgal-fadeIn';
  let delayTime = 1500;
  let isHold = false;

  for (const e of sentence.args) {
    if (e.key === 'backgroundColor') {
      backgroundColor = (e.value as string) || 'rgba(0, 0, 0, 1)';
    }
    if (e.key === 'fontColor') {
      color = (e.value as string) || 'rgba(255, 255, 255, 1)';
    }
    if (e.key === 'fontSize') {
      switch (e.value) {
        case 'small': {
          fontSize = '280%';
          break;
        }
        case 'medium': {
          fontSize = '350%';
          break;
        }
        case 'large': {
          fontSize = '420%';
          break;
        }
      }
    }
    if (e.key === 'animation') {
      chosenAnimationClass = animationClass(e.value as string);
    }
    if (e.key === 'delayTime') {
      const parsedValue = Number.parseInt(e.value.toString(), 10);
      delayTime = isNaN(parsedValue) ? delayTime : parsedValue;
    }
    if (e.key === 'hold' && e.value === true) {
      isHold = true;
    }
  }

  const introContainerStyle = {
    background: backgroundColor,
    color,
    fontSize: fontSize || '350%',
    width: '100%',
    height: '100%',
  };
  const introArray: string[] = sentence.content.split(/\|/);

  const endWait = 1000;
  let baseDuration = endWait + delayTime * introArray.length;
  const duration = isHold ? 1000 * 60 * 60 * 24 : 1000 + delayTime * introArray.length;
  let isBlocking = true;
  let setBlockingStateTimeout = setTimeout(() => {
    isBlocking = false;
  }, baseDuration);

  let timeout = setTimeout(() => {});
  const toNextIntroElement = () => {
    const introContainer = getContainer()?.querySelector<HTMLDivElement>('#introContainer');
    // 由于用户操作，相当于时间向前推进，这时候更新这个演出的预计完成时间
    baseDuration -= delayTime;
    clearTimeout(setBlockingStateTimeout);
    setBlockingStateTimeout = setTimeout(() => {
      isBlocking = false;
    }, baseDuration);
    if (introContainer) {
      const children = introContainer.childNodes[0].childNodes[0].childNodes as unknown as HTMLDivElement[];
      const len = children.length;
      children.forEach((node: HTMLDivElement, index: number) => {
        // 当前语句的延迟显示时间
        const currentDelay = Number(node.style.animationDelay.split('ms')[0]);
        // 当前语句还没有显示，降低显示延迟，因为现在时间因为用户操作，相当于向前推进了
        if (currentDelay > 0) {
          node.style.animationDelay = `${currentDelay - delayTime}ms`;
        }
        // 最后一个元素了
        if (index === len - 1) {
          // 并且已经完全显示了，这时候进行下一步
          if (currentDelay === 0) {
            clearTimeout(timeout);
            WebGAL.gameplay.performController.unmountPerform(performName);
            // 卸载函数发生在 nextSentence 生效前，所以不需要做下一行的操作。
            // setTimeout(nextSentence, 0);
          } else {
            // 还没有完全显示，但是因为时间的推进，要提前完成演出，更新用于结束演出的计时器
            clearTimeout(timeout);
            // 如果 Hold 了，自然不要自动结束
            if (!isHold) {
              timeout = setTimeout(() => {
                WebGAL.gameplay.performController.unmountPerform(performName);
                setTimeout(nextSentence, 0);
              }, baseDuration);
            }
          }
        }
      });
    }
  };

  /**
   * 接受 next 事件
   */
  WebGAL.events.userInteractNext.on(toNextIntroElement);
  // FIXME: 改为设置状态，然后 HTML 在 tid 里写

  const showIntro = introArray.map((textChar, i) => `
    <div
      key='introtext${i}${Math.random().toString()}'
      style='animation-delay: ${delayTime * i}ms;'
      class='${chosenAnimationClass}'
    >
      ${textChar}
      ${textChar === '' ? '\u00A0' : ''}
    </div>
  `).join('');

  const intro = `
    <div style='${objectToInlineStyle(introContainerStyle)}'>
      <div style='padding: 3em 4em 3em 4em;'>
        ${showIntro}
      </div>
    </div>
  `;
  $tw.wiki.setText('$:/temp/tidgal/default/introContainer', undefined, undefined, intro);
  // eslint-disable-next-line react/no-deprecated
  const introContainer = getContainer()?.querySelector<HTMLDivElement>('#introContainer');

  if (introContainer) {
    introContainer.style.display = 'block';
  }

  return {
    performName,
    duration,
    isHoldOn: false,
    stopFunction: () => {
      const introContainer = getContainer()?.querySelector<HTMLDivElement>('#introContainer');
      if (introContainer) {
        introContainer.style.display = 'none';
      }
      WebGAL.events.userInteractNext.off(toNextIntroElement);
    },
    blockingNext: () => isBlocking,
    blockingAuto: () => isBlocking,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    goNextWhenOver: true,
  };
};
