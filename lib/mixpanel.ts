import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN!;

export const initMixpanel = () => {
    if (typeof window !== "undefined") {
        mixpanel.init(MIXPANEL_TOKEN, { debug: process.env.NODE_ENV !== "production" });
    }
};

export const track = (event: string, props?: Record<string, any>) => {
    if (typeof window !== "undefined") {
        mixpanel.track(event, props);
    }
};

export const identify = (userId: string) => {
    if (typeof window !== "undefined") {
        mixpanel.identify(userId);
    }
};
