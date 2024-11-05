import HOT from "../hot";
if (HOT.isInjected) {
    // @ts-ignore
    window.hot = {
        tonconnect: {
            deviceInfo: {
                appName: "hot",
                appVersion: "1",
                maxProtocolVersion: 2,
                platform: "ios",
                features: ["SendTransaction", { name: "SendTransaction", maxMessages: 4 }],
            },
            walletInfo: {
                name: "hotWallet",
                image: "https://storage.herewallet.app/logo.png",
                about_url: "https://hot-labs.org",
            },
            protocolVersion: 2,
            isWalletBrowser: true,
            connect: (_, request) => {
                return HOT.request("ton:connect", request);
            },
            restoreConnection: () => {
                return HOT.request("ton:restoreConnection", {});
            },
            disconnect: () => {
                return HOT.request("ton:disconnect", {});
            },
            send: async (request) => {
                return HOT.request("ton:send", request);
            },
            listen: () => {
                return function () { };
            },
        },
    };
}
//# sourceMappingURL=ton.js.map