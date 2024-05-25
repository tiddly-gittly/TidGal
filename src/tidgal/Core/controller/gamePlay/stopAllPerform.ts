import { logger } from 'src/tidgal/Core/util/logger';

import { WebGAL } from 'src/tidgal/Core/WebGAL';

export const stopAllPerform = () => {
  logger.log('清除所有演出');
  for (let index = 0; index < WebGAL.gameplay.performController.performList.length; index++) {
    const e = WebGAL.gameplay.performController.performList[index];
    e.stopFunction();
    clearTimeout(e.stopTimeout as unknown as number);
    WebGAL.gameplay.performController.performList.splice(index, 1);
    index--;
  }
};
