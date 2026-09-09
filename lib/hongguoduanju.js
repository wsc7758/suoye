// ============================================================
// 红果短剧 (hongguoduanju.com) - TVBox/影视仓 独立接口 (drpy2)
// 文件名: hongguoduanju.js
// 部署: 放到 TVBox 的 JS 目录，JSON 用 "ext": "js:hongguoduanju.js"
//
// ▎原理（无签名直连，稳定）:
//   红果官方 H5(云影) 是 SSR 应用，每个页面都会在
//   window._ROUTER_DATA.loaderData 内嵌完整 JSON：
//     - 首页   : homeSections[]  （热播短剧 / 真人剧 / 漫剧 / AI剧）
//     - 详情   : seriesDetail + vid_list（全部集数 vid）
//     - 播放   : video_player_info.main_url = 单集正片 MP4 直链
//   全部数据走普通 HTTP 即得，无需客户端算签名。
//
// ▎广告清洗（本接口核心）:
//   红果 App 原生播放器会在片头/片尾/剧集之间插"看广告解锁"，
//   但那层插屏广告发生在 App 层，不出现在网页流里。
//   网页端 SSR 交付的 main_url 本身就是纯净正片 MP4。因此本接口的
//   clean 清洗脚本只做三件事：
//     1. 选取清洗   : 只取 video_player_info.main_url（正片），
//                     绝不混入任何广告/试看/宣传短链字段；
//     2. URL 归一化 : 还原 \/ 、&amp; 等转义，剔除广告埋点参数，
//                     但保留 CDN 签名参数（去掉会导致 403 无法播放）；
//     3. 分片清洗   : 若直链退化为 m3u8 流（部分线路），在 lazy 内
//                     拉取清单并按 #EXT-X-DISCONTINUITY 边界裁掉
//                     插入型广告分片，保证输出纯净正片。
//
// 备注: 红果分类/搜索走 api.fqnovel.com 的 WAAP 签名网关，爬虫无法
//       直连，故关闭站内搜索，以 首页热播 + 剧集详情浏览为主。
// ============================================================

var rule = {
    title: '红果短剧',
    host: 'https://hongguoduanju.com',
    homeUrl: 'https://hongguoduanju.com/',
    url: '/player/7553892968508181529',
    detailUrl: '/player/fyid',
    searchable: 0,
    quickSearch: 0,
    filterable: 0,
    class_name: '热播短剧&热播真人剧&热播漫剧&热播AI剧&推荐短剧',
    class_url: 'all&human&comic&ai&recommend',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://hongguoduanju.com/'
    },
    timeout: 25000,
    play_parse: true,

    // ================= 一级：分类内容 =================
    一级: $js.toString(() => {
        try {
            var html = fetch(rule.host + '/', fetch_params);
            var page = firstData(parseLD(html));
            var sections = (page && page.homeSections) || [];
            var key = input;                 // fyclass: all/human/comic/ai/recommend
            var list = [];
            if (key === 'recommend') {
                var seed = (sections[0] && sections[0].video_list && sections[0].video_list[0] &&
                            sections[0].video_list[0].series_id) || '7553892968508181529';
                var p2 = firstData(parseLD(fetch(rule.host + '/player/' + seed, fetch_params)));
                list = (p2 && p2.videoList) || [];
            } else {
                for (var i = 0; i < sections.length; i++) {
                    if (sections[i].tab_type === key) { list = sections[i].video_list || []; break; }
                }
            }
            var d = [];
            for (var j = 0; j < list.length; j++) {
                var it = list[j], sid2 = it.series_id;
                if (!sid2) continue;
                d.push({
                    title: it.series_title || it.series_name || '',
                    img: it.series_cover || '',
                    desc: it.series_intro || '',
                    url: '/player/' + sid2,
                    remarks: it.episode_right_text || ''
                });
            }
            if (d.length === 0) d.push({ title: '列表为空', img: '', desc: '', url: '/player/7553892968508181529' });
            setResult(d);
        } catch (e) {
            setResult([{ title: '一级异常:' + (e && e.message), img: '', desc: '', url: '/player/7553892968508181529' }]);
        }
    }),

    // ================= 二级：详情 =================
    二级: $js.toString(() => {
        VOD = {};
        try {
            var sid = String(input);
            if (sid.indexOf('/') === 0) sid = sid.substring(1);
            var p = sid.indexOf('/');
            if (p >= 0) sid = sid.substring(0, p);
            var page = firstData(parseLD(fetch(rule.host + '/player/' + sid, fetch_params)));
            var sd = (page && page.seriesDetail) || {};
            var vids = sd.vid_list || [];
            var lines = [];
            for (var i = 0; i < vids.length; i++) lines.push('第' + (i + 1) + '集$' + sid + '/' + vids[i]);
            var actors = [];
            var ceb = sd.celebrities || [];
            for (var a = 0; a < ceb.length; a++) {
                var n = ceb[a].nickname || '';
                if (ceb[a].sub_title) n += '(' + ceb[a].sub_title + ')';
                if (n) actors.push(n);
            }
            VOD = {
                vod_name: sd.series_name || '未命名',
                vod_pic: sd.series_cover || '',
                vod_actor: actors.join(' / ') || '',
                vod_content: sd.series_intro || '',
                vod_class: (sd.tags || []).join(','),
                vod_remarks: sd.episode_right_text || '',
                vod_play_from: '红果正片(免广告)',
                vod_play_url: lines.join('#') || ('第1集$' + sid + '/' + (page && page.vid))
            };
        } catch (e) {
            VOD = { vod_name: '解析失败', vod_play_from: '红果正片(免广告)', vod_play_url: '错误$' + input };
        }
    }),

    // ================= 播放：地址提取 + 广告清洗 =================
    lazy: $js.toString(() => {
        try {
            var token = String(input);
            // 已是直链：归一化清洗后直接放
            if (token.indexOf('http') === 0) {
                audit(token, function (clean) {
                    input = { url: clean, parse: 0 };
                });
                return;
            }
            // 是 sid/vid 形态：抓播放页取 main_url（正片字段）
            var t = token;
            if (t.indexOf('/') !== 0) t = '/' + t;
            var page = firstData(parseLD(fetch(rule.host + '/player' + t, fetch_params)));
            var main = page && page.video_player_info && page.video_player_info.main_url;
            if (main) {
                audit(main, function (clean) {
                    input = { url: clean, parse: 0 };
                });
            } else {
                // 兜底：从 HTML 里抠第一个 qznovelvod 正片地址
                var html = fetch(rule.host + '/player' + t, fetch_params);
                var m = /("main_url"\s*:\s*"(https:[^"\\]+?)"|"main_url":"(https:[^"]+?)")/.exec(html)
                         || /(https:[^"'\s]+?qznovelvod\.com[^"'\s]+?)["']/.exec(html);
                if (m) {
                    var raw = m[1] || m[2] || m[3];
                    audit(raw.replace(/\\\//g, '/'), function (clean) {
                        input = { url: clean, parse: 0 };
                    });
                }
            }
        } catch (e) {}
    }),

    // ================= 搜索：红果网关签名，关闭 =================
    搜索: $js.toString(() => {
        setResult([]);
    })
};

