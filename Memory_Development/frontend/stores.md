# 前端状态管理（Context / Reducer）

## 全局状态入口
- `web/src/context/Status/`：状态上下文与 reducer
- `web/src/context/User/`：用户上下文与 reducer
- `web/src/context/Theme/`：主题上下文

## 常见依赖点
- `StatusContext`：用于读取后端 `/api/status` 之类的运行态配置，并影响页面行为（例如顶栏模块、是否需要登录等）
- `helpers/*` 与 `hooks/*`：封装 API 调用、权限判断、表格数据加载与缓存

