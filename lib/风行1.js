var rule = {
    title:"风行视频",
    host:"https://www.fun.tv",
    homeUrl:"/",
    detailUrl:"https://www.fun.tv/vplay/v-fyid.html",
    searchUrl:"**",
    searchable:2,
    quickSearch:0,
    filterable:0,
    multi:1,
    url:"/category/{{fyclass}}?page=((fypage))",
    headers:{
        "User‑Agent":"PC_UA",
        "Referer":"https://www.fun.tv/"
    },
    timeout:6000,
    cate_exclude:"",
    class_name:"电影&电视剧&新时代&少儿&漫剧",
    class_url:"index&movie&tv&variety&cartoon",
    limit:20,
    play_parse:true,
    lazy:$js.toString(()=>{
        try{
            input = {
                header:{
                    "User‑Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
                    "Referer":"https://www.fun.tv/"
                },
                parse:0,
                url:input.split("?")[0],
                jx:1
            }
        }catch(e){
            input = {parse:0,url:input.split("?")[0],jx:1}
        }
    }),
    推荐:'.video_item;a&&title;a&&href;img&&src',
    一级:'.video_item;a&&title;a&&href;img&&src',
    二级:$js.toString(()=>{
        let VOD = {};
        let d = [];
        let html = fetch(input,fetch_params);
        VOD.vod_url = input;
        //提取标题、封面、简介
        VOD.vod_name = fetch_text(html,'.video_title');
        VOD.vod_pic = fetch_attr(html,'meta[property="og:image"]','content');
        VOD.vod_content = fetch_text(html,'.video_desc');
        //解析选集
        let epList = fetch_all(html,'.episode_item a');
        for(let ep of epList){
            let epTitle = ep.text();
            let epHref = ep.attr('href');
            if(epHref){
                d.push({
                    title: epTitle || "播放",
                    url: urljoin(input,epHref)
                })
            }
        }
        VOD.vod_play_from = "风行";
        VOD.vod_play_url = d.map(it=>`${it.title}$${it.url}`).join("#");
        return JSON.stringify(VOD);
    }),
    搜索:$js.toString(()=>{
        let d=[];
        let kw = encodeURIComponent(input);
        let html = fetch(`https://www.fun.tv/search?key=${kw}`,fetch_params);
        let items = fetch_all(html,'.video_item');
        items.forEach(it=>{
            let title = it.find('a').attr('title');
            let href = it.find('a').attr('href');
            let img = it.find('img').attr('src');
            if(title && href){
                d.push({
                    title:title,
                    img:urljoin2(input,img),
                    url:href,
                    desc:""
                })
            }
        })
        setResult(d);
    })
}
