export function objectToInlineStyle(styleObject: Record<string, string>): string {
  return Object.keys(styleObject)
    .map(key => `${key.replaceAll(/([A-Z])/g, '-$1').toLowerCase()}: ${styleObject[key]};`)
    .join(' ');
}
