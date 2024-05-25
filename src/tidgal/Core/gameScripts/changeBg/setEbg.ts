export function setEbg(url: string) {
  const ebg = document.querySelector('#ebg');
  if (ebg) {
    ebg.style.backgroundImage = `url("${url}")`;
  }
}
