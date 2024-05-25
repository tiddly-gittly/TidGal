import { widget as Widget } from '$:/core/modules/widgets/widget.js';
import { IChangedTiddlers } from 'tiddlywiki';
import './index.css';
import { initializeScript } from './Core/initializeScript';
import { onBgChange } from './Stage/MainStage/useSetBg';
import { setStageObjectEffects } from './Stage/MainStage/useSetEffects';
import { onFigureChange } from './Stage/MainStage/useSetFigure';
import { IStageState } from './store/stageInterface';
import { initStageState } from './store/stageReducer';

class GalGameWidget extends Widget {
  refresh(changedTiddlers: IChangedTiddlers) {
    if (changedTiddlers['$:/temp/tidgal/default/StageState']?.modified === true) {
      this.onStageStateChange();
    }
    return false;
  }

  render(parent: Element, nextSibling: Element) {
    this.parentDomNode = parent;
    this.computeAttributes();
    this.execute();
    const assetBase = this.getAttribute('assetBase');
    if (!assetBase) {
      const containerElement = $tw.utils.domMaker('p', {
        text: 'No assetBase!',
      });
      parent.insertBefore(containerElement, nextSibling);
      this.domNodes.push(containerElement);
      return;
    }
    initializeScript({ assetBase });
    const containerElement = $tw.utils.domMaker('div', {
      text: 'This is a widget!',
    });
    parent.insertBefore(containerElement, nextSibling);
    this.domNodes.push(containerElement);
  }

  stageState: IStageState = initStageState;
  prevStageState: IStageState = initStageState;
  setPrevState() {
    this.prevStageState = this.stageState;
  }

  onStageStateChange() {
    this.stageState = $tw.wiki.getTiddlerData('$:/temp/tidgal/default/StageState', initStageState as unknown as Record<any, unknown>) as unknown as IStageState;
    onBgChange(this.stageState, this.prevStageState);
    onFigureChange(this.stageState, this.prevStageState);
    setStageObjectEffects(this.stageState, this.prevStageState);
    this.setPrevState();
  }
}

declare let exports: {
  galgame: typeof GalGameWidget;
};
exports.galgame = GalGameWidget;
