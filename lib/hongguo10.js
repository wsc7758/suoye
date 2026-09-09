// ============================================================
// 红果短剧 (hongguoduanju.com) - TVBox/影视仓 独立接口 (drpy2)
//
// 【三大修复】
// A. 播放: 单集页 /player/{sid}/{vid} 内抓 main_url 直链。
//    main_url 在页面里是 \u002F 转义(https:\u002F\u002F...), 必须还原成 / 才能播,
//    之前没还原 -> 播放器拿到坏链接 -> 0.00Mbps。
// B. 详情: /player/{sid} 页抓 series_name(剧名)/series_cover(封面)/series_intro(简介)
//    /tags(类型标签)/celebrities(演员), 尽量填全详情。
//    sid 用"取 input 最后一段数字"的方式稳健提取。
// C. 分类: 红果真实细分分类参数 background/topic/setting,
//    例 /category?background=cate_390(民国) /category?setting=cate_37(穿越)。
//    列表页数据在 recommendList 数组, 支持 &page=N 翻页。
// 写法沿用 IIFE: "js:(" + fn.toString() + ")()" (引擎 eval 必须能真正执行)
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
        try {
            var token = String(input);
            if (token.indexOf('http') === 0) {
                var purl = unUnd(token).replace(/\\\//g, '/');
                input = { url: purl, parse: 0 };
                return;
            }
            var mm = /(\d+)\/(\d+)/.exec(token);
            if (!mm) {
                var mt = /\d{5,}/.exec(token);
                mm = mt ? [token, mt[0], ''] : null;
            }
            if (!mm) return;
            var sid = mm[1], vid = mm[2];
            var html = '';
            try { html = String(fetch('https://hongguoduanju.com/player/' + sid + '/' + vid, fetch_params)); } catch (e2) {}
            var direct = '';
            var m0 = /"main_url"\s*:\s*"([^"]*)"/.exec(html);
            if (m0 && m0[1] && m0[1].indexOf('http') >= 0) direct = unUnd(m0[1]);
            if (!direct) {
                var m1 = /(https:[^"'\s]+?qznovelvod\.com[^"'\s,]+?)["',]/.exec(html);
                if (m1 && m1[1]) direct = unUnd(m1[1]);
            }
            if (direct) {
                direct = direct.replace(/\\\//g, '/');
                input = { url: direct, parse: 0 };
            }
        } catch (e) {}
    }.toString() + ")()",

    一级: "js:(" + function () {
        var d = [];
        try {
            var myUrl = String(input);
            if (myUrl.indexOf('http') !== 0) myUrl = 'https://hongguoduanju.com' + myUrl;
            var html = '';
            try { html = String(fetch(myUrl, fetch_params)); } catch (e_fetch) {
                d.push({ title: 'fetch异常: ' + (e_fetch && e_fetch.message), img: '', desc: '', url: '/player/7553892968508181529' });
                setResult(d); return;
            }
            if (!html || html.length < 200) {
                d.push({ title: '红果返回空页(size:' + (html ? html.length : 0) + ')', img: '', desc: '', url: '/player/7553892968508181529' });
                setResult(d); return;
            }
            var arr = [];
            // 分类页数据在 recommendList
            var mr = /"recommendList"\s*:\s*\[/.exec(html);
            if (mr) {
                var st = mr.index + mr[0].length - 1;
                var dp = 0, ins = false, esc = false, en = -1;
                for (var s = st; s < html.length; s++) {
                    var c = html.charAt(s);
                    if (ins) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') ins = false; }
                    else { if (c === '"') ins = true; else if (c === '[') dp++; else if (c === ']') { dp--; if (!dp) { en = s + 1; break; } } }
                }
                if (en > 0) {
                    try { arr = JSON.parse(html.slice(st, en)); } catch (e) {}
                }
                for (var j = 0; j < arr.length; j++) {
                    var it = arr[j];
                    if (!it.series_id) continue;
                    d.push({ title: it.series_name || '', img: unUnd(it.series_cover || ''), desc: it.series_intro || '', url: '/player/' + it.series_id, remarks: (it.episode_cnt ? it.episode_cnt + '集' : (it.episode_right_text || '')) });
                }
            } else {
                // 首页 homeSections 兜底
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
                var key = String((typeof MY_CATE !== 'undefined' && MY_CATE) ? MY_CATE : input);
                var sec;
                if (key === 'recommend') sec = secs[0] || {};
                else { for (var x = 0; x < secs.length; x++) { if (secs[x].tab_type === key) { sec = secs[x]; break; } } }
                var list = (sec && sec.video_list) || [];
                if (!list.length) { for (var z = 0; z < secs.length; z++) { if (secs[z].video_list && secs[z].video_list.length) { list = secs[z].video_list; break; } } }
                for (var k = 0; k < list.length; k++) {
                    var ik = list[k];
                    if (!ik.series_id) continue;
                    d.push({ title: ik.series_title || ik.series_name || '', img: unUnd(ik.series_cover || ''), desc: ik.series_intro || '', url: '/player/' + ik.series_id, remarks: ik.episode_right_text || '' });
                }
            }
            if (d.length === 0) d.push({ title: '该分类暂无内容', img: '', desc: 'url:' + myUrl.length, url: '/player/7553892968508181529' });
            setResult(d);
        } catch (e) {
            setResult([{ title: '一级异常:' + (e && e.message), img: '', desc: '', url: '/player/7553892968508181529' }]);
        }
    }.toString() + ")()",

    二级: "js:(" + function () {
        VOD = {};
        try {
            var is = String(input);
            var m = is.match(/\d{5,}/g);
            // 优先用最后一个数字(series_id); 若无则用当前页里的第一个
            var sid = m && m.length ? m[m.length - 1] : '7553892968508181529';
            var html = String(fetch('https://hongguoduanju.com/player/' + sid, fetch_params));
            var name = ''; var mc, mi, mt, mce, mv;
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
            VOD = {
                vod_name: name,
                vod_pic: mcc ? unUnd(mcc[1]) : '',
                vod_actor: cele.join('/'),
                vod_content: (mii && unUnd(mii[1])) || '',
                vod_class: tags.join('/'),
                vod_remarks: vids.length ? (vids.length + '集') : '',
                vod_play_from: '红果正片(免广告)',
                vod_play_url: lines.join('#') || ('第1集$' + sid + '/' + (vids[0] || ''))
            };
        } catch (e) {
            VOD = { vod_name: '解析失败', vod_play_from: '红果正片(免广告)', vod_play_url: '错误$' + input };
        }
    }.toString() + ")()",

    搜索: "js:(" + function () {
        setResult([]);
    }.toString() + ")"
};

// 还原 \u002F 之类的 unicode 转义 -> 真实字符(/、& 等)
function unUnd(s) {
    if (!s) return '';
    return String(s).replace(/\\u([0-9a-fA-F]{4})/g, function (a, b) {
        return String.fromCharCode(parseInt(b, 16));
    });
}
