/**
 * FongMi CatVod JS Spider - CMS API 通用爬虫 v2
 * 
 * 修复: 使用完整Chrome UA替代短UA, 解决部分站点WAF拦截问题
 */

// 模块级变量 (init 中设置)
var siteApi = "";
var siteHeaders = {};

// 完整的Chrome UA (避免被WAF拦截)
var DEFAULT_UA = "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36";

/**
 * 初始化 - 接收站点配置
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
 */
function httpGet(url) {
    var headers = { "User-Agent": DEFAULT_UA };
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
 * 构建 API URL (手动拼接)
 */
function buildUrl(params) {
    var base = ensureJsonApi(siteApi);
    
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
    var ban = ["博彩", "棋牌", "彩票", "电玩", "赌博", "澳门", "赌场", "皇冠", "六合彩", "时时彩", "金沙", "太阳城", "姚记", "开元", "BBIN", "真人", "AG真人", "pg电子, "雷火", "同城", "加微信", "约妹", "加qq", "qq群", "vip", "赞助", "娱乐", "开户"];
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
 * 影片详情
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
 */
function play(flag, id, flags) {
    var headers = { "User-Agent": DEFAULT_UA };
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
 */
function search(wd, quick, pg) {
    try {
        if (!siteApi) return JSON.stringify({ list: [] });
        pg = pg || "1";
        var data = fetchApi({ wd: wd, pg: pg });
        var list = filterList(data.list);
        var result = [];
        var key = wd || "";
        for (var i = 0; i < list.length; i++) {
            var v = list[i];
            var name = v.vod_name || "";
            // 搜索结果二次过滤: 标题必须包含完整搜索关键词
            if (key && name.indexOf(key) < 0) continue;
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
 * ESM 导出
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
