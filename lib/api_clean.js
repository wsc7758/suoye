/**
 * FongMi CatVod JS Spider - CMS API 通用爬虫 (同步版)
 * 
 * 基于 FongMi/TV QuickJS 引擎源码分析编写:
 * - spider.js 加载器: globalThis.req = http (http.js 中的函数)
 * - http.js: req(url, {async:false}) 为同步调用, 返回 {code, headers, content}
 * - Spider.java: init(cfg) 接收 {stype, skey, ext} 对象
 * - 方法名必须用短名称: home, homeVod, category, detail, search, play
 */

// 模块级变量 (init 中设置)
var siteApi = "";
var siteHeaders = {};

/**
 * 初始化 - 接收站点配置
 * __jsEvalReturn 模式下 cfg = {stype:3, skey:"...", ext:{api, headers}}
 */
function init(cfg) {
    try {
        var e = cfg;
        if (cfg && cfg.ext) e = cfg.ext;
        if (typeof e === "string") {
            try {
                e = JSON.parse(e);
            } catch(ex) {
                e = { api: e };
            }
        }
        siteApi = e.api || "";
        siteHeaders = e.headers || {};
    } catch(ex) {
        siteApi = "";
        siteHeaders = {};
    }
}

/**
 * 同步 HTTP GET 请求
 * 使用 req(url, {async:false}) 确保同步返回
 * 响应对象格式: {code:200, headers:{}, content:"响应体字符串"}
 */
function httpGet(url) {
    var headers = { "User-Agent": "Mozilla/5.0 (Linux; Android 11; TVBox) AppleWebKit/537.36" };
    if (siteHeaders) {
        for (var k in siteHeaders) {
            headers[k] = siteHeaders[k];
        }
    }
    var resp = req(url, { async: false, headers: headers });
    if (typeof resp === "string") return resp;
    if (resp && typeof resp === "object") {
        if (resp.content) return resp.content;
        if (resp.body) return resp.body;
        return "";
    }
    return String(resp);
}

/**
 * 将 XML 格式 API URL 自动转为 JSON 格式
 */
function ensureJsonApi(url) {
    return url.replace("at/xml", "at/json");
}

/**
 * 构建 API URL (手动拼接, 不依赖 new URL / URLSearchParams)
 * @param params 查询参数对象 {pg, wd, t, ac, ids, ...}
 */
function buildUrl(params) {
    var base = ensureJsonApi(siteApi);
    
    // 如果要设置 ac 参数, 先移除 URL 中已有的 ac 参数
    if (params.ac) {
        base = base.replace(/[?&]ac=[^&]*/gi, "");
        base = base.replace(/[?&]$/, "");
        base = base.replace(/\?&/, "?");
        base = base.replace(/&&/, "&");
    }
    
    var sep = base.indexOf("?") >= 0 ? "&" : "?";
    var parts = [];
    for (var key in params) {
        var val = params[key];
        if (val !== undefined && val !== null && val !== "") {
            parts.push(key + "=" + encodeURIComponent(val));
        }
    }
    if (parts.length === 0) return base;
    return base + sep + parts.join("&");
}

/**
 * 获取 API 数据并解析为 JSON
 */
function fetchApi(params) {
    var url = buildUrl(params);
    var content = httpGet(url);
    return JSON.parse(content);
}

/**
 * 过滤广告/棋牌类影片
 */
function filterList(list) {
    var ban = ["博彩", "棋牌", "彩票", "电玩", "赌博", "澳门", "赌场", "皇冠", "六合彩", "时时彩"];
    return (list || []).filter(function(item) {
        var name = item.vod_name || "";
        for (var i = 0; i < ban.length; i++) {
            if (name.indexOf(ban[i]) >= 0) return false;
        }
        return true;
    });
}

/**
 * 首页分类
 * @param filter 是否返回筛选器
 * @return JSON字符串 {class:[{type_id,type_name}], filters:{}}
 */
function home(filter) {
    try {
        if (!siteApi) return JSON.stringify({ class: [], filters: {} });
        var data = fetchApi({ pg: 1 });
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
    } catch(ex) {
        return JSON.stringify({ class: [], filters: {} });
    }
}

/**
 * 首页推荐影片
 * @return JSON字符串 {list:[...]}
 */