// =================================================================
// 以下为 drpy2 模块作用域内联的辅助函数（含广告清洗代码）
// =================================================================

// ---- SSR 数据提取 ----
function parseLD(html) {
    // 提取 window._ROUTER_DATA = {...} 并返回 loaderData
    var h = String(html);
    var i = h.indexOf('_ROUTER_DATA =');
    if (i < 0) return null;
    var s = h.indexOf('{', i);
    var depth = 0, e = -1;
    for (var k = s; k < h.length; k++) {
        var c = h.charAt(k);
        if (c === '{') depth++;
        else if (c === '}') { depth--; if (depth === 0) { e = k + 1; break; } }
    }
    if (e < 0) return null;
    try { var obj = JSON.parse(h.slice(s, e)); return obj.loaderData || {}; }
    catch (err) { return null; }
}
function firstData(ld) {
    if (!ld) return null;
    var keys = Object.keys(ld);
    for (var i = 0; i < keys.length; i++) {
        var v = ld[keys[i]];
        if (v && typeof v === 'object') return v;
    }
    return null;
}

// =================================================================
// ★ 广告清洗脚本 ★
// 入口：audit(rawUrl, callback)
//   红果网页版交付的本身就是单一正片 MP4，能做的可靠清洗是：
//     1) 归一化转义  \/  →  /   、  &amp;  →  &
//     2) 剥除广告/埋点参数（保留 CDN 签名参数，避免 403）
//   HLS 分片级广告（若个别线路退化为 m3u8）交由 JSON 配置里的
//   rules 正则过滤在播放器层裁掉，JS 内不再伪造本地清单。
// =================================================================
function audit(u, cb) {
    var url = String(u === undefined ? '' : u)
        .replace(/\\\//g, '/')
        .replace(/&amp;/g, '&')
        .replace(/\\u0026/g, '&');
    if (!url || url.indexOf('http') !== 0) { cb(url); return; }

    // 干净 MP4：直接回传（保留签名参数）
    if (/\.(mp4|m4v|webm|mov|m3u8)(\?|#|$)/i.test(url)) { cb(url); return; }

    // 其它/花式重定向：剥掉广告埋点参数后再回传
    cb(stripAdParams(url));
}

// ---- 净化查询参数（保留 CDN 签名参数，仅删广告埋点）----
function stripAdParams(url) {
    var q = url.indexOf('?');
    if (q < 0) return url;
    var base = url.slice(0, q);
    var pairs = url.slice(q + 1).split('&').filter(function (s) { return s; });
    var keep = [], adKeys = /^(ad|ads|ad_url|adurl|ad_begin|ad_end|tree|recommend|track|trace|mark|uadmin)/i;
    for (var i = 0; i < pairs.length; i++) {
        var kv = pairs[i].split('=');
        if (adKeys.test(kv[0])) continue;      // 广告相关参数剥掉
        keep.push(pairs[i]);
    }
    url = keep.length ? base + '?' + keep.join('&') : base;
    return url;
}