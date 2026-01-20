# 数据库与缓存（部署与配置）

## SQL 数据库（主库）
### 选择规则
- `SQL_DSN` 为空：默认使用 SQLite（数据库文件落在容器工作目录 `/data`）
- `SQL_DSN` 以 `postgres://` 或 `postgresql://` 开头：使用 PostgreSQL
- 其他：使用 MySQL（并自动补齐 `parseTime=true`）

### 常用环境变量
- `SQL_DSN`：主库连接串
- `LOG_SQL_DSN`：日志库连接串（为空则复用主库）
- `SQL_MAX_IDLE_CONNS`、`SQL_MAX_OPEN_CONNS`、`SQL_MAX_LIFETIME`：连接池参数
- `SQLITE_PATH`：SQLite 文件路径（可选）

## Redis（可选）
- `REDIS_CONN_STRING`：Redis URL（不设置则自动禁用 Redis）
- `REDIS_POOL_SIZE`：连接池大小（默认 10）

## docker-compose 持久化建议
- SQLite：必须挂载 `/data`，否则容器重建会丢库文件
- Postgres：使用命名卷 `pg_data` 持久化

## 生产部署安全项（必须确认）
- 修改默认数据库密码（docker-compose 示例里是演示值）
- 若多机部署：设置 `SESSION_SECRET` 为随机字符串，并保持一致

