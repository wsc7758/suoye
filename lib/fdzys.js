// ============================================================
// 饭搭子影视 (fdzys.net) - TVBox/影视仓 drpy2 规则
// 文件名: fdzys.js
// 部署: 放到 TVBox 的 JS 目录，JSON 接口用 js: 前缀引入
//
// 特性说明:
//  - 6 个分类：电影 / 电视剧 / 动漫 / 综艺 / 体育 / 短剧
//  - 详情页解析真实 m3u8 直链并多线路兜底(sid 重试)
//  - 说明：该站列表页为静态首页(约80~200部/类，无服务端翻页)，搜索接口返回热门而非结果，
//          故本规则关闭站内搜索，以分类浏览为主。
// ============================================================
var rule = {
    title: '饭搭子',
    host: 'https://fdzys.net',
    homeUrl: 'https://fdzys.net/',
    url: '/fyclass',
    detailUrl: '/fyid',
    searchable: 0,
    quickSearch: 0,
    filterable: 0,
    class_name: '电影&电视剧&动漫&综艺&体育&短剧',
    class_url: 'movie&tv&dongman&zongyi&tiyu&duanju',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://fdzys.net/'
    },
    timeout: 20000,
    play_parse: true,
    lazy: $js.toString(() => {
        try {
            // input 形如 /tv/slug/N?sid=S ，抓该播放页取 player_aaaa 内的 url 直链
            // 无 sid 的默认线路可能没有直链，需依次尝试 sid=2,3,4...
            let u = input;
            if (u.indexOf('http') !== 0) u = 'https://fdzys.net' + u;
            let base = u.replace(/[?#].*$/, '');
            let m = null;
            let sids = ['', '?sid=2', '?sid=3', '?sid=4', '?sid=5', '?sid=6'];
            for (let i = 0; i < sids.length; i++) {
                try {
                    let html = fetch(base + sids[i], fetch_params);
                    m = /"url":\s*"(https:\\\/\\\/[^"]+?\.m3u8)"/.exec(html) || /"url":\s*"(https:\/\/[^"]+?\.m3u8)"/.exec(html);
                    if (m && m[1]) break;
                } catch (e) {}
            }
            if (m && m[1]) {
                let real = m[1].replace(/\\\//g, '/');
                input = { url: real, parse: 0 };
            }
        } catch (e) {}
    }),
    一级: $js.toString(() => {
        let d = [];
        try {
            let myUrl = input;
            if (myUrl.indexOf('http') !== 0) myUrl = 'https://fdzys.net' + myUrl;
            let html = fetch(myUrl, fetch_params);
            // 影片卡片：<a href="详情"><div class="content-card"><img data-src=海报>...<div class="title">标题</div>
            let reCard = /<a[^>]*href="(https:\/\/fdzys\.net\/(?:movie|tv|dongman|zongyi|tiyu|duanju)\/[^"]+)"[^>]*>[\s\S]*?data-src="([^"]+)"[\s\S]*?<div class="title">([\s\S]*?)<\/div>/g;
            let m;
            while ((m = reCard.exec(html)) !== null) {
                let url = m[1], pic = m[2], title = m[3].replace(/<[^>]+>/g, '').trim();
                if (!url || !title) continue;
                if (pic && pic.indexOf('http') !== 0) pic = 'https://fdzys.net' + pic;
                if (pic && pic.indexOf('https') !== 0 && pic.indexOf('http:') === 0) pic = pic.replace('http:', 'https:');
                let rel = url.replace(/^https:\/\/fdzys\.net\//, '');
                d.push({ title: title, img: pic, desc: '', url: '/' + rel });
            }
            let seen = {}, out = [];
            for (let i = 0; i < d.length; i++) { if (!seen[d[i].url]) { seen[d[i].url] = 1; out.push(d[i]); } }
            if (out.length === 0) out.push({ title: '列表为空', img: '', desc: '', url: '/movie' });
            setResult(out);
        } catch (e) {
            setResult([{ title: '一级异常:' + e.message, img: '', desc: '', url: '/movie' }]);
        }
    }),
    二级: $js.toString(() => {
        VOD = {};
        try {
            let myUrl = input;
            if (myUrl.indexOf('http') !== 0) myUrl = 'https://fdzys.net' + myUrl;
            let html = fetch(myUrl, fetch_params);

            // 标题
            let nm = '';
            let ogt = /<meta property="og:title" content="([^"]*)"/.exec(html);
            if (ogt) nm = ogt[1].replace(/免费在线观看|_.*$/g, '').trim();
            if (!nm) {
                let tt = /<title>([\s\S]*?)<\/title>/.exec(html);
                if (tt) nm = tt[1].replace(/免费在线观看.*$/, '') . replace(/\d+集$/, '').trim();
            }

            // 海报
            let poster = '';
            let ogi = /<meta property="og:image" content="([^"]*)"/.exec(html);
            if (ogi) poster = ogi[1];

            // 演员 / 导演
            let actor = '', director = '';
            let pd = /var player_\w+\s*=\s*(\{[\s\S]*?\});/.exec(html);
            if (pd) {
                try {
                    let j = JSON.parse(pd[1].replace(/\\\//g, '/'));
                    let vd = j.vod_data || {};
                    actor = vd.vod_actor || '';
                    director = vd.vod_director || '';
                } catch (e) {}
            }
            if (!actor) {
                let am = /<div class="role">主演?：([^<]+)<\/div>/.exec(html) || /主演[,:]?\s*：([^<]+)/.exec(html);
                if (am) actor = am[1].trim();
            }

            // 简介
            let desc = '';
            let ogd = /<meta property="og:description" content="([^"]*)"/.exec(html);
            if (ogd) desc = ogd[1].split('｜')[0].trim();
            if (!desc) {
                let md = /<meta name="description" content="([^"]*)"/.exec(html);
                if (md) desc = md[1].split('｜')[0].trim();
            }

            // 剧集列表
            let eps = [], seen = {}, m;
            let reEp = /<a[^>]*href="((?:\/movie|\/tv|\/dongman|\/zongyi|\/tiyu|\/duanju)\/[^"?>]+?\/\d+(?:\?[^">]*)?)"[^>]*>([\s\S]{0,20})<\/a>/g;
            while ((m = reEp.exec(html)) !== null) {
                let u = m[1], t = m[2].replace(/<[^>]+>/g, '').trim();
                if (!/^第?\s*\d/.test(t) || !t) continue;
                let key = u.split('?')[0];
                if (!seen[key]) { seen[key] = 1; eps.push({ t: t, u: u }); }
            }
            if (eps.length === 0) {
                let base = myUrl.replace(/[?#].*$/, '');
                eps.push({ t: '播放', u: '/' + base.replace(/^https:\/\/fdzys\.net\//, '') });
            }

            let lines = [];
            for (let i = 0; i < eps.length; i++) {
                lines.push(eps[i].t + '$' + eps[i].u);
            }

            VOD = {
                vod_name: nm || '未命名',
                vod_pic: poster || '',
                vod_actor: actor || '',
                vod_director: director || '',
                vod_content: desc || '',
                vod_play_from: '直链',
                vod_play_url: lines.join('#')
            };
        } catch (e) {
            VOD = { vod_name: '解析失败', vod_play_from: '直链', vod_play_url: '错误$' + input };
        }
    }),
    搜索: $js.toString(() => {
        setResult([]);
    })
};
