import { InjectedState, HotRequest, HotResponse } from "./helpers/types";
export declare const wait: (timeout: number) => Promise<void>;
export declare class RequestFailed extends Error {
    readonly payload: any;
    name: string;
    constructor(payload: any);
}
declare class HOT {
    walletId: string;
    ancestorOrigins: string[];
    readonly connection: Promise<InjectedState | null>;
    get isInjected(): boolean;
    openInHotBrowser: boolean;
    toggleOpenInHotBrowser(is: boolean): void;
    customProvider?: (data: any, chain: number, address?: string | null) => Promise<any>;
    setupEthProvider(provider?: (data: any, chain: number, address?: string | null) => Promise<any>): void;
    injectedRequest<T extends keyof HotResponse>(method: T, request: HotRequest[T]): Promise<HotResponse[T]>;
    request<T extends keyof HotResponse>(method: T, request: HotRequest[T]): Promise<HotResponse[T]>;
}
declare const _default: HOT;
export default _default;
