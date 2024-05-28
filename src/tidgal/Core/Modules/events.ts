import mitt from 'mitt';

interface IWebgalEvent<T> {
  emit: (message?: T, id?: string) => void;
  off: (callback: (message?: T) => void, id?: string) => void;
  on: (callback: (message?: T) => void, id?: string) => void;
}

export class Events {
  public textSettle = formEvent('text-settle');
  public userInteractNext = formEvent('__NEXT');
  public fullscreenDbClick = formEvent('fullscreen-dbclick');
  public styleUpdate = formEvent('style-update');
}

const eventBus = mitt();

function formEvent<T>(eventName: string): IWebgalEvent<T> {
  return {
    on: (callback, id?) => {
      // DEBUG: console eventName
      console.log(`on eventName`, eventName);
      // @ts-expect-error
      eventBus.on(`${eventName}-${id ?? ''}`, callback);
    },
    emit: (message?, id?) => {
      // DEBUG: console eventName
      console.log(`emit eventName`, eventName);
      eventBus.emit(`${eventName}-${id ?? ''}`, message);
    },
    off: (callback, id?) => {
      // @ts-expect-error
      eventBus.off(`${eventName}-${id ?? ''}`, callback);
    },
  };
}
