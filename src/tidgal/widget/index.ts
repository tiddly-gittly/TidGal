import { widget as Widget } from '$:/core/modules/widgets/widget.js';
import { IChangedTiddlers } from 'tiddlywiki';

import { startGame } from '../Core/controller/gamePlay/startContinueGame';
import { initializeScript } from '../Core/initializeScript';
import { onBgChange } from '../Stage/MainStage/useSetBg';
import { setStageObjectEffects } from '../Stage/MainStage/useSetEffects';
import { onFigureChange } from '../Stage/MainStage/useSetFigure';
import { guiUpdated } from '../store/GUIReducer';
import { savesUpdated } from '../store/savesReducer';
import { IStageState } from '../store/stageInterface';
import { getStage, initStageState, stageUpdated } from '../store/stageReducer';
import { userDataUpdated } from '../store/userDataReducer';

class GalGameWidget extends Widget {
  refresh(changedTiddlers: IChangedTiddlers) {
    if (changedTiddlers['$:/temp/tidgal/default/StageState']) {
      this.onStageStateChange();
      return this.refreshChildren(changedTiddlers);
    }
    // if (changedTiddlers['$:/temp/tidgal/default/GuiState'] || changedTiddlers['$:/temp/tidgal/default/UserData'] || changedTiddlers['$:/temp/tidgal/default/SaveData']) {
    //   return this.refreshChildren(changedTiddlers);
    // }
    if (changedTiddlers['$:/temp/tidgal/default/GuiState']) {
      guiUpdated();
      return this.refreshChildren(changedTiddlers);
    }
    if (changedTiddlers['$:/temp/tidgal/default/UserData']) {
      userDataUpdated();
      return this.refreshChildren(changedTiddlers);
    }
    if (changedTiddlers['$:/temp/tidgal/default/SaveData']) {
      savesUpdated();
      return this.refreshChildren(changedTiddlers);
    }

    return false;
  }

  containerElement: HTMLDivElement | null = null;
  render(parent: Element, nextSibling: Element) {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.execute();
    const assetBase = this.getAttribute('assetBase');
    const width = this.getAttribute('width', '100%');
    const height = this.getAttribute('height', '400px');
    const stageTitle = this.getAttribute('stageTitle', '$:/plugins/linonetwo/tidgal/Stage/Stage');
    if (!assetBase) {
      const containerElement = $tw.utils.domMaker('p', {
        text: 'No assetBase!',
      });
      parent.insertBefore(containerElement, nextSibling);
      this.domNodes.push(containerElement);
      return;
    }
    const containerElement = $tw.utils.domMaker('main', {
      class: 'galgame-container',
      style: { width, height },
    }) as HTMLDivElement;
    this.containerElement = containerElement;
    const transcludeWidgetNode = $tw.wiki.makeTranscludeWidget(stageTitle, {
      document,
      parentWidget: this,
      recursionMarker: 'yes',
      mode: 'block',
      importPageMacros: true,
    });
    transcludeWidgetNode.render(containerElement, null);
    parent.insertBefore(containerElement, nextSibling);
    this.children.push(transcludeWidgetNode);
    this.domNodes.push(containerElement);
    // load the game
    void this.loadGameAndStart(assetBase);
  }

  stageState: IStageState = initStageState;
  prevStageState: IStageState = initStageState;
  setPrevState() {
    this.prevStageState = this.stageState;
  }

  onStageStateChange() {
    this.stageState = getStage();
    onBgChange(this.stageState, this.prevStageState);
    onFigureChange(this.stageState, this.prevStageState);
    setStageObjectEffects(this.stageState, this.prevStageState);
    // update prev state after we finish using it.
    this.setPrevState();
    stageUpdated();
  }

  async loadGameAndStart(assetBase: string) {
    if (!this.containerElement) {
      $tw.utils.error('No container element in galgame widget!');
      return;
    }
    try {
      await initializeScript({ assetBase, container: this.containerElement });
      await startGame();
    } catch (error) {
      $tw.utils.error(error as Error);
      this.containerElement.innerText = `Error loading the game (${(error as Error).message})`;
    }
  }
}

declare let exports: {
  galgame: typeof GalGameWidget;
};
exports.galgame = GalGameWidget;
