//小心儿悠悠 -- 修复版
//修复: union.video.qq.com/fcgi-bin/data 接口已被腾讯封禁(key all illegal),多集取数改为基于仍可用的 detail 接口
//修复: get_playsource 超时问题,统一走本地代理解析链路(127.0.0.1:9978)
var rule = {
    title: '腾讯视频',
    host: 'https://v.qq.com',
    homeUrl: '/x/bu/pagesheet/list?_all=1&append=1&channel=cartoon&listpage=1&offset=0&pagesize=21&iarea=-1&sort=18',
    detailUrl: 'https://node.video.qq.com/x/api/float_vinfo2?cid=fyid',
    searchUrl: '**',
    searchable: 2,
    filterable: 1,
    multi: 1,
    url: '/x/bu/pagesheet/list?_all=1&append=1&channel=fyclass&listpage=1&offset=((fypage-1)*21)&pagesize=21&iarea=-1',
    filter_url: 'sort={{fl.sort or 75}}&iyear={{fl.iyear}}&year={{fl.year}}&itype={{fl.type}}&ifeature={{fl.feature}}&iarea={{fl.area}}&itrailer={{fl.itrailer}}&gender={{fl.sex}}',
    filter:{"choice":[{"key":"sort","name":"排序","value":[{"n":"最热","v":"75"},{"n":"最新","v":"83"},{"n":"好评","v":"81"}]},{"key":"iyear","name":"年代","value":[{"n":"全部","v":"-1"},{"n":"2025","v":"2025"},{"n":"2024","v":"2024"},{"n":"2023","v":"2023"},{"n":"2022","v":"2022"},{"n":"2021","v":"2021"},{"n":"2020","v":"2020"},{"n":"2019","v":"2019"},{"n":"2018","v":"2018"},{"n":"2017","v":"2017"},{"n":"2016","v":"2016"},{"n":"2015","v":"2015"}]}],"tv":[{"key":"sort","name":"排序","value":[{"n":"最热","v":"75"},{"n":"最新","v":"79"},{"n":"好评","v":"16"}]},{"key":"feature","name":"类型","value":[{"n":"全部","v":"-1"},{"n":"爱情","v":"1"},{"n":"古装","v":"2"},{"n":"悬疑","v":"3"},{"n":"都市","v":"4"},{"n":"家庭","v":"5"},{"n":"喜剧","v":"6"},{"n":"传奇","v":"7"},{"n":"武侠","v":"8"},{"n":"军旅","v":"9"},{"n":"权谋","v":"10"},{"n":"革命","v":"11"},{"n":"现实","v":"13"},{"n":"青春","v":"14"},{"n":"猎奇","v":"15"},{"n":"科幻","v":"16"},{"n":"竞技","v":"17"},{"n":"玄幻","v":"18"}]},{"key":"iyear","name":"年代","value":[{"n":"全部","v":"-1"},{"n":"2025","v":"2025"},{"n":"2024","v":"2024"},{"n":"2023","v":"2023"},{"n":"2022","v":"2022"},{"n":"2021","v":"2021"},{"n":"2020","v":"2020"},{"n":"2019","v":"2019"},{"n":"2018","v":"2018"},{"n":"2017","v":"2017"},{"n":"2016","v":"2016"},{"n":"2015","v":"2015"}]}],"movie":[{"key":"sort","name":"排序","value":[{"n":"最热","v":"75"},{"n":"最新","v":"83"},{"n":"好评","v":"81"}]},{"key":"type","name":"类型","value":[{"n":"全部","v":"-1"},{"n":"犯罪","v":"4"},{"n":"励志","v":"2"},{"n":"喜剧","v":"100004"},{"n":"热血","v":"100061"},{"n":"悬疑","v":"100009"},{"n":"爱情","v":"100005"},{"n":"科幻","v":"100012"},{"n":"恐怖","v":"100010"},{"n":"动画","v":"100015"},{"n":"战争","v":"100006"},{"n":"家庭","v":"100017"},{"n":"剧情","v":"100022"},{"n":"奇幻","v":"100016"},{"n":"武侠","v":"100011"},{"n":"历史","v":"100021"},{"n":"老片","v":"100013"},{"n":"西部","v":"3"},{"n":"记录片","v":"100020"}]},{"key":"year","name":"年代","value":[{"n":"全部","v":"-1"},{"n":"2025","v":"2025"},{"n":"2024","v":"2024"},{"n":"2023","v":"2023"},{"n":"2022","v":"2022"},{"n":"2021","v":"2021"},{"n":"2020","v":"2020"},{"n":"2019","v":"2019"},{"n":"2018","v":"2018"},{"n":"2017","v":"2017"},{"n":"2016","v":"2016"},{"n":"2015","v":"2015"}]}],"variety":[{"key":"sort","name":"排序","value":[{"n":"最热","v":"75"},{"n":"最新","v":"23"}]},{"key":"iyear","name":"年代","value":[{"n":"全部","v":"-1"},{"n":"2025","v":"2025"},{"n":"2024","v":"2024"},{"n":"2023","v":"2023"},{"n":"2022","v":"2022"},{"n":"2021","v":"2021"},{"n":"2020","v":"2020"},{"n":"2019","v":"2019"},{"n":"2018","v":"2018"},{"n":"2017","v":"2017"},{"n":"2016","v":"2016"},{"n":"2015","v":"2015"}]}],"cartoon":[{"key":"sort","name":"排序","value":[{"n":"最热","v":"75"},{"n":"最新","v":"83"},{"n":"好评","v":"81"}]},{"key":"area","name":"地区","value":[{"n":"全部","v":"-1"},{"n":"内地","v":"1"},{"n":"日本","v":"2"},{"n":"欧美","v":"3"},{"n":"其他","v":"4"}]},{"key":"type","name":"类型","value":[{"n":"全部","v":"-1"},{"n":"玄幻","v":"9"},{"n":"科幻","v":"4"},{"n":"武侠","v":"13"},{"n":"冒险","v":"3"},{"n":"战斗","v":"5"},{"n":"搞笑","v":"1"},{"n":"恋爱","v":"7"},{"n":"魔幻","v":"6"},{"n":"竞技","v":"20"},{"n":"悬疑","v":"17"},{"n":"日常","v":"15"},{"n":"校园","v":"16"},{"n":"真人","v":"18"},{"n":"推理","v":"14"},{"n":"历史","v":"19"},{"n":"经典","v":"3"},{"n":"其他","v":"12"}]},{"key":"iyear","name":"年代","value":[{"n":"全部","v":"-1"},{"n":"2025","v":"2025"},{"n":"2024","v":"2024"},{"n":"2023","v":"2023"},{"n":"2022","v":"2022"},{"n":"2021","v":"2021"},{"n":"2020","v":"2020"},{"n":"2019","v":"2019"},{"n":"2018","v":"2018"},{"n":"2017","v":"2017"},{"n":"2016","v":"2016"},{"n":"2015","v":"2015"}]}],"child":[{"key":"sort","name":"排序","value":[{"n":"最热","v":"75"},{"n":"最新","v":"76"},{"n":"好评","v":"20"}]},{"key":"sex","name":"性别","value":[{"n":"全部","v":"-1"},{"n":"女孩","v":"1"},{"n":"男孩","v":"2"}]},{"key":"area","name":"地区","value":[{"n":"全部","v":"-1"},{"n":"内地","v":"3"},{"n":"日本","v":"2"},{"n":"其他","v":"1"}]},{"key":"iyear","name":"年龄段","value":[{"n":"全部","v":"-1"},{"n":"0-3岁","v":"1"},{"n":"4-6岁","v":"2"},{"n":"7-9岁","v":"3"},{"n":"10岁以上","v":"4"},{"n":"全年龄段","v":"7"}]}],"doco":[{"key":"sort","name":"排序","value":[{"n":"最热","v":"75"},{"n":"最新","v":"74"}]},{"key":"itrailer","name":"出品方","value":[{"n":"全部","v":"-1"},{"n":"BBC","v":"1"},{"n":"国家地理","v":"4"},{"n":"HBO","v":"3175"},{"n":"NHK","v":"2"},{"n":"历史频道","v":"7"},{"n":"ITV","v":"3530"},{"n":"探索频道","v":"3174"},{"n":"ZDC","v":"3176"},{"n":"腾讯自制","v":"15"},{"n":"合作机构","v":"6"},{"n":"其他","v":"5"}]},{"key":"type","name":"类型","value":[{"n":"全部","v":"-1"},{"n":"自然","v":"4"},{"n":"美食","v":"10"},{"n":"社会","v":"3"},{"n":"人文","v":"6"},{"n":"历史","v":"1"},{"n":"军事","v":"2"},{"n":"科技","v":"8"},{"n":"财经","v":"14"},{"n":"探险","v":"15"},{"n":"罪案","v":"7"},{"n":"竞技","v":"12"},{"n":"旅游","v":"11"}]}]},
    headers: {
        'User-Agent': 'PC_UA'
    },
    timeout: 5000,
    cate_exclude: '会员|游戏|全部',
    class_name: '精选&电影&电视剧&综艺&动漫&少儿&纪录片',
    class_url: 'choice&movie&tv&variety&cartoon&child&doco',
    limit: 20,
    play_parse: true,
    lazy: $js.toString(() => {
        // 统一走本地代理解析链路,避免 get_playsource 超时/union封禁
        let url = input.split("?")[0];
        input = {
            header: { 'User-Agent': "" },
            parse: 0,
            url: url,
            jx: 1,
            danmaku: 'http://127.0.0.1:9978/proxy?do=danmu&site=js&url=http://dm.qxq6.com/zy/api.php?url=' + url
        };
    }),
    推荐: '.list_item;img&&alt;img&&src;a&&Text;a&&data-float',
    一级: '.list_item;img&&alt;img&&src;a&&Text;a&&data-float',
    二级: $js.toString(() => {
        VOD = {};
        let d = [];
        let html = fetch(input, fetch_params);
        let cid = input.split("cid=")[1];
        cid = cid ? cid.split(/[?&]/)[0] : input.split("/")[3];
        let json;
        try { json = JSON.parse(html); } catch (e) { }
        if (json && json.c) {
            let c = json.c;
            VOD = {
                vod_url: input,
                vod_name: c.title,
                type_name: (json.typ || []).join(","),
                vod_actor: (json.nam || []).flat().join(","),
                vod_year: c.year,
                vod_content: c.description,
                vod_remarks: json.rec,
                vod_pic: urljoin2(input, c.pic)
            }
        }
        // 获取视频id列表(详情接口仍可用)
        let vids = (json && json.c && json.c.video_ids) || [];
        if (vids.length === 0 && json && json.c && json.c.vid) {
            vids = [json.c.vid];
        }
        if (vids.length === 1) {
            // 单集/电影,直接给在线播放,交由本地代理解析
            let vid = vids[0];
            d.push({
                title: json && json.c ? json.c.title : "在线播放",
                pic_url: (json && json.c && json.c.pic) || "",
                desc: "",
                url: "https://v.qq.com/x/cover/" + cid + "/" + vid + ".html"
            });
        } else if (vids.length > 1) {
            // 多集:不再调用已封禁的 union 接口,改用详情接口 video_ids 分集
            vids.forEach(function(vid, i) {
                d.push({
                    title: "第" + (i + 1) + "集",
                    pic_url: (json && json.c && json.c.pic) || "",
                    desc: "",
                    url: "https://v.qq.com/x/cover/" + cid + "/" + vid + ".html"
                });
            });
        }
        VOD.vod_play_from = "QQ";
        VOD.vod_play_url = d.map(function(it) {
            return it.title + "$" + it.url
        }).join("#");
    }),
        搜索: $js.toString(() => {
    let d = [], keyword = input.split("/")[3];
    function vodSearch(keyword, page = 0) {
        return request('https://pbaccess.video.qq.com/trpc.videosearch.mobile_search.MultiTerminalSearch/MbSearch?vplatform=2', {
            body: JSON.stringify({
                version: "25042201",
                clientType: 1,
                filterValue: "",
                uuid: "B1E50847-D25F-4C4B-BBA0-36F0093487F6",
                retry: 0,
                query: keyword,
                pagenum: page,
                isPrefetch: true,
                pagesize: 30,
                queryFrom: 0,
                searchDatakey: "",
                transInfo: "",
                isneedQc: true,
                preQid: "",
                adClientInfo: "",
                extraInfo: {
                    isNewMarkLabel: "1",
                    multi_terminal_pc: "1",
                    themeType: "1",
                    sugRelatedIds: "{}",
                    appVersion: ""
                }
            }),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.139 Safari/537.36',
                'Content-Type': 'application/json',
                'Origin': 'https://v.qq.com',
                'Referer': 'https://v.qq.com/'
            },
            method: 'POST'
        });
    }

    const nonMainContentKeywords = [
        '预告', '花絮', '特辑', '片段', '剪辑', '片花', '独家', '专访', '纯享',
        '制作', '幕后', '宣传', 'MV', '主题曲', '插曲', '彩蛋', '抢先看',
        '精彩', '集锦', '盘点', '回顾', '解说', '评测', '反应', 'reaction'
    ];

    function isMainContent(title) {
        if (!title) return false;
        if (title.includes('<em>') || title.includes('</em>')) return false;
        return !nonMainContentKeywords.some(kw => title.includes(kw));
    }

    function cleanTitle(t) {
        return (t || '').replace(/<[^>]+>/g, '');
    }

    try {
        let html = vodSearch(keyword, 0), json = JSON.parse(html);
        let seen = {};
        function pushItem(it) {
            if (it && it.doc && it.doc.id && it.videoInfo) {
                let t = cleanTitle(it.videoInfo.title);
                let cidV = it.doc.id;
                if (!seen[cidV] && isMainContent(t) && t.indexOf(keyword) >= 0) {
                    seen[cidV] = true;
                    d.push({
                        title: t,
                        img: it.videoInfo.imgUrl || "",
                        url: cidV,
                        desc: it.videoInfo.secondLine || ""
                    });
                }
            }
        }
        if (json.data && json.data.normalList && json.data.normalList.itemList) {
            json.data.normalList.itemList.forEach(pushItem);
        }
        if (json.data && json.data.areaBoxList) {
            json.data.areaBoxList.forEach(box => {
                (box.itemList || []).forEach(pushItem);
            });
        }
        if (d.length === 0 && json.data && json.data.hasMore) {
            for (let page = 1; page < 3; page++) {
                try {
                    let more = JSON.parse(vodSearch(keyword, page));
                    if (more.data && more.data.normalList && more.data.normalList.itemList) {
                        more.data.normalList.itemList.forEach(pushItem);
                    }
                    if (!more.data || !more.data.hasMore) break;
                } catch (e) { break; }
            }
        }
    } catch (e) {
        log("搜索出错: " + e.message);
    }
    // 搜索结果二次过滤: 标题必须包含完整搜索关键词(已过滤预告/花絮等非正片)
    setResult(d);
})
};
