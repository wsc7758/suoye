var rule = {
    title:"CMS接口清洗工具",
    host:"",
    apiUrl:"https://cj.jusj.top/api.php/provide/vod/?ac=list",
    detailUrl:"https://cj.jusj.top/api.php/provide/vod/?ac=detail&ids=fyid",
    searchUrl:"https://cj.jusj.top/api.php/provide/vod/?ac=list&wd=**",
    searchable:1,
    quickSearch:0,
    headers:{
        "User-Agent":"Mozilla/5.0 (Mobile; Android)"
    },
    listParse:function(json){
        let data = JSON.parse(json);
        let arr = [];
        for(let item of data.list){
            arr.push({
                vod_id:item.vod_id,
                vod_name:item.vod_name,
                vod_pic:item.vod_pic,
                vod_remarks:item.vod_remarks,
                vod_year:item.vod_year,
                vod_area:item.vod_area,
                vod_type:item.vod_type,
                vod_actor:item.vod_actor,
                vod_director:item.vod_director,
                vod_content:item.vod_content
            })
        }
        return arr;
    },
    detailParse:function(json){
        let data = JSON.parse(json);
        let info = data.list[0];
        let vod_play_from = info.vod_play_from.split("$$$");
        let vod_play_url = info.vod_play_url.split("$$$");
        let playList = [];
        for(let i=0;i<vod_play_from.length;i++){
            let sourceName = vod_play_from[i];
            let episodes = vod_play_url[i].split("#");
            let epList = [];
            for(let ep of episodes){
                let nameUrl = ep.split("$");
                let epName = nameUrl[0];
                let rawUrl = nameUrl[1];
                epList.push({
                    name:epName,
                    url:rawUrl
                })
            }
            playList.push({
                from:sourceName,
                url:epList
            })
        }
        return {
            vod_name:info.vod_name,
            vod_pic:info.vod_pic,
            vod_actor:info.vod_actor,
            vod_director:info.vod_director,
            vod_content:info.vod_content,
            vod_play_list:playList
        }
    }
}