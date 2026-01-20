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
| `/console/models` | ModelPage | AdminRoute |
| `/console/deployment` | ModelDeploymentPage | AdminRoute |
| `/console/channel` | Channel | AdminRoute |
| `/console/redemption` | Redemption | AdminRoute |
| `/console/user` | User | AdminRoute |
| `/console/token` | Token | PrivateRoute |
| `/console/playground` | Playground | PrivateRoute |
| `/console/topup` | TopUp | PrivateRoute（按实际组件实现） |
| `/console/log` | Log | PrivateRoute（按实际组件实现） |
| `/console/setting` | Setting/PersonalSetting | PrivateRoute（按实际组件实现） |
| `/console/chat` | Chat | PrivateRoute（按实际组件实现） |
| `/console/midjourney` | Midjourney | PrivateRoute（按实际组件实现） |
| `/console/task` | Task | PrivateRoute（按实际组件实现） |
| `/console/pricing` | Pricing | 可能需要登录（受配置影响） |

提示：控制台路由较多，以 `web/src/App.jsx` 为准，可按需补全此表。

