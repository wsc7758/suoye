/**
 * FongMi / Drpy CMS API 通用爬虫 v4
 * 兼容 cms_spider_v3.js 的调用约定，可直接替换配置中的 api 路径。
 *
 * 相对 v3 的改进：
 * 1. 搜索强制 ac=search（v3 在 ?ac=list 的源上搜索会失效）
 * 2. JSON 解析失败时回退解析 CMS XML，兼容 at/xml 源
 * 3. 请求带超时；首页分类 / 首页推荐短时缓存，减少重复请求
 * 4. 广告过滤改为忽略大小写 + 去重，移除易误杀的泛词
 * 5. 搜索本地相关性过滤放宽（名称/演员/导演/简介），避免别名漏结果
 */

var siteApi = "";
var siteHeaders = {};
var siteFilters = {};
var siteTimeout = 8000;

var cacheHomeData = null;
var CACHE_TTL = 60000;

var DEFAULT_UA = "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36";

var BAN_RE = /(博彩|棋牌|彩票|电玩|赌博|澳门|赌场|皇冠|六合彩|六和彩|时时彩|金沙|太阳城|姚记|开元|bbin|ag真人|pg电子|真人视讯|雷火|加微信|约妹|加qq|qq群|赞助|开户)/i;

function now() {
    return Date.now ? Date.now() : new Date().getTime();
}

function init(cfg) {
    var e = cfg || {};
    if (e.ext) e = e.ext;
    if (typeof e === "string") {
        try { e = JSON.parse(e); } catch (ex) { e = { api: e }; }
    }
    siteApi = e.api || "";
    siteHeaders = e.headers || {};
    siteFilters = e.filters || {};
    var t = Number(e.timeout || (cfg && cfg.timeout));
    siteTimeout = t > 0 ? t * 1000 : 8000;
    cacheHomeData = null;
}

function requestHeaders() {
    var h = { "User-Agent": DEFAULT_UA };
    for (var k in siteHeaders) {
        if (siteHeaders.hasOwnProperty(k)) h[k] = siteHeaders[k];
    }
    return h;
}

function httpGet(url) {
    var resp = req(url, { async: false, timeout: siteTimeout, headers: requestHeaders() });
    if (typeof resp === "string") return resp;
    if (resp && typeof resp === "object") {
        if (resp.content) return resp.content;
        if (resp.body) return resp.body;
    }
    return resp == null ? "" : String(resp);
}

function ensureJsonApi(url) {
    return String(url || "").replace(/at\/xml/gi, "at/json");
}

/** 移除原有的 ac 参数，并修复 ?/& 拼接 */
function stripAc(url) {
    var u = String(url || "");
    u = u.replace(/([?&])ac=[^&]*/gi, "$1");
    u = u.replace(/\?&/g, "?").replace(/&&/g, "&");
    u = u.replace(/\?&+/g, "?");
    if (u.indexOf("?") < 0 && u.indexOf("&") >= 0) {
        var i = u.indexOf("&");
        u = u.substring(0, i) + "?" + u.substring(i + 1);
    }
    u = u.replace(/\?+/g, "?").replace(/[?&]+$/, "");
    return u;
}

function buildUrl(params) {
    var base = ensureJsonApi(siteApi);
    if (params && params.ac) base = stripAc(base);
    var sep = base.indexOf("?") >= 0 ? "&" : "?";
    var parts = [];
    for (var key in params) {
        if (!params.hasOwnProperty(key)) continue;
        var val = params[key];
        if (val !== undefined && val !== null && val !== "") {
            parts.push(key + "=" + encodeURIComponent(val));
        }
    }
    return parts.length ? base + sep + parts.join("&") : base;
}

function cleanText(s) {
    var v = String(s == null ? "" : s);
    v = v.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
    v = v.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
         .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
    return v.replace(/^\s+|\s+$/g, "");
}

function pick(o, names) {
    for (var i = 0; i < names.length; i++) {
        var v = o[names[i]];
        if (v !== undefined && v !== null && v !== "") return v;
    }
    return "";
}

