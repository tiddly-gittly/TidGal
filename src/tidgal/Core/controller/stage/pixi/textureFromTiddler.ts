import * as PIXI from 'pixi.js';

export function createTextureFromTiddler(title: string) {
  const tiddlerText = $tw.wiki.getTiddlerText(title);
  if (!tiddlerText) return;
  // create img element with base64
  const imgElement = document.createElement('img');
  imgElement.src = `data:image/png;base64,${tiddlerText}`;
  const base = new PIXI.BaseTexture(imgElement);
  const texture = new PIXI.Texture(base);
  return texture;
}
