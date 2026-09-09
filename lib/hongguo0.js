// ============================================================
// 红果短剧 (hongguoduanju.com) - TVBox/影视仓 独立接口 (drpy2)
//
// 【本版修复】
//  drpy2 引擎只 eval 每个 rule.X 里的字符串, 脚本其它位置的全局函数不会被载入。
//  之前把还原转义的函数定义在 rule 外面(全局) -> 引擎里 undefined ->
//  一级报"'unUnd' is undefined"、二级报"解析失败"。
//  故: 每个函数内部自带 unescape 逻辑(局部 und), 完全自包含。
// 保留功能: 播放(还原 main_url 的 \u002F) / 详情(tags、celebrities、简介)
//          细分分类(background/topic/setting) / 分页
// 写法沿用 IIFE: "js:(" + fn.toString() + ")()"
// ============================================================
var rule = {
    title: '红果短剧',
    host: 'https://hongguoduanju.com',
    homeUrl: 'https://hongguoduanju.com/category',
    url: 'https://hongguoduanju.com/category?fyclass&page=fypage',
    detailUrl: '/player/fyid',
    searchable: 0,
    quickSearch: 0,
    filterable: 0,
    class_name: '全部短剧&都市&现代&古代&年代&民国&校园&宫廷&玄幻&战神&仙侠&悬疑&科幻&恐怖&喜剧&动作&商战&武侠&民国爱情&穿越&重生&系统&赘婿逆袭&甜宠&豪门&神医&打脸虐渣&神豪&强者回归',
    class_url: 'all&background=cate_1&background=cate_757&background=cate_758&background=cate_79&background=cate_390&background=cate_4&background=cate_1153&topic=cate_1019&topic=cate_1038&topic=cate_1013&topic=cate_165&topic=cate_1092&topic=cate_1219&topic=cate_303&topic=cate_302&topic=cate_1225&topic=cate_1172&topic=cate_1025&setting=cate_37&setting=cate_36&setting=cate_19&setting=cate_1044&setting=cate_96&setting=cate_936&setting=cate_26&setting=cate_1051&setting=cate_20&setting=cate_1045',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://hongguoduanju.com/'
    },
    timeout: 25000,
    play_parse: true,

    lazy: "js:(" + function () {
        var und = function (s) { if (!s) return ''; return String(s).replace(/\\u([0-9a-fA-F]{4})/g, function (a, b) { return String.fromCharCode(parseInt(b, 16)); }); };
        try {
            var token = String(input);
            if (token.indexOf('http') === 0) {
                input = { url: und(token).replace(/\\\//g, '/'), parse: 0 };
                return;
            }
            var mm = /(\d+)\/(\d+)/.exec(token);
            if (!mm) { var mt = /\d{5,}/.exec(token); mm = mt ? [token, mt[0], ''] : null; }
            if (!mm) return;
            var sid = mm[1], vid = mm[2];
            var html = '';
            try { html = String(fetch('https://hongguoduanju.com/player/' + sid + '/' + vid, fetch_params)); } catch (e2) {}
            var direct = '';
            var m0 = /"main_url"\s*:\s*"([^"]*)"/.exec(html);
            if (m0 && m0[1] && m0[1].indexOf('http') >= 0) direct = und(m0[1]);
            if (!direct) {
                var m1 = /(https:[^"'\s]+?qznovelvod\.com[^"'\s,]+?)["',]/.exec(html);
                if (m1 && m1[1]) direct = und(m1[1]);
            }
            if (direct) { input = { url: direct.replace(/\\\//g, '/'), parse: 0 }; }
        } catch (e) {}
    }.toString() + ")()",

    一级: "js:(" + function () {
        var und = function (s) { if (!s) return ''; return String(s).replace(/\\u([0-9a-fA-F]{4})/g, function (a, b) { return String.fromCharCode(parseInt(b, 16)); }); };
        var d = [];
        try {
            var myUrl = String(input);
            if (myUrl.indexOf('http') !== 0) myUrl = 'https://hongguoduanju.com' + myUrl;
            // 平台 canonical 不支持显式 page=1: /category?xx&page=1 会 301->404 空页。
            // 去掉 page=1, 第1页直接用默认(不带page)即可; 第2页起 page=N 正常。
            myUrl = myUrl.split('&').filter(function (x) { return !/^page=1$/i.test(x); }).join('&');
            var html = '';
            try { html = String(fetch(myUrl, fetch_params)); } catch (e_fetch) { setResult([]); return; }
            if (!html || html.length < 200) { setResult([]); return; }
            var arr = [];
            var mr = /"recommendList"\s*:\s*\[/.exec(html);
            if (mr) {
                var st = mr.index + mr[0].length - 1, dp = 0, ins = false, esc = false, en = -1;
                for (var s = st; s < html.length; s++) {
                    var c = html.charAt(s);
                    if (ins) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') ins = false; }
                    else { if (c === '"') ins = true; else if (c === '[') dp++; else if (c === ']') { dp--; if (!dp) { en = s + 1; break; } } }
                }
                if (en > 0) { try { arr = JSON.parse(html.slice(st, en)); } catch (e) {} }
                for (var j = 0; j < arr.length; j++) {
                    var it = arr[j];
                    if (!it.series_id) continue;
                    d.push({ title: it.series_name || '', img: und(it.series_cover || ''), desc: it.series_intro || '', url: '/player/' + it.series_id, remarks: (it.episode_cnt ? it.episode_cnt + '集' : (it.episode_right_text || '')) });
                }
            } else {
                var msc = /"homeSections"\s*:\s*\[/.exec(html);
                var st2 = msc ? (msc.index + msc[0].length - 1) : html.indexOf('[', html.indexOf('homeSections') < 0 ? 0 : html.indexOf('homeSections'));
                var dp2 = 0, ins2 = false, esc2 = false, en2 = -1;
                for (var s2 = st2; s2 < html.length; s2++) {
                    var c2 = html.charAt(s2);
                    if (ins2) { if (esc2) esc2 = false; else if (c2 === '\\') esc2 = true; else if (c2 === '"') ins2 = false; }
                    else { if (c2 === '"') ins2 = true; else if (c2 === '[') dp2++; else if (c2 === ']') { dp2--; if (!dp2) { en2 = s2 + 1; break; } } }
                }
                var secs = [];
                if (en2 > 0) { try { secs = JSON.parse(html.slice(st2, en2)); } catch (e) {} }
                var sec;
                if (typeof MY_CATE !== 'undefined' && String(MY_CATE + '').indexOf('cate_') >= 0) sec = null;
                else {
                    var key = String((typeof MY_CATE !== 'undefined' && MY_CATE) ? MY_CATE : 'recommend');
                    if (key === 'recommend') sec = secs[0] || {};
                    else { for (var x = 0; x < secs.length; x++) { if (secs[x].tab_type === key) { sec = secs[x]; break; } } }
                }
                var list = (sec && sec.video_list) || [];
                if (!list.length) { for (var z = 0; z < secs.length; z++) { if (secs[z].video_list && secs[z].video_list.length) { list = secs[z].video_list; break; } } }
                for (var k = 0; k < list.length; k++) {
                    var ik = list[k];
                    if (!ik.series_id) continue;
                    d.push({ title: ik.series_title || ik.series_name || '', img: und(ik.series_cover || ''), desc: ik.series_intro || '', url: '/player/' + ik.series_id, remarks: ik.episode_right_text || '' });
                }
            }
            if (d.length === 0) d.push({ title: '该分类暂无内容', img: '', desc: 'url:' + (myUrl || '').length, url: '/player/7553892968508181529' });
            setResult(d);
        } catch (e) {
            setResult([{ title: '一级异常:' + (e && e.message), img: '', desc: '', url: '/player/7553892968508181529' }]);
        }
    }.toString() + ")()",

    二级: "js:(" + function () {
        var und = function (s) { if (!s) return ''; return String(s).replace(/\\u([0-9a-fA-F]{4})/g, function (a, b) { return String.fromCharCode(parseInt(b, 16)); }); };
        VOD = {};
        try {
            var is = String(input);
            var m = is.match(/\d{5,}/g);
            var sid = m && m.length ? m[m.length - 1] : '7553892968508181529';
            var html = String(fetch('https://hongguoduanju.com/player/' + sid, fetch_params));
            var name = '';
            var mnm = /"series_name"\s*:\s*"([^"]*)"/.exec(html); if (mnm && mnm[1]) name = mnm[1];
            var mcc = /"series_cover"\s*:\s*"([^"]*)"/.exec(html);
            var mii = /"series_intro"\s*:\s*"([^"]*)"/.exec(html);
            var mtt = /"tags"\s*:\s*(\[[^\]]*\])/.exec(html);
            var mcee = /"celebrities"\s*:\s*\[([\s\S]*?)\]/.exec(html);
            var tags = [], cele = [];
            if (mtt) { try { tags = JSON.parse(mtt[1]); } catch (e) {} }
            if (mcee && mcee[1] && mcee[1].indexOf('name') >= 0) {
                var reN = /"name"\s*:\s*"([^"]+)"/g, nm;
                while ((nm = reN.exec(mcee[1])) !== null) { if (nm[1]) cele.push(nm[1]); }
            }
            var mvv = /"vid_list"\s*:\s*(\[[0-9",\s]*\])/.exec(html);
            var vids = [];
            if (mvv) { try { vids = JSON.parse(mvv[1]); } catch (e2) {} }
            var lines = [];
            for (var i = 0; i < vids.length; i++) lines.push('第' + (i + 1) + '集$' + sid + '/' + vids[i]);
            if (!name) name = '未命名';
            // ---- 聚合全片合并: 以剧名在聚合源(天龙影院)检索并补全集 ----
            // 仅当前3集可免广告播, 第4集起尝试从全片源补齐; 检索失败时静默, 不影响红果本身。
            var aggFrom = '', aggUrl = '';
            try {
                var swd = encodeURIComponent(name.trim());
                var aggHost = 'https://m.82mao.com';
                var sh = '';
                try { sh = String(fetch(aggHost + '/index.php/vod/search/wd/' + swd + '.html', fetch_params)); } catch (ef) {}
                if (!sh || sh.length < 300) { try { sh = String(fetch(aggHost + '/Search/' + swd + '.html', fetch_params)); } catch (ef2) {} }
                if (sh && sh.length > 200) {
                    var bestId = '', bestScore = -1, me, t = name.replace(/\s+/g, '');
                    var relist = /href="[^"]*\/Movie\/(\d+)\.html[^"]*"[^>]*title="([^"]*)"/g;
                    while ((me = relist.exec(sh)) !== null) {
                        var cand = (me[2] || '').replace(/\s+/g, '');
                        var sc = 0, i2;
                        for (i2 = 0; i2 < t.length; i2++) if (cand.indexOf(t.charAt(i2)) >= 0) sc++;
                        if (sc > bestScore) { bestScore = sc; bestId = me[1]; }
                    }
                    if (bestId) {
                        var dh = '';
                        try { dh = String(fetch(aggHost + '/Movie/' + bestId + '.html', fetch_params)); } catch (ef3) {}
                        var epMap = {}, mep, rp = /\/Play\/(\d+-\d+-\d+-(\d+))\.html/g;
                        while ((mep = rp.exec(dh)) !== null) { var en = parseInt(mep[2], 10); if (en > 0) epMap[en] = mep[1]; }
                        var keys = [];
                        for (var k in epMap) { if (epMap.hasOwnProperty(k)) keys.push(parseInt(k, 10)); }
                        keys.sort(function (a, b) { return a - b; });
                        var aLines = [];
                        for (var a2 = 0; a2 < keys.length; a2++) aLines.push('第' + keys[a2] + '集$' + aggHost + '/Play/' + epMap[keys[a2]] + '.html');
                        if (aLines.length > 0) { aggUrl = aLines.join('#'); aggFrom = '聚合·天龙影院(全集)'; }
                    }
                }
            } catch (eagg) {}
            var rFrom = '红果正片(免广告)';
            var rUrl = lines.join('#') || ('第1集$' + sid + '/' + (vids[0] || ''));
            if (aggFrom) { rFrom += '$$' + aggFrom; rUrl += '$$' + aggUrl; }
            VOD = {
                vod_name: name,
                vod_pic: mcc ? und(mcc[1]) : '',
                vod_actor: cele.join('/'),
                vod_content: (mii && und(mii[1])) || '',
                vod_class: tags.join('/'),
                vod_remarks: vids.length ? (vids.length + '集') : '',
                vod_play_from: rFrom,
                vod_play_url: rUrl
            };
        } catch (e) {
            VOD = { vod_name: '解析失败', vod_play_from: '红果正片(免广告)', vod_play_url: '错误$' + input };
        }
    }.toString() + ")()",

    搜索: "js:(" + function () {
        setResult([]);
    }.toString() + ")"
};
