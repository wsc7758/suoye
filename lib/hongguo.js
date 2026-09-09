// ============================================================
// 红果短剧 (hongguoduanju.com) - TVBox/影视仓 独立接口 (drpy2)
// 文件名: hongguoduanju.js
// 部署1(本地): 放到 TVBox 的 JS 目录，JSON 用 "ext":"js:hongguoduanju.js"
// 部署2(远程): 上传到仓库 lib/ 目录，JSON 用 "ext":"https://.../hongguoduanju.js"
//
// ▎原理（红果H5/云影 SSR，无签名直连）:
//   页面内嵌 window._ROUTER_DATA.loaderData，真实结构（随版本会嵌套不同深度）：
//     首页   -> 深层 homeSections[]（tab_type=all/human/comic/ai）
//     详情   -> 深层 seriesDetail + vid_list（全部集数 vid）
//     播放   -> 深层 video_player_info.main_url = 单集正片 MP4 直链
//
// ▎两个关键修复:
//   1. 边界函数作用域：TVBox 用 new Function 在全局作用域创建边界函数，
//      看不到文件顶层自定义函数。故所有解析逻辑【全内联】到 一级/二级/lazy，
//      只调用引擎全局 fetch / fetch_params / setResult / input。
//   2. 解析器鲁棒性：_ROUTER_DATA 的 JSON 内含（可含 {} 的简介）字符串，
//      朴素括号计数会截错范围。改为字符串感知扫描（跳过引号/转义），
//      并用 pick() 在 loaderData 里深层定位字段，兼容结构嵌套变化。
//
// ▎广告清洗：HTML 交付的 main_url 本身即纯净正片，不做任何广告拼接；
//   只做 URL 归一化（还原 \/、&amp;）并保留 CDN 签名参数（去掉会 403）。
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

    // ============ 一级：分类内容 ============
    一级: $js.toString(() => {
        try {
            // 字符串感知提取 _ROUTER_DATA.loaderData
            function ssr(h) {
                h = String(h);
                var i = h.indexOf('_ROUTER_DATA =');
                if (i < 0) return null;
                var s = h.indexOf('{', i), d = 0, inStr = false, esc = false, e = -1;
                for (var k = s; k < h.length; k++) {
                    var c = h.charAt(k);
                    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; }
                    else { if (c === '"') inStr = true; else if (c === '{') d++; else if (c === '}') { d--; if (d === 0) { e = k + 1; break; } } }
                }
                if (e < 0) return null;
                try { return JSON.parse(h.slice(s, e)).loaderData || null; } catch (x) { return null; }
            }
            // 深层定位首个含指定字段的对象取值
            function pick(o, key, dep) {
                if (!o || typeof o !== 'object') return null;
                if (o[key] !== undefined) return o[key];
                if (dep > 7) return null;
                var ks = Object.keys(o);
                for (var i = 0; i < ks.length; i++) {
                    var r = pick(o[ks[i]], key, dep + 1);
                    if (r !== null && r !== undefined) return r;
                }
                return null;
            }

            var ld = ssr(fetch('https://hongguoduanju.com/', fetch_params));
            var sections = pick(ld, 'homeSections', 0) || [];
            var key = String(input), list = [], d = [];

            if (key === 'recommend') {
                // 推荐短剧：直接取首页各区首个非空列表（原 detail videoList 路径已失效）
                for (var q = 0; q < sections.length && list.length === 0; q++) list = sections[q].video_list || [];
            } else {
                for (var i = 0; i < sections.length; i++) {
                    if (sections[i].tab_type === key) { list = sections[i].video_list || []; break; }
                }
            }

            for (var j = 0; j < list.length; j++) {
                var it = list[j], s2 = it.series_id;
                if (!s2) continue;
                d.push({
                    title: it.series_title || it.series_name || '',
                    img: it.series_cover || '',
                    desc: it.series_intro || '',
                    url: '/player/' + s2,
                    remarks: it.episode_right_text || ''
                });
            }
            if (d.length === 0) d.push({ title: '列表为空', img: '', desc: '', url: '/player/7553892968508181529' });
            setResult(d);
        } catch (e) {
            setResult([{ title: '一级异常:' + (e && e.message), img: '', desc: '', url: '/player/7553892968508181529' }]);
        }
    }),

    // ============ 二级：详情 ============
    二级: $js.toString(() => {
        VOD = {};
        try {
            function ssr(h) {
                h = String(h);
                var i = h.indexOf('_ROUTER_DATA =');
                if (i < 0) return null;
                var s = h.indexOf('{', i), d = 0, inStr = false, esc = false, e = -1;
                for (var k = s; k < h.length; k++) {
                    var c = h.charAt(k);
                    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; }
                    else { if (c === '"') inStr = true; else if (c === '{') d++; else if (c === '}') { d--; if (d === 0) { e = k + 1; break; } } }
                }
                if (e < 0) return null;
                try { return JSON.parse(h.slice(s, e)).loaderData || null; } catch (x) { return null; }
            }
            function pick(o, key, dep) {
                if (!o || typeof o !== 'object') return null;
                if (o[key] !== undefined) return o[key];
                if (dep > 7) return null;
                var ks = Object.keys(o);
                for (var i = 0; i < ks.length; i++) {
                    var r = pick(o[ks[i]], key, dep + 1);
                    if (r !== null && r !== undefined) return r;
                }
                return null;
            }

            var sid = String(input);
            if (sid.indexOf('/') === 0) sid = sid.substring(1);
            var p = sid.indexOf('/');
            if (p >= 0) sid = sid.substring(0, p);

            var ld = ssr(fetch('https://hongguoduanju.com/player/' + sid, fetch_params));
            var sd = pick(ld, 'seriesDetail', 0) || {};
            var vids = sd.vid_list || [], lines = [], actors = [];
            for (var i = 0; i < vids.length; i++) lines.push('第' + (i + 1) + '集$' + sid + '/' + vids[i]);

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
                vod_play_url: lines.join('#') || ('第1集$' + sid + '/' + (sd.vid || ''))
            };
        } catch (e) {
            VOD = { vod_name: '解析失败', vod_play_from: '红果正片(免广告)', vod_play_url: '错误$' + input };
        }
    }),

    // ============ 播放：地址提取 + 广告清洗 ============
    lazy: $js.toString(() => {
        try {
            function ssr(h) {
                h = String(h);
                var i = h.indexOf('_ROUTER_DATA =');
                if (i < 0) return null;
                var s = h.indexOf('{', i), d = 0, inStr = false, esc = false, e = -1;
                for (var k = s; k < h.length; k++) {
                    var c = h.charAt(k);
                    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; }
                    else { if (c === '"') inStr = true; else if (c === '{') d++; else if (c === '}') { d--; if (d === 0) { e = k + 1; break; } } }
                }
                if (e < 0) return null;
                try { return JSON.parse(h.slice(s, e)).loaderData || null; } catch (x) { return null; }
            }
            function pick(o, key, dep) {
                if (!o || typeof o !== 'object') return null;
                if (o[key] !== undefined) return o[key];
                if (dep > 7) return null;
                var ks = Object.keys(o);
                for (var i = 0; i < ks.length; i++) {
                    var r = pick(o[ks[i]], key, dep + 1);
                    if (r !== null && r !== undefined) return r;
                }
                return null;
            }
            function clean(u) {
                return String(u || '').replace(/\\\//g, '/').replace(/&amp;/g, '&').replace(/\\u0026/g, '&');
            }

            var token = String(input);
            if (token.indexOf('http') === 0) { input = { url: clean(token), parse: 0 }; return; }

            var t = token;
            if (t.indexOf('/') !== 0) t = '/' + t;
            var direct = null;
            try {
                var html = fetch('https://hongguoduanju.com/player' + t, fetch_params);
                var vpi = pick(ssr(html), 'video_player_info', 0);
                if (vpi && vpi.main_url) direct = vpi.main_url;
                if (!direct && html) {
                    var m = /"main_url"\s*:\s*"(https:[^"\\]+?)"/.exec(html);
                    if (m && m[1]) direct = m[1];
                }
                if (!direct && html) {
                    var m2 = /(https:[^"'\s]+?qznovelvod\.com[^"'\s]+?)["']/.exec(html);
                    if (m2 && m2[1]) direct = m2[1];
                }
            } catch (e) {}
            if (direct) input = { url: clean(direct), parse: 0 };
        } catch (e) {}
    }),

    // ============ 搜索：红果网关签名，关闭 ============
    搜索: $js.toString(() => {
        setResult([]);
    })
};
