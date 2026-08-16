/**
 * FongMi CatVod JS Spider - CMS API 通用爬虫
 * 适配 FongMi/TV QuickJS 引擎 (type=3)
 *
 * 核心规范:
 * 1. 使用 __jsEvalReturn() ESM 导出模式
 * 2. 使用 req() 发送 HTTP 请求
 * 3. 通过 init(cfg) 接收配置, cfg.ext 为站点 ext 字段
 * 4. 所有函数返回 JSON 字符串
 * 5. 不使用 new URL() / URLSearchParams (QuickJS 不支持)
 */

const UA = "Mozilla/5.0 (Linux; U; Android 11; TVBox) AppleWebKit/537.36";

// 全局配置, 由 init(cfg) 设置
let siteExt = {};

/**
 * 将 XML 格式 API URL 自动转为 JSON 格式
 * 例如: .../at/xml/ -> .../at/json/
 */
function ensureJsonApi(url) {
    return url.replace("at/xml", "at/json");
}

/**
 * 手动构建 URL (不依赖 new URL / URLSearchParams)
 * @param {Object} params - 查询参数 { pg, wd, t, ac, ids, ... }
 */
function buildUrl(params) {
    let base = ensureJsonApi(siteExt.api || "");

    // 如果要设置 ac 参数, 先移除 URL 中已存在的 ac 参数 (避免重复)
    if (params.ac) {
        base = base.replace(/[?&]ac=[^&]*/gi, "");
        // 清理移除后可能产生的 URL 问题
        base = base.replace(/[?&]$/, "");
        base = base.replace(/\?&/, "?");
        base = base.replace(/&&/, "&");
    }

    let separator = base.indexOf("?") >= 0 ? "&" : "?";
    let parts = [];
    for (let key in params) {
        let val = params[key];
        if (val !== undefined && val !== null && val !== "") {
            parts.push(key + "=" + encodeURIComponent(val));
        }
    }
    if (parts.length === 0) return base;
    return base + separator + parts.join("&");
}

/**
 * HTTP GET 请求 (使用 FongMi 内置 req 函数)
 * 兼容 req 返回字符串或对象两种情况
 */
async function httpGet(url) {
    let headers = Object.assign({ "User-Agent": UA }, siteExt.headers || {});
    let resp = await req(url, { method: "GET", headers: headers });

    let content;
    if (typeof resp === "string") {
        content = resp;
    } else if (resp && typeof resp === "object") {
        // req 可能返回对象 { content, body, code, headers }
        content = resp.content || resp.body || "";
        if (typeof content !== "string") content = String(content);
    } else {
        content = String(resp);
    }
    return content;
}

/**
 * 获取 API 数据并解析为 JSON
 */
async function fetchApi(params) {
    let url = buildUrl(params);
    let content = await httpGet(url);
    return JSON.parse(content);
}

/**
 * 过滤广告/棋牌类影片
 */
function filterList(list) {
    var banWords = ["博彩", "棋牌", "彩票", "电玩", "赌博", "澳门", "赌场", "皇冠", "六合彩", "时时彩"];
    return (list || []).filter(function(item) {
        var name = item.vod_name || "";
        return !banWords.some(function(k) { return name.indexOf(k) >= 0; });
    });
}

/**
 * 初始化 - 接收站点配置
 * FongMi 框架调用 init(cfg), cfg.ext 对应 JSON 配置中的 ext 字段
 */
async function init(cfg) {
    try {
        if (typeof cfg === "string") {
            cfg = JSON.parse(cfg);
        }
        // cfg 可能是 { ext: {...} } 或直接是 ext 对象
        var ext = cfg;
        if (cfg && cfg.ext) ext = cfg.ext;
        if (typeof ext === "string") {
            ext = JSON.parse(ext);
        }
        siteExt = ext || {};
    } catch(e) {
        siteExt = {};
    }
}

/**
 * 首页分类
 * @param {boolean} filter - 是否返回筛选器
 * @returns JSON 字符串: { class: [...], filters: {} }
 */
async function home(filter) {
    try {
        var data = await fetchApi({ pg: 1 });
        var classes = [];
        if (data.class) {
            for (var i = 0; i < data.class.length; i++) {
                classes.push({
                    type_id: String(data.class[i].type_id),
                    type_name: data.class[i].type_name
                });
            }
        }
        return JSON.stringify({ class: classes, filters: {} });
    } catch(e) {
        return JSON.stringify({ class: [], filters: {} });
    }
}

