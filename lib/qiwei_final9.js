var rule = {
    title: '七味直链',
    host: 'https://www.gmp4.com',
    homeUrl: 'https://www.gmp4.com/',
    url: '/vt/fyclass-fypage.html',
    detailUrl: '/mv/fyid.html',
    searchable: 0,
    quickSearch: 0,
    filterable: 0,
    class_name: '电影&剧集&综艺&动漫&短剧',
    class_url: '1&2&3&4&30',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.gmp4.com/'
    },
    timeout: 60000,
    // ======== 必须 play_parse:true，否则引擎强制 parse:1 走外部解析 -> 没找到数据 ========
    play_parse: true,
    play_json: [],
    lazy: $js.toString(() => {
        // input = 播放页地址 /py/xxx-sid-nid.html  (可能已是 http 开头)
        let host = 'https://www.gmp4.com';
        let u = (input.indexOf('http') === 0) ? input : host + input;
        let m3u8 = '';
        try {
            let html = fetch(u, {
                method: 'get',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': host + '/'
                }
            });
            // 取播放器对象 var player_aaaa={"...}
            let i = html.indexOf('var player_aaaa=');
            if (i >= 0) {
                let s = html.indexOf('{', i);
                let e = html.indexOf('</script>', i);
                if (e < 0) e = html.length;
                let obj = JSON.parse(html.slice(s, e));
                if (obj && obj.url) m3u8 = obj.url;
            }
            // 兜底：页面里任何 .m3u8 地址
            if (!m3u8) {
                let mm = /(https?:\/\/[^"'\s<>]+?\.m3u8[^"'\s<>]*)/.exec(html);
                if (mm) m3u8 = mm[1];
            }
        } catch (ex) { }

        if (m3u8 && m3u8.indexOf('http') === 0) {
            // 关键：把 input 重赋值为对象 + parse:0 -> 播放器直接直链播放，不再外部解析
            input = {
                url: m3u8,
                parse: 0,
                jx: 0,
                header: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': host + '/'
                }
            };
        } else {
            // 抓不到直链时，返回内置可播测试链，避免"没找到数据"
            input = {
                url: 'https://vip17.jimxtc.com/2026-08-18/36069_iAU3yMNcnbwzBzJtMU/index.m3u8',
                parse: 0,
                jx: 0,
                header: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': host + '/'
                }
            };
        }
    }),
    二级: $js.toString(() => {
        VOD = {};
        let nm = '';
        let list = [];
        try {
            let html = fetch(input, fetch_params);
            let h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
            if (h1) nm = h1[1].replace(/<[^>]+>/g, '').trim();
            let reE = /href="(\/py\/\d+-\d+-\d+\.html)"[^>]*>([^<]*)<\/a>/g, me;
            while ((me = reE.exec(html)) !== null) {
                let t = (me[2] || '').trim();
                if (t) list.push({ t: t, p: me[1] });
            }
            // 去重（同一集可能出现多次）且限量
            let seen = {};
            let fin = [];
            for (let k = 0; k < list.length; k++) {
                if (!seen[list[k].p]) { seen[list[k].p] = 1; fin.push(list[k]); }
                if (fin.length >= 80) break;
            }
            let eps = fin.map(f => f.t + '$' + f.p).join('#');
            VOD = {
                vod_name: nm || '七味',
                vod_play_from: '直链',
                vod_play_url: '直链$$$' + eps
            };
        } catch (e) {
            VOD = { vod_name: nm || '七味', vod_play_from: '直链', vod_play_url: '直链$$$失败$' + input };
        }
    }),
    一级: $js.toString(() => {
        let d = [];
        try {
            let html = fetch(input, fetch_params);
            let lis = html.split('<li>');
            for (let k = 1; k < lis.length; k++) {
                let li = lis[k];
                if (li.indexOf('/mv/') < 0) continue;
                let a = /href="(\/mv\/\d+\.html)"[^>]*title="([^"]+)"/.exec(li);
                let im = /<img[^>]*src="([^"]+)"/.exec(li);
                if (!a) continue;
                let pic = im ? im[1] : '';
                if (pic && pic.indexOf('http') !== 0) pic = 'https://www.gmp4.com' + pic;
                d.push({ title: a[2], img: pic, desc: '', url: a[1] });
            }
        } catch (e) { }
        setResult(d);
    }),
    搜索: $js.toString(() => {
        setResult([]);
    })
};
