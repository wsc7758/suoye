var rule = {
    title: '七味直达',
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
    play_parse: true,
    play_json: [],
    lazy: $js.toString(() => {
        let host = 'https://www.gmp4.com';
        // 已带 http 直链(m3u8/mp4)，直接交给播放器
        if (typeof input === 'string' && input.indexOf('http') === 0) {
            input = { url: input.split('$').pop(), parse: 0, jx: 0, header: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Referer': host + '/' } };
            return;
        }
        let u = /\/py\//.test(input) ? host + input : input;
        let m3u8 = '';
        try {
            let html = fetch(u, { method: 'get', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Referer': host + '/' } });
            let i = html.indexOf('var player_aaaa=');
            if (i >= 0) {
                let s = html.indexOf('{', i);
                let e = html.indexOf('</script>', i);
                if (e < 0) e = html.length;
                let obj = JSON.parse(html.slice(s, e));
                if (obj && obj.url) m3u8 = obj.url;
            }
            if (!m3u8) { let mm = /https?:\/\/[^"'\s<>]+?\.m3u8[^"'\s<>]*/.exec(html); if (mm) m3u8 = mm[1]; }
        } catch (ex) { }
        input = { url: m3u8 || '', parse: 0, jx: 0, header: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Referer': host + '/' } };
    }),
    二级: $js.toString(() => {
        VOD = {};
        let nm = '';
        let lines = [];
        try {
            let html = fetch(input, fetch_params);
            let h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
            if (h1) nm = h1[1].replace(/<[^>]+>/g, '').trim();
            // 收集播放集(去重)
            let seen = {}, eps = [], me;
            let reE = /href="(\/py\/\d+-\d+-\d+\.html)"[^>]*>([^<]*)<\/a>/g;
            while ((me = reE.exec(html)) !== null) {
                let t = (me[2] || '').trim();
                if (t && !seen[me[1]]) { seen[me[1]] = 1; eps.push({ t: t, p: me[1] }); }
            }
            // 逐集解析真实直链(限60集防超时)
            let cap = eps.length > 60 ? 60 : eps.length;
            for (let k = 0; k < cap; k++) {
                let u = '';
                try {
                    let ph = fetch('https://www.gmp4.com' + eps[k].p, fetch_params);
                    let i = ph.indexOf('var player_aaaa=');
                    if (i >= 0) {
                        let s = ph.indexOf('{', i);
                        let e = ph.indexOf('</script>', i);
                        if (e < 0) e = ph.length;
                        let obj = JSON.parse(ph.slice(s, e));
                        if (obj && obj.url && obj.url.indexOf('http') === 0) u = obj.url;
                    }
                    if (!u) { let mm = /https?:\/\/[^"'\s<>]+?\.m3u8[^"'\s<>]*/.exec(ph); if (mm) u = mm[1]; }
                } catch (ex) { }
                lines.push(eps[k].t + '$' + (u || eps[k].p));
            }
        } catch (e) {
            nm = nm || '七味';
        }
        if (lines.length === 0) lines = ['暂无' + '$' + (input || '')];
        VOD = {
            vod_name: nm || '七味',
            vod_play_from: '直链',
            vod_play_url: '直链$$$' + lines.join('#')
        };
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
