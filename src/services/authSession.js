/**
 * 登录态的唯一出口
 *
 * 之前登录态是两个各走各的 localStorage key：路由守卫只看永不过期的 isAuthenticated，
 * 而接口请求头用的是会过期的 auth_token。token 过期后守卫照样放行，等页面首屏接口
 * 返回 code 401 才被踢回登录页 —— 表现就是"点进去一闪又弹回来"。
 *
 * 这里把登录态统一成"token 在不在、过没过期"。isAuthenticated 只作为旧版本残留一并清理，
 * 不再参与判断。
 *
 * 注意有一类失效是前端**查不出来**的：后端是单账号单会话，同一账号在别处登录会下发新的
 * session_id 并把旧会话作废（接口返回 401「会话已失效，请重新登录」）。这种 token 的 exp
 * 还在未来、结构也完全合法，守卫只能放行，等接口 401 才知道。所以失效原因必须带到登录页
 * 显示出来，否则用户看到的就是莫名其妙的弹回 —— 这正是"无痕能进、正常窗口进不去"的来源：
 * 在无痕里登一次，就把正常窗口的会话顶掉了
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_info';
/** 旧版本写过的登录标记，清理时带上，免得残留把人误判成已登录 */
const LEGACY_FLAG_KEY = 'isAuthenticated';
/** 被踢下线的原因，登录页读一次就删 */
const KICK_REASON_KEY = 'auth_kick_reason';

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

/**
 * 取出并清除"为什么被踢下线"，登录页开屏时调用
 *
 * 读完即删，避免用户下次正常访问登录页还看到上次的提示
 *
 * @returns {string} 提示文案，没有则空串
 */
export function takeKickReason() {
    const reason = localStorage.getItem(KICK_REASON_KEY) || '';
    localStorage.removeItem(KICK_REASON_KEY);
    return reason;
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
 * 把后端的 401 原因翻译成给用户看的话
 *
 * 后端目前会给这几种：「会话已失效，请重新登录」（被别处登录顶掉）、
 * 「无效的 token」、「缺少 Authorization header」。前两种含义差很多，
 * 不能都糊成"登录已过期"——用户要能分清是自己超时了，还是账号在别处登录了
 *
 * @param {string} message - 后端返回的 message
 * @returns {string}
 */
function describeKick(message) {
    const text = String(message || '');
    if (text.includes('会话')) {
        return '该账号已在其他地方登录，当前会话被顶下线，请重新登录';
    }
    if (text.includes('token') || text.includes('Authorization')) {
        return '登录状态已失效，请重新登录';
    }
    return text || '登录状态已失效，请重新登录';
}

/**
 * token 失效：清掉登录态并回登录页，带上当前页以便登录后跳回
 *
 * 接口层拿到业务码 401 时调用。走整页跳转而不是 router.push，
 * 是为了把已经渲染了一半的页面和它在途的请求一起丢掉
 *
 * @param {string} [message] - 后端返回的 401 message，用来告诉用户为什么被踢
 */
/**
 * 清掉登录态并记下原因，但不跳转
 *
 * 路由守卫用：它自己会 next() 到登录页，不需要也不能在这里整页跳转
 *
 * @param {string} [message] - 失效原因
 */
export function noteSessionExpired(message) {
    // 原本就没登录过就别提示"已失效"——首次访问被守卫挡下也会走到这里，
    // 那种情况下弹一句"登录状态已失效"纯属吓人。并发的多个 401 也靠这条自然去重
    const hadSession = Boolean(getToken());
    clearSession();
    if (!hadSession) return;

    // 原因写在 localStorage 而不是 URL：整页跳转后组件才起来，URL 参数会被路由守卫的
    // 重定向洗掉，而且失效原因不该留在地址栏里被复制传播
    localStorage.setItem(KICK_REASON_KEY, describeKick(message));
}

export function handleSessionExpired(message) {
    const from = currentRoutePath();
    noteSessionExpired(message);
    if (isOnLoginPage()) return;

    const redirect = normalizeRedirect(from);
    const query = redirect ? `?redirect=${ encodeURIComponent(redirect) }` : '';
    // 用 pathname 而不是写死 '/'，部署在子路径下（如 /frontend-a/）时才不会跳飞
    window.location.href = `${ window.location.pathname }#/login${ query }`;
}
