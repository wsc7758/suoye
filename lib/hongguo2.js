// ============================================================
// 红果短剧 (hongguoduanju.com) - TVBox/影视仓 独立接口 (drpy2)
// 文件名: hongguoduanju.js
// 部署1(本地): 放到 TVBox 的 JS 目录，JSON 用 "ext":"js:hongguoduanju.js"
// 部署2(远程): 上传到仓库 lib/ 目录，JSON 用 "ext":"https://.../hongguoduanju.js"
//   【重要】替换 js 后必须：清 TVBox 缓存并重新加载该源 / 重启 App，才会用新版。
//   若用的是 "js:" 本地方式，请确认覆盖的是「设备 TVBox JS 目录」里的文件，
//   而不是仓库副本（二者不互通，只能二选一）。
//
// ▎原理（红果H5/云影 SSR）:
//   页面内嵌 window._ROUTER_DATA.loaderData，深层字段：
//     首页 -> homeSections[]（tab_type=all/human/comic/ai）
//     详情 -> seriesDetail + vid_list（全部集数）
//     播放 -> video_player_info.main_url = 单集正片 MP4 直链
//
// ▎入土关键：脚本已全内联（不依赖文件顶层函数，规避 TVBox new Function
//   全局作用域看不到顶层 function 的 ReferenceError）；
//   解析器为字符串感知（跳过引号内 { }）；pick() 深层定位兼容嵌套变化。
//   fetch 显式携带完整浏览器请求头，不赌 fetch_params 是否注入 rule.headers。
//
// ▎广告清洗：main_url 即纯净正片，URL 归一化（\\/、&amp;）并保留 CDN 签名。
//
// ▎诊断：若本机/设备无法访问该站，列表会直接显示原因（如"网络无法访问"），
//   而不是静默"列表为空"。
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

    // ---------- 一级：分类内容 ----------
    一级: $js.toString(() => {
        try {
            function ssr(h) {
                h = String(h); var i = h.indexOf('_ROUTER_DATA =');
                if (i < 0) return null; var s = h.indexOf('{', i), d = 0, ins = false, esc = false, e = -1;
                for (var k = s; k < h.length; k++) { var c = h.charAt(k);
                    if (ins) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') ins = false; }
                    else { if (c === '"') ins = true; else if (c === '{') d++; else if (c === '}') { d--; if (!d) { e = k + 1; break; } } } }
                if (e < 0) return null;
                try { return JSON.parse(h.slice(s, e)).loaderData || null; } catch (x) { return null; }
            }
            function pick(o, key, dep) {
                if (!o || typeof o !== 'object') return null;
                if (o[key] !== undefined) return o[key];
                if (dep > 7) return null;
                var ks = Object.keys(o);
                for (var i = 0; i < ks.length; i++) { var r = pick(o[ks[i]], key, dep + 1); if (r !== null && r !== undefined) return r; }
                return null;
            }
            var opt = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36', 'Referer': 'https://hongguoduanju.com/', 'Accept-Language': 'zh-CN,zh;q=0.9' }, timeout: 25000 };
            var html = fetch('https://hongguoduanju.com/', opt);
            if (!html || html.length < 500) { setResult([{ title: '无法访问红果站点(返回过短,请检查网络/换网络)', img: '', desc: '', url: '/player/7553892968508181529' }]); return; }
            var ld = ssr(html);
            if (!ld) { setResult([{ title: '红果页面无SSR数据,可能被拦截或改版', img: '', desc: '', url: '/player/7553892968508181529' }]); return; }
            var sections = pick(ld, 'homeSections', 0) || [];
            var key = String(input), list = [], d = [];
            if (key === 'recommend') {
                for (var q = 0; q < sections.length && list.length === 0; q++) list = sections[q].video_list || [];
            } else {
                for (var i = 0; i < sections.length; i++) { if (sections[i].tab_type === key) { list = sections[i].video_list || []; break; } }
            }
            for (var j = 0; j < list.length; j++) {
                var it = list[j], s2 = it.series_id;
                if (!s2) continue;
                d.push({ title: it.series_title || it.series_name || '', img: it.series_cover || '', desc: it.series_intro || '', url: '/player/' + s2, remarks: it.episode_right_text || '' });
            }
            if (d.length === 0) d.push({ title: '该分类暂无内容', img: '', desc: '若多次为空，多为设备无法访问 hongguoduanju.com', url: '/player/7553892968508181529' });
            // 【定位卡】无条件置顶：证明本脚本已运行，并暴露 分类/分区数/命中数
            var dbg = { title: '红果[ver3] 类[' + key + '] 分区' + (Array.isArray(sections) ? sections.length : 0) + ' 命中' + list.length, img: '', desc: '看到此卡=新版脚本已运行; 若下方无影片,把本行文字回传', url: '/player/7553892968508181529' };
            d.unshift(dbg);
            setResult(d);
        } catch (e) {
            setResult([{ title: '一级异常:' + (e && e.message), img: '', desc: '', url: '/player/7553892968508181529' }]);
        }
    }),

    // ---------- 二级：详情 ----------
    二级: $js.toString(() => {
        VOD = {};
        try {
            function ssr(h) {
                h = String(h); var i = h.indexOf('_ROUTER_DATA =');
                if (i < 0) return null; var s = h.indexOf('{', i), d = 0, ins = false, esc = false, e = -1;
                for (var k = s; k < h.length; k++) { var c = h.charAt(k);
                    if (ins) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') ins = false; }
                    else { if (c === '"') ins = true; else if (c === '{') d++; else if (c === '}') { d--; if (!d) { e = k + 1; break; } } } }
                if (e < 0) return null;
                try { return JSON.parse(h.slice(s, e)).loaderData || null; } catch (x) { return null; }
            }
            function pick(o, key, dep) {
                if (!o || typeof o !== 'object') return null;
                if (o[key] !== undefined) return o[key];
                if (dep > 7) return null;
                var ks = Object.keys(o);
                for (var i = 0; i < ks.length; i++) { var r = pick(o[ks[i]], key, dep + 1); if (r !== null && r !== undefined) return r; }
                return null;
            }
            var opt = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36', 'Referer': 'https://hongguoduanju.com/', 'Accept-Language': 'zh-CN,zh;q=0.9' }, timeout: 25000 };
            var sid = String(input);
            if (sid.indexOf('/') === 0) sid = sid.substring(1);
            var p = sid.indexOf('/'); if (p >= 0) sid = sid.substring(0, p);

            var html = fetch('https://hongguoduanju.com/player/' + sid, opt);
            var ld = ssr(html);
            var sd = (ld && pick(ld, 'seriesDetail', 0)) || {};
            var vids = sd.vid_list || [], lines = [], actors = [];
            var name = sd.series_name || '';
            if (!name) { var tm = /<title>([^<]{1,60})<\/title>/.exec(html || ''); name = (tm && tm[1] ? tm[1].trim() : '').replace(/[|_-](红果|短剧|视频|app).*$/i, '') || ''; }
            if (!name) name = '未命名(可能无法访问红果站点)';
            for (var i = 0; i < vids.length; i++) lines.push('第' + (i + 1) + '集$' + sid + '/' + vids[i]);
            var ceb = sd.celebrities || [];
            for (var a = 0; a < ceb.length; a++) { var n = ceb[a].nickname || ''; if (ceb[a].sub_title) n += '(' + ceb[a].sub_title + ')'; if (n) actors.push(n); }

            VOD = {
                vod_name: name,
                vod_pic: sd.series_cover || '',
                vod_actor: actors.join(' / ') || '',
                vod_content: sd.series_intro || '',
                vod_class: (sd.tags || []).join(','),
                vod_remarks: sd.episode_right_text || (vids.length ? (vids.length + '集') : ''),
                vod_play_from: '红果正片(免广告)',
                vod_play_url: lines.join('#') || ('第1集$' + sid + '/' + (sd.vid || ''))
            };
        } catch (e) {
            VOD = { vod_name: '解析失败', vod_play_from: '红果正片(免广告)', vod_play_url: '错误$' + input };
        }
    }),

    // ---------- 播放：地址提取 + 广告清洗 ----------
    lazy: $js.toString(() => {
        try {
            function ssr(h) {
                h = String(h); var i = h.indexOf('_ROUTER_DATA =');
                if (i < 0) return null; var s = h.indexOf('{', i), d = 0, ins = false, esc = false, e = -1;
                for (var k = s; k < h.length; k++) { var c = h.charAt(k);
                    if (ins) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') ins = false; }
                    else { if (c === '"') ins = true; else if (c === '{') d++; else if (c === '}') { d--; if (!d) { e = k + 1; break; } } } }
                if (e < 0) return null;
                try { return JSON.parse(h.slice(s, e)).loaderData || null; } catch (x) { return null; }
            }
            function pick(o, key, dep) {
                if (!o || typeof o !== 'object') return null;
                if (o[key] !== undefined) return o[key];
                if (dep > 7) return null;
                var ks = Object.keys(o);
                for (var i = 0; i < ks.length; i++) { var r = pick(o[ks[i]], key, dep + 1); if (r !== null && r !== undefined) return r; }
                return null;
            }
            function clean(u) { return String(u || '').replace(/\\\//g, '/').replace(/&amp;/g, '&').replace(/\\u0026/g, '&'); }
            var opt = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36', 'Referer': 'https://hongguoduanju.com/', 'Accept-Language': 'zh-CN,zh;q=0.9' }, timeout: 25000 };

            var token = String(input);
            if (token.indexOf('http') === 0) { input = { url: clean(token), parse: 0 }; return; }

            var t = token; if (t.indexOf('/') !== 0) t = '/' + t;
            var direct = null, html = null;
            try { html = fetch('https://hongguoduanju.com/player' + t, opt); } catch (e2) {}
            var ld = html ? ssr(html) : null;
            var vpi = ld ? pick(ld, 'video_player_info', 0) : null;
            if (vpi && vpi.main_url) direct = vpi.main_url;
            if (!direct && html) { var m = /"main_url"\s*:\s*"(https:[^"\\]+?)"/.exec(html); if (m && m[1]) direct = m[1]; }
            if (!direct && html) { var m2 = /(https:[^"'\s]+?qznovelvod\.com[^"'\s]+?)["']/.exec(html); if (m2 && m2[1]) direct = m2[1]; }
            if (direct) input = { url: clean(direct), parse: 0 };
        } catch (e) {}
    }),

    // ---------- 搜索：红果网关签名，关闭 ----------
    搜索: $js.toString(() => {
        setResult([]);
    })
};
