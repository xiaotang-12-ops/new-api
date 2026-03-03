# 版本记录（时间倒序）

## v0.0.3（2026-02-28.下午18:10）
- **普通用户日志计费细节与上游映射信息隐藏修复**：
  - **用户提问**：普通用户在“使用日志”展开后还能看到“实际模型/计费过程/上游返回”等细节，会暴露模型重定向与计费信息，希望彻底禁止查看。
  - **问题根因**：
    1. 后端日志脱敏只删除了部分键，`other` 中计费倍率/计费过程相关字段仍返回给普通用户。
    2. 前端日志页对 `type=消费` 的“日志详情/计费过程/模型映射弹层”未按管理员身份做渲染限制。
  - **问题场景**：普通用户访问 `/api/log/self` 并展开日志行时，可看到请求并计费模型、实际模型、计费过程等信息。
  - **修复方案**：
    1. 在 `controller/log.go` 将普通用户 `other` 改为严格白名单输出，仅保留安全字段（如 `request_path`、`frt`、`group`、错误码类字段），默认过滤计费与上游映射细节。
    2. 在 `web/src/hooks/usage-logs/useUsageLogsData.jsx` 对“日志详情/计费过程/实际模型”展开内容增加 `isAdminUser` 条件，仅管理员渲染。
    3. 在 `web/src/components/table/usage-logs/UsageLogsColumnDefs.jsx`：
       - 普通用户禁用模型映射 Popover（仅显示请求模型标签）
       - 普通用户“详情”列不再渲染计费摘要，回退普通文本显示。
    4. 使用 Docker 全量构建验证（前后端编译通过）。
  - **影响文件**：`controller/log.go`、`web/src/hooks/usage-logs/useUsageLogsData.jsx`、`web/src/components/table/usage-logs/UsageLogsColumnDefs.jsx`、`Memory_Development/backend/api.md`、`Memory_Development/frontend/routes.md`、`Memory_Development/index.md`、`Memory_Development/changelog.md`、`VERSION`
  - **记录人**：Codex（小雅）

## v0.0.2（2026-02-27.下午15:18）
- **侧边栏模块可见性与路由访问一致性修复**：
  - **用户提问**：希望可按权限控制用户能看到哪些模块（如只保留数据看板/令牌管理/使用日志），并避免隐藏后还能通过地址栏访问。
  - **问题根因**：侧边栏已按 `sidebar_modules` 做显示过滤，但 `web/src/App.jsx` 路由层只做了登录/管理员校验，未校验模块可见性。
  - **问题场景**：管理员在侧边栏配置中隐藏模块后，用户仍可手动输入 `/console/*` 路径访问对应页面。
  - **修复方案**：
    1. 在 `web/src/helpers/auth.jsx` 新增 `SidebarModuleRoute`，统一校验模块是否在当前用户的侧边栏配置中可见。
    2. 在 `web/src/App.jsx` 为控制台相关路由增加 `SidebarModuleRoute` 包装（`console`/`personal`/`admin` 区域对应模块）。
    3. 模块被隐藏时路由直接重定向到 `/forbidden`，确保“隐藏=不可直达访问”（前端层面）。
  - **影响文件**：`web/src/helpers/auth.jsx`、`web/src/App.jsx`、`Memory_Development/frontend/routes.md`、`Memory_Development/index.md`、`Memory_Development/changelog.md`、`VERSION`
  - **记录人**：Codex（小雅）

## v0.0.1（2026-02-27.上午11:22）
- **日志真实模型字段权限收敛**：
  - **用户提问**：云服务已有运行数据，希望普通用户看消费日志时只看到请求模型，不暴露重定向后的实际/上游模型，管理员保留可见。
  - **问题根因**：用户日志接口直接返回原始 `other` 字段，其中包含 `upstream_model_name` 等真实上游模型信息；缺少按角色裁剪。
  - **问题场景**：普通用户访问 `/api/log/self`、`/api/log/self/search`（以及可公开访问的 `/api/log/token`）时，能看到模型映射细节。
  - **修复方案**：
    1. 在 `controller/log.go` 增加统一脱敏逻辑：基于 `role` 判断是否为 `Admin/Root`。
    2. 对非管理员删除 `other` 中真实模型相关键（如 `upstream_model_name`、`actual_model`、`real_model`、`target_model`、`provider_model` 等），并删除 `is_model_mapped`。
    3. 将脱敏逻辑接入 `GetUserLogs`、`SearchUserLogs`；`GetLogByKey` 因无鉴权默认按非管理员脱敏。
  - **影响文件**：`controller/log.go`、`Memory_Development/backend/api.md`、`Memory_Development/index.md`、`Memory_Development/changelog.md`、`VERSION`
  - **记录人**：Codex（小雅）

## v0.0.0（2026-01-20）
- 初始化 Memory_Development 文档体系：index/backend/frontend/database/changelog

