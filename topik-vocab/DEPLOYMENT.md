# TOPIK单词：正式网址与部署约定

**固定公开入口**：https://evelynyyyyy.github.io/study-abroad/k/

**实际应用路径**：https://evelynyyyyy.github.io/study-abroad/topik-vocab/

**仓库**：`evelynyyyyy/study-abroad`；**发布分支**：`gh-pages`；**GitHub Pages 源目录**：分支根目录 `/`（由已有成功的 Pages 构建记录及发布路径确认；GitHub Pages Settings API 当前未授权读取）。

## 后续发布规则

1. 所有正式修改只更新上述仓库的 `gh-pages` 分支下 `topik-vocab/` 文件，继续使用原有发布路径；不得新建版本目录、变更公开入口、覆盖仓库根 `index.html`（该文件属于另一网站）。
2. `k/index.html` 是固定短链接的同源跳转入口。不得删除它，也不得改为不同来源的域名；自动测试验证其指向 `../topik-vocab/`。
3. 资源文件可以在 HTML 内部添加版本参数以更新浏览器缓存，但对用户提供的**公开网址**不得添加版本号或随机参数。
4. 保留 `localStorage` 主键 `topik_lab_v2`，对新字段使用兼容迁移；不得清空浏览器存储。CI 验证固定入口和导入导出功能仍存在。
5. 正式更新前检查 GitHub Actions 的 `Check Korean vocabulary app`，并确认 `pages build and deployment` 成功。自动检查与 Pages 发布可能并行，因此不能把检查成功等同于部署成功。
6. 测试可使用临时分支，但不得更改正式入口。没有用户明确同意，不得设置 `CNAME`、更改 Pages 域名或做跨域跳转。

## 数据备份与未来域名迁移

网站设置 → **导出备份**：下载 JSON，其中 `state` 包含进度、两个方向的记忆状态、错词、每日记录、收藏、个性化词汇、智能答题历史和偏好。设置 → **导入备份** 可以恢复 JSON；导入会覆盖新域名当前浏览器内的记录，操作前应先备份两边数据。

如以后购买独立域名：先从旧网址导出 JSON → 在新域名验证网站和 HTTPS → 在新域名导入 JSON → 核对进度及双向复习 → 仅在用户确认后考虑旧入口的跳转。浏览器不同来源的 localStorage 不会自动共享。

## 独立域名（未启用）

候选如 `kword.study`、`mykorean.app`、`korwords.com` 都需先核实可注册性、购买价格及续费价格。购得域名后，在 GitHub Pages 设置自定义域名，按 GitHub 的指引配置 DNS（子域通常 CNAME，根域通常 A/AAAA/ALIAS），待证书签发后启用 HTTPS。未经用户明确批准，不修改 DNS、Pages 自定义域名或旧站重定向。
