# 前端路由清单（React Router）

> 说明：路由定义集中在 `web/src/App.jsx`，并由 `web/src/index.jsx` 将 App 渲染进 `PageLayout`。

## 公共路由

| 路径 | 页面 | 备注 |
|---|---|---|
| `/` | Home | 主页 |
| `/setup` | Setup | 初始化向导 |
| `/about` | About | 关于 |
| `/privacy-policy` | PrivacyPolicy | 隐私政策 |
| `/user-agreement` | UserAgreement | 用户协议 |
| `/login` | LoginForm | 登录 |
| `/register` | RegisterForm | 注册 |
| `/reset` | PasswordResetForm | 找回密码 |
| `/user/reset` | PasswordResetConfirm | 重置密码确认 |
| `/forbidden` | Forbidden | 无权限 |

## OAuth 回调

| 路径 | 页面/组件 | 备注 |
|---|---|---|
| `/oauth/github` | OAuth2Callback(github) | GitHub OAuth 回调 |
| `/oauth/discord` | OAuth2Callback(discord) | Discord OAuth 回调 |
| `/oauth/oidc` | OAuth2Callback(oidc) | OIDC OAuth 回调 |

## 控制台路由（`/console/*`）

| 路径 | 页面 | 权限 |
|---|---|---|
| `/console/models` | ModelPage | `AdminRoute` + `SidebarModuleRoute(admin.models)` |
| `/console/deployment` | ModelDeploymentPage | `AdminRoute` + `SidebarModuleRoute(admin.deployment)` |
| `/console/channel` | Channel | `AdminRoute` + `SidebarModuleRoute(admin.channel)` |
| `/console/redemption` | Redemption | `AdminRoute` + `SidebarModuleRoute(admin.redemption)` |
| `/console/user` | User | `AdminRoute` + `SidebarModuleRoute(admin.user)` |
| `/console/setting` | Setting | `AdminRoute` + `SidebarModuleRoute(admin.setting)` |
| `/console/token` | Token | `PrivateRoute` + `SidebarModuleRoute(console.token)` |
| `/console` | ConsoleLandingRoute（按权限落地） | `PrivateRoute`；若有 `console.detail` 则进入 Dashboard，否则自动跳转到首个可见控制台模块（如 token/log） |
| `/console/log` | Log | `PrivateRoute` + `SidebarModuleRoute(console.log)` |
| `/console/midjourney` | Midjourney | `PrivateRoute` + `SidebarModuleRoute(console.midjourney)` |
| `/console/task` | Task | `PrivateRoute` + `SidebarModuleRoute(console.task)` |
| `/console/playground` | Playground | `PrivateRoute` + `SidebarModuleRoute(chat.playground)` |
| `/console/topup` | TopUp | `PrivateRoute` + `SidebarModuleRoute(personal.topup)` |
| `/console/personal` | PersonalSetting | `PrivateRoute` + `SidebarModuleRoute(personal.personal)` |
| `/console/chat/:id?` | Chat | `PrivateRoute` + `SidebarModuleRoute(chat.chat)` |

提示：
- 侧边栏显示由 `useSidebar` 负责；路由访问由 `SidebarModuleRoute` 二次校验，防止隐藏模块被直接 URL 访问。
- 控制台路由较多，以 `web/src/App.jsx` 为准。

