declare global {
    interface Window {
        ethereum: any;
    }
}
export declare const hotProvider: {
    on(event: string, cb: any): void;
    removeListener(event: string, cb: any): void;
    _events: Map<string, Set<any>>;
    isMetaMask: boolean;
    isHotWallet: boolean;
    isConnected: () => boolean;
    readonly account: {
        address: string | null;
        chain: number;
    };
    address: string | null;
    get chainId(): number;
    set chainId(chain: number | string);
    request: (data: any) => Promise<any>;
};
