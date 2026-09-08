var rule = {
    title: '七味判定2',
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
    play_parse: true,
    play_json: [{ re: '*', json: { parse: 0, jx: 0 } }],
    lazy: $js.toString(() => {
        let host = 'https://www.gmp4.com';
        let ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        let m3u8 = '';
        if (typeof input === 'string' && input.indexOf('http') === 0) {
            let mm = /https?:\/\/[^#\s]+/.exec(input);
            m3u8 = mm ? mm[0] : input;
        }
        input = { url: m3u8 || input, parse: 0, jx: 0, header: { 'User-Agent': ua, 'Referer': host + '/' } };
    }),
    二级: $js.toString(() => {
        // ===== 判定版：二级完全不访问网络，直接返回写死的两条可播直链 =====
        VOD = {
            vod_name: '七味-二级判定',
            vod_play_from: '直链',
            vod_play_url: '直链$$$【判定】第1集$https://svip.xgplay17.com/2026-08-18/36069_iAU3yMNcnbwzBzJtMU/index.m3u8#【判定】第2集$https://vip.dytt-see.com/20260703/41636_4bf88c7b/index.m3u8'
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
