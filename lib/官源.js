//共享五大站采集 - drpy2规则
//采集腾讯/爱奇艺/优酷/芒果/B站资源,调用本地代理解析播放
var rule = {
    title: '共享五大站',
    host: 'http://cj.10010888.xyz',
    url: '/api.php/provide/vod/?ac=list&pg=fypage&t=fyclass',
    searchUrl: '/api.php/provide/vod/?ac=detail&wd=**&pg=fypage',
    detailUrl: '/api.php/provide/vod/?ac=detail&ids=fyid',
    searchable: 2,
    quickSearch: 0,
    filterable: 1,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
    },
    timeout: 5000,
    class_name: '电影&连续剧&综艺&动漫&少儿&纪录片&短剧',
    class_url: '1&2&3&4&5&6&7',
    play_parse: true,
    lazy: $js.toString(() => {
        try {
            let api = "http://127.0.0.1:9978/proxy?do=seachdanmu&go=getuserjx&url=" + input.split("?")[0];
            let response = fetch(api, {
                method: 'get',
                headers: {
                    'User-Agent': 'okhttp/3.14.9',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            let bata = JSON.parse(response);
            if (bata.url.includes("http")) {
                input = {
                    header: {
                        'User-Agent': ""
                    },
                    parse: 0,
                    url: bata.url,
                    jx: 0,
                    danmaku: 'http://127.0.0.1:9978/proxy?do=danmu&site=js&url=http://dm.qxq6.com/zy/api.php?url=' + input.split("?")[0]
                };
            } else {
                input = {
                    header: {
                        'User-Agent': ""
                    },
                    parse: 0,
                    url: input.split("?")[0],
                    jx: 1,
                    danmaku: 'http://127.0.0.1:9978/proxy?do=danmu&site=js&url=http://dm.qxq6.com/zy/api.php?url=' + input.split("?")[0]
                };
            }
        } catch {
            input = {
                header: {
                    'User-Agent': ""
                },
                parse: 0,
                url: input.split("?")[0],
                jx: 1,
                danmaku: 'http://127.0.0.1:9978/proxy?do=danmu&site=js&url=http://dm.qxq6.com/zy/api.php?url=' + input.split("?")[0]
            };
        }
    }),
    一级: $js.toString(() => {
        let d = [];
        let html = fetch(input, fetch_params);
        let json = JSON.parse(html);
        let ban = ['博彩', '棋牌', '彩票', '电玩', '赌博', '澳门', '赌场', '皇冠', '六合彩', '时时彩'];
        json.list.forEach(function(item) {
            let name = item.vod_name || '';
            let isBanned = false;
            for (let i = 0; i < ban.length; i++) {
                if (name.indexOf(ban[i]) >= 0) {
                    isBanned = true;
                    break;
                }
            }
            if (!isBanned) {
                d.push({
                    title: item.vod_name,
                    img: item.vod_pic || '',
                    desc: item.vod_remarks || '',
                    url: item.vod_id
                });
            }
        });
        setResult(d);
    }),
    二级: $js.toString(() => {
        VOD = {};
        let html = fetch(input, fetch_params);
        let json = JSON.parse(html);
        if (json.list && json.list.length > 0) {
            let data = json.list[0];
            VOD = {
                vod_name: data.vod_name,
                vod_pic: data.vod_pic || '',
                vod_year: data.vod_year || '',
                vod_area: data.vod_area || '',
                vod_director: data.vod_director || '',
                vod_actor: data.vod_actor || '',
                vod_content: data.vod_content || '',
                vod_remarks: data.vod_remarks || '',
                vod_play_from: data.vod_play_from || '',
                vod_play_url: data.vod_play_url || ''
            };
        }
    }),
    搜索: $js.toString(() => {
        let d = [];
        let html = fetch(input, fetch_params);
        let json = JSON.parse(html);
        let ban = ['博彩', '棋牌', '彩票', '电玩', '赌博', '澳门', '赌场', '皇冠', '六合彩', '时时彩'];
        json.list.forEach(function(item) {
            let name = item.vod_name || '';
            let isBanned = false;
            for (let i = 0; i < ban.length; i++) {
                if (name.indexOf(ban[i]) >= 0) {
                    isBanned = true;
                    break;
                }
            }
            if (!isBanned) {
                d.push({
                    title: item.vod_name,
                    img: item.vod_pic || '',
                    desc: item.vod_remarks || '',
                    url: item.vod_id
                });
            }
        });
        setResult(d);
    })
}
