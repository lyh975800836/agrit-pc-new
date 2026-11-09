# Findings

## 右侧统计专项 review（2026-11-09）

本轮只 review，业务代码未修改。发现三个问题，均在隔离模拟浏览器复现：

1. **P2 账号绑定状态判断错误**（ScopeStatistics.vue:20）。Plot 契约明确 owner_user_id 字符串 "0" 表示未绑定，但模板按 truthy 判断，实测显示“已绑定”。农户直接进入小地块时又有相反问题：详情返回 owner_user_id=2031 / owner_username=farmer-test，但 buildPlotData 丢弃 owner_user_id，而账号列也不读 owner_username，实际显示“未绑定”。需要保留并归一化账号信息，区分缺失、"0" 和真实 ID，优先展示实际账号名称。
2. **P2 主地块区域株密度优先取了节点统计**（scopeStatistics.js:79-80）。接口 summary.trees_per_mu 明确为 in_region_trees / region_area，根节点 trees_per_mu 可能包括区域外的树。模拟总株数 30、区域内 20、区域面积 60、root.trees_per_mu=.5、summary.trees_per_mu=1/3，页面“区域株密度”显示 .5 而应为 .333…；同页面旧全局统计使用 summary 字段，口径不一致。主地块应优先 summary 的区域密度，缺失时使用区域内株数计算。
3. **P2 直接进入区域 URL 把未加载的数据显示为零**（scopeStatistics.js:48-50,73-76）。discoverDrilldown 对直接 region 入口不加载 descendants，nodes 和 stats 均为空。直接 /plot/901 实测：区域 summary 为 30 株，但右侧显示小地块 0 块、农户林地 0 亩、小地块内 0 株及“当前范围暂无小地块”；同一模拟区域从主地块下钻可显示两个真实子节点。这是“未加载”被当成“空数据”，应加载授权的区域子节点/统计，或将未知指标展示为不可用。

验证限制：现有 26 项测试及构建在上一轮已通过，但未覆盖以上场景。本轮没有执行真实后端写入，也未重新登录真实账号。

- 截图统计同步：文档明确 source_area_mu / coverage 位于小地块 ext_attrs；统计行与 sub-plots 按字符串 ID 合并。截图要求小地块名称、账号、面积、株数、株密度、平均冠幅、原始面积、影像覆盖、合计与查看入口。范围/批次变化必须丢弃旧统计；缺失值显示破折号。用户展示布局偏好已异步询问。

- Vue 2 + Vuex + Vue CLI，现有 PlotDetailV2 承担巡飞时间线和地图数据编排。
- 数据链：apiClient → plotDetailDataService → analysisBatchCache → PlotDetailV2 → WMTSTileMap。
- 现有入口通过名称匹配列表，子节点需直接用字符串 ID 请求 detail。
- 区域下钻需通过 ext_attrs.drilldown 或 sub-plots 的 region 节点识别；农户 parcel 入口不请求管理统计。
- summary.analysis_tile 必须 completed，农户禁止基础底图回退，图层名每次读取接口。
- 节点切换必须统一 plot_id，批次变化重取管理统计；has_pest / has_yield 控制展示。

来源：用户提供的 miniapp-api-v2.md 和 overview-drilldown-api.md。

- 同目录 open-api.md 补充了投影公式：x=(lon-min_lon)*pixel_per_lon_degree，y=(max_lat-lat)*pixel_per_lat_degree，显示时乘 displayTileSize/tile_size。
- graphify 仅本地 AST 索引 src，136 个代码文件；确认缓存、详情服务和地图之间的调用关系，未上传代码。
- 范围功能独立在 drilldownMixin 与新组件中；普通地块沿用原地图准备/预取路径。

## 2026-11-09

- 原 scoped 边界只有描线，未显示名称，且原始 click 被 tile-grid 的 pointer capture 重定向。必须用真实 pointer 操作验证。
- 总览底图 17×24 格，原 tileSize 下限 80 导致多数区域首屏不可见；scoped 需要同时适配宽高。
- 图中主地块 1053 的 13 个区域和 41 个小地块已全部实际点击核验；同名小地块按 ID 保留。

## 全量新增功能 review（2026-11-09）

