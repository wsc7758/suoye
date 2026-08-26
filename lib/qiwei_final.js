/**
 * 七味网 gmp4.com - 最终稳定版 (直链预解析, 不走 lazy)
 * 标题带 NEW 是为了让你在 TVBox 数据源列表里一眼确认加载的是新版
 */
var rule = {
    title: '七味NEW',
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
    timeout: 15000,
    play_parse: false,
    //------------------------------------------------------------------
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
    //------------------------------------------------------------------
    二级: $js.toString(() => {
        VOD = {};
        try {
            let html = fetch(input, fetch_params);
            let nm = '';
            let h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
            if (h1) nm = h1[1].replace(/<[^>]+>/g, '').trim();

            let eps = [];
            let blk = /<ul class="player[^"]*"[^>]*>([\s\S]*?)<\/ul>/.exec(html);
            if (blk) {
                let re = /href="(\/py\/\d+-\d+-\d+\.html)"[^>]*>([^<]*)<\/a>/g, m;
                while ((m = re.exec(blk[1])) !== null) {
                    let t = (m[2] || '').trim();
                    if (t) eps.push({ t: t, p: m[1] });
                }
            }

            let list = [];
            let cap = Math.min(eps.length, 50);
            for (let k = 0; k < cap; k++) {
                let pu = 'https://www.gmp4.com' + eps[k].p;
                let ph = '', m3u8 = '';
                try { ph = fetch(pu, fetch_params); } catch (e2) { ph = ''; }
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

            VOD = {
                vod_name: nm || '七味影片',
                vod_play_from: '直链',
                vod_play_url: '直链$$$' + list.join('#')
            };
        } catch (e) {
            VOD = { vod_name: '二级异常:' + e.message, vod_play_from: '', vod_play_url: '' };
        }
    }),
    //------------------------------------------------------------------
    搜索: $js.toString(() => {
        setResult([]);
    })
};
