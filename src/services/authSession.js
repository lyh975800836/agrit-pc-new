/**
 * 登录态的唯一出口
 *
 * 之前登录态是两个各走各的 localStorage key：路由守卫只看永不过期的 isAuthenticated，
 * 而接口请求头用的是会过期的 auth_token。token 过期后守卫照样放行，等页面首屏接口
 * 返回 code 401 才被踢回登录页 —— 表现就是"点进去一闪又弹回来"，
 * 且无痕模式因为每次都得重新登录反而不复现。
 *
 * 这里把登录态统一成"token 在不在、过没过期"。isAuthenticated 只作为旧版本残留一并清理，
 * 不再参与判断
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';
/** 旧版本写过的登录标记，清理时带上，免得残留把人误判成已登录 */
const LEGACY_FLAG_KEY = 'isAuthenticated';

/** 离过期这么近就当已失效，避开客户端时钟偏差和请求在途的时间 */
const EXPIRY_SKEW_MS = 30 * 1000;

export function getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
}

/**
 * 解 JWT 里的 exp，返回毫秒时间戳
 *
 * 解不出来返回 null 而不是当作过期：后端哪天换成不透明 token，
 * 不该把所有人挡在登录页外面，那种情况交给接口的 401 兜底
 *
 * @param {string} token - JWT
 * @returns {number|null}
 */
function readTokenExpiry(token) {
    const parts = String(token).split('.');
    if (parts.length !== 3) return null;

    try {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        return Number.isFinite(payload?.exp) ? payload.exp * 1000 : null;
    }
    catch (error) {
        return null;
    }
}

/** 当前登录态还能不能用 */
export function isSessionValid() {
    const token = getToken();
    if (!token) return false;

    const expiry = readTokenExpiry(token);
    if (expiry === null) return true;
    return Date.now() < expiry - EXPIRY_SKEW_MS;
}

/**
 * 写入登录态（登录成功后调用）
 *
 * @param {string} token - 后端下发的 token
 * @param {Object} user - 用户信息
 */
export function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
    localStorage.setItem(LEGACY_FLAG_KEY, 'true');
}

export function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(LEGACY_FLAG_KEY);
}

function isOnLoginPage() {
    return (window.location.hash || '').startsWith('#/login');
}

/** 当前 hash 路由（不含 #），登录成功后用它跳回原处 */
export function currentRoutePath() {
    const hash = window.location.hash || '';
    return hash.startsWith('#') ? hash.slice(1) : hash;
}

/**
 * 登录后该跳回哪儿：过滤掉登录页本身和外站地址，避免绕圈或被当跳板
 *
 * @param {string} redirect - 路由里带的 redirect 参数
 * @returns {string|null} 可用的站内路径
 */
export function normalizeRedirect(redirect) {
    const target = String(redirect || '');
    // 必须是站内的绝对路径；'//host' 会被浏览器当成协议相对的外站地址
    if (!target.startsWith('/') || target.startsWith('//')) return null;
    if (target.startsWith('/login')) return null;
    return target;
}

/**
 * token 失效：清掉登录态并回登录页，带上当前页以便登录后跳回
 *
 * 接口层拿到业务码 401 时调用。走整页跳转而不是 router.push，
 * 是为了把已经渲染了一半的页面和它在途的请求一起丢掉
 */
export function handleSessionExpired() {
    const from = currentRoutePath();
    clearSession();
    if (isOnLoginPage()) return;

    const redirect = normalizeRedirect(from);
    const query = redirect ? `?redirect=${ encodeURIComponent(redirect) }` : '';
    // 用 pathname 而不是写死 '/'，部署在子路径下（如 /frontend-a/）时才不会跳飞
    window.location.href = `${ window.location.pathname }#/login${ query }`;
}
