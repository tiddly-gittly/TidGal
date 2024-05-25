import { generateTestblurAnimationObj } from 'src/tidgal/Core/controller/stage/pixi/animations/testblur';
import { generateUniversalSoftInAnimationObj } from 'src/tidgal/Core/controller/stage/pixi/animations/universalSoftIn';
import { generateUniversalSoftOffAnimationObj } from 'src/tidgal/Core/controller/stage/pixi/animations/universalSoftOff';

export const webgalAnimations: Array<{ animationGenerateFunc: Function; name: string }> = [
  { name: 'universalSoftIn', animationGenerateFunc: generateUniversalSoftInAnimationObj },
  { name: 'universalSoftOff', animationGenerateFunc: generateUniversalSoftOffAnimationObj },
  { name: 'testblur', animationGenerateFunc: generateTestblurAnimationObj },
];
