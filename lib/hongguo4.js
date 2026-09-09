// ============================================================
// 红果短剧 (hongguoduanju.com) - TVBox/影视仓 独立接口 (drpy2)
// 本版与已验证可用的 fdzys(饭搭子) 脚本【逐字同构】：
//   - 一律用 fetch(url, fetch_params)（不自定义 opt 对象）
//   - 解析逻辑全部内联在 一级/二级/lazy 内部（无文件顶层自定义函数）
//   - 结构/写法与饭搭子一致，避免被个别引擎判定为无效规则
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
    // 取 _ROUTER_DATA.loaderData（字符串感知，跳过引号内花括号）
    lazy: $js.toString(() => {
        try {
            var token = String(input);
            if (token.indexOf('http') === 0) {
                var purl = token.replace(/\\\//g, '/').replace(/&amp;/g, '&');
                input = { url: purl, parse: 0 };
                return;
            }
            var t = token;
            if (t.indexOf('/') !== 0) t = '/' + t;
            var html = '';
            try { html = fetch('https://hongguoduanju.com/player' + t, fetch_params); } catch (e2) {}
            var direct = '';
            // 优先从 SSR 取 main_url，其次正则兜底
            var i = html.indexOf('"main_url"');
            var re = /"main_url"\s*:\s*"(https:[^"\\]+?)"/;
            var m0 = re.exec(html);
            if (m0 && m0[1]) direct = m0[1];
            if (!direct) {
                var re2 = /(https:[^"'\s]+?qznovelvod\.com[^"'\s]+?)["']/;
                var m1 = re2.exec(html);
                if (m1 && m1[1]) direct = m1[1];
            }
            if (direct) {
                direct = direct.replace(/\\\//g, '/').replace(/&amp;/g, '&');
                input = { url: direct, parse: 0 };
            }
        } catch (e) {}
    }),
    一级: $js.toString(() => {
        var d = [];
        try {
            var myUrl = 'https://hongguoduanju.com/';
            var html = fetch(myUrl, fetch_params);
            var list = [], key = String(input);
            // 提取 homeSections 数组
            var msc = /"homeSections"\s*:\s*\[/.exec(html);
            if (msc) {
                var i = msc.index, dep = 0, ins = false, esc = false, e = -1;
                for (var s = html.indexOf('[', i); s < html.length; s++) {
                    var c = html.charAt(s);
                    if (ins) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') ins = false; }
                    else { if (c === '"') ins = true; else if (c === '[') dep++; else if (c === ']') { dep--; if (!dep) { e = s + 1; break; } } }
                }
                if (e > 0) {
                    var arr = JSON.parse(html.slice(html.indexOf('[', i), e));
                    // 匹配分类：key==all 取第一区，否则按 tab_type
                    var sec;
                    if (key === 'recommend') { sec = arr[0] || {}; }
                    else { for (var x = 0; x < arr.length; x++) { if (arr[x].tab_type === key) { sec = arr[x]; break; } } }
                    list = (sec && sec.video_list) || [];
                    if (key === 'recommend' && list.length === 0) { for (x = 0; x < arr.length && list.length === 0; x++) list = arr[x].video_list || []; }
                }
            }
            for (var j = 0; j < list.length; j++) {
                var it = list[j];
                if (!it.series_id) continue;
                d.push({ title: it.series_title || it.series_name || '', img: it.series_cover || '', desc: it.series_intro || '', url: '/player/' + it.series_id, remarks: it.episode_right_text || '' });
            }
            if (d.length === 0) d.push({ title: '该分类暂无内容', img: '', desc: '红果[同构版]未取到列表', url: '/player/7553892968508181529' });
            setResult(d);
        } catch (e) {
            setResult([{ title: '一级异常:' + (e && e.message), img: '', desc: '', url: '/player/7553892968508181529' }]);
        }
    }),
    二级: $js.toString(() => {
        VOD = {};
        try {
            var sid = String(input);
            if (sid.indexOf('/') === 0) sid = sid.substring(1);
            var p = sid.indexOf('/');
            if (p >= 0) sid = sid.substring(0, p);
            var html = fetch('https://hongguoduanju.com/player/' + sid, fetch_params);
            var name = '';
            var mnm = /"series_name"\s*:\s*"([^"]*)"/.exec(html);
            if (mnm && mnm[1]) name = mnm[1];
            var mc = /"series_cover"\s*:\s*"([^"]*)"/.exec(html);
            var mi = /"series_intro"\s*:\s*"([^"]*)"/.exec(html);
            var mv = /"vid_list"\s*:\s*\[[^\]]*\]/.exec(html);
            var vids = [];
            if (mv) { try { vids = JSON.parse(mv[0].substring(12)); } catch (e2) {} }
            var lines = [];
            for (var i = 0; i < vids.length; i++) lines.push('第' + (i + 1) + '集$' + sid + '/' + vids[i]);
            if (!name) name = '未命名';
            VOD = {
                vod_name: name,
                vod_pic: (mc && mc[1]) || '',
                vod_actor: '',
                vod_content: (mi && mi[1]) || '',
                vod_class: '',
                vod_remarks: vids.length ? (vids.length + '集') : '',
                vod_play_from: '红果正片(免广告)',
                vod_play_url: lines.join('#') || ('第1集$' + sid)
            };
        } catch (e) {
            VOD = { vod_name: '解析失败', vod_play_from: '红果正片(免广告)', vod_play_url: '错误$' + input };
        }
    }),
    搜索: $js.toString(() => {
        setResult([]);
    })
};