/**
 * 首页推荐列表
 * @returns JSON 字符串: { list: [...] }
 */
async function homeVod() {
    try {
        var data = await fetchApi({ pg: 1 });
        var list = filterList(data.list).map(function(v) {
            return {
                vod_id: String(v.vod_id),
                vod_name: v.vod_name,
                vod_pic: v.vod_pic || "",
                vod_remarks: v.vod_remarks || ""
            };
        });
        return JSON.stringify({ list: list });
    } catch(e) {
        return JSON.stringify({ list: [] });
    }
}

/**
 * 分类列表
 * @param {string} tid - 分类ID (对应 class 中的 type_id)
 * @param {string} pg - 页码, 从 "1" 开始
 * @param {boolean} filter - 是否有筛选器
 * @param {Object} extend - 用户选择的筛选条件 { area, year, lang, by, ... }
 * @returns JSON 字符串: { list: [...], page, pagecount, limit, total }
 */
async function category(tid, pg, filter, extend) {
    try {
        pg = pg || "1";
        var params = { pg: pg };
        if (tid) params.t = tid;

        // 处理筛选条件
        if (extend) {
            if (extend.area) params.area = extend.area;
            if (extend.year) params.year = extend.year;
            if (extend.lang) params.lang = extend.lang;
            if (extend.by) params.by = extend.by;
        }

        var data = await fetchApi(params);
        var list = filterList(data.list).map(function(v) {
            return {
                vod_id: String(v.vod_id),
                vod_name: v.vod_name,
                vod_pic: v.vod_pic || "",
                vod_remarks: v.vod_remarks || ""
            };
        });

        return JSON.stringify({
            list: list,
            page: parseInt(pg) || 1,
            pagecount: data.pagecount || data.totalPage || 1,
            limit: data.limit || 20,
            total: data.total || 0
        });
    } catch(e) {
        return JSON.stringify({ list: [], page: 1, pagecount: 1 });
    }
}

/**
 * 影片详情 (含播放地址)
 * @param {string} id - 影片ID (vod_id)
 * @returns JSON 字符串: { list: [{ vod_id, vod_name, vod_pic, vod_play_from, vod_play_url, ... }] }
 */
async function detail(id) {
    try {
        var data = await fetchApi({ ac: "detail", ids: id });
        var list = data.list || [];
        if (list.length === 0) return JSON.stringify({ list: [] });

        var info = list[0];
        return JSON.stringify({
            list: [{
                vod_id: String(info.vod_id),
                vod_name: info.vod_name,
                vod_pic: info.vod_pic || "",
                vod_remarks: info.vod_remarks || "",
                vod_year: info.vod_year || "",
                vod_area: info.vod_area || "",
                vod_director: info.vod_director || "",
                vod_actor: info.vod_actor || "",
                vod_content: info.vod_content || "",
                vod_play_from: info.vod_play_from || "",
                vod_play_url: info.vod_play_url || ""
            }]
        });
    } catch(e) {
        return JSON.stringify({ list: [] });
    }
}

/**
 * 播放解析
 * @param {string} flag - 线路名 (对应 vod_play_from)
 * @param {string} id - 播放地址 (从 vod_play_url 中提取的 URL)
 * @param {Array} flags - 全局 VIP 标志列表
 * @returns JSON 字符串: { url, parse, header }
 */
async function play(flag, id, flags) {
    return JSON.stringify({
        url: id,
        parse: 0,
        header: Object.assign({ "User-Agent": UA }, siteExt.headers || {})
    });
}

/**
 * 搜索
 * @param {string} wd - 搜索关键词
 * @param {boolean} quick - 是否快搜
 * @param {string} pg - 页码 (可选)
 * @returns JSON 字符串: { list: [...] }
 */
async function search(wd, quick, pg) {
    try {
        pg = pg || "1";
        var data = await fetchApi({ wd: wd, pg: pg });
        var list = filterList(data.list).map(function(v) {
            return {
                vod_id: String(v.vod_id),
                vod_name: v.vod_name,
                vod_pic: v.vod_pic || "",
                vod_remarks: v.vod_remarks || ""
            };
        });
        return JSON.stringify({ list: list });
    } catch(e) {
        return JSON.stringify({ list: [] });
    }
}

/**
 * ESM 导出 - FongMi 框架通过 __jsEvalReturn() 获取方法表
 * 方法名必须为: init, home, homeVod, category, detail, play, search
 */
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
