# 抖音开放平台 API 接入指南 — 中芳堂

> 零封号风险：走官方 API 通道，所有发布行为合规

## 第一步：注册抖音开放平台

1. 访问 https://open.douyin.com/
2. 使用中芳堂的企业信息注册（企业认证）
3. 完成开发者认证

## 第二步：创建应用

1. 进入「管理中心」→「创建应用」
2. 应用类型：**网站应用**
3. 填写应用名称：中芳堂AI内容助手
4. 填写回调地址（可用临时地址，后续更新）

## 第三步：开通权限

审核通过后：
- 进入「接口权限」→「视频发布及管理」
- 此权限 **默认已开通**，无需额外申请
- 如未开通，点击申请即可

## 第四步：获取凭证

在应用详情页获取：
- `client_key`（App ID）
- `client_secret`（App Secret）

## 第五步：授权抖音账号

1. 使用 OAuth 2.0 获取用户授权
2. 用户扫码授权后获得 `access_token`
3. 通过 `access_token` 调用视频发布 API

## API 调用示例

```python
# 1. 获取 access_token
GET https://open.douyin.com/oauth/access_token/
  ?client_key=YOUR_CLIENT_KEY
  &client_secret=YOUR_CLIENT_SECRET
  &code=AUTHORIZATION_CODE
  &grant_type=authorization_code

# 2. 上传视频
POST https://open.douyin.com/api/douyin/v1/video/upload_video/
  ?access_token=ACCESS_TOKEN
  &open_id=USER_OPEN_ID

# 3. 发布视频
POST https://open.douyin.com/api/douyin/v1/video/publish/
  ?access_token=ACCESS_TOKEN
  &open_id=USER_OPEN_ID
  Body: { "video_id": "UPLOADED_VIDEO_ID", "text": "视频标题 #中医养生" }
```

## 接入代码（Python）

```python
import requests

class DouyinPublisher:
    """抖音官方 API 发布器 — 零封号风险"""
    
    def __init__(self, client_key, client_secret):
        self.client_key = client_key
        self.client_secret = client_secret
        self.base_url = "https://open.douyin.com"
    
    def get_access_token(self, code):
        """通过授权码获取 access_token"""
        resp = requests.get(f"{self.base_url}/oauth/access_token/", params={
            "client_key": self.client_key,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code"
        })
        return resp.json()
    
    def upload_video(self, access_token, open_id, video_path):
        """上传视频文件"""
        with open(video_path, 'rb') as f:
            resp = requests.post(
                f"{self.base_url}/api/douyin/v1/video/upload_video/",
                params={"access_token": access_token, "open_id": open_id},
                files={"video": f}
            )
        return resp.json()
    
    def publish_video(self, access_token, open_id, video_id, title, topics=None):
        """发布视频"""
        text = title
        if topics:
            text += " " + " ".join(f"#{t}" for t in topics)
        
        resp = requests.post(
            f"{self.base_url}/api/douyin/v1/video/publish/",
            params={"access_token": access_token, "open_id": open_id},
            json={"video_id": video_id, "text": text}
        )
        return resp.json()

# 使用示例
# publisher = DouyinPublisher("YOUR_CLIENT_KEY", "YOUR_CLIENT_SECRET")
# token_data = publisher.get_access_token("AUTHORIZATION_CODE")
# upload_result = publisher.upload_video(token_data["access_token"], token_data["open_id"], "video.mp4")
# publish_result = publisher.publish_video(
#     token_data["access_token"], token_data["open_id"],
#     upload_result["video"]["video_id"],
#     "中医芳香疗法：3分钟了解精油养生",
#     ["中医养生", "芳香疗法", "精油"]
# )
```

## 注意事项

- ⚠️ 不要上传带品牌 logo 或水印的视频（可能降权/下架）
- ⚠️ 视频推荐 16:9，720p 以上，mp4 格式
- ⚠️ 视频不超过 4GB，时长 15 分钟以内
- ✅ 通过官方 API 发布的视频审核逻辑与抖音端内一致
