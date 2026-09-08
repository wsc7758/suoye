var rule = {
    title: '七味快',
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
    timeout: 20000,
    play_parse: true,
    play_json: [],
    // lazy 会经 $js.toString 转成“语句”后被 eval，函数体严禁顶层 return
    lazy: $js.toString(() => {
        let host = 'https://www.gmp4.com';
        let ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        let m3u8 = '';
        if (typeof input === 'string' && input.indexOf('http') === 0) {
            // 已是 http 开头的地址，防重复解析（可能含域名）
            let mm = /https?:\/\/[^#\s]+/.exec(input);
            m3u8 = mm ? mm[0] : input;
        } else {
            // input 是播放页路径 /py/xxx-sid-nid.html，先去抓直链
            let u = /\/py\//.test(input) ? host + input : input;
            try {
                let html = fetch(u, { method: 'get', headers: { 'User-Agent': ua, 'Referer': host + '/' } });
                let i = html.indexOf('var player_aaaa=');
                if (i >= 0) {
                    let s = html.indexOf('{', i);
                    let e = html.indexOf('</script>', i);
                    if (e < 0) e = html.length;
                    let obj = JSON.parse(html.slice(s, e));
                    if (obj && obj.url && obj.url.indexOf('http') === 0) m3u8 = obj.url;
                }
                if (!m3u8) {
                    let mm = /https?:\/\/[^"'\s<>]+?\.m3u8[^"'\s<>]*/.exec(html);
                    if (mm) m3u8 = mm[1];
                }
            } catch (ex) { }
        }
        // 关键：把 input 重赋值成对象 + parse:0 => 直链播放，不再外部解析
        input = {
            url: m3u8,
            parse: 0,
            jx: 0,
            header: { 'User-Agent': ua, 'Referer': host + '/' }
        };
    }),
    二级: $js.toString(() => {
        VOD = {};
        try {
            let html = fetch(input, fetch_params);
            let h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
            let nm = h1 ? h1[1].replace(/<[^>]+>/g, '').trim() : '';
            let seen = {}, lines = [], me;
            let reE = /href="(\/py\/\d+-\d+-\d+\.html)"[^>]*>([^<]*)<\/a>/g;
            while ((me = reE.exec(html)) !== null) {
                let t = (me[2] || '').trim();
                if (t && !seen[me[1]]) { seen[me[1]] = 1; lines.push(t + '$' + me[1]); }
                if (lines.length >= 80) break;
            }
            if (lines.length === 0) lines[0] = '暂无' + '$' + input;
            VOD = {
                vod_name: nm || '七味',
                vod_play_from: '直链',
                vod_play_url: '直链$$$' + lines.join('#')
            };
        } catch (e) {
            VOD = {
                vod_name: '七味',
                vod_play_from: '直链',
                vod_play_url: '直链$$$失败$' + input
            };
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
