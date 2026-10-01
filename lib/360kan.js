// ============================================================
// 360影视 (www.360kan.com) - TVBox/影视仓 drpy2 规则
// 文件名: 360kan.js
//
// 说明:
//  - 本规则只用 360kan 自己的接口(同站不同子域名):
//      列表/详情: api.web.360kan.com
//      搜索:      api.so.360kan.com
//    不涉及任何第三方站点的抓取。
//  - 站点定位: 影视聚合。详情接口直接给出各大视频站的分集播放页链接,
//    本规则将其整理成"线路(各站) x 剧集"的播放列表返回;
//    播放交给客户端已配置的解析(jx)完成, 故 lazy 返回 parse:1。
//
// 分类(catid 已实测):
//  1=电影  2=电视剧  3=综艺  4=动漫(含儿童)
//
// 配置示例:
//   "type": 3,
//   "api":  "<drpy2.min.js 地址>",
//   "ext":  "<本文件地址>"
// ============================================================
var rule = {
    title: '360影视',
    host: 'https://www.360kan.com',
    homeUrl: 'https://www.360kan.com/',
    // 一级: 分类列表 (JSON)
    url: 'https://api.web.360kan.com/v1/filter/list?catid=fyclass&pageno=fypage&pagesize=20',
    // 搜索: 关键词 ** , 页码 fypage
    searchUrl: 'https://api.so.360kan.com/index?force_v=1&kw=**&from=&pageno=fypage&v_ap=1&tab=all',
    searchable: 1,
    quickSearch: 1,
    filterable: 0,
    class_name: '电影&电视剧&综艺&动漫·儿童',
    class_url: '1&2&3&4',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.360kan.com/'
    },
    timeout: 20000,
    play_parse: true,

    // 首页推荐: 取电影分类第一页
    推荐: "js:" + function () {
        var d = [];
        try {
            var html = fetch('https://api.web.360kan.com/v1/filter/list?catid=1&pageno=1&pagesize=20', fetch_params);
            var obj = JSON.parse(html);
            var arr = (obj && obj.data && obj.data.movies) || [];
            for (var i = 0; i < arr.length; i++) {
                var m = arr[i];
                var pic = m.cover || m.cdncover || '';
                if (pic.indexOf('//') === 0) pic = 'https:' + pic;
                d.push({ title: m.title || '', img: pic, desc: m.comment || '', url: '1/' + (m.id || '') });
            }
        } catch (e) { }
        setResult(d);
    }.toString(),

    // 一级: 分类列表
    一级: "js:" + function () {
        var d = [];
        try {
            var myUrl = String(input);
            if (myUrl.indexOf('http') !== 0) {
                var cc = /(\d+)/.exec(myUrl);
                myUrl = 'https://api.web.360kan.com/v1/filter/list?catid=' + (cc ? cc[1] : '1') + '&pageno=1&pagesize=20';
            }
            var catid = '1';
            var mm = /catid=(\d+)/.exec(myUrl);
            if (mm) catid = mm[1];
            var html = fetch(myUrl, fetch_params);
            var obj = JSON.parse(html);
            var arr = (obj && obj.data && obj.data.movies) || [];
            for (var i = 0; i < arr.length; i++) {
                var m = arr[i];
                if (!m.id) continue;
                var pic = m.cover || m.cdncover || '';
                if (pic.indexOf('//') === 0) pic = 'https:' + pic;
                d.push({
                    title: m.title || '',
                    img: pic,
                    desc: m.comment || (m.moviecategory || []).join('/'),
                    url: catid + '/' + m.id
                });
            }
        } catch (e) { }
        setResult(d);
    }.toString(),

    // 二级: 详情 + 各站分集
    二级: "js:" + function () {
        var nameMap = {
            qiyi: '爱奇艺', imgo: '芒果TV', mgtv: '芒果TV', qq: '腾讯视频', youku: '优酷',
            bilibili1: '哔哩哔哩', sohu: '搜狐视频', leshi: '乐视', letv: '乐视',
            pptv: 'PPTV', funshion: '风行', douyin: '抖音', m1905: '1905电影网',
            huanxi: '欢喜首映', wasu: '华数TV', acfun: 'AcFun', music: '音悦台'
        };
        VOD = {};
        try {
            var s = String(input);
            try { s = decodeURIComponent(s); } catch (e0) { }
            var parts = s.split('/');
            var cat = parts[0], id = parts[1];
            if (!cat || !id) { VOD = { vod_name: '参数缺失', vod_play_from: '360影视', vod_play_url: '错误$' + s }; return; }
            var html = fetch('https://api.web.360kan.com/v1/detail?cat=' + cat + '&id=' + id, fetch_params);
            var obj = JSON.parse(html);
            var m = (obj && obj.data) || {};
            var pld = m.playlinksdetail || {};
            var ae = m.allepidetail || {};
            var froms = [], urls = [];
            for (var site in pld) {
                if (!pld.hasOwnProperty(site)) continue;
                var nm = nameMap[site] || site;
                var eps = ae[site];
                var lines = [];
                if (eps && eps.length) {
                    for (var i = 0; i < eps.length; i++) {
                        var ep = eps[i];
                        if (!ep.url) continue;
                        var t = ep.playlink_num ? ('第' + ep.playlink_num + '集') : ('第' + (i + 1) + '集');
                        lines.push(t + '$' + ep.url);
                    }
                } else {
                    var du = (pld[site] && pld[site].default_url) || '';
                    if (du) lines.push(nm + '$' + du);
                }
                if (lines.length > 0) { froms.push(nm); urls.push(lines.join('#')); }
            }
            var pic = m.cdncover || '';
            if (pic.indexOf('//') === 0) pic = 'https:' + pic;
            VOD = {
                vod_name: m.title || '',
                vod_pic: pic,
                vod_actor: (m.actor || []).join('/'),
                vod_director: (m.director || []).join('/'),
                vod_content: m.description || m.comment || '',
                vod_year: m.pubdate || '',
                vod_area: (m.area || []).join('/'),
                vod_class: (m.moviecategory || []).join('/'),
                vod_remarks: m.upinfo ? (m.upinfo + '集') : '',
                vod_play_from: froms.join('$$$') || '360影视',
                vod_play_url: urls.join('$$$') || ('暂无播放源$' + s)
            };
        } catch (e) {
            VOD = { vod_name: '解析失败', vod_play_from: '360影视', vod_play_url: '错误$' + input };
        }
    }.toString(),

    // 搜索
    搜索: "js:" + function () {
        var d = [];
        try {
            var pg = '1';
            var mp = /pageno=(\d+)/.exec(String(input));
            if (mp) pg = mp[1];
            var kw = '';
            try { kw = (typeof KEY !== 'undefined' && KEY) ? KEY : ''; } catch (e1) { }
            if (!kw) {
                var mk = /[?&]kw=([^&]*)/.exec(String(input));
                if (mk) { try { kw = decodeURIComponent(mk[1]); } catch (e2) { kw = mk[1]; } }
            }
            var url = 'https://api.so.360kan.com/index?force_v=1&kw=' + encodeURIComponent(kw) + '&from=&pageno=' + pg + '&v_ap=1&tab=all';
            var html = fetch(url, fetch_params);
            var obj = JSON.parse(html);
            var rows = (obj && obj.data && obj.data.longData && obj.data.longData.rows) || [];
            for (var i = 0; i < rows.length; i++) {
                var r = rows[i];
                var cid = String(r.cat_id || '');
                if (['1', '2', '3', '4'].indexOf(cid) < 0) continue;
                if (!r.en_id) continue;
                var pic = r.cover || '';
                if (pic.indexOf('//') === 0) pic = 'https:' + pic;
                d.push({
                    title: (r.titleTxt || r.title || '').replace(/<[^>]+>/g, ''),
                    img: pic,
                    desc: r.year || '',
                    url: cid + '/' + r.en_id
                });
            }
        } catch (e) { }
        setResult(d);
    }.toString(),

    // 播放: 详情返回的是各站播放页链接, 交给客户端解析
    lazy: "js:" + function () {
        try {
            var u = String(input);
            if (u.indexOf('http') === 0) input = { url: u, parse: 1 };
        } catch (e) { }
    }.toString()
};
