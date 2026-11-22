// Build-time env values may be relative ("/callback", "/api/ws") so the same
// image works on any hostname (AWS, on-prem box, etc.). Resolve them against
// the page origin at runtime; absolute values are returned unchanged.

const resolve = (value: string | undefined, fallbackPath: string): string => {
    const raw: string = value && value.length > 0 ? value : fallbackPath;
    if (/^[a-z]+:\/\//i.test(raw)) {
        return raw;
    }
    return new URL(raw, window.location.origin).toString();
};

export const resolveCallbackUrl = (value: string | undefined): string =>
    resolve(value, "/callback");

export const resolveWebSocketUrl = (value: string | undefined): string => {
    const url: URL = new URL(resolve(value, "/api/ws"));
    if (url.protocol === "http:") url.protocol = "ws:";
    if (url.protocol === "https:") url.protocol = "wss:";
    return url.toString();
};
