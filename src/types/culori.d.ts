declare module 'culori' {
  export function rgb(color: any): any;
  export function lab(color: any): any;
  export function differenceCiede2000(color1: any, color2: any): number;
  export function differenceCie76(color1: any, color2: any): number;
  export function parse(color: string): any;
  export function formatHex(color: any): string;
  export function formatRgb(color: any): string;
} 