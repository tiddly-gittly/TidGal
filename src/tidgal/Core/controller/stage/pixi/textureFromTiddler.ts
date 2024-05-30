
export function createBase64UrlFromTiddler(title: string) {
  // this does not handle lazy-loading, because all there assets should be plugin, and is not lazy-loaded
  const tiddler = $tw.wiki.getTiddler(title);
  if (!tiddler) return;
  // create img element with base64
  const base64String = `data:${tiddler.fields.type ?? 'image/png'};base64,${tiddler.fields.text}`;
  return base64String;
  // create PIXI.Texture from img element
  // const imgElement = document.createElement('img');
  // imgElement.src = base64String;
  // const base = new PIXI.BaseTexture(imgElement);
  // const texture = new PIXI.Texture(base);
  // return texture;
}
