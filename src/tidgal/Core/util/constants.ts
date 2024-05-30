export const SCREEN_CONSTANTS = {
  height: 1440,
  width: 2560,
};
export function updateDisplayAreaWH(containerElement: HTMLElement) {
  SCREEN_CONSTANTS.width = containerElement.clientWidth;
  SCREEN_CONSTANTS.height = containerElement.clientHeight;
  containerElement.addEventListener('resize', () => {
    SCREEN_CONSTANTS.width = containerElement.clientWidth;
    SCREEN_CONSTANTS.height = containerElement.clientHeight;
  });
}
