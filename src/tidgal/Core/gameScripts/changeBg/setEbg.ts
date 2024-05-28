import { getContainer } from '../../util/coreInitialFunction/container';
import { getBase64URL } from '../../util/gameAssetsAccess/assetSetter';

/**
 * 设置模糊背景
 */
export function setEbg(url: string) {
  const ebg = getContainer()?.querySelector<HTMLDivElement>('#ebg');
  if (ebg) {
    ebg.style.backgroundImage = `url("${getBase64URL(url)}")`;
  }
}
