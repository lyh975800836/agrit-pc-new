<template>
  <section class="scope-statistics" :class="{ expanded }" aria-label="当前范围统计">
    <header>
      <div><h3>{{ plot.name }}</h3><p>当前范围统计<span v-if="summary && summary.detected_at"> · {{ summary.detected_at.slice(0, 10) }}</span></p></div>
      <button v-if="canExpand && !expanded" @click="$emit('expand')">展开明细</button>
    </header>
    <p v-if="loading" class="state" role="status">正在同步当前范围统计…</p>
    <p v-else-if="error" class="state" role="alert">{{ error }} <button @click="$emit('retry')">重试</button></p>
    <p v-else-if="!summary && !stats" class="state">暂无当前批次统计</p>
    <template v-else>
      <dl class="scope-metric-grid">
        <div v-for="metric in metrics" :key="metric.key"><dt>{{ metric.label }}</dt><dd>{{ format(model.metrics[metric.key], metric.digits) }}<small v-if="model.metrics[metric.key] != null">{{ metric.unit }}</small><small v-if="metric.key === 'in_parcel_trees' && model.metrics.in_parcel_ratio != null">（{{ (model.metrics.in_parcel_ratio * 100).toFixed(1) }}%）</small></dd></div>
      </dl>
      <div class="table-heading"><h4>{{ plot.node_type === 'parcel' ? '小地块明细' : '小地块统计' }}</h4><span>{{ rows.length }} 块</span></div>
      <p class="table-hint">左右滑动查看完整指标</p>
      <div class="parcel-stat-table" tabindex="0" aria-label="小地块统计明细，可横向滚动">
        <table>
          <thead><tr><th>小地块</th><th>账号</th><th>面积(亩)</th><th>株数</th><th>株/亩</th><th>平均冠幅(㎡)</th><th>原始面积(亩)</th><th>影像覆盖</th><th v-if="hasPest">病树</th><th v-if="hasYield">产量</th><th>查看</th></tr></thead>
          <tbody><tr v-for="row in rows" :key="row.plot_id" :class="{ selected: String(row.plot_id) === String(plot.id) }">
            <th scope="row">{{ row.name }}</th><td>{{ row.owner_name || (row.owner_user_id ? '已绑定' : '未绑定') }}</td><td>{{ format(row.area, 2) }}</td><td>{{ format(row.tree_count, 0) }}</td><td>{{ format(row.trees_per_mu, 1) }}</td><td>{{ format(row.avg_crown_area, 1) }}</td><td>{{ format(row.source_area_mu, 2) }}</td><td><span :class="{ 'low-coverage': row.coverage != null && row.coverage < .95 }">{{ coverage(row.coverage) }}</span></td><td v-if="hasPest">{{ format(row.pest_count, 0) }}</td><td v-if="hasYield">{{ format(row.yield_total, 2) }}</td><td><button v-if="canExpand && row.node && String(row.plot_id) !== String(plot.id)" @click="$emit('select', row.node)">查看</button><span v-else>{{ String(row.plot_id) === String(plot.id) ? '当前' : '—' }}</span></td>
          </tr></tbody>
          <tfoot v-if="rows.length"><tr><th scope="row">{{ keyword.trim() ? '筛选合计' : '合计' }}</th><td>—</td><td>{{ format(totals.area, 2) }}</td><td>{{ format(totals.tree_count, 0) }}</td><td>{{ format(totals.trees_per_mu, 1) }}</td><td>{{ format(totals.avg_crown_area, 1) }}</td><td>{{ format(totals.source_area_mu, 2) }}</td><td>—</td><td v-if="hasPest">{{ format(totals.pest_count, 0) }}</td><td v-if="hasYield">{{ format(totals.yield_total, 2) }}</td><td></td></tr></tfoot>
        </table>
      </div>
      <p v-if="!rows.length" class="state">{{ keyword.trim() ? '暂无匹配的小地块' : '当前范围暂无小地块' }}</p>
    </template>
  </section>
</template>

<script>
import { buildScopeStatistics, numericStat, totalParcelStats } from '../services/scopeStatistics';

