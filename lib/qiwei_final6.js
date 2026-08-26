var rule = {
    title: '七味字段诊断',
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
            vod_name: '二级执行了',
            vod_play_from: '测试源',
            vod_play_url: '测试源$$$测试集$https://v.fengbao11.com/video/emozhikou/8c62fd4eca05/index.m3u8'
        };
    }),
    一级: $js.toString(() => {
        let d = [];
        try {
            let html = fetch(input, fetch_params);
            // 诊断：检查 rule.二级 字段
            let erjiType = typeof rule.二级;
            let erjiPreview = '';
            if (erjiType === 'string') {
                erjiPreview = rule.二级.substring(0, 60).replace(/\n/g, '\\n');
            } else {
                erjiPreview = String(rule.二级);
            }
            let hasDetailUrl = typeof rule.detailUrl === 'string' ? rule.detailUrl : 'NO_detailUrl';
            let diagTag = '[二级=' + erjiType + '|' + erjiPreview + '|detailUrl=' + hasDetailUrl + ']';

            let lis = html.split('<li>');
            for (let k = 1; k < lis.length; k++) {
                let li = lis[k];
                if (li.indexOf('/mv/') < 0) continue;
                let a = /href="(\/mv\/\d+\.html)"[^>]*title="([^"]+)"/.exec(li);
                let im = /<img[^>]*src="([^"]+)"/.exec(li);
                if (!a) continue;
                let pic = im ? im[1] : '';
                if (pic && pic.indexOf('http') !== 0) pic = 'https://www.gmp4.com' + pic;
                // 第一个影片标题前加诊断标签
                let title = (k === 1 ? diagTag : '') + a[2];
                d.push({ title: title, img: pic, desc: '', url: a[1] });
            }
        } catch (e) {
            // 如果出错，把错误信息放进列表
            d.push({ title: '[一级异常:' + e.message + ']', img: '', desc: '', url: '/mv/1.html' });
        }
        setResult(d);
    }),
    搜索: $js.toString(() => {
        setResult([]);
    })
};
