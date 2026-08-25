//======================================================================
// 七味网 (gmp4.com) - 直链预解析版 (免 lazy / 免 parse)
// 站点: https://www.gmp4.com
// 方案说明:
//   放弃"lazy 免嗅探" (该层在 FongMi/TVBox 里行为不可控, 常导致"没有找到数据"),
//   改为在 二级 里直接把每个分集的真实 m3u8 解出来, 填成普通可播地址.
//   play_parse:false -> 引擎不调用 lazy, 播放器拿到真实 m3u8 直连开播.
//   附赠: Accept-Encoding 强制明文, 避开 gzip 乱码.
//======================================================================
var rule = {
    title: '七味gmp4直链',
    host: 'https://www.gmp4.com',
    url: '/vt/fyclass-fypage.html',
    detailUrl: '/mv/fyid.html',
    searchable: 0,
    quickSearch: 0,
    filterable: 0,
    class_name: '电影&剧集&综艺&动漫&短剧',
    class_url: '1&2&3&4&30',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Referer': 'https://www.gmp4.com/',
        'Accept-Encoding': 'identity'
    },
    timeout: 8000,
    play_parse: false,      // 关键: 关闭 lazy 免嗅, 播放器直接用 二级 里的真实直链
    //------------------------------------------------------------------
    一级: $js.toString(() => {
        let d = [];
        try {
            let html = fetch(input, fetch_params);
            let uls = html.match(/<ul class="content-list"[\s\S]*?<\/ul>/);
            let ul = uls ? uls[0] : html;
            let lis = ul.split(/<li>/);
            for (let k = 1; k < lis.length; k++) {
                let li = lis[k];
                if (li.indexOf('/mv/') < 0) continue;
                let a = /href="(\/mv\/\d+\.html)"[^>]*title="([^"]+)"/.exec(li);
                let im = /<img[^>]*src="([^"]+)"/.exec(li);
                if (!a) continue;
                let pic = im ? im[1] : '';
                if (pic.indexOf('http') !== 0) pic = (pic.charAt(0) === '/' ? 'https://www.gmp4.com' + pic : '');
                d.push({ title: a[2], img: pic, desc: '', url: a[1] });
            }
        } catch (e) { }
        setResult(d);
    }),
    //------------------------------------------------------------------
    // 二级: 详情 + 直链预解析
    // 取第一条能解出直链的线路, 解析其全部分集的真实 m3u8
    //------------------------------------------------------------------
    二级: $js.toString(() => {
        VOD = {};
        try {
            let host = 'https://www.gmp4.com';
            let html = fetch(input, fetch_params);

            // 标题
            let h1r = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
            let name = h1r ? h1r[1].replace(/<[^>]+>/g, '').trim() : '';
            let yr = /\((\d{4})\)/.exec(name);
            let year = yr ? yr[1] : '';

            // 分集块
            let blocks = [];
            let reBlock = /<ul class="player[^"]*"[^>]*>([\s\S]*?)<\/ul>/g, bm;
            while ((bm = reBlock.exec(html)) !== null) blocks.push(bm[1]);

            let play_from = '', play_url = '';
            for (let bi = 0; bi < blocks.length && !play_url; bi++) {
                let block = blocks[bi];
                let eps = [];
                let reE = /href="(\/py\/\d+-\d+-\d+\.html)"[^>]*>([^<]*)<\/a>/g, me;
                while ((me = reE.exec(block)) !== null) {
                    let t = me[2].trim();
                    if (t) eps.push(t + '$' + me[1]);
                }
                if (eps.length === 0) continue;

                // 逐个解析真实 m3u8 (限制数量防过慢)
                let cap = Math.min(eps.length, 60);
                let list = [];
                for (let k = 0; k < cap; k++) {
                    let pu = eps[k].split('$')[1];
                    let m3u8 = '';
                    try {
                        let ph = fetch(host + pu, fetch_params);
                        let i = ph.indexOf('var player_aaaa=');
                        if (i >= 0) {
                            let s = ph.indexOf('{', i), e = ph.indexOf('</script>', i);
                            if (e < 0) e = ph.length;
                            let obj = JSON.parse(ph.slice(s, e));
                            m3u8 = (obj && obj.url) || '';
                        }
                    } catch (ex) { m3u8 = ''; }
                    if (m3u8) list.push(eps[k].split('$')[0] + '$' + m3u8);
                }
                if (list.length > 0) {
                    play_from = '直链';
                    play_url = '直链$$$' + list.join('#');
                }
            }

            VOD = {
                vod_name: name.replace('(' + year + ')', '') || name,
                vod_year: year,
                vod_play_from: play_from,
                vod_play_url: play_url
            };
        } catch (e) { VOD = {}; }
    }),
    //------------------------------------------------------------------
    搜索: $js.toString(() => {
        setResult([]);
    })
};
