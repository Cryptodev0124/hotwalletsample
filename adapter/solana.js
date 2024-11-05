import { BaseMessageSignerWalletAdapter, isVersionedTransaction, WalletConnectionError, WalletError, WalletNotConnectedError, WalletReadyState, WalletSendTransactionError, WalletSignMessageError, WalletSignTransactionError, } from "@solana/wallet-adapter-base";
import { PublicKey, Transaction, VersionedTransaction, } from "@solana/web3.js";
import HOT, { wait } from "../hot";
export const HotWalletName = "HOT";
if (HOT.isInjected) {
    localStorage.setItem("walletName", `"HOT"`);
}
export class HotWalletAdapter extends BaseMessageSignerWalletAdapter {
    constructor() {
        super(...arguments);
        this.name = HotWalletName;
        this.url = "https://hot-labs.org";
        this.icon = "https://storage.herewallet.app/logo.png";
        this.supportedTransactionVersions = new Set(["legacy", 0]);
        this._connecting = false;
        this._publicKey = null;
        this._readyState = WalletReadyState.Installed;
    }
    get publicKey() {
        return this._publicKey;
    }
    get connecting() {
        return this._connecting;
    }
    get readyState() {
        return this._readyState;
    }
    _getLocalAccount() {
        try {
            const publicKey = localStorage.getItem("hot:solana-account");
            if (publicKey == null)
                return null;
            return new PublicKey(publicKey);
        }
        catch {
            return null;
        }
    }
    _parseTransaction(base64) {
        const buf = Buffer.from(base64, "base64");
        try {
            return Transaction.from(buf);
        }
        catch {
            return VersionedTransaction.deserialize(buf);
        }
    }
    async autoConnect() {
        const account = this._getLocalAccount();
        if (account)
            return await this.connect();
        if (HOT.isInjected)
            return await this.connect();
    }
    async connect() {
        try {
            if (this.connected || this.connecting)
                return;
            this._connecting = true;
            const account = this._getLocalAccount();
            if (account && !HOT.isInjected) {
                await wait(100);
                this._publicKey = account;
                this.emit("connect", account);
                this._connecting = false;
                return;
            }
            const { publicKey } = await HOT.request("solana:connect", {});
            if (!publicKey)
                throw new WalletConnectionError();
            this._publicKey = new PublicKey(publicKey);
            localStorage.setItem("hot:solana-account", this._publicKey.toString());
            this.emit("connect", this._publicKey);
            this._connecting = false;
        }
        catch (error) {
            console.error(error);
            this.emit("error", error);
            this._connecting = false;
            throw error;
        }
    }
    async disconnect() {
        localStorage.removeItem("hot:solana-account");
        this._publicKey = null;
        this.emit("disconnect");
    }
    async sendTransaction(transaction, connection, options = {}) {
        try {
            if (!this._publicKey)
                throw new WalletNotConnectedError();
            try {
                const { signers, ...sendOptions } = options;
                if (isVersionedTransaction(transaction)) {
                    signers?.length && transaction.sign(signers);
                }
                else {
                    transaction = (await this.prepareTransaction(transaction, connection, sendOptions));
                    signers?.length && transaction.partialSign(...signers);
                }
                sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;
                const { signature } = await HOT.request("solana:signAndSendTransaction", {
                    transaction: Buffer.from(transaction.serialize({ requireAllSignatures: false })).toString("base64"),
                    sendOptions,
                });
                return signature;
            }
            catch (error) {
                if (error instanceof WalletError)
                    throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        }
        catch (error) {
            this.emit("error", error);
            throw error;
        }
    }
    async signTransaction(transaction) {
        try {
            if (!this._publicKey)
                throw new WalletNotConnectedError();
            try {
                const tx = Buffer.from(transaction.serialize({ requireAllSignatures: false })).toString("base64");
                const result = await HOT.request("solana:signTransactions", { transactions: [tx] });
                return this._parseTransaction(result.transactions[0]);
            }
            catch (error) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        }
        catch (error) {
            this.emit("error", error);
            throw error;
        }
    }
    async signAllTransactions(transactions) {
        try {
            if (!this._publicKey)
                throw new WalletNotConnectedError();
            try {
                const tx = transactions.map((t) => Buffer.from(t.serialize({ requireAllSignatures: false })).toString("base64"));
                const response = await HOT.request("solana:signTransactions", { transactions: tx });
                return response.transactions.map(this._parseTransaction);
            }
            catch (error) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        }
        catch (error) {
            this.emit("error", error);
            throw error;
        }
    }
    async signMessage(message) {
        try {
            if (!this._publicKey)
                throw new WalletNotConnectedError();
            try {
                const { signature } = await HOT.request("solana:signMessage", {
                    message: Buffer.from(message).toString("base64"),
                });
                return Buffer.from(signature, "base64");
            }
            catch (error) {
                throw new WalletSignMessageError(error?.message, error);
            }
        }
        catch (error) {
            this.emit("error", error);
            throw error;
        }
    }
}
//# sourceMappingURL=solana.js.map