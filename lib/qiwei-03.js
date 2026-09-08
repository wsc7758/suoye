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
        // 关键：与能用的采集源一致——vod_play_url 不带线路名前缀，分集$url用#连接
        VOD = {
            vod_name: '七味Fix-二级成功',
            vod_play_from: '直链',
            vod_play_url: '【判定】第1集$https://svip.xgplay17.com/2026-08-18/36069_iAU3yMNcnbwzBzJtMU/index.m3u8#【判定】第2集$https://vip.dytt-see.com/20260703/41636_4bf88c7b/index.m3u8'
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
