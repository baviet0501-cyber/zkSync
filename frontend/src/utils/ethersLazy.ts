let instance: any = null;
let promise: Promise<any> | null = null;

/**
 * Lazily load ethers (v5) to reduce initial bundle size.
 * ethers v5 is ~350 kB and cannot be tree-shaken (single namespace object).
 * This function caches the module after the first load.
 */
export async function getEthers(): Promise<any> {
  if (instance) return instance;
  if (!promise) {
    promise = import("ethers").then((mod) => {
      instance = mod.ethers ?? mod.default ?? mod;
      return instance;
    });
  }
  return promise;
}
