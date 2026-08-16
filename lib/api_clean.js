const UA = "Dalvik/2.1.0 (Linux; U; Android 11; TVBox_takagen99_20260227-1116-armeabi-generic-java)";
const ext = args.ext || {};
const apiUrl = ext.api;
const headers = ext.headers || {};
if (!apiUrl) throw Error("ext.api 接口地址不能为空");

// 判断API返回格式是否为XML
function isXmlApi() {
  return apiUrl.includes("at/xml");
}

// 拼接分页、搜索、分类参数
function buildUrl(page, wd, tid) {
  let url = new URL(apiUrl);
  const params = new URLSearchParams(url.search);
  params.set("pg", page || 1);
  if (wd) params.set("wd", wd);
  if (tid) params.set("t", tid);
  url.search = params.toString();
  return url.toString();
}

// 构建详情页URL（ac=detail&ids=vid）
function buildDetailUrl(vid) {
  let url = new URL(apiUrl);
  const params = new URLSearchParams(url.search);
  params.set("ac", "detail");
  params.set("ids", vid);
  url.search = params.toString();
  return url.toString();
}

// 请求接口并自动解析XML/JSON
function fetchApi(page, wd, tid) {
  const target = buildUrl(page, wd, tid);
  const resp = request(target, { headers: { ...headers, "User-Agent": UA } });
  if (isXmlApi()) return xml2json(resp);
  return JSON.parse(resp);
}

// 请求详情接口
function fetchDetail(vid) {
  const target = buildDetailUrl(vid);
  const resp = request(target, { headers: { ...headers, "User-Agent": UA } });
  if (isXmlApi()) return xml2json(resp);
  return JSON.parse(resp);
}

// 过滤广告、棋牌类影片
function filterList(list) {
  const banWords = ["博彩", "棋牌", "彩票", "电玩", "赌博", "澳门", "赌场", "皇冠", "六合彩", "时时彩"];
  return (list || []).filter(item => !banWords.some(k => (item.vod_name || "").includes(k)));
}

// 初始化
function init() {
  return JSON.stringify({});
}

// 首页分类
function home() {
  try {
    const data = fetchApi(1);
    return JSON.stringify({ class: data.class || [] });
  } catch(e) {
    return JSON.stringify({ class: [] });
  }
}

// 分类列表（传入tid进行分类过滤）
function category() {
  try {
    const tid = args.tid;
    const raw = fetchApi(args.page || 1, "", tid);
    let list = filterList(raw.list);
    return JSON.stringify({ list });
  } catch(e) {
    return JSON.stringify({ list: [] });
  }
}

// 详情页（使用ac=detail直接获取影片详情和播放地址）
function detail() {
  try {
    const vid = args.vid;
    const raw = fetchDetail(vid);
    let list = raw.list || [];
    if (list.length === 0) throw "影片不存在";
    const info = list[0];
    return JSON.stringify({
      list: [{
        vod_id: info.vod_id,
        vod_name: info.vod_name,
        vod_pic: info.vod_pic || "",
        vod_remarks: info.vod_remarks || "",
        vod_play_from: info.vod_play_from || "",
        vod_play_url: info.vod_play_url || ""
      }]
    });
  } catch(e) {
    return JSON.stringify({ list: [] });
  }
}

// 搜索
function search() {
  try {
    const wd = args.wd;
    const raw = fetchApi(args.page || 1, wd);
    let list = filterList(raw.list);
    return JSON.stringify({ list });
  } catch(e) {
    return JSON.stringify({ list: [] });
  }
}

// 播放直透（附带headers信息）
function play() {
  return JSON.stringify({
    url: args.url,
    header: headers || {}
  });
}

switch (args.type) {
  case "init": return init();
  case "home": return home();
  case "category": return category();
  case "detail": return detail();
  case "search": return search();
  case "play": return play();
}
