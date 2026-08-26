var rule = {
    title: '七味诊断',
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
        // 诊断版本：每一步状态都记录到 vod_name 中
        let diag = [];
        diag.push('input=' + (typeof input));
        try { diag.push('inputVal=' + String(input).substring(0, 80)); } catch(e) { diag.push('inputErr=' + e.message); }

        VOD = {
            vod_name: '诊断:初始化OK',
            vod_play_from: '诊断源',
            vod_play_url: '诊断源$$$步骤0$https://v.fengbao11.com/video/emozhikou/8c62fd4eca05/index.m3u8'
        };

        try {
            diag.push('fetch_params类型=' + (typeof fetch_params));
            let html = '';
            try {
                html = fetch(input, fetch_params);
                diag.push('fetch成功,长度=' + (html ? html.length : 0));
            } catch (ef) {
                diag.push('fetch异常=' + ef.message);
                html = '';
            }

            if (!html || html.length === 0) {
                VOD.vod_name = '诊断:fetch返回空|' + diag.join('|');
                return;
            }

            // 检查是否是404页面
            if (html.indexOf('404') >= 0 && html.length < 5000) {
                diag.push('可能404');
            }

            let h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
            let nm = '';
            if (h1) {
                nm = h1[1].replace(/<[^>]+>/g, '').trim();
                diag.push('h1=' + nm);
            } else {
                diag.push('h1未匹配');
            }

            let blocks = [];
            let reBlock = /<ul class="player[^"]*"[^>]*>([\s\S]*?)<\/ul>/g, bm;
            while ((bm = reBlock.exec(html)) !== null) blocks.push(bm[1]);
            diag.push('播放源ul数量=' + blocks.length);

            if (blocks.length === 0) {
                // 尝试更宽松的匹配
                let loose = /<ul[^>]*class="[^"]*player[^"]*"[^>]*>/.exec(html);
                diag.push('宽松匹配ul=' + (loose ? '有' : '无'));
                VOD.vod_name = '诊断:无播放源|' + diag.join('|');
                VOD.vod_play_url = '诊断源$$$无播放源$https://v.fengbao11.com/video/emozhikou/8c62fd4eca05/index.m3u8';
                return;
            }

            let found = false;
            for (let bi = 0; bi < blocks.length && !found; bi++) {
                let eps = [];
                let reE = /href="(\/py\/\d+-\d+-\d+\.html)"[^>]*>([\s\S]*?)<\/a>/g, me;
                while ((me = reE.exec(blocks[bi])) !== null) {
                    let t = (me[2] || '').replace(/<[^>]+>/g, '').trim();
                    if (t) eps.push({ t: t, p: me[1] });
                }
                diag.push('源' + (bi+1) + '集数=' + eps.length);

                if (eps.length === 0) continue;

                let list = [];
                for (let k = 0; k < Math.min(eps.length, 5); k++) {
                    let ph = '', m3u8 = '';
                    try {
                        ph = fetch('https://www.gmp4.com' + eps[k].p, fetch_params);
                    } catch (e2) {
                        diag.push('源' + (bi+1) + '集' + k + 'fetch异常=' + e2.message);
                        ph = '';
                    }
                    if (!ph) {
                        diag.push('源' + (bi+1) + '集' + k + '播放页空');
                        continue;
                    }
                    diag.push('源' + (bi+1) + '集' + k + '播放页长度=' + ph.length);

                    let i = ph.indexOf('var player_aaaa=');
                    if (i < 0) {
                        diag.push('源' + (bi+1) + '集' + k + '无player_aaaa');
                        // 尝试其他变量名
                        if (ph.indexOf('player_aaaa') >= 0) diag.push('但含player_aaaa字符串');
                        continue;
                    }
                    try {
                        let s = ph.indexOf('{', i);
                        let depth = 0, e = s;
                        for (let j = s; j < ph.length; j++) {
                            if (ph[j] === '{') depth++;
                            else if (ph[j] === '}') { depth--; if (depth === 0) { e = j + 1; break; } }
                        }
                        let jsonStr = ph.slice(s, e);
                        let obj = JSON.parse(jsonStr);
                        if (obj && obj.url) {
                            m3u8 = obj.url;
                            diag.push('源' + (bi+1) + '集' + k + 'url=' + m3u8.substring(0, 60));
                        } else {
                            diag.push('源' + (bi+1) + '集' + k + 'obj无url字段,keys=' + Object.keys(obj).join(','));
                        }
                    } catch (e3) {
                        diag.push('源' + (bi+1) + '集' + k + 'JSON异常=' + e3.message);
                        m3u8 = '';
                    }

                    if (m3u8) list.push(eps[k].t + '$' + m3u8);
                }

                if (list.length > 0) {
                    VOD = {
                        vod_name: nm || ('诊断:源' + (bi+1)),
                        vod_play_from: '直链',
                        vod_play_url: '直链$$$' + list.join('#')
                    };
                    found = true;
                    diag.push('最终成功:源' + (bi+1) + ',集数=' + list.length);
                }
            }

            if (!found) {
                VOD.vod_name = '诊断:全部源失败|' + diag.join('|');
                VOD.vod_play_from = '诊断源';
                VOD.vod_play_url = '诊断源$$$全部失败$https://v.fengbao11.com/video/emozhikou/8c62fd4eca05/index.m3u8';
            }
        } catch (e) {
            diag.push('外层异常=' + e.message);
            VOD.vod_name = '诊断:外层异常|' + diag.join('|');
            VOD.vod_play_from = '诊断源';
            VOD.vod_play_url = '诊断源$$$外层异常$https://v.fengbao11.com/video/emozhikou/8c62fd4eca05/index.m3u8';
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
                d.push({ title: a[2], img: pic, desc: '', url: a[1] });
            }
        } catch (e) { }
        setResult(d);
    }),
    搜索: $js.toString(() => {
        setResult([]);
    })
};
