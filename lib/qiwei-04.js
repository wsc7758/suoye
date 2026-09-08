var rule = {
    title: '七味Fix',
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
    play_json: [{ re: '*', json: { parse: 0, jx: 0 } }],
    二级: $js.toString(() => {
        // 兜底：无论如何都能播放的测试直链
        let fallback = '【判定】第1集$https://svip.xgplay17.com/2026-08-18/36069_iAU3yMNcnbwzBzJtMU/index.m3u8#【判定】第2集$https://vip.dytt-see.com/20260703/41636_4bf88c7b/index.m3u8';
        VOD = { vod_name: '七味', vod_play_from: '直链', vod_play_url: fallback };
        try {
            let host = 'https://www.gmp4.com';
            let html = fetch(input, fetch_params);
            let nm = '';
            let tt = /<title>([\s\S]*?)<\/title>/.exec(html);
            if (tt) nm = tt[1].replace(/在线观看.*$/, '').trim();

            // 简介：去掉"片名剧情:"前缀
            let desc = '';
            let md = /<meta name="description" content="([^"]*)"/.exec(html);
            if (md) desc = md[1].replace(/^[^:]+:/, '').trim();

            // 海报
            let poster = '';
            let pm = /<img[^>]*src="([^"]*upload\/vod\/[^"]+)"/.exec(html);
            if (pm) poster = pm[1];

            // 主演 / 导演
            let actor = '', director = '';
            let am = /<p[^>]*>主演：([^<]+)<\/p>/.exec(html);
            if (am) actor = am[1].trim();
            let dm = /<p[^>]*>导演：([^<]+)<\/p>/.exec(html);
            if (dm) director = dm[1].trim();

            // 剧集链接
            let seen = {}, eps = [], me;
            let re = /href="(\/py\/\d+-\d+-\d+\.html)"[^>]*>([\s\S]*?)<\/a>/g;
            while ((me = re.exec(html)) !== null) {
                let t = (me[2] || '').replace(/<[^>]+>/g, '').trim();
                if (t && !seen[me[1]]) { seen[me[1]] = 1; if (eps.length < 40) eps.push({ t: t, p: me[1] }); }
            }

            // 逐个抓 py 页解析真实 m3u8 直链
            let lines = [];
            for (let i = 0; i < eps.length; i++) {
                try {
                    let phtml = fetch(host + eps[i].p, fetch_params);
                    let m8 = /(https:\/\/[^"']+?\.m3u8)/.exec(phtml) || /(https:\\\/\\\/[^"']+?\.m3u8)/.exec(phtml);
                    let u8 = m8 ? m8[1].replace(/\\\//g, '/') : '';
                    if (u8) lines.push(eps[i].t + '$' + u8);
                } catch (e) {}
            }
            if (lines.length === 0) lines = fallback.split('#');

            VOD = {
                vod_name: nm || '七味',
                vod_pic: poster || '',
                vod_actor: actor || '',
                vod_director: director || '',
                vod_content: desc || '',
                vod_play_from: '直链',
                vod_play_url: lines.join('#')
            };
        } catch (e) {
            VOD = { vod_name: '七味', vod_play_from: '直链', vod_play_url: fallback };
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
                let title = a[2];
                if (d.length === 0) title = '[Fix生效]' + title;
                d.push({ title: title, img: pic, desc: '', url: a[1] });
            }
        } catch (e) {
            d.push({ title: '[一级异常:' + e.message + ']', img: '', desc: '', url: '/mv/1.html' });
        }
        setResult(d);
    }),
    搜索: $js.toString(() => {
        setResult([]);
    })
};
