import { WebgalParser } from 'src/tidgal/Core/parser/sceneParser';
import { IWebGALStyleObj } from 'webgal-parser/build/types/styleParser';

export function scss2cssinjsParser(scssString: string): IWebGALStyleObj {
  return WebgalParser.parseScssToWebgalStyleObj(scssString);
}
