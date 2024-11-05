import uuid4 from "uuid4";
import { baseEncode } from "@near-js/utils";
import { createRequest, getResponse } from "./helpers/proxy";
export const wait = (timeout) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
};
export class RequestFailed extends Error {
    constructor(payload) {
        super();
        this.payload = payload;
        this.name = "RequestFailed";
    }
}
class HOT {
    constructor() {
        this.walletId = "https://t.me/herewalletbot/app";
        this.ancestorOrigins = [
            "http://localhost:1234",
            "https://my.herewallet.app",
            "https://tgapp-dev.herewallet.app",
            "https://tgapp.herewallet.app",
            "https://beta.herewallet.app",
        ];
        this.connection = new Promise((resolve) => {
            if (typeof window === "undefined")
                return resolve(null);
            if (window?.self === window?.top)
                return resolve(null);
            this.injectedRequest("initialized", {})
                .then(resolve)
                .catch(() => resolve(null));
        });
        this.openInHotBrowser = false;
    }
    get isInjected() {
        return this.ancestorOrigins.includes(window.location.ancestorOrigins?.[0]);
    }
    toggleOpenInHotBrowser(is) {
        this.openInHotBrowser = is;
    }
    setupEthProvider(provider) {
        this.customProvider = provider;
    }
    async injectedRequest(method, request) {
        const id = uuid4();
        return new Promise((resolve, reject) => {
            const handler = (e) => {
                if (e.data.id !== id)
                    return;
                window?.removeEventListener("message", handler);
                if (e.data.success)
                    return resolve(e.data.payload);
                else
                    return reject(e.data.payload);
            };
            window?.parent.postMessage({ $hot: true, method, request, id }, "*");
            window?.addEventListener("message", handler);
        });
    }
    async request(method, request) {
        if (this.isInjected) {
            return this.injectedRequest(method, request);
        }
        const id = uuid4();
        const WebApp = window?.Telegram?.WebApp;
        const panel = WebApp == null ? window.open("about:blank", "_blank") : null;
        const requestId = await createRequest({
            inside: this.openInHotBrowser || (method === "ethereum" && this.customProvider == null),
            origin: location.href,
            $hot: true,
            method,
            request,
            id,
        });
        const link = `${this.walletId}?startapp=hotconnect-${baseEncode(requestId)}`;
        if (panel)
            panel.location.assign(link);
        else
            WebApp?.openTelegramLink(link);
        const poolResponse = async () => {
            await wait(3000);
            const data = await getResponse(requestId).catch(() => null);
            if (data == null)
                return await poolResponse();
            if (data.success)
                return data.payload;
            throw new RequestFailed(data.payload);
        };
        const result = await poolResponse();
        panel?.close();
        return result;
    }
}
export default new HOT();
//# sourceMappingURL=hot.js.map