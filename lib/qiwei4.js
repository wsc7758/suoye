//======================================================================
// 七味网 (gmp4.com) - drpy2/FongMi 混合规则
// 站点: https://www.gmp4.com  (苹果CMS v10, API与搜索已用验证码/关闭禁用)
// 说明:
//   1) 首页/分类   : 网页抓取  /vt/{tid}-{pg}.html  (第1页同样适用)
//   2) 详情/线路   : 网页抓取  /mv/{id}.html, 按 py-tabs 源标签 + ul.player 分集
//   3) 播放        : lazy 内抓取 /py/{vid}-{sid}-{nid}.html,
//                    解析内嵌 var player_aaaa={...} 直接取出真实 m3u8 直链(免外部分析)
//   4) 搜索        : 站点被"安全验证(验证码)"拦截, 无法脚本绕过 -> searchable=0 关闭
//======================================================================
var rule = {
    title: '七味gmp4',
    host: 'https://www.gmp4.com',
    url: '/vt/fyclass-fypage.html',
    detailUrl: '/mv/fyid.html',
    searchable: 0,           // 该站搜索被验证码拦截, 关闭以保稳定
    quickSearch: 0,
    filterable: 0,
    class_name: '电影&剧集&综艺&动漫&短剧',
    class_url: '1&2&3&4&30',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        'Referer': 'https://www.gmp4.com/',
        // 关键: 强制服务器返回明文, 禁止 gzip.
        // 站点若收到 Accept-Encoding:gzip 会回 gzip 压缩内容;
        // 而 TVBox 的网络库不一定解压 -> 页面变乱码 -> 所有正则失败 -> "没有找到数据".
        'Accept-Encoding': 'identity'
    },
    timeout: 8000,
    play_parse: true,
    // 关键: 置为 [] 以禁止引擎在 lazy 返回后把 parse 强制改回 1.
    // 引擎源码: 当 !rule.play_json 时, Object.assign(lazy_play,{jx:0,parse:1})
    // 会把我们 lazy 返回的 parse:0 覆盖成 1, 导致 FongMi 把直链送去"一键解析"
    // 而非直接播放, 解析失败即报"没有找到数据". 空数组不触发该覆盖(保留 parse:0).
    play_json: [],
    lazy: $js.toString(() => {
        // 注意: 引擎以 eval(lazy_code) 执行本函数体, 顶层不能有 return 语句(会抛 Illegal return)
        // 因此全部改用 if/else 赋值给 input, 不提前退出
        var host = 'https://www.gmp4.com';
        var u = (input.indexOf('http') === 0) ? input : host + input;
        // 显式给出 UA + Referer, 避免依赖引擎 fetch_params(在lazy上下文可能为undefined)
        var fp = (typeof fetch_params === 'undefined' || !fetch_params) ? {
            method: 'get',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
                'Referer': host + '/',
                'Accept-Encoding': 'identity'
            }
        } : fetch_params;
        var i = -1, s = -1, e = -1, obj = null, url = '';
        var html = '';
        try {
            html = fetch(u, fp);
            i = html.indexOf('var player_aaaa=');
        } catch (ex) { i = -1; }
        if (i >= 0) {
            // 页面含内嵌直链, 尝试解析 player_aaaa
            try {
                s = html.indexOf('{', i);
                e = html.indexOf('</script>', i);
                if (e < 0) e = html.length;
                obj = JSON.parse(html.slice(s, e));
                url = (obj && obj.url) ? obj.url : '';
            } catch (ex) { url = ''; }
            if (url && url.indexOf('http') >= 0 && url.indexOf('.') > 0) {
                // obj.url 即为真实 m3u8/mp4 直链, 直接可播, 无需解析
                input = { url: url, parse: 0, jx: 0, header: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36', 'Referer': host + '/' } };
            } else {
                // 直链为空(可能需鉴权/解析), 回退页面交给外部解析器
                input = { url: u, header: { 'User-Agent': '' }, parse: 1, jx: 1 };
            }
        } else {
            // 页面无内嵌直链(可能触发验证码)或结构变化, 回退交给外部解析器
            input = { url: u, header: { 'User-Agent': '' }, parse: 1, jx: 1 };
        }
    }),
    //------------------------------------------------------------------
    // 一级: 分类列表页 (网页抓取 content-list)
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
                let rm = /<h3>[\s\S]*?<span>([^<]+)<\/span>/.exec(li);
                if (!a) continue;
                let pic = im ? im[1] : '';
                if (pic.indexOf('http') !== 0) pic = (pic.charAt(0) === '/' ? 'https://www.gmp4.com' + pic : '');
                d.push({
                    title: a[2],
                    img: pic,
                    desc: rm ? rm[1] : '',
                    url: a[1]
                });
            }
        } catch (e) { }
        setResult(d);
    }),
    //------------------------------------------------------------------
    // 二级: 详情页 -> 元信息 + 多线路/分集
    //------------------------------------------------------------------
    二级: $js.toString(() => {
        VOD = {};
        try {
            let html = fetch(input, fetch_params);

            // 标题 (h1 含年份)
            let h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
            let name = h1 ? h1[1].replace(/<[^>]+>/g, '').trim() : '';
            let yr = /\((\d{4})\)/.exec(name);
            let praise = /<span class="year">\((\d{4})\)<\/span>/.exec(html);
            let year = yr ? yr[1] : (praise ? praise[1] : '');

            // 海报
            let pm = /<img[^>]*src="(https?:\/\/[^"]*\/upload\/[^"]+)"/.exec(html);
            let pic = pm ? pm[1] : '';

            // 文本清洁: 去HTML注释(页面含<!--跳转链接-->残留), 解码常用实体
            function clean(s) {
                return (s || '')
                    .replace(/<!--[\s\S]*?-->/g, '')     // 去掉被注释掉的重复跳转块
                    .replace(/<[^>]+>/g, '')             // 去标签
                    .replace(/&nbsp;/g, ' ')
                    .replace(/&middot;|&mid;/g, '·')
                    .replace(/&amp;/g, '&')
                    .replace(/\s+/g, ' ')
                    .trim();
            }

            // 简介
            let ct = /class="(?:zkjj_a|sqjj_a)"[^>]*>([\s\S]*?)<\/p>/.exec(html);
            let content = ct ? clean(ct[1].replace(/[\r\n]+/g, '')) : '';

            // 元信息通用抽取: <span>导演：</span>内容</div>
            function pick(lb) {
                let re = new RegExp('<span>' + lb + '：?</span>([\\s\\S]*?)<\\/div>');
                let m = re.exec(html);
                if (!m) return '';
                return clean(m[1]).replace(/^[:：]/, '');
            }
            let director = pick('导演');
            let actor = pick('主演');
            let type = pick('类型');
            let area = pick('地区');
            let remark = pick('上映');
            if (!remark) remark = year;

            // ------- 播放: 源标签(py-tabs) + 分集(ul.player) -------
            let tabHtml = '';
            let tbox = html.match(/<ul class="py-tabs">([\s\S]*?)<\/ul>/);
            if (tbox) tabHtml = tbox[1];

            // 源名列表
            let names = [];
            let reN = /<li[^>]*>\s*([^<]+?)\s*<div/g, mN;
            while ((mN = reN.exec(tabHtml)) !== null) {
                let n = mN[1].replace(/\s+/g, '');
                if (n) names.push(n);
            }

            // 分集块(每 ul.player 是一个源的全部剧集)
            let froms = [], urls = [];
            let gi = 0;
            let reG = /<ul class="player[^"]*"[^>]*>([\s\S]*?)<\/ul>/g, mG;
            while ((mG = reG.exec(html)) !== null) {
                let block = mG[1];
                let eps = [];
                let reE = /href="(\/py\/\d+-\d+-\d+\.html)"[^>]*>([^<]*)<\/a>/g, mE;
                while ((mE = reE.exec(block)) !== null) {
                    eps.push(mE[2].trim() + '$' + mE[1]);
                }
                if (eps.length === 0) continue;
                let srcName = (gi < names.length) ? names[gi] : ('线路' + (gi + 1));
                froms.push(srcName);
                urls.push(srcName + '$$$' + eps.join('#'));
                gi++;
            }

            VOD = {
                vod_name: name.replace('(' + year + ')', '') || '',
                vod_pic: pic,
                vod_year: year,
                vod_area: area,
                vod_type: type,
                vod_director: director,
                vod_actor: actor,
                vod_content: content,
                vod_remarks: remark,
                vod_play_from: froms.join('$$$'),
                vod_play_url: urls.join('$$$')
            };
        } catch (e) { }
    }),
    //------------------------------------------------------------------
    // 搜索: 站点被"安全验证"验证码拦截, 无法脚本绕过 -> 空结果
    //------------------------------------------------------------------
    搜索: $js.toString(() => {
        setResult([]);
    })
};
