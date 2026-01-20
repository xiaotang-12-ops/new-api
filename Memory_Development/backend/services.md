# 后端核心模块（职责速查）

## 入口与初始化
- 入口：`main.go`
- 资源初始化：`InitResources()`（加载 `.env`，初始化 env、logger、ratio settings、HTTP client、token encoder、DB、log DB、Redis）

## `router/`（路由层）
- 负责将路由前缀与 controller 绑定，并组合中间件链
- `router/main.go`：总装配（Api/Dashboard/Relay/Video/Web/Redirect）
- `router/web-router.go`：静态站点托管与 SPA 兜底（NoRoute 对 `/v1`、`/api`、`/assets` 做排除）

## `controller/`（业务入口）
- Gin handler 层，做参数校验、权限检查、调用 service/model 完成业务
- `/api/*` 的主要接口落在这里（如 user/channel/token/log/model/task 等）

## `middleware/`（横切能力）
- 鉴权：UserAuth / AdminAuth / RootAuth / TokenAuth 等
- 限流：GlobalAPIRateLimit / GlobalWebRateLimit / CriticalRateLimit / ModelRequestRateLimit
- 其他：CORS、解压请求、统计、请求 ID、recover、logger、分发（Distribute）等

## `service/`（服务层）
- 封装 HTTP client、token encoder、任务定时、第三方回调/支付等服务能力
- 多数 controller 会在这里完成“非纯 DB”的业务流程

## `model/`（数据层）
- GORM 模型与 DB 初始化（支持 Postgres/MySQL/SQLite 按 `SQL_DSN` 选择）
- option/config 同步、缓存、定时更新等

## `relay/`（转发/适配层）
- 对接多家上游模型供应商并提供统一转发能力
- 与 `router/relay-router.go` 中的 `/v1*`、`/mj`、`/suno` 等路由配合

## `common/`（基础设施）
- env 解析与默认值、Redis 初始化、加解密、限流工具、日志工具等

