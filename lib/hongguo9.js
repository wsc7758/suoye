// ============================================================
// 红果短剧 (hongguoduanju.com) - TVBox/影视仓 独立接口 (drpy2)
//
// 【最终修复·必读】之前所有版本(含七味 nodollar)都用了
//   "js:" + function(){...}.toString()
// drpy2 引擎对 js 规则是这样执行的(exact code):
//   eval(p.trim().replace("js:", ""));
// 去掉 "js:" 后得到 -> "function(){...}"
// eval 一个匿名函数声明语句 = SyntaxError(函数语句必须命名)，
// 异常被吞掉，VODS 保持为空 -> 列表 "没找到数据"。
// 正确写法: 让 eval 出来的表达式真正执行函数体 —— 用 IIFE 自调用:
//   "js:(" + function(){...}.toString() + ")()"
// => eval("(function(){...})()")  立即执行 -> setResult/VOD 生效。
// 这也是七味接口当初"没找到数据"的根本原因，一并修复。
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

    lazy: "js:(" + function () {
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
    }.toString() + ")()",

    一级: "js:(" + function () {
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
            // 分类key从引擎注入的 MY_CATE(= 该分类的tid, 如 all/human/comic/ai)取;
            // input 是引擎生成的列表URL(带域名), 不能用作分类匹配。
            var key = String((typeof MY_CATE !== 'undefined' && MY_CATE) ? MY_CATE : input);
            var list = [];
            var msc = /"homeSections"\s*:\s*\[/.exec(html);
            // startIdx 指向数组开头的 "["(注意 "homeSections": 后紧跟 [)
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
                d.push({ title: 'JSON解析失败: ' + (e_json && e_json.message).slice(0, 30), img: '', desc: '', url: '/player/7553892968508181529' });
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
            // 兜底: 若该分类无内容(或 key 未命中), 取第一个有内容的板块, 保证列表不空白
            if (list.length === 0) {
                for (var z = 0; z < arr.length; z++) {
                    var zl = arr[z].video_list || [];
                    if (zl.length) { list = zl; break; }
                }
            }
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
    }.toString() + ")()",

    二级: "js:(" + function () {
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
    }.toString() + ")()",

    搜索: "js:(" + function () {
        setResult([]);
    }.toString() + ")()"
};
