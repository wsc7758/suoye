// ============================================================
// PP视频 (www.pptv.com / PP视频·原PPTV聚力) - TVBox/影视仓 drpy2 规则
// 文件名: pptv.js
//
// 说明:
//  - 本规则只用 PPTV 自己的站点与接口, 不涉及任何第三方站点:
//      列表/分类: epg.api.pptv.com/newList.api      (JSON)
//      详情/剧集: epg.api.pptv.com/detail.api       (JSON)
//      播放取流:  web-play.pptv.com/webplay3-0-*.xml (JSONP)
//      搜索:      search.pptv.com/s_video           (服务端渲染 HTML)
//    全部接口均已实测通过。
//
// 分类(typeid 已实测):
//  1=电影  2=电视剧  3=动漫  4=综艺  210784=少儿
//
// 播放说明(重要):
//  PPTV 是"多段 mp4", 一集视频由若干个 mp4 分片组成, 分片地址形如
//    https://txyun.vod.pptv.com/{分段序号}/0/1/{rid}?h5vod.ver=2.1.3&k={k}&type=mhpptv
//  客户端播放器无法把多个分片拼成一条, 因此本规则:
//    - 单分片: 直接返回真实 mp4 直链 (parse:0)
//    - 多分片: 返回该集的 PPTV 播放页, 交给客户端已配置的解析(jx) (parse:1)
//
// 重要: 所有 js: 规则必须用 $js.toString(() => {...}) 生成,
//       drpy2 直接 eval("js:" 之后的内容, 需要的是"语句"而非函数表达式。
//
// 配置示例:
//   "type": 3,
//   "api":  "<drpy2.min.js 地址>",
//   "ext":  "<本文件地址>"
// ============================================================
var rule = {
    title: 'PP视频',
    host: 'https://www.pptv.com',
    homeUrl: 'https://www.pptv.com/',
    // 一级: 分类列表 (JSON) —— fyclass 为分类 id, fypage 为页码
    url: 'https://epg.api.pptv.com/newList.api?appid=pptv.web.h5&appplt=web&appver=4.0.7&from=web&typeid=fyclass&auth=n/a&ppi=302c3532&ps=30&pn=fypage&sortType=hot1&contype=0&hasVirtual=false',
    // 搜索: 关键词 ** , 页码 fypage (服务端渲染 HTML)
    searchUrl: 'https://search.pptv.com/s_video?kw=**&pn=fypage',
    searchable: 1,
    quickSearch: 1,
    filterable: 0,
    class_name: '电影&电视剧&动漫&综艺&少儿',
    class_url: '1&2&3&4&210784',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.pptv.com/'
        // 如需播放 VIP 剧集, 把下面这行前面的 // 去掉, 并填入你自己登录 PPTV 后的 Cookie
        // (浏览器登录 v.pptv.com 后 F12 -> Network -> 任意请求 -> Request Headers -> Cookie 整段复制)
        // , 'Cookie': 'PPTVSESSIONID=xxx; ...'
    },
    timeout: 20000,
    play_parse: true,

    // ---------------------------------------------------------
    // 首页推荐: 取电影频道第一页
    // ---------------------------------------------------------
    推荐: $js.toString(() => {
        let d = [];
        try {
            let u = 'https://epg.api.pptv.com/newList.api?appid=pptv.web.h5&appplt=web&appver=4.0.7&from=web&typeid=1&auth=n/a&ppi=302c3532&ps=30&pn=1&sortType=hot1&contype=0&hasVirtual=false';
            let obj = JSON.parse(fetch(u, fetch_params));
            let arr = obj.videos || [];
            for (let i = 0; i < arr.length; i++) {
                let m = arr[i];
                if (!m.vid) continue;
                let pic = m.imgurl || m.sloturl || '';
                if (pic.indexOf('//') === 0) pic = 'https:' + pic;
                d.push({
                    title: m.title || '',
                    img: pic,
                    desc: [m.typeName, m.year, m.catalog].filter(Boolean).join(' · '),
                    url: String(m.vid)
                });
            }
        } catch (e) { }
        setResult(d);
    }),

    // ---------------------------------------------------------
    // 一级: 分类列表
    // ---------------------------------------------------------
    一级: $js.toString(() => {
        let d = [];
        try {
            let myUrl = String(input);
            let tid = '1', pg = '1';
            let mt = /typeid=(\d+)/.exec(myUrl);
            if (mt) { tid = mt[1]; }
            else { let mc = /(\d+)/.exec(myUrl); if (mc) tid = mc[1]; }
            let mp = /[?&]pn=(\d+)/.exec(myUrl);
            if (mp) pg = mp[1];
            if (myUrl.indexOf('http') !== 0) {
                myUrl = 'https://epg.api.pptv.com/newList.api?appid=pptv.web.h5&appplt=web&appver=4.0.7&from=web&typeid=' + tid + '&auth=n/a&ppi=302c3532&ps=30&pn=' + pg + '&sortType=hot1&contype=0&hasVirtual=false';
            }
            let obj = JSON.parse(fetch(myUrl, fetch_params));
            let arr = obj.videos || [];
            for (let i = 0; i < arr.length; i++) {
                let m = arr[i];
                if (!m.vid) continue;
                let pic = m.imgurl || m.sloturl || '';
                if (pic.indexOf('//') === 0) pic = 'https:' + pic;
                d.push({
                    title: m.title || '',
                    img: pic,
                    desc: [m.typeName, m.year, m.catalog].filter(Boolean).join(' · '),
                    url: String(m.vid)
                });
            }
        } catch (e) { }
        setResult(d);
    }),

    // ---------------------------------------------------------
    // 二级: 详情 + 剧集
    //   input 可能是: "9069008"(vid) 或 "https://v.pptv.com/show/xxx.html"(搜索来的播放页)
    // ---------------------------------------------------------
    二级: $js.toString(() => {
        VOD = {};
        let base = 'https://epg.api.pptv.com/detail.api?vid={VID}&format=json&appid=pptv.web.h5&appplt=web&appver=4.0.7&from=web&ppi=302c3532';
        try {
            let s = String(input);
            try { s = decodeURIComponent(s); } catch (e0) { }
            // input 可能是 "9050063"(直接) 或 "https://www.pptv.com/9050063"(引擎 urljoin 后)
            // 也可能是搜索来的播放页 "https://v.pptv.com/show/xxx.html"
            let tail = s.replace(/[?#].*$/, '').replace(/\/+$/, '');
            let segs = tail.split('/');
            let last = segs[segs.length - 1] || '';
            let vid = '';
            if (/^\d{5,}$/.test(last)) {
                vid = last;
            } else {
                let mh = /^(\d{5,})\.html?$/i.exec(last);
                if (mh) vid = mh[1];
            }
            if (!vid) {
                // 是播放页 URL: 抓页面取 "cid"
                let page = fetch(s, fetch_params);
                let mc = /"cid"\s*:\s*(\d+)/.exec(page);
                if (!mc) mc = /video_id['"]?\s*[:=]\s*['"]?(\d+)/.exec(page);
                if (mc) vid = mc[1];
            }
            if (!vid) {
                VOD = { vod_name: '参数缺失', vod_play_from: 'PP视频', vod_play_url: '无法解析$' + s };
            } else {
                let obj = JSON.parse(fetch(base.replace('{VID}', vid), fetch_params));
                let v = (obj && obj.v) || {};
                let pic = v.imgurl || v.covertranspic || v.sloturl || '';
                if (pic.indexOf('//') === 0) pic = 'https:' + pic;

                // 剧集: video_list 里可能是 video 或 playlink2
                let eps = [];
                let vl = v.video_list;
                if (vl && vl.video && vl.video.length) eps = vl.video;
                else if (vl && vl.playlink2 && vl.playlink2.length) eps = vl.playlink2;
                else if (vl && vl.playlink && vl.playlink.length) eps = vl.playlink;

                let lines = [];
                for (let i = 0; i < eps.length; i++) {
                    let a = (eps[i] && eps[i]._attributes) || {};
                    let eid = a.id || '';
                    if (!eid) continue;
                    let t = a.title ? ('第' + a.title + '集') : ('第' + (i + 1) + '集');
                    lines.push(t + '$' + eid);
                }
                // 没有分集(电影/单视频): 直接用 vid 播放
                if (lines.length === 0) lines.push('正片$' + vid);

                let actor = v.act || '';
                if (!actor && v.actors && v.actors.length) {
                    actor = v.actors.map(function (x) { return x.name; }).join(',');
                }
                VOD = {
                    vod_name: v.title || '',
                    vod_pic: pic,
                    vod_actor: actor,
                    vod_director: v.director || '',
                    vod_content: v.content || '',
                    vod_year: v.year || '',
                    vod_area: v.area || '',
                    vod_class: v.catalog || '',
                    vod_remarks: v.vsTitle ? (v.vsTitle + '集') : '',
                    vod_play_from: 'PP视频',
                    vod_play_url: lines.join('#')
                };
            }
        } catch (e) {
            VOD = { vod_name: '解析失败', vod_play_from: 'PP视频', vod_play_url: '错误$' + input };
        }
    }),

    // ---------------------------------------------------------
    // 搜索: 解析 search.pptv.com 服务端渲染 HTML
    // ---------------------------------------------------------
    搜索: $js.toString(() => {
        let d = [];
        try {
            let pg = '1';
            let mp = /[?&]pn=(\d+)/.exec(String(input));
            if (mp) pg = mp[1];
            let kw = '';
            try { kw = (typeof KEY !== 'undefined' && KEY) ? KEY : ''; } catch (e1) { }
            if (!kw) {
                let mk = /[?&]kw=([^&]*)/.exec(String(input));
                if (mk) { try { kw = decodeURIComponent(mk[1]); } catch (e2) { kw = mk[1]; } }
            }
            let u = 'https://search.pptv.com/s_video?kw=' + encodeURIComponent(kw) + '&pn=' + pg;
            let html = fetch(u, fetch_params);
            let re = /<a href="(\/\/v\.pptv\.com\/show\/[^"]+?)"\s+class="img-block"[^>]*?title="([^"]*)"[^>]*>[\s\S]*?<img[^>]*?src="([^"]+)"/g;
            let m;
            while ((m = re.exec(html)) !== null) {
                let link = m[1];
                let title = m[2];
                let pic = m[3] || '';
                if (link.indexOf('//') === 0) link = 'https:' + link;
                if (pic.indexOf('//') === 0) pic = 'https:' + pic;
                d.push({
                    title: title.replace(/<[^>]+>/g, ''),
                    img: pic,
                    desc: '',
                    url: link.split('?')[0]
                });
            }
        } catch (e) { }
        setResult(d);
    }),

    // ---------------------------------------------------------
    // 播放: 用 webplay3 取真实分片地址
    // ---------------------------------------------------------
    lazy: $js.toString(() => {
        try {
            let raw = String(input);
            let id = (/^\d+$/.test(raw)) ? raw : ((/\/(\d+)(\.html)?$/.exec(raw) || [])[1] || '');
            if (!id) { input = { url: raw, parse: 1 }; return; }
            let wu = 'https://web-play.pptv.com/webplay3-0-' + id + '.xml?o=0&version=6&type=mhpptv&appid=pptv.web.h5&appplt=web&appver=4.0.7&cb=a';
            let txt = fetch(wu, fetch_params);
            let mm = /\((\{[\s\S]*\})\)/.exec(txt);
            let obj = mm ? JSON.parse(mm[1]) : null;
            if (!obj || !obj.childNodes) { input = { url: '', parse: 0 }; return; }
            // 注意: VIP/付费集的响应会在 childNodes[0] 放一个 error 节点(付费用户名为空),
            //       但完整数据仍在后面, 所以必须按 tagName 找 channel, 不能用 childNodes[0]
            let ch = null;
            for (let i = 0; i < obj.childNodes.length; i++) {
                if (obj.childNodes[i].tagName === 'channel') { ch = obj.childNodes[i]; break; }
            }
            if (!ch) { input = { url: '', parse: 0 }; return; }
            let lk = ch.lk ? ch.lk.replace(/^http:/, 'https:') : '';
            // 画质表
            let quals = [];
            for (let i = 0; i < (ch.childNodes || []).length; i++) {
                if (ch.childNodes[i].tagName === 'file') { quals = ch.childNodes[i].childNodes || []; break; }
            }
            // dt / dragdata 一一对应
            let dts = [], drags = [];
            for (let i = 0; i < obj.childNodes.length; i++) {
                let n = obj.childNodes[i];
                if (n.tagName === 'dt') dts.push(n);
                else if (n.tagName === 'dragdata') drags.push(n);
            }
            // 选最高的非 VIP 画质; 若整集都是 VIP(付费集), 则退回取最高画质
            let best = -1, bestH = -1;
            for (let i = 0; i < quals.length; i++) {
                if (quals[i].vip === 1 || quals[i].watch === 0) continue;
                let h = quals[i].height || 0;
                if (h > bestH) { bestH = h; best = i; }
            }
            if (best < 0) {
                best = 0; bestH = -1;
                for (let i = 0; i < quals.length; i++) {
                    let h = quals[i].height || 0;
                    if (h > bestH) { bestH = h; best = i; }
                }
            }
            let dt = dts[best], dg = drags[best];
            if (!dt || !dg) { input = lk ? { url: lk, parse: 1 } : { url: '', parse: 0 }; return; }
            let sh = 'txyun.vod.pptv.com';
            let kraw = '';
            for (let i = 0; i < (dt.childNodes || []).length; i++) {
                let c = dt.childNodes[i];
                if (c.tagName === 'sh') sh = c.childNodes[0];
                if (c.tagName === 'key') kraw = c.childNodes[0];
            }
            let k = '';
            try { k = decodeURIComponent(kraw).split('&')[0]; } catch (e3) { k = String(kraw).split('&')[0]; }
            let segs = [];
            for (let i = 0; i < (dg.childNodes || []).length; i++) {
                if (dg.childNodes[i].tagName === 'sgm') segs.push(dg.childNodes[i].no);
            }
            let direct = 'https://' + sh + '/0/0/1/' + dg.rid + '?h5vod.ver=2.1.3&k=' + k + '&type=mhpptv';
            if (segs.length <= 1) {
                input = { url: direct, parse: 0 };
            } else if (lk) {
                input = { url: lk, parse: 1 };
            } else {
                input = { url: direct, parse: 0 };
            }
        } catch (e) {
            input = { url: '', parse: 0 };
        }
    })
};
