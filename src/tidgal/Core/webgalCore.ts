import { AnimationManager } from 'src/tidgal/Core/Modules/animations';
import { BacklogManager } from 'src/tidgal/Core/Modules/backlog';
import { Events } from 'src/tidgal/Core/Modules/events';
import { SceneManager } from 'src/tidgal/Core/Modules/scene';
import { Gameplay } from './Modules/gamePlay';

export class WebgalCore {
  public sceneManager = new SceneManager();
  public backlogManager = new BacklogManager(this.sceneManager);
  public animationManager = new AnimationManager();
  public gameplay = new Gameplay();
  public gameName = '';
  public gameKey = '';
  public events = new Events();
}
