/* eslint-disable unicorn/prefer-spread */
export const withoutTextNode = <T extends NodeListOf<ChildNode> | HTMLDivElement[]>(children: T): T => Array.from(children).filter(item => item.nodeName !== '#text') as T;
