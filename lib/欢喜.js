var rule = {
    title:"欢喜视频",
    host:"https://www.huanxi.com",
    //首页接口，欢喜首页推荐列表
    homeUrl:"https://www.huanxi.com/api/recommend?page=1&limit=21",
    //详情接口模板 fyid会替换成影片id
    detailUrl:"https://www.huanxi.com/api/vod/detail?id=fyid",
    searchUrl:"**",
    searchable:2,
    quickSearch:1,
    filterable:1,
    multi:1,
    //分类列表接口模板 fypage DRPY内置分页变量
    url:"https://www.huanxi.com/api/vod/list?cate=fyclass&page=((fypage))&limit=21",
    filter_url:"sort={{fl.sort}}&year={{fl.year}}&area={{fl.area}}",
    filter:{
        "choice":[
            {"key":"sort","name":"排序","value":[{"n":"最热","v":"hot"},{"n":"最新","v":"new"},{"n":"评分","v":"score"}]}
        ],
        "tv":[
            {"key":"sort","name":"排序","value":[{"n":"最热","v":"hot"},{"n":"最新","v":"new"}]},
            {"key":"year","name":"年代","value":[{"n":"全部","v":""},{"n":"2026","v":"2026"},{"n":"2025","v":"2025"},{"n":"2024","v":"2024"},{"n":"2023","v":"2023"}]}
        ],
        "movie":[
            {"key":"sort","name":"排序","value":[{"n":"最热","v":"hot"},{"n":"评分","v":"score"}]},
            {"key":"area","name":"地区","value":[{"n":"全部","v":""},{"n":"内地","v":"cn"},{"n":"海外","v":"over"}]}
        ],
        "variety":[
            {"key":"sort","name":"排序","value":[{"n":"最热","v":"hot"},{"n":"最新","v":"new"}]}
        ],
        "doco":[
            {"key":"sort","name":"排序","value":[{"n":"最热","v":"hot"}]}
        ]
    },
    headers:{
        "User-Agent":"PC_UA",
        "Referer":"https://www.huanxi.com/"
    },
    timeout:6000,
    cate_exclude:"",
    class_name:"精选&电视剧&电影&综艺&纪录片",
    class_url:"choice&tv&movie&variety&doco",
    limit:20,
    play_parse:true,
    //lazy播放预处理：仿照腾讯脚本，无本地代理，直接交给全局解析jx
    lazy:$js.toString(()=>{
        try{
            input = {
                header:{
                    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
                    "Referer":"https://www.huanxi.com/"
                },
                parse:0,
                url:input.split("?")[0],
                jx:1
            }
        }catch(e){
            input = {
                parse:0,
                url:input.split("?")[0],
                jx:1
            }
        }
    }),
    //首页、分类列表选择器，因为返回的是json接口，这里可以空，二级函数处理列表
    推荐:"",
    一级:"",
    //详情处理函数（对应腾讯脚本的二级）
    二级:$js.toString(()=>{
        let VOD = {};
        let d = [];
        let html = fetch(input,fetch_params);
        let json;
        try{
            json = JSON.parse(html);
        }catch(err){
            return "";
        }
        if(!json.data) return "";
        let info = json.data;
        //填充vod基础元信息
        VOD = {
            vod_name:info.title || "",
            vod_pic:info.cover || "",
            vod_actor:info.actor || "",
            vod_director:info.director || "",
            vod_year:info.year || "",
            vod_area:info.area || "",
            type_name:info.cate_name || "",
            vod_content:info.desc || "",
            vod_remarks:info.update_info || ""
        };
        //解析分集
        if(info.episodes && info.episodes.length>0){
            info.episodes.forEach(ep=>{
                //拼接欢喜播放页面url，对应你给的 player.shtml
                let playUrl = `https://www.huanxi.com/player.shtml?id=${info.vod_id}&ep=${ep.ep_id}`;
                d.push({
                    title:ep.title || `第${ep.index}集`,
                    url:playUrl
                })
            })
        }
        //DRPY标准播放列表拼接
        VOD.vod_play_from = "欢喜";
        VOD.vod_play_url = d.map(it=>`${it.title}$${it.url}`).join("#");
        return JSON.stringify(VOD);
    }),
    //自定义搜索函数，仿照腾讯搜索逻辑
    搜索:$js.toString(()=>{
        let d = [];
        let keyword = input;
        async function searchApi(word,page=1){
            return request(`https://www.huanxi.com/api/vod/search?keyword=${encodeURIComponent(word)}&page=${page}&limit=20`,{
                method:"GET",
                headers:{
                    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
                    "Referer":"https://www.huanxi.com/"
                }
            })
        }
        //过滤关键词，过滤花絮预告
        const filterWords = ["预告","花絮","片段","片花","MV"];
        function isValidTitle(title){
            if(!title) return false;
            return !filterWords.some(w=>title.includes(w))
        }
        try{
            let res = searchApi(keyword,1);
            let json = JSON.parse(res);
            if(json.data && json.data.list){
                json.data.list.forEach(item=>{
                    if(isValidTitle(item.title)){
                        d.push({
                            title:item.title,
                            img:item.cover || "",
                            url:item.vod_id,
                            desc:item.update_info || ""
                        })
                    }
                })
            }
        }catch(e){
            log("搜索异常:"+e.message)
        }
        setResult(d);
    })
}
