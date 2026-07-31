// Type shim for upng-js (no built-in TS declarations).
declare module 'upng-js' {
  export function encode(imagedata: ArrayBufferLike[], w: number, h: number, cnum: number): ArrayBuffer;
  export function decode(buffer: ArrayBufferLike): { width: number; height: number; data: Uint8Array; depth: number; ctype: number; tabs: Record<string, any> };
  export function decodeFirstFrame(buffer: ArrayBufferLike): { width: number; height: number; data: Uint8Array };
  export const encoded: { _idat: ArrayBuffer };
  const UPNG: { encode: typeof encode; decode: typeof decode; decodeFirstFrame: typeof decodeFirstFrame; encoded: typeof encoded };
  export default UPNG;
}