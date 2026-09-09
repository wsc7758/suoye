// ============================================================
// 红果短剧 (hongguoduanju.com) - TVBox/影视仓 独立接口 (drpy2)
//
// 【本版关键修复】对齐"七味"最终版(qiwei_nodollar.js)：
//   摒弃 $js.toString(箭头函数)，全部改为手写 "js:" + function(){}.toString()
//   $js.toString 依赖运行时对箭头函数 toString 的字符串化结果，
//   在某些 TVBox/drpy2 版本会失败 → rule.一级 不是 "js:" 前缀 → 引擎不执行
//   → 点分类只有分类标签、列表空白"没找到数据"。
//   手写字符串 100% 保证 "js:" 前缀，彻底绕开该差异。
//   每个函数体自包含，仅依赖引擎注入的 input/fetch/fetch_params/setResult/VOD。
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

    lazy: "js:" + function () {
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
            try { html = String(fetch('https://hongguoduanju.com/player' + t, fetch_params)); } catch (e2) {}
            var direct = '';
            var m0 = /"main_url"\s*:\s*"(https:[^"\\]+?)"/.exec(html);
            if (m0 && m0[1]) direct = m0[1];
            if (!direct) {
                var m1 = /(https:[^"'\s]+?qznovelvod\.com[^"'\s]+?)["']/.exec(html);
                if (m1 && m1[1]) direct = m1[1];
            }
            if (direct) {
                direct = direct.replace(/\\\//g, '/').replace(/&amp;/g, '&');
                input = { url: direct, parse: 0 };
            }
        } catch (e) {}
    }.toString(),

    一级: "js:" + function () {
        var d = [];
        try {
            var myUrl = 'https://hongguoduanju.com/';
            var html = '';
            try { html = String(fetch(myUrl, fetch_params)); } catch (e_fetch) {
                d.push({ title: 'fetch异常: ' + (e_fetch && e_fetch.message), img: '', desc: '', url: '/player/7553892968508181529' });
                setResult(d); return;
            }
            if (!html || html.length < 200) {
                d.push({ title: '红果返回空页(size:' + (html ? html.length : 0) + ')', img: '', desc: '设备网络被红果屏蔽', url: '/player/7553892968508181529' });
                setResult(d); return;
            }
            var list = [], key = String(input);
            var msc = /"homeSections"\s*:\s*\[/.exec(html);
            // startIdx 必须指向数组开头的 "["，不能指向 "homeSections" 的引号
            var startIdx = msc ? (msc.index + msc[0].length - 1) : 0;
            if (!msc) {
                var hx = html.indexOf('homeSections');
                startIdx = html.indexOf('[', hx < 0 ? 0 : hx);
            }
            if (startIdx < 0) {
                d.push({ title: '找不到 homeSections', img: '', desc: 'size:' + html.length, url: '/player/7553892968508181529' });
                setResult(d); return;
            }
            var i, dep = 0, ins = false, esc = false, e = -1;
            for (var s = startIdx; s < html.length; s++) {
                var c = html.charAt(s);
                if (ins) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') ins = false; }
                else { if (c === '"') ins = true; else if (c === '[') dep++; else if (c === ']') { dep--; if (!dep) { e = s + 1; break; } } }
            }
            if (e <= 0) {
                d.push({ title: 'JSON截取失败', img: '', desc: 'size:' + html.length, url: '/player/7553892968508181529' });
                setResult(d); return;
            }
            var arr = [];
            try { arr = JSON.parse(html.slice(startIdx, e)); } catch (e_json) {
                d.push({ title: 'JSON解析失败: ' + (e_json && e_json.message).slice(0, 30), img: '', desc: 'size:' + html.length, url: '/player/7553892968508181529' });
                setResult(d); return;
            }
            if (!Array.isArray(arr) || arr.length === 0) {
                d.push({ title: 'homeSections 非数组/空', img: '', desc: 'len:' + (arr && arr.length), url: '/player/7553892968508181529' });
                setResult(d); return;
            }
            var sec;
            if (key === 'recommend') sec = arr[0] || {};
            else { for (var x = 0; x < arr.length; x++) { if (arr[x].tab_type === key) { sec = arr[x]; break; } } }
            list = (sec && sec.video_list) || [];
            if (key === 'recommend' && list.length === 0) { for (x = 0; x < arr.length && list.length === 0; x++) list = arr[x].video_list || []; }
            for (var j = 0; j < list.length; j++) {
                var it = list[j];
                if (!it.series_id) continue;
                d.push({ title: it.series_title || it.series_name || '', img: it.series_cover || '', desc: it.series_intro || '', url: '/player/' + it.series_id, remarks: it.episode_right_text || '' });
            }
            if (d.length === 0) d.push({ title: '该分类暂无内容', img: '', desc: 'tab:' + key + ' 分类数:' + arr.length, url: '/player/7553892968508181529' });
            setResult(d);
        } catch (e) {
            setResult([{ title: '一级异常:' + (e && e.message), img: '', desc: '', url: '/player/7553892968508181529' }]);
        }
    }.toString(),

    二级: "js:" + function () {
        VOD = {};
        try {
            var sid = String(input);
            // 归一化: /player/123 | player/123 | /123 | 123  -> 123
            sid = sid.replace(/^\//, '').replace(/^player\//, '').replace(/\/.*$/, '');
            var html = String(fetch('https://hongguoduanju.com/player/' + sid, fetch_params));
            var name = '';
            var mnm = /"series_name"\s*:\s*"([^"]*)"/.exec(html);
            if (mnm && mnm[1]) name = mnm[1];
            var mc = /"series_cover"\s*:\s*"([^"]*)"/.exec(html);
            var mi = /"series_intro"\s*:\s*"([^"]*)"/.exec(html);
            var mv = /"vid_list"\s*:\s*(\[[0-9",\s]*\])/.exec(html);
            var vids = [];
            if (mv) { try { vids = JSON.parse(mv[1]); } catch (e2) {} }
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
    }.toString(),

    搜索: "js:" + function () {
        setResult([]);
    }.toString()
};
