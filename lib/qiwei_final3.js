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
    timeout: 30000,
    play_parse: false,
    二级: $js.toString(() => {
        VOD = {
            vod_name: '诊断OK-LOCK',
            vod_play_from: '测试直链',
            vod_play_url: '测试直链$$$试播$https://v.fengbao11.com/video/emozhikou/8c62fd4eca05/index.m3u8'
        };
        try {
            let html = fetch(input, fetch_params);
            // 提取标题
            let h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
            let nm = '';
            if (h1) nm = h1[1].replace(/<[^>]+>/g, '').trim();
            // 提取海报
            let pic = '';
            let picRe = /<img[^>]*data-original="([^"]+)"[^>]*>/.exec(html) || /<div[^>]*class="[^"]*pic[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"/.exec(html);
            if (picRe) pic = picRe[1];
            if (pic && pic.indexOf('http') !== 0) pic = 'https://www.gmp4.com' + pic;
            // 提取所有播放源 ul
            let blocks = [];
            let reBlock = /<ul class="player[^"]*"[^>]*>([\s\S]*?)<\/ul>/g, bm;
            while ((bm = reBlock.exec(html)) !== null) blocks.push(bm[1]);

            let found = false;
            // 遍历所有播放源，找到第一个有有效 m3u8 直链的源
            for (let bi = 0; bi < blocks.length && !found; bi++) {
                let eps = [];
                // 兼容链接文本中含嵌套标签的情况
                let reE = /href="(\/py\/\d+-\d+-\d+\.html)"[^>]*>([\s\S]*?)<\/a>/g, me;
                while ((me = reE.exec(blocks[bi])) !== null) {
                    let t = (me[2] || '').replace(/<[^>]+>/g, '').trim();
                    if (t) eps.push({ t: t, p: me[1] });
                }
                if (eps.length === 0) continue;

                let list = [];
                for (let k = 0; k < Math.min(eps.length, 30); k++) {
                    let ph = '', m3u8 = '';
                    try {
                        ph = fetch('https://www.gmp4.com' + eps[k].p, fetch_params);
                    } catch (e2) { ph = ''; }
                    if (!ph) continue;

                    // 健壮解析 player_aaaa：花括号深度匹配，避免 </script> 边界问题
                    let i = ph.indexOf('var player_aaaa=');
                    if (i < 0) continue;
                    try {
                        let s = ph.indexOf('{', i);
                        if (s < 0) continue;
                        let depth = 0, e = s;
                        for (let j = s; j < ph.length; j++) {
                            if (ph[j] === '{') depth++;
                            else if (ph[j] === '}') { depth--; if (depth === 0) { e = j + 1; break; } }
                        }
                        let obj = JSON.parse(ph.slice(s, e));
                        // 只接受 m3u8 直链，过滤需要网页解析的地址
                        if (obj && obj.url && /\.m3u8(\?|$)/i.test(obj.url)) {
                            m3u8 = obj.url;
                        }
                    } catch (e3) { m3u8 = ''; }

                    if (m3u8) list.push(eps[k].t + '$' + m3u8);
                }

                if (list.length > 0) {
                    VOD = {
                        vod_name: nm || '七味视频',
                        vod_pic: pic,
                        vod_play_from: '直链',
                        vod_play_url: '直链$$$' + list.join('#')
                    };
                    found = true;
                }
            }
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
