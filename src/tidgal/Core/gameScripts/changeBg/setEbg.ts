import { getContainer } from '../../util/coreInitialFunction/container';

export function setEbg(url: string) {
  const ebg = getContainer()?.querySelector<HTMLDivElement>('#ebg');
  if (ebg) {
    ebg.style.backgroundImage = `url("${url}")`;
  }
}
