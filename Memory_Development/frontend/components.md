# 前端组件清单（按目录）

## 目录速查

| 目录 | 作用 |
|---|---|
| `web/src/components/layout/` | 全局布局：Header/Sider/Footer/页面壳（含 SetupCheck） |
| `web/src/components/auth/` | 登录/注册/重置密码/OAuth 回调/2FA 等 |
| `web/src/components/dashboard/` | 数据看板组件（图表、统计卡片、FAQ、公告等） |
| `web/src/components/playground/` | Playground（调试/发起请求/SSE 查看/参数管理等） |
| `web/src/components/settings/` | 系统/操作/支付/比例/模型部署等设置页组件 |
| `web/src/components/table/` | 表格页（channels/tokens/users/logs/models 等）及其 modal |
| `web/src/components/common/` | 通用 UI 组件与工具（Loading、Card、JSONEditor、MarkdownRenderer 等） |

## 典型入口组件
- `web/src/components/layout/PageLayout.jsx`：页面布局容器（渲染路由 App）
- `web/src/components/layout/headerbar/`：顶部导航与操作区
- `web/src/components/layout/SiderBar.jsx`：侧边栏

