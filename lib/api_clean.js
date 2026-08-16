const UA = "Dalvik/2.1.0 (Linux; U; Android 11; TVBox_takagen99_20260227-1116-armeabi-generic-java)";
const ext = args.ext || {};
const apiUrl = ext.api;
const headers = ext.headers || {};
if (!apiUrl) throw Error("ext.api 接口地址不能为空");

// 拼接分页、搜索参数
function buildUrl(base, page, wd) {
  let url = new URL(base);
  const params = new URLSearchParams(url.search);
  params.set("pg", page);
  if (wd) params.set("wd", encodeURIComponent(wd));
  url.search = params.toString();
  return url.toString();
}

// 请求接口并自动解析XML/JSON
function fetchApi(page = 1, wd = "") {
  const target = buildUrl(apiUrl, page, wd);
  const resp = request(target, { headers: { ...headers, "User-Agent": UA } });
  if (target.includes("at/xml")) return xml2json(resp);
  return JSON.parse(resp);
}

// 首页分类
function home() {
  const data = fetchApi(1);
  return JSON.stringify({ class: data.class || [] });
}

// 分类列表
function category() {
  const tid = args.tid;
  const raw = fetchApi(args.page || 1);
  let list = raw.list || [];
  // 过滤广告、棋牌类影片
  const banWords = ["博彩", "棋牌", "彩票", "电玩", "赌博"];
  list = list.filter(item => !banWords.some(k => item.vod_name?.includes(k)));
  return JSON.stringify({ list });
}

// 详情页
function detail() {
  const vid = args.vid;
  const raw = fetchApi(1);
  const info = raw.list.find(v => v.vod_id == vid);
  if (!info) throw "影片不存在";
  return JSON.stringify({
    vod_id: info.vod_id,
    vod_name: info.vod_name,
    vod_pic: info.vod_pic || "",
    vod_remarks: info.vod_remarks || "",
    vod_play_from: info.vod_play_from || "",
    vod_play_url: info.vod_play_url || ""
  });
}

// 搜索
function search() {
  const wd = args.wd;
  const raw = fetchApi(args.page || 1, wd);
  let list = raw.list || [];
  const banWords = ["博彩", "棋牌", "彩票", "电玩", "赌博"];
  list = list.filter(item => !banWords.some(k => item.vod_name?.includes(k)));
  return JSON.stringify({ list });
}

// 播放直透，不经过网页广告页面
function play() {
  return JSON.stringify({ url: args.url });
}

switch (args.type) {
  case "home": return home();
  case "category": return category();
  case "detail": return detail();
  case "search": return search();
  case "play": return play();
}