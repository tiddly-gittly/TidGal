import { ITransform } from 'src/tidgal/Corestore/stageInterface';

export type IUserAnimationEffects = Array<ITransform & { duration: number }>;

export interface IUserAnimation {
  effects: Effects;
  name: string;
}

export class AnimationManager {
  public nextEnterAnimationName = new Map<string, string>();
  public nextExitAnimationName = new Map<string, string>();
  private readonly animations: IUserAnimation[] = [];

  public addAnimation(animation: IUserAnimation) {
    this.animations.push(animation);
  }

  public getAnimations() {
    return this.animations;
  }
}