function homeVod() {
    try {
        if (!siteApi) return JSON.stringify({ list: [] });
        var data = fetchApi({ pg: 1 });
        var list = filterList(data.list);
        var result = [];
        for (var i = 0; i < list.length; i++) {
            var v = list[i];
            result.push({
                vod_id: String(v.vod_id),
                vod_name: v.vod_name,
                vod_pic: v.vod_pic || "",
                vod_remarks: v.vod_remarks || ""
            });
        }
        return JSON.stringify({ list: result });
    } catch(ex) {
        return JSON.stringify({ list: [] });
    }
}

/**
 * 分类列表
 * @param tid 分类ID
 * @param pg 页码(字符串, 从"1"开始)
 * @param filter 是否有筛选器
 * @param extend 筛选条件 {area, year, lang, by}
 * @return JSON字符串 {list, page, pagecount, limit, total}
 */
function category(tid, pg, filter, extend) {
    try {
        if (!siteApi) return JSON.stringify({ list: [], page: 1, pagecount: 1 });
        pg = pg || "1";
        var params = { pg: pg };
        if (tid) params.t = tid;
        if (extend) {
            if (extend.area) params.area = extend.area;
            if (extend.year) params.year = extend.year;
            if (extend.lang) params.lang = extend.lang;
            if (extend.by) params.by = extend.by;
        }
        var data = fetchApi(params);
        var list = filterList(data.list);
        var result = [];
        for (var i = 0; i < list.length; i++) {
            var v = list[i];
            result.push({
                vod_id: String(v.vod_id),
                vod_name: v.vod_name,
                vod_pic: v.vod_pic || "",
                vod_remarks: v.vod_remarks || ""
            });
        }
        return JSON.stringify({
            list: result,
            page: parseInt(pg) || 1,
            pagecount: data.pagecount || data.totalPage || 1,
            limit: data.limit || 20,
            total: data.total || 0
        });
    } catch(ex) {
        return JSON.stringify({ list: [], page: 1, pagecount: 1 });
    }
}

/**
 * 影片详情 (含播放地址)
 * @param id 影片ID (vod_id)
 * @return JSON字符串 {list:[{vod_id, vod_name, vod_pic, vod_play_from, vod_play_url, ...}]}
 */
function detail(id) {
    try {
        if (!siteApi) return JSON.stringify({ list: [] });
        var data = fetchApi({ ac: "detail", ids: id });
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
    } catch(ex) {
        return JSON.stringify({ list: [] });
    }
}

/**
 * 播放解析
 * @param flag 线路名 (vod_play_from)
 * @param id 播放地址URL
 * @param flags 全局VIP标志列表
 * @return JSON字符串 {url, parse, header}
 */
function play(flag, id, flags) {
    var headers = { "User-Agent": "Mozilla/5.0 (Linux; Android 11; TVBox) AppleWebKit/537.36" };
    if (siteHeaders) {
        for (var k in siteHeaders) {
            headers[k] = siteHeaders[k];
        }
    }
    return JSON.stringify({
        url: id,
        parse: 0,
        header: headers
    });
}

/**
 * 搜索
 * @param wd 搜索关键词
 * @param quick 是否快搜
 * @param pg 页码
 * @return JSON字符串 {list:[...]}
 */
function search(wd, quick, pg) {
    try {
        if (!siteApi) return JSON.stringify({ list: [] });
        pg = pg || "1";
        var data = fetchApi({ wd: wd, pg: pg });
        var list = filterList(data.list);
        var result = [];
        for (var i = 0; i < list.length; i++) {
            var v = list[i];
            result.push({
                vod_id: String(v.vod_id),
                vod_name: v.vod_name,
                vod_pic: v.vod_pic || "",
                vod_remarks: v.vod_remarks || ""
            });
        }
        return JSON.stringify({ list: result });
    } catch(ex) {
        return JSON.stringify({ list: [] });
    }
}

/**
 * ESM 导出 - FongMi 框架通过 __jsEvalReturn() 获取方法表
 * spider.js 检测到 __jsEvalReturn 后:
 *   1. 设置 globalThis.req = http (http.js 中的函数)
 *   2. 调用 __jsEvalReturn() 获取 Spider 对象
 *   3. 后续通过 Spider 对象调用各方法
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
