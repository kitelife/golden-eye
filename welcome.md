# Golden-Eye(火眼金睛)

## 依赖

- NodeJS

## 运行

- 安装依赖: 从官网下载NodeJS
- 安装工程依赖: `npm install`
- 启动: `node server.js`

## API

### 获取站点/页面指纹

- URL：`/check`
- 请求方法：`GET`
- 请求参数：
    - `token`：用于身份验证
    - `url`：站点主页或子页URL，带协议头
- 响应示例：

```json
{
    // 标识是否成功获取指纹，`success` 或 `failed`
    "status": "success",
    // 如果 `status` 为 `failed`，则 使用 `message` 字段替代 `data` 字段
    "data": {
        // 指纹探测出的应用列表
        "apps": [
            "ClickHeat",
            "Nginx",
            "PHP",
            "Twitter Bootstrap",
            "jQuery"
        ],
        // 指纹中应用的详细信息，包括版本、所属分类、可信度
        "details": {
            "ClickHeat": {
                "versions": [],
                "category": [
                    "analytics"
                ],
                "confidence": 100
            },
            "Nginx": {
                "versions": [
                    "1.9.7"
                ],
                "category": [
                    "web-servers"
                ],
                "confidence": 100
            },
            "PHP": {
                "versions": [
                    "5.5.30"
                ],
                "category": [
                    "programming-languages"
                ],
                "confidence": 100
            },
            "Twitter Bootstrap": {
                "versions": [],
                "category": [
                    "web-frameworks"
                ],
                "confidence": 100
            },
            "jQuery": {
                "versions": [
                    "1.9.1"
                ],
                "category": [
                    "javascript-frameworks"
                ],
                "confidence": 100
            }
        }
    }
}
```

## 应用分类列表

*注：未重新整理开源项目wappalyzer所使用的分类*

```text
"1": "cms",
"2": "message-boards",
"3": "database-managers",
"4": "documentation-tools",
"5": "widgets",
"6": "ecommerce",
"7": "photo-galleries",
"8": "wikis",
"9": "hosting-panels",
"10": "analytics",
"11": "blogs",
"12": "javascript-frameworks",
"13": "issue-trackers",
"14": "video-players",
"15": "comment-systems",
"16": "captchas",
"17": "font-scripts",
"18": "web-frameworks",
"19": "miscellaneous",
"20": "editors",
"21": "lms",
"22": "web-servers",
"23": "cache-tools",
"24": "rich-text-editors",
"25": "javascript-graphics",
"26": "mobile-frameworks",
"27": "programming-languages",
"28": "operating-systems",
"29": "search-engines",
"30": "web-mail",
"31": "cdn",
"32": "marketing-automation",
"33": "web-server-extensions",
"34": "databases",
"35": "maps",
"36": "advertising-networks",
"37": "network-devices",
"38": "media-servers",
"39": "webcams",
"40": "printers",
"41": "payment-processors",
"42": "tag-managers",
"43": "paywalls",
"44": "build-ci-systems",
"45": "control-systems",
"46": "remote-access",
"47": "dev-tools",
"48": "network-storage",
"49": "feed-readers",
"50": "document-management-systems",
"51": "landing-page-builders",
"52": "web-security"
```
