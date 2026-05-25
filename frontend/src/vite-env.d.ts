/// <reference types="vite/client" />

interface Window {
  ethereum?: import("ethers").providers.ExternalProvider & {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, cb: (...args: any[]) => void) => void;
    removeListener: (event: string, cb: (...args: any[]) => void) => void;
    isMetaMask?: boolean;
  };
}

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: NonNullable<Window["ethereum"]>;
}

interface EIP6963AnnounceProviderEvent extends Event {
  detail: EIP6963ProviderDetail;
}

declare namespace NodeJS {
  interface ProcessEnv {
    VITE_GREETER_ADDRESS?: string;
    VITE_TOKEN_ADDRESS?: string;
    VITE_PAYMASTER_ADDRESS?: string;
  }
}
