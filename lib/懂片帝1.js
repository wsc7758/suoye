// ============================================================
// 懂片帝17 (dongpian17.com) - drpy2 规则 (type:3 使用)
//
// 站点 /v1/ 接口要求请求签名, 该签名在客户端本地用纯 JS HMAC-SHA256 计算,
// 不依赖 CryptoJS, 也不需要任何服务器中转。
//
// 配置:
//   "type": 3,
//   "api":  "<drpy2.min.js 地址>",
//   "ext":  "<本文件地址>"
//
// 注意: 签名含时间戳(服务端一般只允许几分钟偏差), 手机系统时间必须准确。
// ============================================================
var rule = {
    title: '懂片帝17',
    host: 'https://dongpian17.com',
    homeUrl: '/',
    url: '/v1/browse/catalog?sort=trending&window=all&kind=fyclass&page=fypage&limit=24',
    searchUrl: '/v1/browse/catalog?page=fypage&limit=20&search_fields=all&q=**',
    detailUrl: '/v1/catalog/fyid',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://dongpian17.com/'
    },
    timeout: 20000,
    class_name: '剧集&电影&动漫&综艺&纪录片&短剧',
    class_url: 'series&movie&anime&variety&documentary&short_drama',
    play_parse: true,
    推荐: $js.toString(() => {
    var DP_HOST = 'https://dongpian17.com';
    var DP_KEY = '8b9a908a05eac640e1ee06f52acaa741bfe4ba9e004eeffdbeb635e532e06666';
    var DP_CLI = {
        'x-ai-movie-client-name': 'movie-search-frontend',
        'x-ai-movie-client-version': '1.0.0',
        'x-ai-movie-build-version': 'dongpiandi-v2026.09.30.1-dbb1f9857565-web',
        'x-ai-movie-protocol-version': '2026-07-05.library-v2.playback-v1'
    };
    var DP_utf = function (s) {
        var b = [];
        for (var i = 0; i < s.length; i++) b.push(s.charCodeAt(i) & 255);
        return b;
    };
    var DP_w2b = function (w) {
        var b = [];
        for (var i = 0; i < w.length; i++) b.push((w[i] >>> 24) & 255, (w[i] >>> 16) & 255, (w[i] >>> 8) & 255, w[i] & 255);
        return b;
    };
    var DP_b2h = function (b) {
        var hx = '0123456789abcdef', s = '';
        for (var i = 0; i < b.length; i++) s += hx.charAt((b[i] >> 4) & 15) + hx.charAt(b[i] & 15);
        return s;
    };
    var DP_sha = function (m) {
        var K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];
        var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
        var ro = function (x, n) { return (x >>> n) | (x << (32 - n)); };
        var l = m.length;
        m = m.slice(0);
        m.push(0x80);
        while (m.length % 64 !== 56) m.push(0);
        var bits = l * 8;
        m.push(0, 0, 0, 0);
        m.push((bits >>> 24) & 255, (bits >>> 16) & 255, (bits >>> 8) & 255, bits & 255);
        var w = new Array(64);
        for (var i = 0; i < m.length; i += 64) {
            for (var t = 0; t < 16; t++) w[t] = (m[i + t * 4] << 24) | (m[i + t * 4 + 1] << 16) | (m[i + t * 4 + 2] << 8) | m[i + t * 4 + 3];
            for (t = 16; t < 64; t++) {
                var s0 = ro(w[t - 15], 7) ^ ro(w[t - 15], 18) ^ (w[t - 15] >>> 3);
                var s1 = ro(w[t - 2], 17) ^ ro(w[t - 2], 19) ^ (w[t - 2] >>> 10);
                w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
            }
            var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
            for (t = 0; t < 64; t++) {
                var S1 = ro(e, 6) ^ ro(e, 11) ^ ro(e, 25);
                var ch = (e & f) ^ (~e & g);
                var t1 = (h + S1 + ch + K[t] + w[t]) | 0;
                var S0 = ro(a, 2) ^ ro(a, 13) ^ ro(a, 22);
                var mj = (a & b) ^ (a & c) ^ (b & c);
                var t2 = (S0 + mj) | 0;
                h = g; g = f; f = e; e = (d + t1) | 0;
                d = c; c = b; b = a; a = (t1 + t2) | 0;
            }
            H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
        }
        return H;
    };
    // HMAC-SHA256, 返回十六进制字符串(不依赖 CryptoJS)
    var DP_hmac = function (msg) {
        var kb = DP_utf(DP_KEY);
        if (kb.length > 64) kb = DP_w2b(DP_sha(kb));
        while (kb.length < 64) kb.push(0);
        var o = [], inn = [];
        for (var i = 0; i < 64; i++) { o.push(kb[i] ^ 92); inn.push(kb[i] ^ 54); }
        var inner = DP_w2b(DP_sha(inn.concat(DP_utf(msg))));
        return DP_b2h(DP_w2b(DP_sha(o.concat(inner))));
    };
    // 带签名的请求: method + path(含查询串) + 时间戳 + 随机数
    var DP_req = function (method, path, body) {
        var ts = String(Math.floor(Date.now()));
        var nonce = '', hx = '0123456789abcdef';
        for (var i = 0; i < 32; i++) nonce += hx.charAt(Math.floor(Math.random() * 16));
        var hd = { 'Accept': 'application/json', 'Referer': DP_HOST + '/' };
        for (var k in DP_CLI) hd[k] = DP_CLI[k];
        hd['x-ai-movie-timestamp'] = ts;
        hd['x-ai-movie-nonce'] = nonce;
        hd['x-ai-movie-signature'] = DP_hmac(method + '\n' + path + '\n' + ts + '\n' + nonce);
        var opt = { method: method, headers: hd };
        if (body) {
            hd['Content-Type'] = 'application/json';
            opt.body = JSON.stringify(body);
        }
        return fetch(DP_HOST + path, opt);
    };
    var DP_json = function (method, path, body) {
        try { return JSON.parse(DP_req(method, path, body)); } catch (e) { return {}; }
    };
    var DP_p = function (u) { return String(u).replace(/^https?:\/\/[^\/]+/, ''); };
    var DP_card = function (c) {
        return {
            title: c.title || '',
            img: c.poster_url || '',
            desc: c.remarks || (c.year ? c.year + '' : ''),
            url: c.id || ''
        };
    };
    var r = DP_json('GET', '/v1/browse/catalog?sort=trending&window=week&page=1&limit=40');
    var cs = r.cards || [], d = [], seen = {};
    for (var i = 0; i < cs.length; i++) {
        if (!cs[i].id || seen[cs[i].id]) continue;
        seen[cs[i].id] = 1;
        d.push(DP_card(cs[i]));
    }
    setResult(d);
    }),
    一级: $js.toString(() => {
    var DP_HOST = 'https://dongpian17.com';
    var DP_KEY = '8b9a908a05eac640e1ee06f52acaa741bfe4ba9e004eeffdbeb635e532e06666';
    var DP_CLI = {
        'x-ai-movie-client-name': 'movie-search-frontend',
        'x-ai-movie-client-version': '1.0.0',
        'x-ai-movie-build-version': 'dongpiandi-v2026.09.30.1-dbb1f9857565-web',
        'x-ai-movie-protocol-version': '2026-07-05.library-v2.playback-v1'
    };
    var DP_utf = function (s) {
        var b = [];
        for (var i = 0; i < s.length; i++) b.push(s.charCodeAt(i) & 255);
        return b;
    };
    var DP_w2b = function (w) {
        var b = [];
        for (var i = 0; i < w.length; i++) b.push((w[i] >>> 24) & 255, (w[i] >>> 16) & 255, (w[i] >>> 8) & 255, w[i] & 255);
        return b;
    };
    var DP_b2h = function (b) {
        var hx = '0123456789abcdef', s = '';
        for (var i = 0; i < b.length; i++) s += hx.charAt((b[i] >> 4) & 15) + hx.charAt(b[i] & 15);
        return s;
    };
    var DP_sha = function (m) {
        var K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];
        var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
        var ro = function (x, n) { return (x >>> n) | (x << (32 - n)); };
        var l = m.length;
        m = m.slice(0);
        m.push(0x80);
        while (m.length % 64 !== 56) m.push(0);
        var bits = l * 8;
        m.push(0, 0, 0, 0);
        m.push((bits >>> 24) & 255, (bits >>> 16) & 255, (bits >>> 8) & 255, bits & 255);
        var w = new Array(64);
        for (var i = 0; i < m.length; i += 64) {
            for (var t = 0; t < 16; t++) w[t] = (m[i + t * 4] << 24) | (m[i + t * 4 + 1] << 16) | (m[i + t * 4 + 2] << 8) | m[i + t * 4 + 3];
            for (t = 16; t < 64; t++) {
                var s0 = ro(w[t - 15], 7) ^ ro(w[t - 15], 18) ^ (w[t - 15] >>> 3);
                var s1 = ro(w[t - 2], 17) ^ ro(w[t - 2], 19) ^ (w[t - 2] >>> 10);
                w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
            }
            var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
            for (t = 0; t < 64; t++) {
                var S1 = ro(e, 6) ^ ro(e, 11) ^ ro(e, 25);
                var ch = (e & f) ^ (~e & g);
                var t1 = (h + S1 + ch + K[t] + w[t]) | 0;
                var S0 = ro(a, 2) ^ ro(a, 13) ^ ro(a, 22);
                var mj = (a & b) ^ (a & c) ^ (b & c);
                var t2 = (S0 + mj) | 0;
                h = g; g = f; f = e; e = (d + t1) | 0;
                d = c; c = b; b = a; a = (t1 + t2) | 0;
            }
            H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
        }
        return H;
    };
    // HMAC-SHA256, 返回十六进制字符串(不依赖 CryptoJS)
    var DP_hmac = function (msg) {
        var kb = DP_utf(DP_KEY);
        if (kb.length > 64) kb = DP_w2b(DP_sha(kb));
        while (kb.length < 64) kb.push(0);
        var o = [], inn = [];
        for (var i = 0; i < 64; i++) { o.push(kb[i] ^ 92); inn.push(kb[i] ^ 54); }
        var inner = DP_w2b(DP_sha(inn.concat(DP_utf(msg))));
        return DP_b2h(DP_w2b(DP_sha(o.concat(inner))));
    };
    // 带签名的请求: method + path(含查询串) + 时间戳 + 随机数
    var DP_req = function (method, path, body) {
        var ts = String(Math.floor(Date.now()));
        var nonce = '', hx = '0123456789abcdef';
        for (var i = 0; i < 32; i++) nonce += hx.charAt(Math.floor(Math.random() * 16));
        var hd = { 'Accept': 'application/json', 'Referer': DP_HOST + '/' };
        for (var k in DP_CLI) hd[k] = DP_CLI[k];
        hd['x-ai-movie-timestamp'] = ts;
        hd['x-ai-movie-nonce'] = nonce;
        hd['x-ai-movie-signature'] = DP_hmac(method + '\n' + path + '\n' + ts + '\n' + nonce);
        var opt = { method: method, headers: hd };
        if (body) {
            hd['Content-Type'] = 'application/json';
            opt.body = JSON.stringify(body);
        }
        return fetch(DP_HOST + path, opt);
    };
    var DP_json = function (method, path, body) {
        try { return JSON.parse(DP_req(method, path, body)); } catch (e) { return {}; }
    };
    var DP_p = function (u) { return String(u).replace(/^https?:\/\/[^\/]+/, ''); };
    var DP_card = function (c) {
        return {
            title: c.title || '',
            img: c.poster_url || '',
            desc: c.remarks || (c.year ? c.year + '' : ''),
            url: c.id || ''
        };
    };
    var r = DP_json('GET', DP_p(input));
    var cs = r.cards || [], d = [];
    for (var i = 0; i < cs.length; i++) d.push(DP_card(cs[i]));
    setResult(d);
    }),
    二级: $js.toString(() => {
    var DP_HOST = 'https://dongpian17.com';
    var DP_KEY = '8b9a908a05eac640e1ee06f52acaa741bfe4ba9e004eeffdbeb635e532e06666';
    var DP_CLI = {
        'x-ai-movie-client-name': 'movie-search-frontend',
        'x-ai-movie-client-version': '1.0.0',
        'x-ai-movie-build-version': 'dongpiandi-v2026.09.30.1-dbb1f9857565-web',
        'x-ai-movie-protocol-version': '2026-07-05.library-v2.playback-v1'
    };
    var DP_utf = function (s) {
        var b = [];
        for (var i = 0; i < s.length; i++) b.push(s.charCodeAt(i) & 255);
        return b;
    };
    var DP_w2b = function (w) {
        var b = [];
        for (var i = 0; i < w.length; i++) b.push((w[i] >>> 24) & 255, (w[i] >>> 16) & 255, (w[i] >>> 8) & 255, w[i] & 255);
        return b;
    };
    var DP_b2h = function (b) {
        var hx = '0123456789abcdef', s = '';
        for (var i = 0; i < b.length; i++) s += hx.charAt((b[i] >> 4) & 15) + hx.charAt(b[i] & 15);
        return s;
    };
    var DP_sha = function (m) {
        var K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];
        var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
        var ro = function (x, n) { return (x >>> n) | (x << (32 - n)); };
        var l = m.length;
        m = m.slice(0);
        m.push(0x80);
        while (m.length % 64 !== 56) m.push(0);
        var bits = l * 8;
        m.push(0, 0, 0, 0);
        m.push((bits >>> 24) & 255, (bits >>> 16) & 255, (bits >>> 8) & 255, bits & 255);
        var w = new Array(64);
        for (var i = 0; i < m.length; i += 64) {
            for (var t = 0; t < 16; t++) w[t] = (m[i + t * 4] << 24) | (m[i + t * 4 + 1] << 16) | (m[i + t * 4 + 2] << 8) | m[i + t * 4 + 3];
            for (t = 16; t < 64; t++) {
                var s0 = ro(w[t - 15], 7) ^ ro(w[t - 15], 18) ^ (w[t - 15] >>> 3);
                var s1 = ro(w[t - 2], 17) ^ ro(w[t - 2], 19) ^ (w[t - 2] >>> 10);
                w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
            }
            var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
            for (t = 0; t < 64; t++) {
                var S1 = ro(e, 6) ^ ro(e, 11) ^ ro(e, 25);
                var ch = (e & f) ^ (~e & g);
                var t1 = (h + S1 + ch + K[t] + w[t]) | 0;
                var S0 = ro(a, 2) ^ ro(a, 13) ^ ro(a, 22);
                var mj = (a & b) ^ (a & c) ^ (b & c);
                var t2 = (S0 + mj) | 0;
                h = g; g = f; f = e; e = (d + t1) | 0;
                d = c; c = b; b = a; a = (t1 + t2) | 0;
            }
            H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
        }
        return H;
    };
    // HMAC-SHA256, 返回十六进制字符串(不依赖 CryptoJS)
    var DP_hmac = function (msg) {
        var kb = DP_utf(DP_KEY);
        if (kb.length > 64) kb = DP_w2b(DP_sha(kb));
        while (kb.length < 64) kb.push(0);
        var o = [], inn = [];
        for (var i = 0; i < 64; i++) { o.push(kb[i] ^ 92); inn.push(kb[i] ^ 54); }
        var inner = DP_w2b(DP_sha(inn.concat(DP_utf(msg))));
        return DP_b2h(DP_w2b(DP_sha(o.concat(inner))));
    };
    // 带签名的请求: method + path(含查询串) + 时间戳 + 随机数
    var DP_req = function (method, path, body) {
        var ts = String(Math.floor(Date.now()));
        var nonce = '', hx = '0123456789abcdef';
        for (var i = 0; i < 32; i++) nonce += hx.charAt(Math.floor(Math.random() * 16));
        var hd = { 'Accept': 'application/json', 'Referer': DP_HOST + '/' };
        for (var k in DP_CLI) hd[k] = DP_CLI[k];
        hd['x-ai-movie-timestamp'] = ts;
        hd['x-ai-movie-nonce'] = nonce;
        hd['x-ai-movie-signature'] = DP_hmac(method + '\n' + path + '\n' + ts + '\n' + nonce);
        var opt = { method: method, headers: hd };
        if (body) {
            hd['Content-Type'] = 'application/json';
            opt.body = JSON.stringify(body);
        }
        return fetch(DP_HOST + path, opt);
    };
    var DP_json = function (method, path, body) {
        try { return JSON.parse(DP_req(method, path, body)); } catch (e) { return {}; }
    };
    var DP_p = function (u) { return String(u).replace(/^https?:\/\/[^\/]+/, ''); };
    var DP_card = function (c) {
        return {
            title: c.title || '',
            img: c.poster_url || '',
            desc: c.remarks || (c.year ? c.year + '' : ''),
            url: c.id || ''
        };
    };
    VOD = {};
    var d = DP_json('GET', DP_p(input));
    if (d && d.id) {
        var eps = d.episodes || [], main = [], other = [];
        for (var i = 0; i < eps.length; i++) {
            if (!eps[i].token) continue;
            if (eps[i].episode_track === 'main' || !eps[i].episode_track) main.push(eps[i]); else other.push(eps[i]);
        }
        if (!main.length) main = other;
        var parts = [];
        for (var k = 0; k < main.length; k++) {
            var e = main[k];
            var nm = e.title || ('第' + (e.number || (k + 1)) + '集');
            parts.push(nm + '$' + DP_HOST + '/p/' + e.token);
        }
        VOD = {
            vod_id: d.id,
            vod_name: d.title || '',
            vod_pic: d.poster_url || '',
            type_name: (d.genres || []).join(','),
            vod_year: d.year || '',
            vod_area: d.area || '',
            vod_lang: d.language || '',
            vod_remarks: d.episode_progress_text || (d.episode_count ? d.episode_count + '集' : ''),
            vod_actor: (d.actors || []).join(','),
            vod_director: (d.directors || []).join(','),
            vod_content: d.description || '',
            vod_play_from: '懂片帝',
            vod_play_url: parts.join('#')
        };
    }
    }),
    搜索: $js.toString(() => {
    var DP_HOST = 'https://dongpian17.com';
    var DP_KEY = '8b9a908a05eac640e1ee06f52acaa741bfe4ba9e004eeffdbeb635e532e06666';
    var DP_CLI = {
        'x-ai-movie-client-name': 'movie-search-frontend',
        'x-ai-movie-client-version': '1.0.0',
        'x-ai-movie-build-version': 'dongpiandi-v2026.09.30.1-dbb1f9857565-web',
        'x-ai-movie-protocol-version': '2026-07-05.library-v2.playback-v1'
    };
    var DP_utf = function (s) {
        var b = [];
        for (var i = 0; i < s.length; i++) b.push(s.charCodeAt(i) & 255);
        return b;
    };
    var DP_w2b = function (w) {
        var b = [];
        for (var i = 0; i < w.length; i++) b.push((w[i] >>> 24) & 255, (w[i] >>> 16) & 255, (w[i] >>> 8) & 255, w[i] & 255);
        return b;
    };
    var DP_b2h = function (b) {
        var hx = '0123456789abcdef', s = '';
        for (var i = 0; i < b.length; i++) s += hx.charAt((b[i] >> 4) & 15) + hx.charAt(b[i] & 15);
        return s;
    };
    var DP_sha = function (m) {
        var K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];
        var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
        var ro = function (x, n) { return (x >>> n) | (x << (32 - n)); };
        var l = m.length;
        m = m.slice(0);
        m.push(0x80);
        while (m.length % 64 !== 56) m.push(0);
        var bits = l * 8;
        m.push(0, 0, 0, 0);
        m.push((bits >>> 24) & 255, (bits >>> 16) & 255, (bits >>> 8) & 255, bits & 255);
        var w = new Array(64);
        for (var i = 0; i < m.length; i += 64) {
            for (var t = 0; t < 16; t++) w[t] = (m[i + t * 4] << 24) | (m[i + t * 4 + 1] << 16) | (m[i + t * 4 + 2] << 8) | m[i + t * 4 + 3];
            for (t = 16; t < 64; t++) {
                var s0 = ro(w[t - 15], 7) ^ ro(w[t - 15], 18) ^ (w[t - 15] >>> 3);
                var s1 = ro(w[t - 2], 17) ^ ro(w[t - 2], 19) ^ (w[t - 2] >>> 10);
                w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
            }
            var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
            for (t = 0; t < 64; t++) {
                var S1 = ro(e, 6) ^ ro(e, 11) ^ ro(e, 25);
                var ch = (e & f) ^ (~e & g);
                var t1 = (h + S1 + ch + K[t] + w[t]) | 0;
                var S0 = ro(a, 2) ^ ro(a, 13) ^ ro(a, 22);
                var mj = (a & b) ^ (a & c) ^ (b & c);
                var t2 = (S0 + mj) | 0;
                h = g; g = f; f = e; e = (d + t1) | 0;
                d = c; c = b; b = a; a = (t1 + t2) | 0;
            }
            H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
        }
        return H;
    };
    // HMAC-SHA256, 返回十六进制字符串(不依赖 CryptoJS)
    var DP_hmac = function (msg) {
        var kb = DP_utf(DP_KEY);
        if (kb.length > 64) kb = DP_w2b(DP_sha(kb));
        while (kb.length < 64) kb.push(0);
        var o = [], inn = [];
        for (var i = 0; i < 64; i++) { o.push(kb[i] ^ 92); inn.push(kb[i] ^ 54); }
        var inner = DP_w2b(DP_sha(inn.concat(DP_utf(msg))));
        return DP_b2h(DP_w2b(DP_sha(o.concat(inner))));
    };
    // 带签名的请求: method + path(含查询串) + 时间戳 + 随机数
    var DP_req = function (method, path, body) {
        var ts = String(Math.floor(Date.now()));
        var nonce = '', hx = '0123456789abcdef';
        for (var i = 0; i < 32; i++) nonce += hx.charAt(Math.floor(Math.random() * 16));
        var hd = { 'Accept': 'application/json', 'Referer': DP_HOST + '/' };
        for (var k in DP_CLI) hd[k] = DP_CLI[k];
        hd['x-ai-movie-timestamp'] = ts;
        hd['x-ai-movie-nonce'] = nonce;
        hd['x-ai-movie-signature'] = DP_hmac(method + '\n' + path + '\n' + ts + '\n' + nonce);
        var opt = { method: method, headers: hd };
        if (body) {
            hd['Content-Type'] = 'application/json';
            opt.body = JSON.stringify(body);
        }
        return fetch(DP_HOST + path, opt);
    };
    var DP_json = function (method, path, body) {
        try { return JSON.parse(DP_req(method, path, body)); } catch (e) { return {}; }
    };
    var DP_p = function (u) { return String(u).replace(/^https?:\/\/[^\/]+/, ''); };
    var DP_card = function (c) {
        return {
            title: c.title || '',
            img: c.poster_url || '',
            desc: c.remarks || (c.year ? c.year + '' : ''),
            url: c.id || ''
        };
    };
    var pg = 1;
    var mm = /[?&]page=(\d+)/.exec(String(input));
    if (mm) pg = mm[1];
    var r = DP_json('GET', '/v1/browse/catalog?page=' + pg + '&limit=20&search_fields=all&q=' + encodeURIComponent(KEY || ''));
    var cs = r.cards || [], d = [];
    for (var i = 0; i < cs.length; i++) d.push(DP_card(cs[i]));
    setResult(d);
    }),
    lazy: $js.toString(() => {
    var DP_HOST = 'https://dongpian17.com';
    var DP_KEY = '8b9a908a05eac640e1ee06f52acaa741bfe4ba9e004eeffdbeb635e532e06666';
    var DP_CLI = {
        'x-ai-movie-client-name': 'movie-search-frontend',
        'x-ai-movie-client-version': '1.0.0',
        'x-ai-movie-build-version': 'dongpiandi-v2026.09.30.1-dbb1f9857565-web',
        'x-ai-movie-protocol-version': '2026-07-05.library-v2.playback-v1'
    };
    var DP_utf = function (s) {
        var b = [];
        for (var i = 0; i < s.length; i++) b.push(s.charCodeAt(i) & 255);
        return b;
    };
    var DP_w2b = function (w) {
        var b = [];
        for (var i = 0; i < w.length; i++) b.push((w[i] >>> 24) & 255, (w[i] >>> 16) & 255, (w[i] >>> 8) & 255, w[i] & 255);
        return b;
    };
    var DP_b2h = function (b) {
        var hx = '0123456789abcdef', s = '';
        for (var i = 0; i < b.length; i++) s += hx.charAt((b[i] >> 4) & 15) + hx.charAt(b[i] & 15);
        return s;
    };
    var DP_sha = function (m) {
        var K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];
        var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
        var ro = function (x, n) { return (x >>> n) | (x << (32 - n)); };
        var l = m.length;
        m = m.slice(0);
        m.push(0x80);
        while (m.length % 64 !== 56) m.push(0);
        var bits = l * 8;
        m.push(0, 0, 0, 0);
        m.push((bits >>> 24) & 255, (bits >>> 16) & 255, (bits >>> 8) & 255, bits & 255);
        var w = new Array(64);
        for (var i = 0; i < m.length; i += 64) {
            for (var t = 0; t < 16; t++) w[t] = (m[i + t * 4] << 24) | (m[i + t * 4 + 1] << 16) | (m[i + t * 4 + 2] << 8) | m[i + t * 4 + 3];
            for (t = 16; t < 64; t++) {
                var s0 = ro(w[t - 15], 7) ^ ro(w[t - 15], 18) ^ (w[t - 15] >>> 3);
                var s1 = ro(w[t - 2], 17) ^ ro(w[t - 2], 19) ^ (w[t - 2] >>> 10);
                w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
            }
            var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
            for (t = 0; t < 64; t++) {
                var S1 = ro(e, 6) ^ ro(e, 11) ^ ro(e, 25);
                var ch = (e & f) ^ (~e & g);
                var t1 = (h + S1 + ch + K[t] + w[t]) | 0;
                var S0 = ro(a, 2) ^ ro(a, 13) ^ ro(a, 22);
                var mj = (a & b) ^ (a & c) ^ (b & c);
                var t2 = (S0 + mj) | 0;
                h = g; g = f; f = e; e = (d + t1) | 0;
                d = c; c = b; b = a; a = (t1 + t2) | 0;
            }
            H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
        }
        return H;
    };
    // HMAC-SHA256, 返回十六进制字符串(不依赖 CryptoJS)
    var DP_hmac = function (msg) {
        var kb = DP_utf(DP_KEY);
        if (kb.length > 64) kb = DP_w2b(DP_sha(kb));
        while (kb.length < 64) kb.push(0);
        var o = [], inn = [];
        for (var i = 0; i < 64; i++) { o.push(kb[i] ^ 92); inn.push(kb[i] ^ 54); }
        var inner = DP_w2b(DP_sha(inn.concat(DP_utf(msg))));
        return DP_b2h(DP_w2b(DP_sha(o.concat(inner))));
    };
    // 带签名的请求: method + path(含查询串) + 时间戳 + 随机数
    var DP_req = function (method, path, body) {
        var ts = String(Math.floor(Date.now()));
        var nonce = '', hx = '0123456789abcdef';
        for (var i = 0; i < 32; i++) nonce += hx.charAt(Math.floor(Math.random() * 16));
        var hd = { 'Accept': 'application/json', 'Referer': DP_HOST + '/' };
        for (var k in DP_CLI) hd[k] = DP_CLI[k];
        hd['x-ai-movie-timestamp'] = ts;
        hd['x-ai-movie-nonce'] = nonce;
        hd['x-ai-movie-signature'] = DP_hmac(method + '\n' + path + '\n' + ts + '\n' + nonce);
        var opt = { method: method, headers: hd };
        if (body) {
            hd['Content-Type'] = 'application/json';
            opt.body = JSON.stringify(body);
        }
        return fetch(DP_HOST + path, opt);
    };
    var DP_json = function (method, path, body) {
        try { return JSON.parse(DP_req(method, path, body)); } catch (e) { return {}; }
    };
    var DP_p = function (u) { return String(u).replace(/^https?:\/\/[^\/]+/, ''); };
    var DP_card = function (c) {
        return {
            title: c.title || '',
            img: c.poster_url || '',
            desc: c.remarks || (c.year ? c.year + '' : ''),
            url: c.id || ''
        };
    };
    var token = '';
    var tm = /\/p\/([A-Za-z0-9_\-]+)/.exec(String(input));
    if (tm) token = tm[1];
    if (token) {
        var res = DP_json('GET', '/v1/playback/resolve/' + token + '?view=compact');
        var lines = res.line_options || [], direct = '';
        for (var i = 0; i < lines.length; i++) {
            var u = lines[i].url || '';
            if (u.indexOf('resolve://') !== 0) {
                if (/\.m3u8/.test(u)) { direct = u; break; }
                if (!direct && /^https?:/.test(u)) direct = u;
                continue;
            }
            var tick = u.slice(10);
            var rr = DP_json('POST', '/v1/playback/resolve-line?view=compact', { ticket: tick });
            var du = (rr && rr.line && rr.line.url) || '';
            if (!/^https?:/.test(du)) continue;
            if (/\.m3u8/.test(du)) { direct = du; break; }
            if (!direct) direct = du;
        }
        if (direct) {
            input = {
                url: direct,
                parse: 0,
                jx: 0,
                header: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
            };
        }
    }
    })
};
