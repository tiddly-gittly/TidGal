import { nextSentence } from 'src/tidgal/Core/controller/gamePlay/nextSentence';
import { ISentence } from 'src/tidgal/Core/controller/scene/sceneInterface';
import { IPerform } from 'src/tidgal/Core/Modules/perform/performInterface';
import { stageActions } from 'src/tidgal/store/stageReducer';

/**
 * 获取随机演出名称
 */
export const getRandomPerformName = (): string => {
  return Math.random().toString().substring(0, 10);
};

export class PerformController {
  public performList: IPerform[] = [];
  public timeoutList: Array<ReturnType<typeof setTimeout>> = [];

  public arrangeNewPerform(perform: IPerform, script: ISentence, syncPerformState = true) {
    // 语句不执行演出
    if (perform.performName === 'none') {
      return;
    }
    // 同步演出状态
    if (syncPerformState) {
      const performToAdd = { id: perform.performName, isHoldOn: perform.isHoldOn, script };
      stageActions.addPerform(performToAdd);
    }

    // 时间到后自动清理演出
    perform.stopTimeout = setTimeout(() => {
      // perform.stopFunction();
      // perform.isOver = true;
      if (!perform.isHoldOn) {
        // 如果不是保持演出，清除
        this.unmountPerform(perform.performName);
        if (perform.goNextWhenOver) {
          // nextSentence();
          this.goNextWhenOver();
        }
      }
    }, perform.duration);

    this.performList.push(perform);
  }

  public unmountPerform(name: string, force = false) {
    if (force) {
      for (let index = 0; index < this.performList.length; index++) {
        const e = this.performList[index];
        if (e.performName === name) {
          e.stopFunction();
          clearTimeout(e.stopTimeout as unknown as number);
          this.performList.splice(index, 1);
          index--;
          /**
           * 从状态表里清除演出
           */
          this.erasePerformFromState(name);
        }
      }
    } else {
      for (let index = 0; index < this.performList.length; index++) {
        const e = this.performList[index];
        if (!e.isHoldOn && e.performName === name) {
          e.stopFunction();
          clearTimeout(e.stopTimeout as unknown as number);
          this.performList.splice(index, 1);
          index--;
        }
      }
    }
  }

  public erasePerformFromState(name: string) {
    stageActions.removePerformByName(name);
  }

  public removeAllPerform() {
    for (const e of this.performList) {
      e.stopFunction();
    }
    this.performList = [];
    for (const e of this.timeoutList) {
      clearTimeout(e);
    }
  }

  private goNextWhenOver() {
    let isBlockingAuto = false;
    this.performList.forEach((e) => {
      if (e.blockingAuto()) {
        // 阻塞且没有结束的演出
        isBlockingAuto = true;
      }
    });
    if (isBlockingAuto) {
      // 有阻塞，提前结束
      setTimeout(this.goNextWhenOver, 100);
    } else {
      nextSentence();
    }
  }
}
