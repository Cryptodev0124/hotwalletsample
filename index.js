import { hotProvider } from "./adapter/evm";
import { HotWalletAdapter as SolanaHotWalletAdapter } from "./adapter/solana";
import { setupHotWallet } from "./adapter/near";
import "./adapter/ton";
export { AuthPayload, authPayloadSchema, verifySignature } from "./helpers/nep0314";
export { SolanaHotWalletAdapter, hotProvider };
export { setupHotWallet };
export { default as HOT, RequestFailed } from "./hot";
//# sourceMappingURL=index.js.map