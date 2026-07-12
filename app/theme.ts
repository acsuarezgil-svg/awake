export const wheelThemes = {
    roseSage: {
        name: "Rose + Sage",
        mode: "light",
        pageBackground:
            "linear-gradient(180deg, rgb(255 255 255), rgb(255 247 248), rgb(247 253 250))",
        pattern: "251, 113, 133",
        investment: "52, 211, 153",
        patternFill: "rgba(251, 113, 133, 0.45)",
        investmentFill: "rgba(52, 211, 153, 0.45)",
        wheelBackground:
            "linear-gradient(135deg, rgb(255 241 242), rgb(236 253 245), rgb(240 249 255))",

    },

    clayMoss: {
        name: "Clay + Moss",
        mode: "light",
        pageBackground:
            "linear-gradient(180deg, rgb(255 255 255), rgb(250 246 243), rgb(246 249 243))",
        pattern: "194, 120, 91",
        investment: "112, 143, 95",
        patternFill: "rgba(194, 120, 91, 0.48)",
        investmentFill: "rgba(112, 143, 95, 0.48)",
        wheelBackground:
            "linear-gradient(135deg, rgb(250 242 237), rgb(241 246 236), rgb(248 250 247))",

    },

    lavenderMint: {
        name: "Lavender + Mint",
        mode: "light",
        pageBackground:
            "linear-gradient(180deg, rgb(255 255 255), rgb(248 247 255), rgb(244 253 251))",
        pattern: "167, 139, 250",
        investment: "45, 212, 191",
        patternFill: "rgba(167, 139, 250, 0.42)",
        investmentFill: "rgba(45, 212, 191, 0.42)",
        wheelBackground:
            "linear-gradient(135deg, rgb(245 243 255), rgb(240 253 250), rgb(248 250 252))",

    },

    yinYang: {
        name: "Yin & Yang",
        mode: "light",
        pageBackground:
            "linear-gradient(180deg, rgb(255 255 255), rgb(247 247 246), rgb(239 238 236))",
        pattern: "63, 63, 70",
        investment: "168, 162, 158",
        patternFill: "rgba(63, 63, 70, 0.58)",
        investmentFill: "rgba(168, 162, 158, 0.46)",
        wheelBackground:
            "linear-gradient(135deg, rgb(250 250 249), rgb(245 245 244), rgb(231 229 228))",

    },

    ocean: {
        name: "Ocean",
        mode: "light",
        pageBackground:
            "linear-gradient(180deg, rgb(255 255 255), rgb(242 248 255), rgb(239 253 252))",
        pattern: "30, 64, 175",
        investment: "45, 212, 191",
        patternFill: "rgba(30, 64, 175, 0.48)",
        investmentFill: "rgba(45, 212, 191, 0.48)",
        wheelBackground:
            "linear-gradient(135deg, rgb(239 246 255), rgb(236 254 255), rgb(240 253 250))",

    },

    forest: {
        name: "Forest",
        mode: "light",
        pageBackground:
            "linear-gradient(180deg, rgb(255 255 255), rgb(244 251 246), rgb(246 249 240))",
        pattern: "22, 101, 52",
        investment: "132, 204, 22",
        patternFill: "rgba(22, 101, 52, 0.50)",
        investmentFill: "rgba(132, 204, 22, 0.42)",
        wheelBackground:
            "linear-gradient(135deg, rgb(240 253 244), rgb(247 254 231), rgb(245 245 244))",

    },

    sunset: {
        name: "Sunset",
        mode: "light",
        pageBackground:
            "linear-gradient(180deg, rgb(255 255 255), rgb(255 248 240), rgb(255 245 243))",
        pattern: "194, 65, 12",
        investment: "251, 191, 36",
        patternFill: "rgba(194, 65, 12, 0.48)",
        investmentFill: "rgba(251, 191, 36, 0.44)",
        wheelBackground:
            "linear-gradient(135deg, rgb(255 247 237), rgb(255 251 235), rgb(255 241 242))",

    },

    midnight: {
        name: "Midnight",
        mode: "dark",
        pageBackground:
            "linear-gradient(180deg, rgb(15 23 42), rgb(17 24 39), rgb(20 45 48))",
        pattern: "100, 116, 139",
        investment: "45, 212, 191",
        patternFill: "rgba(100, 116, 139, 0.78)",
        investmentFill: "rgba(45, 212, 191, 0.58)",
        wheelBackground:
            "linear-gradient(135deg, rgb(15 23 42), rgb(17 24 39), rgb(19 78 74))",

    },
} as const;

export type WheelTheme = keyof typeof wheelThemes;

export function isWheelTheme(value: string): value is WheelTheme {
    return value in wheelThemes;
}

export function isDarkWheelTheme(theme: WheelTheme) {
    return wheelThemes[theme].mode === "dark";
}