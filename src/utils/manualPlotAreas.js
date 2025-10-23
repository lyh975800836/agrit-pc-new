const MANUAL_PLOT_AREAS = {
    雷哥: 25.4,
    宏哥: 272.07,
    巴塘: 30.88,
    巴塘2: 30.88,
    油茶示范基地: 213,
    油茶精品园: 213,
    田林县: 213,
    1000: 25.4,
    1001: 272.07,
    1002: 30.88,
    1039: 213
};

function normalizeManualPlotKey(value) {
    if (value === undefined || value === null) {
        return null;
    }

    const stringValue = String(value).trim();

    if (!stringValue) {
        return null;
    }

    if (Object.prototype.hasOwnProperty.call(MANUAL_PLOT_AREAS, stringValue)) {
        return stringValue;
    }

    if (stringValue.includes('雷哥')) {
        return '雷哥';
    }

    if (stringValue.includes('宏哥')) {
        return '宏哥';
    }

    if (stringValue.includes('巴塘')) {
        return '巴塘';
    }

    if (stringValue.includes('油茶')) {
        return '油茶示范基地';
    }

    return stringValue;
}

export function resolveManualPlotArea(...candidates) {
    for (const candidate of candidates) {
        const normalized = normalizeManualPlotKey(candidate);
        if (normalized && Object.prototype.hasOwnProperty.call(MANUAL_PLOT_AREAS, normalized)) {
            return MANUAL_PLOT_AREAS[normalized];
        }
    }

    return null;
}

export { MANUAL_PLOT_AREAS };