function normalizeItem(v) {
    if (!v) return null;
    return {
        vod_id: String(pick(v, ["vod_id", "id"]) || ""),
        vod_name: cleanText(pick(v, ["vod_name", "name"])),
        vod_pic: cleanText(pick(v, ["vod_pic", "pic"])),
        vod_remarks: cleanText(pick(v, ["vod_remarks", "note", "state"])),
        vod_year: cleanText(pick(v, ["vod_year", "year"])),
        vod_area: cleanText(pick(v, ["vod_area", "area"])),
        vod_director: cleanText(pick(v, ["vod_director", "director"])),
        vod_actor: cleanText(pick(v, ["vod_actor", "actor"])),
        vod_content: cleanText(pick(v, ["vod_content", "content", "desc"])),
        vod_type: cleanText(pick(v, ["vod_type", "type_name", "typename"])),
        vod_score: cleanText(pick(v, ["vod_score", "score"])),
        vod_play_from: cleanText(pick(v, ["vod_play_from", "play_from"])),
        vod_play_url: cleanText(pick(v, ["vod_play_url", "play_url"]))
    };
}

/** CMS XML 回退解析（仅用正则，不依赖 DOM / 第三方库） */
function parseXml(text) {
    var xml = String(text || "");
    if (xml.indexOf("<root") < 0 && xml.indexOf("<video") < 0) return null;
    var out = { class: [], list: [], page: 1, pagecount: 1, limit: 20, total: 0 };

    var cb = xml.match(/<class\b[^>]*>([\s\S]*?)<\/class>/i);
    if (cb) {
        var cre = /<ty\b([^>]*)>([\s\S]*?)<\/ty>/gi, cm;
        while ((cm = cre.exec(cb[1])) !== null) {
            var idm = cm[1].match(/id\s*=\s*["']?([^"'\s>]+)/i);
            out.class.push({ type_id: String(idm ? idm[1] : ""), type_name: cleanText(cm[2]) });
        }
    }

    var lb = xml.match(/<list\b([^>]*)>/i);
    if (lb) {
        var pg = lb[1].match(/page\s*=\s*["']?(\d+)/i);
        var pc = lb[1].match(/pagecount\s*=\s*["']?(\d+)/i);
        var li = lb[1].match(/limit\s*=\s*["']?(\d+)/i);
        var to = lb[1].match(/total\s*=\s*["']?(\d+)/i);
        if (pg) out.page = parseInt(pg[1], 10);
        if (pc) out.pagecount = parseInt(pc[1], 10);
        if (li) out.limit = parseInt(li[1], 10);
        if (to) out.total = parseInt(to[1], 10);
    }

    var vre = /<video\b[^>]*>([\s\S]*?)<\/video>/gi, vm;
    while ((vm = vre.exec(xml)) !== null) {
        var obj = {};
        var tre = /<([a-zA-Z_][\w-]*)\b[^>]*>([\s\S]*?)<\/\1>/gi, tm;
        while ((tm = tre.exec(vm[1])) !== null) obj[tm[1].toLowerCase()] = tm[2];
        var item = normalizeItem(obj);
        if (item && item.vod_id) out.list.push(item);
    }

    return (out.list.length || out.class.length) ? out : null;
}

function fetchApi(params) {
    var content = httpGet(buildUrl(params));
    if (!content) throw new Error("empty response");
    var data = null;
    try { data = JSON.parse(content); } catch (ex) { data = parseXml(content); }
    if (!data || typeof data !== "object") throw new Error("parse failed");
    return data;
}

/** 广告过滤 + 按 vod_id 去重 */
function filterList(list) {
    var seen = {}, out = [];
    var arr = list || [];
    for (var i = 0; i < arr.length; i++) {
        var v = normalizeItem(arr[i]);
        if (!v || !v.vod_id) continue;
        if (BAN_RE.test(v.vod_name)) continue;
        if (seen[v.vod_id]) continue;
        seen[v.vod_id] = 1;
        out.push(v);
    }
    return out;
}

function toBrief(v) {
    return {
        vod_id: v.vod_id,
        vod_name: v.vod_name,
        vod_pic: v.vod_pic,
        vod_remarks: v.vod_remarks
    };
}

function cached(store, key) {
    if (!store || store.key !== key) return null;
    if (now() - store.time > CACHE_TTL) return null;
    return store.data;
}

/** 首页分类与推荐共用一次请求，避免 home()/homeVod() 各请求一次 */
function loadHome() {
    var hit = cached(cacheHomeData, "home");
    if (hit) return hit;
    var data = fetchApi({ pg: 1 });
    var classes = [], list = [];
    var cls = data.class || [];
    for (var i = 0; i < cls.length; i++) {
        classes.push({
            type_id: String(pick(cls[i], ["type_id", "id", "typeId"])),
            type_name: cleanText(pick(cls[i], ["type_name", "name"]))
        });
    }
    var items = filterList(data.list);
    for (var j = 0; j < items.length; j++) list.push(toBrief(items[j]));
    var out = { class: classes, list: list };
    cacheHomeData = { key: "home", time: now(), data: out };
    return out;
}

function home(filter) {
    try {
        if (!siteApi) return JSON.stringify({ class: [], filters: {} });
        return JSON.stringify({ class: loadHome().class, filters: siteFilters });
    } catch (ex) {
        return JSON.stringify({ class: [], filters: siteFilters });
    }
}

function homeVod() {
    try {
        if (!siteApi) return JSON.stringify({ list: [] });
        return JSON.stringify({ list: loadHome().list });
    } catch (ex) {
        return JSON.stringify({ list: [] });
    }
}

function category(tid, pg, filter, extend) {
    try {
        if (!siteApi) return JSON.stringify({ list: [], page: 1, pagecount: 1 });
        pg = pg || "1";
        var params = { pg: pg };
        if (tid) params.t = tid;
        if (extend) {
            var map = { area: "area", year: "year", lang: "lang", by: "by", class: "class", tag: "tag" };
            for (var k in map) {
                if (extend[k]) params[k] = extend[k];
            }
        }
        var data = fetchApi(params);
        var items = filterList(data.list);
        var list = [];
        for (var i = 0; i < items.length; i++) list.push(toBrief(items[i]));
        return JSON.stringify({
            list: list,
            page: parseInt(pg, 10) || 1,
            pagecount: parseInt(data.pagecount || data.totalPage || data.page, 10) || 1,
            limit: parseInt(data.limit, 10) || 20,
            total: parseInt(data.total, 10) || 0
        });
    } catch (ex) {
        return JSON.stringify({ list: [], page: 1, pagecount: 1 });
    }
}

function detail(id) {
    try {
        if (!siteApi) return JSON.stringify({ list: [] });
        var data = fetchApi({ ac: "detail", ids: id });
        var items = data.list || [];
        if (!items.length) return JSON.stringify({ list: [] });
        return JSON.stringify({ list: [normalizeItem(items[0])] });
    } catch (ex) {
        return JSON.stringify({ list: [] });
    }
}

function play(flag, id, flags) {
    var u = String(id || "");
    if (u.indexOf("//") === 0) u = "https:" + u;
    return JSON.stringify({ url: u, parse: 0, header: requestHeaders() });
}

function search(wd, quick, pg) {
    try {
        if (!siteApi) return JSON.stringify({ list: [] });
        var data = fetchApi({ ac: "search", wd: wd, pg: pg || "1" });
        var items = filterList(data.list);
        var key = String(wd || "").toLowerCase();
        var matched = [], fallback = [];
        for (var i = 0; i < items.length; i++) {
            var v = items[i];
            var hay = (v.vod_name + " " + v.vod_actor + " " + v.vod_director + " " + v.vod_content).toLowerCase();
            if (!key || hay.indexOf(key) >= 0) matched.push(v);
            else fallback.push(v);
        }
        var use = matched.length ? matched : fallback;
        var list = [];
        for (var j = 0; j < use.length; j++) list.push(toBrief(use[j]));
        return JSON.stringify({ list: list });
    } catch (ex) {
        return JSON.stringify({ list: [] });
    }
}

export function __jsEvalReturn() {
    return {
        init: init,
        home: home,
        homeVod: homeVod,
        category: category,
        detail: detail,
        play: play,
        search: search
    };
}
