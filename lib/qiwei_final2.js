var rule = {
    title: '七味LOCK',
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
    play_parse: false,
    二级: $js.toString(() => {
        VOD = {
            vod_name: '诊断OK-LOCK',
            vod_play_from: '测试直链',
            vod_play_url: '测试直链$$$试播$https://v.fengbao11.com/video/emozhikou/8c62fd4eca05/index.m3u8'
        };
        try {
            let html = fetch(input, fetch_params);
            let h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
            let nm = '';
            if (h1) nm = h1[1].replace(/<[^>]+>/g, '').trim();
            let blocks = [];
            let reBlock = /<ul class="player[^"]*"[^>]*>([\s\S]*?)<\/ul>/g, bm;
            while ((bm = reBlock.exec(html)) !== null) blocks.push(bm[1]);
            let list = [];
            for (let bi = 0; bi < blocks.length && list.length < 1; bi++) {
                let eps = [];
                let reE = /href="(\/py\/\d+-\d+-\d+\.html)"[^>]*>([^<]*)<\/a>/g, me;
                while ((me = reE.exec(blocks[bi])) !== null) {
                    let t = (me[2] || '').trim();
                    if (t) eps.push({ t: t, p: me[1] });
                }
                for (let k = 0; k < Math.min(eps.length, 30); k++) {
                    let ph = '', m3u8 = '';
                    try { ph = fetch('https://www.gmp4.com' + eps[k].p, fetch_params); } catch (e2) { ph = ''; }
                    let i = ph.indexOf('var player_aaaa=');
                    if (i >= 0) {
                        try {
                            let s = ph.indexOf('{', i);
                            let e = ph.indexOf('</script>', i);
                            if (e < 0) e = ph.length;
                            let obj = JSON.parse(ph.slice(s, e));
                            if (obj && obj.url) m3u8 = obj.url;
                        } catch (e3) { m3u8 = ''; }
                    }
                    if (m3u8) list.push(eps[k].t + '$' + m3u8);
                }
            }
            let vod = {
                vod_name: nm || '诊断OK-LOCK',
                vod_play_from: '直链',
                vod_play_url: '直链$$$' + list.join('#')
            };
            if (list.length > 0) VOD = vod;
        } catch (e) { }
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
