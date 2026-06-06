<?php
header("Access-Control-Allow-Origin:*");
header("Content-Type:application/vnd.apple.mpegurl");
$pid = $_GET['pid'];
$vid = $_GET['vid'];
$ua = "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome";
$context = stream_context_create([
    'http'=>[
        'user_agent'=>$ua,
        'timeout'=>10
    ]
]);
$page = @file_get_contents("https://m.yangshipin.cn/video?type=1&pid={$pid}&vid={$vid}",false,$context);
if(!$page){exit("#EXTINF:-1,链接失效");}
preg_match('/"playUrl":"([^"]+?)"/',$page,$arr);
if(isset($arr[1])&&!empty($arr[1])){
    echo $arr[1];
}else{
    exit("#EXTINF:-1,获取失败");
}
?>