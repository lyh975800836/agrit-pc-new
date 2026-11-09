<template>
  <div class="report-overlay" @click.self="$emit('close')">
    <section class="report-panel" role="dialog" aria-modal="true" aria-label="地块健康与巡检报告">
      <header><div><h3>{{ plot.name }} · 健康与巡检报告</h3><small>仅展示当前地块范围的数据</small></div><button @click="$emit('close')">关闭</button></header>
      <p v-if="loading" role="status">正在加载健康数据…</p>
      <p v-if="error" role="alert">{{ error }} <button @click="load">重新加载</button></p>
      <div class="report-grid">
        <article><h4>健康评分</h4><template v-if="health"><strong>{{ health.health_score ?? '—' }} 分</strong> · {{ health.health_level }}<p>较上期 {{ health.health_delta > 0 ? '+' : '' }}{{ health.health_delta ?? '—' }}</p><div class="trend"><span v-for="(item, i) in health.trend || []" :key="i">{{ item.date }}<b>{{ item.score }} 分</b></span></div></template><p v-else>暂无健康评分</p></article>
        <article><h4>关键指标</h4><p v-for="metric in metrics" :key="metric.key">{{ metric.label }} <b>{{ metric.value }}</b></p><p v-if="!metrics.length">暂无监测指标</p></article>
        <article v-if="hasPest"><h4>病虫害识别</h4><p v-for="(item, i) in detections" :key="i">{{ item.name }} · {{ item.affected_count }} 株 · {{ riskLabel(item.risk_level) }}</p><p v-if="!detections.length">暂无识别记录</p><p v-for="(tip, i) in suggestions" :key="`tip-${i}`">{{ tip }}</p></article>
        <article><h4>土壤与认证</h4><p v-for="(item, i) in soil" :key="item.id || i">{{ item.name }}：{{ item.value }} {{ item.unit }} <small>{{ item.status_note }}</small></p><p v-if="!soil.length">暂无土壤监测数据</p><p v-for="cert in certifications" :key="cert.key">{{ cert.name }} · {{ cert.passed ? '已通过' : '未通过' }}</p></article>
      </div>
      <article v-if="summary" class="analysis-report"><h4>当前巡飞批次</h4><p>{{ summary.detected_at || '采集日期未提供' }} <span v-if="summary.remark">· {{ summary.remark }}</span></p><p>总株数 {{ summary.total_trees ?? '—' }}<span v-if="hasPest"> · 病树 {{ summary.pest_trees ?? '—' }}</span><span v-if="summary.has_yield !== false"> · 产量 {{ summary.yield_total ?? '—' }}</span></p><p>{{ summary.ai_score_desc }}</p><p>{{ summary.ai_summary || '暂无分析摘要' }}</p></article>
      <p v-else>暂无当前巡飞批次报告</p>
      <footer><button :disabled="!analysisId || !summary || !!busy" @click="exportReport">{{ busy === 'export' ? '正在生成…' : '导出当前范围 PDF' }}</button><button :disabled="!analysisId || !summary || !!busy || !!taskId" @click="createTask">{{ busy === 'task' ? '正在创建…' : (taskId ? '已创建农事任务' : '由本次巡检生成农事任务') }}</button><a v-if="pdfUrl" :href="pdfUrl" target="_blank" rel="noopener noreferrer">打开 / 下载报告</a></footer>
      <p v-if="actionMessage" role="status">{{ actionMessage }}</p>
    </section>
  </div>
</template>

<script>
import { postPlotData, isForbidden } from '../services/drilldownService';

