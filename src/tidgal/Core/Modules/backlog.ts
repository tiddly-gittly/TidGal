/**
 * 当前的backlog
 */
import cloneDeep from 'lodash/cloneDeep';
import { IEffect, IStageState } from 'src/tidgal/store/stageInterface';
import { webgalStore } from 'src/tidgal/store/store';
import { ISaveScene } from 'src/tidgal/store/userDataInterface';

import { SceneManager } from 'src/tidgal/Core/Modules/scene';
import { SYSTEM_CONFIG } from 'src/tidgal/Coreconfig';

export interface IBacklogItem {
  currentStageState: IStageState;
  saveScene: ISaveScene;
}

export class BacklogManager {
  public isSaveBacklogNext = false;
  private readonly backlog: IBacklogItem[] = [];

  private readonly sceneManager: SceneManager;

  public constructor(sceneManager: SceneManager) {
    this.sceneManager = sceneManager;
  }

  public getBacklog() {
    return this.backlog;
  }

  public editLastBacklogItemEffect(effects: IEffect[]) {
    this.backlog.at(-1).currentStageState.effects = effects;
  }

  public makeBacklogEmpty() {
    this.backlog.splice(0, this.backlog.length); // 清空backlog
  }

  public insertBacklogItem(item: IBacklogItem) {
    this.backlog.push(item);
  }

  public saveCurrentStateToBacklog() {
    // 存一下 Backlog
    const currentStageState = getStage();
    const stageStateToBacklog = cloneDeep(currentStageState);
    stageStateToBacklog.PerformList.forEach((ele) => {
      ele.script.args.forEach((argelement) => {
        if (argelement.key === 'concat') {
          argelement.value = false;
          ele.script.content = stageStateToBacklog.showText;
        }
      });
    });
    const backlogElement: IBacklogItem = {
      currentStageState: stageStateToBacklog,
      saveScene: {
        currentSentenceId: this.sceneManager.sceneData.currentSentenceId, // 当前语句ID
        sceneStack: cloneDeep(this.sceneManager.sceneData.sceneStack), // 场景栈
        sceneName: this.sceneManager.sceneData.currentScene.sceneName, // 场景名称
        sceneUrl: this.sceneManager.sceneData.currentScene.sceneUrl, // 场景url
      },
    };
    this.getBacklog().push(backlogElement);

    // 清除超出长度的部分
    while (this.getBacklog().length > SYSTEM_CONFIG.backlog_size) {
      this.getBacklog().shift();
    }
  }
}