范围：已提交的 PC 下钻功能与当前未提交的交互修复。此次仅审查与验证，没有修改业务代码。接口文档为验收依据；未取得可访问的原 demo URL，不能声称完成与 demo 的逐项对照。

### 已确认问题

1. **P2 农事任务防重状态在报告关闭后丢失**。`PlotScopeReport.vue:30,81` 的 busy/taskId 只存在于实例内，父组件 `PlotDetailV2.vue:168` 用 v-if 销毁实例。模拟环境完成一次创建、关闭重开后，taskId 为空，可对同一 plot_id=900 / analysis_id=14 再发 create-farming；实际记录到两次相同 POST。请求未完成时关闭重开也会绕过 busy。建议将进行中/已创建状态按地块和批次保存在父级或共享状态，并与后端幂等策略配合。已确认重复请求，未向真实后端创建任务，因此没有证据确认真实库产生重复记录。
2. **P3 跨范围切换后巡飞节点加载动画不消失**。`drilldownMixin.js:98-105,210-215` 更换令牌但不清 analysisSwitchingId。模拟延迟根节点批次 13 的树接口：summary 已返回，scopeLoading=false、范围入口可用；进入区域 901 后释放旧请求，区域数据加载完成但 analysisSwitchingId 仍是 13，DOM 保留 1 个 loading 节点。建议新范围接管时重置批次切换状态。
3. **P3 年份切换的 403 被处理两次**。`PlotDetailV2.vue:949` 已调用 handleScopeError 后抛出，`:1137` 再处理一次。隔离模拟 timeline 返回业务 403，记录到两次“无权查看该地块”提示，随后返回列表。建议仅由一层统一处理，保持不重试。

### 逐项覆盖

| 新增功能 | 结果与证据 |
| --- | --- |
| ID 路由、同名地块、长 ID | 代码审查及单测通过；ID 保持字符串，同名标记按 ID 保留 |
| 主地块 → 区域 → 小地块、面包屑及同区域切换 | 本次核对上一轮真实点击记录：13 区域、41 小地块全部核验选中 ID |
| 地图内部/名称点击、拖动、键盘、名称避让 | 本次核对上一轮真实鼠标、拖动、Enter 验证记录与相关单测 |
| 按元数据投影、父区域底图、边界高亮 | 代码/单测及上一轮真实小地块 1067 验证；底图所属 1054 |
| 区域/小地块/农户统计、搜索、多地块农户 | 本轮真实数据：13/41/38 行，所有行入口均能匹配节点；盘通书两个地块入口为 1094/1084；李通林搜索匹配一个区域及农户 |
| 批次切换、旧响应隔离、随机图层重新获取 | 代码与单测通过；存在上述跨范围 loading 残留 |
| 树点开关、单树详情、所属农户信息 | 上一轮真实 1067 的 87 株及 R01-000001 点击记录；本轮审查请求 ID 与过期响应保护 |
| has_pest/has_yield 隐藏 | 地图筛选、单树、监测概况、统计表及报告代码核对；未检测字段不显示 |
| 底图 pending/processing/failed/null、农户禁止回退 | 本轮相关单测通过，结合上一轮隔离浏览器验证；无农户专用真实账号 |
| 健康、关键指标、土壤、认证与顶部入口 | 本轮真实主地块 1053 读取成功、顶部入口存在；土壤空态正常。模拟单接口失败保留其余结果，重试恢复 |
| PDF 导出 | 模拟返回链接成功；请求包含当前 plot_id/analysis_id。未执行真实生成与文件内容验收 |
| 巡检生成农事任务 | 模拟请求范围正确；存在上述关闭重开绕过防重问题；未执行真实写入 |
| 403 返回列表、不自动重试 | 代码/单测与上一轮模拟记录；本轮确认年份 403 双提示问题 |
| 普通林地、工厂、仓库兼容 | 核对原流程分支及上一轮普通林地 1001 真实验证、工厂/仓库模拟验证；未对所有旧业务做全面验收 |

本轮 `npm run test:drilldown`：23/23 通过，日志 `/tmp/agrit-review-tests.log`；`git diff --check` 通过。生产 build 与 lint 沿用上一轮同一业务代码结果：构建成功，0 errors / 175 warnings。本轮未重跑构建、未提交、未推送、未部署。