export default {
    name: 'PlotScopeReport',
    props: {
        plot: { type: Object, required: true }, analysisId: { type: [String, Number], default: null },
        summary: { type: Object, default: null }
    },
    data: () => ({ loading: false, error: '', health: null, metrics: [], detections: [], suggestions: [], soil: [], certifications: [], busy: '', pdfUrl: '', taskId: '', actionMessage: '' }),
    computed: { hasPest() { return this.summary?.has_pest !== false; } },
    mounted() { this.load(); },
    beforeDestroy() { this._loadToken = null; this._disposed = true; },
    methods: {
        riskLabel(value) { return ({ high: '高风险', medium: '中风险', low: '低风险', normal: '正常' })[value] || '未评级'; },
        async load() {
            const token = Symbol('health');
            this._loadToken = token;
            this.loading = true;
            this.error = '';
            const paths = ['health-detail', 'key-metrics', 'soil-data', 'certifications'];
            if (this.hasPest) paths.push('latest-detections');
            const results = await Promise.allSettled(paths.map(path => postPlotData(`plot/${path}`, { plot_id: String(this.plot.id) })));
            if (this._loadToken !== token) return;
            this.loading = false;
            const forbidden = results.find(result => result.status === 'rejected' && isForbidden(result.reason));
            if (forbidden) { this.$emit('error', forbidden.reason); return; }
            const values = results.map(result => result.status === 'fulfilled' ? result.value : null);
            this.health = values[0];
            this.metrics = values[1]?.metrics || [];
            this.soil = values[2]?.metrics || [];
            this.certifications = values[3]?.certs || [];
            this.detections = values[4]?.detections || [];
            this.suggestions = values[4]?.ai_suggestions || [];
            if (results.some(result => result.status === 'rejected')) this.error = '部分数据加载失败，可重新加载';
        },
        async runAction(kind, path) {
            if (this.busy || !this.analysisId || !this.summary) return null;
            this.busy = kind;
            this.actionMessage = '';
            try {
                return await postPlotData(`plot-analysis/${path}`, { plot_id: String(this.plot.id), analysis_id: String(this.analysisId) });
            } catch (error) {
                if (!this._disposed) {
                    if (isForbidden(error)) this.$emit('error', error);
                    else this.actionMessage = error.message;
                }
                return null;
            } finally { if (!this._disposed) this.busy = ''; }
        },
        async exportReport() {
            const result = await this.runAction('export', 'export-pdf');
            if (!result || this._disposed) return;
            try {
                const url = new URL(result.pdf_url);
                if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalid URL');
                this.pdfUrl = url.href;
                this.actionMessage = '报告已生成，点击链接打开或下载。';
            } catch (_) { this.actionMessage = '报告下载地址无效，请稍后重试'; }
        },
        async createTask() {
            if (this.taskId) return;
            const result = await this.runAction('task', 'create-farming');
            if (!result || this._disposed) return;
            this.taskId = result.task_id || '';
            this.actionMessage = this.taskId ? `农事任务已创建，任务编号：${this.taskId}` : '未返回任务编号，请稍后检查任务列表';
        }
    }
};
</script>

<style scoped lang="less">
@import (reference) "~@/styles/components/plot-scrollbar.less";
.report-panel, .trend { .plot-scrollbar(); }
.report-overlay { position: fixed; inset: 0; z-index: 1250; display: flex; align-items: center; justify-content: center; background: #0009; }
.report-panel { box-sizing: border-box; width: min(920px, 94vw); max-height: 86vh; overflow: auto; padding: 24px; border: 1px solid #c69c6d70; border-radius: 8px; color: #e2c59a; background: #0d2a28; font-size: 13px; }
header { display: flex; align-items: center; justify-content: space-between; gap: 20px; } h3 { margin: 0 0 6px; } h4 { margin: 0 0 12px; } small { color: #c69c6dbb; } p { line-height: 1.7; } button, a { font: inherit; color: inherit; background: transparent; border: 1px solid #c69c6d70; border-radius: 4px; padding: 8px 12px; cursor: pointer; } button:disabled { opacity: .45; cursor: default; } button:hover:enabled { background: #c69c6d25; }
.report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 22px 0; } article { border: 1px solid #c69c6d30; padding: 16px; border-radius: 5px; } strong { font-size: 28px; } .trend { display: flex; gap: 14px; overflow: auto; } .trend span { display: flex; flex-direction: column; gap: 6px; white-space: nowrap; } footer { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; }
@media (max-width: 700px) { .report-grid { grid-template-columns: 1fr; } }
</style>
