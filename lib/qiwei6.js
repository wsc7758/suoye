//======================================================================
// 七味网 (gmp4.com) - 自诊断版 (把故障点直接显示在详情页上, 不需要日志)
// 用法: 改个名字上传仓库, TVBox 里新增/替换该源, 点任意一部影片进详情页
//      然后把"详情页显示的 片名/备注/简介"内容发给我即可.
//======================================================================
var rule = {
    title: '七味gmp4诊断',
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
    timeout: 15000,
    play_parse: false,
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
    二级: $js.toString(() => {
        VOD = {};
        let S = { step: 'start', len: 0, tabs: '?', blocks: '?', resolved: 0, url: '' };
        try {
            let host = 'https://www.gmp4.com';
            let html = fetch(input, fetch_params);
            S.step = 'fetched'; S.len = (html || '').length;
            if (!html) throw new Error('fetch empty');
            S.tabs = (html.indexOf('py-tabs') >= 0) ? 'y' : 'n';
            S.blocks = String((html.match(/<ul class="player/g) || []).length);

            let h1r = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
            let name = h1r ? h1r[1].replace(/<[^>]+>/g, '').trim() : '';

            // 解析直链
            let reBlock = /<ul class="player[^"]*"[^>]*>([\s\S]*?)<\/ul>/g, bm;
            let blocks = [];
            while ((bm = reBlock.exec(html)) !== null) blocks.push(bm[1]);

            let froms = [], urls = [];
            for (let bi = 0; bi < blocks.length && urls.length === 0; bi++) {
                let eps = [];
                let reE = /href="(\/py\/\d+-\d+-\d+\.html)"[^>]*>([^<]*)<\/a>/g, me;
                while ((me = reE.exec(blocks[bi])) !== null) {
                    let t = me[2].trim();
                    if (t) eps.push(t + '$' + me[1]);
                }
                let list = [];
                for (let k = 0; k < Math.min(eps.length, 6); k++) {
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
                    S.resolved = list.length; S.url = list[0];
                    urls.push('直链$$$' + list.join('#'));
                    froms.push('直链');
                    break;
                }
            }
            S.step = 'built';

            // 无论如何都保证 VOD 有内容, 便于看诊断信息
            VOD = {
                vod_name: name || '(未取到片名)',
                // 诊断信息塞进 备注/简介, TVBox 详情页会显示
                vod_remarks: 'D1:' + S.step + ' len=' + S.len + ' tabs=' + S.tabs + ' blk=' + S.blocks + ' res=' + S.resolved,
                vod_content: '直链1=' + S.url,
                vod_year: '',
                vod_play_from: froms.join('$$$') || '无线路',
                vod_play_url: urls.join('$$$') || ('无线路$$$暂无$https://www.gmp4.com/')
            };
        } catch (e) {
            S.step = 'ERR:' + e.message;
            VOD = {
                vod_name: '(二级异常)',
                vod_remarks: 'D1:' + S.step + ' len=' + S.len,
                vod_content: '请把此页字幕发给我',
                vod_play_from: '无线路',
                vod_play_url: '无线路$$$暂无$https://www.gmp4.com/'
            };
        }
    }),
    //------------------------------------------------------------------
    搜索: $js.toString(() => {
        setResult([]);
    })
};
