# 后端 API 清单（按模块）

> 说明：以 `router/*.go` 为准；此文档记录“对外接口形态与入口文件”，便于快速定位。

## 路由装配入口
- `main.go` 调用 `router.SetRouter(server, buildFS, indexPage)`
- `router/main.go` 负责注册：Api / Dashboard / Relay / Video / Web（或重定向）

## `/api`（控制台/管理 API）
入口：`router/api-router.go`

| 方法 | 路径 | 权限/鉴权 | 备注 |
|---|---|---|---|
| GET | `/api/status` | 无 | 服务状态 |
| GET | `/api/setup` | 无 | 初始化状态 |
| POST | `/api/setup` | 无 | 初始化提交 |
| GET | `/api/models` | UserAuth | 控制台模型列表 |
| GET | `/api/pricing` | TryUserAuth | 定价/模型广场 |
| GET | `/api/verification` | 限流 + Turnstile | 邮箱验证码 |
| GET | `/api/reset_password` | 限流 + Turnstile | 重置密码邮件 |
| POST | `/api/user/register` | 限流 + Turnstile | 注册 |
| POST | `/api/user/login` | 限流 + Turnstile | 登录 |
| GET | `/api/user/logout` | 无 | 登出 |
| GET | `/api/user/self` | UserAuth | 当前用户信息 |
| PUT | `/api/user/self` | UserAuth | 更新当前用户 |
| GET | `/api/channel/*` | AdminAuth | 渠道管理（列表/增删改/测试/拉取模型等） |
| GET/POST/PUT/DELETE | `/api/token/*` | UserAuth | Token 管理 |
| GET/POST/PUT/DELETE | `/api/user/*` | AdminAuth | 用户管理 |
| GET/POST | `/api/verify/*` | UserAuth | 通用安全验证 |

提示：`/api` 下端点较多，详细以源码为准：`router/api-router.go`

## `/dashboard` 与 `/v1/dashboard`（OpenAI dashboard billing/usage 兼容）
入口：`router/dashboard.go`

| 方法 | 路径 | 权限/鉴权 | 备注 |
|---|---|---|---|
| GET | `/dashboard/billing/subscription` | TokenAuth | 订阅信息 |
| GET | `/dashboard/billing/usage` | TokenAuth | 用量信息 |
| GET | `/v1/dashboard/billing/subscription` | TokenAuth | 同上（兼容） |
| GET | `/v1/dashboard/billing/usage` | TokenAuth | 同上（兼容） |

## `/v1/models`（模型列表/检索）
入口：`router/relay-router.go`

| 方法 | 路径 | 权限/鉴权 | 备注 |
|---|---|---|---|
| GET | `/v1/models` | TokenAuth | 根据请求头判定渠道类型并返回模型 |
| GET | `/v1/models/:model` | TokenAuth | 检索模型 |

## `/v1`（OpenAI/Claude/Gemini 等兼容转发）
入口：`router/relay-router.go`

| 方法 | 路径 | 权限/鉴权 | 备注 |
|---|---|---|---|
| GET | `/v1/realtime` | TokenAuth + Distribute | OpenAI Realtime（WebSocket） |
| POST | `/v1/messages` | TokenAuth + Distribute | Claude Messages |
| POST | `/v1/completions` | TokenAuth + Distribute | OpenAI Completions |
| POST | `/v1/chat/completions` | TokenAuth + Distribute | OpenAI Chat Completions |
| POST | `/v1/responses` | TokenAuth + Distribute | OpenAI Responses |
| POST | `/v1/images/generations` | TokenAuth + Distribute | 图片生成 |
| POST | `/v1/embeddings` | TokenAuth + Distribute | Embeddings |
| POST | `/v1/audio/transcriptions` | TokenAuth + Distribute | 语音转文字 |
| POST | `/v1/audio/speech` | TokenAuth + Distribute | 文本转语音 |
| POST | `/v1/rerank` | TokenAuth + Distribute | Rerank |
| POST | `/v1/models/*path` | TokenAuth + Distribute | Gemini relay 兼容路径 |

## `/v1beta`（Gemini 兼容）
入口：`router/relay-router.go`

| 方法 | 路径 | 权限/鉴权 | 备注 |
|---|---|---|---|
| GET | `/v1beta/models` | TokenAuth | Gemini 模型列表 |
| POST | `/v1beta/models/*path` | TokenAuth + Distribute | Gemini API：`/models/{model}:{action}` |

## `/mj` 与 `/:mode/mj`（Midjourney）
入口：`router/relay-router.go`

| 方法 | 路径 | 权限/鉴权 | 备注 |
|---|---|---|---|
| GET | `/mj/image/:id` | 无 | 图片代理 |
| POST | `/mj/submit/*` | TokenAuth + Distribute | 提交任务（imagine/describe/...） |
| GET | `/mj/task/:id/fetch` | TokenAuth + Distribute | 查询任务 |
| GET | `/:mode/mj/image/:id` | 无 | 按 mode 分流 |
| POST/GET | `/:mode/mj/...` | TokenAuth + Distribute | 同上 |

## `/suno`（Suno 任务）
入口：`router/relay-router.go`

| 方法 | 路径 | 权限/鉴权 | 备注 |
|---|---|---|---|
| POST | `/suno/submit/:action` | TokenAuth + Distribute | 提交任务 |
| POST | `/suno/fetch` | TokenAuth + Distribute | 查询 |
| GET | `/suno/fetch/:id` | TokenAuth + Distribute | 查询 |

## 视频相关（OpenAI/Kling/即梦）
入口：`router/video-router.go`

| 方法 | 路径 | 权限/鉴权 | 备注 |
|---|---|---|---|
| POST | `/v1/video/generations` | TokenAuth + Distribute | 视频生成任务 |
| GET | `/v1/video/generations/:task_id` | TokenAuth + Distribute | 查询任务 |
| GET | `/v1/videos/:task_id/content` | TokenAuth + Distribute | 获取视频内容 |
| POST | `/v1/videos` | TokenAuth + Distribute | OpenAI videos create（兼容） |
| GET | `/v1/videos/:task_id` | TokenAuth + Distribute | 查询（兼容） |
| POST | `/kling/v1/videos/text2video` | TokenAuth + Distribute | Kling（请求转换） |
| POST | `/kling/v1/videos/image2video` | TokenAuth + Distribute | Kling（请求转换） |
| POST | `/jimeng/` | TokenAuth + Distribute | 即梦官方 API 映射（请求转换） |