export default {
    name: 'ScopeStatistics',
    props: {
        plot: { type: Object, required: true }, nodes: { type: Array, default: () => [] },
        stats: { type: Object, default: null }, summary: { type: Object, default: null },
        loading: Boolean, error: { type: String, default: '' }, canExpand: Boolean, expanded: Boolean,
        keyword: { type: String, default: '' }
    },
    computed: {
        model() { return buildScopeStatistics(this); },
        rows() { return this.model.parcels.filter(row => `${row.name || ''} ${row.farmer_name || ''}`.includes(this.keyword.trim())); },
        totals() { return totalParcelStats(this.rows); },
        hasPest() { return (this.summary || this.stats)?.has_pest !== false; },
        hasYield() { return (this.summary || this.stats)?.has_yield !== false; },
        metrics() {
            const own = this.plot.node_type === 'parcel';
            return [
                { key: 'area', label: own ? '小地块面积' : '区域面积', digits: 2, unit: '亩' },
                ...(!own ? [
                    { key: 'parcel_count', label: '小地块数', digits: 0, unit: '块' },
                    { key: 'parcel_area', label: '农户林地面积', digits: 2, unit: '亩' }
                ] : []),
                { key: 'tree_count', label: '总株数', digits: 0, unit: '株' },
                ...(!own ? [
                    { key: 'in_parcel_trees', label: '小地块内株数', digits: 0, unit: '株' },
                    { key: 'outside_parcel_trees', label: '区域内未归属株数', digits: 0, unit: '株' }
                ] : []),
                { key: 'trees_per_mu', label: own ? '株密度' : '区域株密度', digits: 1, unit: '株/亩' },
                ...(!own ? [{ key: 'parcel_trees_per_mu', label: '农户林地株密度', digits: 1, unit: '株/亩' }] : []),
                { key: 'avg_crown_area', label: '平均冠幅', digits: 1, unit: '㎡' }
            ];
        }
    },
    methods: {
        format(value, digits = 2) {
            const number = numericStat(value);
            return number == null ? '—' : number.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
        },
        coverage(value) { return value == null ? '—' : `${Math.round(value * 100)}%`; }
    }
};
</script>

<style scoped lang="less">
@import (reference) "~@/styles/components/plot-scrollbar.less";
.scope-statistics { box-sizing: border-box; min-width: 0; max-width: 100%; padding: 18px 14px; color: #f0e4d2; font-size: 12px; }
header, .table-heading { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
h3 { font-size: 16px; margin: 0; overflow-wrap: anywhere; } header p { margin: 6px 0 0; color: #b9d1ca; font-size: 11px; }
button { font: inherit; color: #f0e4d2; background: transparent; border: 1px solid #c69c6d85; border-radius: 4px; padding: 5px 8px; white-space: nowrap; cursor: pointer; }
button:hover { background: #c69c6d20; } button:focus-visible, .parcel-stat-table:focus-visible { outline: 2px solid #e2c59a; outline-offset: 2px; }
.scope-metric-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px 8px; padding: 16px 0; margin: 0; border-bottom: 1px solid #c69c6d30; }
.expanded { padding: 8px 0; }
.expanded .scope-metric-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
dt { color: #b9d1ca; font-size: 11px; margin-bottom: 5px; } dd { margin: 0; font-size: 16px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; color: #f0e4d2; } dd small { margin-left: 3px; font-size: 10px; color: #d8c6ac; }
.table-heading { margin-top: 16px; } h4 { margin: 0; font-size: 13px; color: #f0e4d2; } .table-heading span, .table-hint { color: #b9d1ca; font-size: 11px; } .table-hint { margin: 6px 0 10px; }
.parcel-stat-table { .plot-scrollbar(); overflow: auto; max-height: 320px; }
table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12px; font-variant-numeric: tabular-nums; }
th, td { padding: 10px; text-align: right; white-space: nowrap; border-bottom: 1px solid #c69c6d42; }
thead th { position: sticky; top: 0; z-index: 2; background: #163633; font-weight: 500; color: #e1c99e; }
th:first-child { position: sticky; left: 0; text-align: left; background: #0d2a28; z-index: 1; font-weight: 500; border-right: 1px solid #c69c6d25; }
thead th:first-child { z-index: 3; background: #163633; }
th:last-child, td:last-child { position: sticky; right: 0; z-index: 1; background: #0d2a28; border-left: 1px solid #c69c6d25; }
thead th:last-child { z-index: 3; background: #163633; }
tfoot th, tfoot td { position: sticky; bottom: 0; z-index: 2; background: #163633; font-weight: 600; } tfoot th:first-child { z-index: 3; background: #163633; }
tfoot td:last-child { z-index: 3; background: #163633; }
.selected td, .selected th:first-child { background: #23413a; color: #f4e7d2; }
.low-coverage { display: inline-block; color: #ffbd75; border: 1px solid #c88a4055; background: #c88a4018; padding: 2px 5px; border-radius: 3px; }
.state { color: #c5d7d1; line-height: 1.8; padding: 12px 0; }
</style>
