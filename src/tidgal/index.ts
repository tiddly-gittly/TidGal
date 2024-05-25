import { widget as Widget } from '$:/core/modules/widgets/widget.js';
import { IChangedTiddlers } from 'tiddlywiki';
import './index.css';
import { initializeScript } from './Core/initializeScript';

class GalGameWidget extends Widget {
  refresh(_changedTiddlers: IChangedTiddlers) {
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
}

declare let exports: {
  galgame: typeof GalGameWidget;
};
exports.galgame = GalGameWidget;
