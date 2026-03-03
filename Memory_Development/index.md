# 项目快照（必读）

## 项目定位
New-API 是一个 Go(Gin) 单体服务，提供：
- 控制台/管理 API：`/api/*`
- OpenAI/Gemini/Claude 等兼容转发 API：`/v1*`、`/v1beta*`、`/mj`、`/suno`、`/kling/v1` 等
- 前端管理后台（React SPA）：默认由后端内嵌并静态托管；也支持通过 `FRONTEND_BASE_URL` 切换为前后端分离（后端 301 重定向）

## 项目结构（tree 风格）
（忽略 node_modules/.git 等系统目录）

```
new-api/
├─ common/                 # 通用工具与全局配置：env、redis、加密、限流、日志等
├─ constant/               # 常量与枚举：渠道类型、环境变量键、任务/模型相关常量等
├─ controller/             # HTTP Handler：各业务接口入口（与 router 绑定）
├─ docs/                   # 项目说明与图片等（非运行时依赖）
├─ dto/                    # 请求/响应 DTO 与协议适配结构
├─ logger/                 # 日志初始化与封装
├─ middleware/             # Gin 中间件：鉴权/限流/CORS/恢复/统计等
├─ model/                  # 数据层：GORM 模型、DB 初始化、迁移与缓存
├─ pkg/                    # 可复用包（如 ionet 客户端等）
├─ relay/                  # 上游适配与转发：OpenAI/Gemini/Claude/… 多渠道实现
├─ router/                 # 路由注册：/api、/v1、/mj、静态站点等
├─ service/                # 服务层：HTTP client、任务、编码器、业务辅助
├─ setting/                # 运行配置的结构化定义与加载逻辑
├─ types/                  # 共享类型：错误结构、请求元信息等
├─ web/                    # 前端（React + Vite）源码与构建配置
├─ Dockerfile              # 多阶段构建：Bun 构建前端 + Go 编译后端 + 运行时镜像
├─ docker-compose.yml      # 一键部署（new-api + postgres + redis）
├─ main.go                 # 后端入口：加载 env、初始化资源、启动 Gin
└─ .env.example            # 环境变量示例（可选）
```

## 访问端口（部署时最关心）
- 对外访问：默认 `http://<宿主机>:3000/`
- docker-compose：`"3000:3000"`（宿主机 3000 → 容器 3000）
- 端口优先级：`PORT` 环境变量 > `--port` 启动参数 > 默认 3000

## 核心路由总览（后端）
路由装配入口：`router/SetRouter`（依次注册 API、Dashboard、Relay、Video、Web/Redirect）

| 路由前缀 | 说明 | 主要文件 |
|---|---|---|
| `/api` | 控制台/管理类 API（用户、渠道、token、日志、设置等） | `router/api-router.go` |
| `/dashboard`、`/v1/dashboard` | OpenAI dashboard billing/usage 兼容 | `router/dashboard.go` |
| `/v1` | OpenAI/Claude/Embedding/Image/Audio/Rerank/Realtime 等兼容转发 | `router/relay-router.go` |
| `/v1beta`、`/v1beta/models` | Gemini 相关兼容与转发 | `router/relay-router.go` |
| `/mj`、`/:mode/mj` | Midjourney 相关代理与任务 | `router/relay-router.go` |
| `/suno` | Suno 任务转发 | `router/relay-router.go` |
| `/kling/v1`、`/jimeng` | Kling/即梦相关视频任务 | `router/video-router.go` |
| `/` | 前端静态资源与 SPA 兜底（或重定向到 `FRONTEND_BASE_URL`） | `router/web-router.go`、`router/main.go` |

更细的 API/端点清单见：
- `backend/api.md`

## 外部依赖与数据持久化
- 数据库：支持 PostgreSQL/MySQL/SQLite（按 `SQL_DSN` 决定；为空默认 SQLite）
- Redis：可选（未设置 `REDIS_CONN_STRING` 时自动禁用）
- Docker 部署：
  - 建议生产改掉默认数据库密码
  - 若用 SQLite，务必挂载 `/data`（docker-compose 已默认 `./data:/data`）

更细见：
- `database.md`

## 前端路由与页面
- 前端路由表在 `web/src/App.jsx`（react-router-dom v6）
- 路径大多以 `/console/*` 为控制台入口（PrivateRoute/AdminRoute）

更细见：
- `frontend/routes.md`
- `frontend/components.md`
- `frontend/stores.md`

## 文档索引（这里能查到什么）
- `backend/api.md`：后端路由前缀与关键端点清单（按模块）
- `backend/services.md`：后端核心模块职责（controller/service/model/common/relay）
- `database.md`：数据库/Redis 配置、持久化与常见部署注意点
- `frontend/routes.md`：前端路由路径 → 页面/权限
- `frontend/components.md`：主要组件目录与用途
- `frontend/stores.md`：全局状态（React Context/reducer）与关键状态点
- `changelog.md`：版本演进记录（时间倒序；index.md 只保留最近 3 个版本摘要）

## 最近版本（只保留 3 个）
### v0.0.3（日志隐私收口）
- 普通用户使用日志改为严格脱敏：不再返回/展示实际模型、计费过程、上游返回等会暴露重定向与计费策略的字段
- 前端日志详情区按角色渲染：管理员保留完整排障信息，普通用户仅看安全基础信息

### v0.0.2（模块可见性路由收口）
- 控制台路由增加 `SidebarModuleRoute` 校验：隐藏的侧边栏模块不能再通过直接 URL 访问
- 可与“管理员侧边栏全局配置”联动，实现“只显示并允许访问指定模块”（例如仅保留数据看板/令牌管理/使用日志）

### v0.0.1（日志字段权限控制）
- `/api/log/self` 与 `/api/log/self/search` 按角色返回：普通用户隐藏真实/上游模型字段，Admin/Root 保持可见
- `/api/log/token` 默认按非管理员视角脱敏，避免公开接口暴露上游重定向信息

