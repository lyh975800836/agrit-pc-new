<template>
  <div class="bottom-tables-row">
    <!-- 金融服务实体经济表格 -->
    <div class="data-table-panel finance-table" :style="{ backgroundImage: `url(${images.tableBg})` }">
      <div class="table-header">
        <h3>金融服务实体经济</h3>
      </div>
      <div class="data-table">
        <div class="table-row table-head table-head-finance">
          <span>银行名称</span>
          <span>支持金额(万元)</span>
        </div>
        <div
          v-for="(item, index) in financeData"
          :key="index"
          class="table-row table-row-finance"
        >
          <span>{{ item.bank }}</span>
          <span>{{ item.amount }}</span>
        </div>
      </div>
    </div>

    <!-- 大宗商品采购商表格 -->
    <div class="data-table-panel purchase-table" :style="{ backgroundImage: `url(${images.tableBg})` }">
      <div class="table-header">
        <h3>大宗商品采购商</h3>
      </div>
      <div class="data-table">
        <div class="table-row table-head table-head-purchase">
          <span>大宗商品采购商</span>
          <span>采购量</span>
        </div>
        <div
          v-for="(item, index) in purchaseData"
          :key="index"
          class="table-row table-row-purchase"
        >
          <span>{{ item.buyer }}</span>
          <span>{{ item.quantity }}</span>
        </div>
      </div>
    </div>

    <!-- 服务队详细数据表格 -->
    <div class="data-table-panel service-team-table" :style="{ backgroundImage: `url(${images.tableBg})` }">
      <div class="table-header">
        <h3>服务队详细</h3>
      </div>
      <div class="data-table">
        <div class="table-row table-head">
          <span>服务队名称</span>
          <span>负责人</span>
          <span>服务范围</span>
          <span>人数</span>
        </div>
        <div
          v-for="(item, index) in serviceTeamData"
          :key="index"
          class="table-row"
        >
          <span>{{ item.name }}</span>
          <span>{{ item.leader }}</span>
          <span>{{ item.area }}</span>
          <span>{{ item.members }}</span>
        </div>
      </div>
    </div>

    <!-- 地块详细数据表格 -->
    <div class="data-table-panel plot-data-table" :style="{ backgroundImage: `url(${images.tableBg})` }">
      <div class="table-header">
        <h3>地块详细</h3>
      </div>
      <div class="data-table">
        <div class="table-row table-head">
          <span>地块名称</span>
          <span>位置</span>
          <span>面积</span>
        </div>
        <div
          v-for="(item, index) in plotData"
          :key="index"
          class="table-row"
        >
          <span>{{ item.name }}</span>
          <span>{{ item.location }}</span>
          <span>{{ item.area }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 数据表格区域组件
 *
 * 包含金融服务、采购商、服务队、地块四个数据表格
 * @component DataTablesSection
 */
export default {
  name: 'DataTablesSection',
  props: {
    /**
     * 图片资源配置
     */
    images: {
      type: Object,
      required: true
    },
    /**
     * 金融服务数据
     */
    financeData: {
      type: Array,
      default: () => [
        { bank: '农业银行百色分行', amount: '--' },
        { bank: '百色市商业银行', amount: '--' },
        { bank: '邮储银行百色支行', amount: '--' },
        { bank: '农村信用合作社', amount: '--' }
      ]
    },
    /**
     * 采购商数据
     */
    purchaseData: {
      type: Array,
      default: () => [
        { buyer: '王守义十三香', quantity: '3000吨' },
        { buyer: '仲景食品', quantity: '600吨' },
        { buyer: '海底捞', quantity: '500吨' },
        { buyer: '杨安镇调味品集团', quantity: '500吨' }
      ]
    },
    /**
     * 服务队数据
     */
    serviceTeamData: {
      type: Array,
      default: () => [
        { name: '顺达农林', leader: '李子顺', area: '田林', members: '50人' },
        { name: '梁油农林', leader: '李丽', area: '右江区', members: '30人' },
        { name: '龙少坤劳务', leader: '龙少坤', area: '田林', members: '30人' },
        { name: '韦仕德劳务', leader: '韦仕德', area: '德保', members: '30人' },
        { name: '杨瑞红劳务', leader: '杨瑞红', area: '右江区', members: '30人' }
      ]
    },
    /**
     * 地块数据
     */
    plotData: {
      type: Array,
      default: () => [
        { name: '北山地块', location: '右江区', area: '500亩' },
        { name: '南畔地块', location: '田阳区', area: '380亩' },
        { name: '西侧地块', location: '田东县', area: '420亩' },
        { name: '东部地块', location: '德保县', area: '350亩' }
      ]
    }
  }
};
</script>

<style lang="less" scoped>
/* 底部表格区域 - 四列 */
.bottom-tables-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-top: 25px;
  gap: 20px;
}

.data-table-panel.finance-table,
.data-table-panel.purchase-table,
.data-table-panel.service-team-table,
.data-table-panel.plot-data-table {
  display: flex;
  overflow: hidden;
  flex-direction: column;
  height: 350px;
  padding: 20px;

  color: #c69c6d;
  border-radius: 8px;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.finance-table .data-table,
.purchase-table .data-table,
.service-team-table .data-table,
.plot-data-table .data-table {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

/* 表格头部 */
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.table-header h3 {
  margin: 0;
  font-family: SourceHanSansCN-Medium;
  font-size: 20px;
  color: #c69c6d;
}

/* 金融和采购表格样式 (2列) */
.finance-table .table-row,
.purchase-table .table-row {
  position: relative;
  display: grid;
  align-items: center;
  grid-template-columns: repeat(2, 1fr);
  padding: 12px 4px;
  font-family: SourceHanSansCN-Medium;
  font-size: 14px;
  font-weight: normal;
  text-align: center;

  color: #4cfcea;

  > span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &.table-head {
    padding-bottom: 12px;
    border-bottom: 1px solid #4cfcea66;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    font-weight: 600;

    color: #c69c6d;
    background: #4cfcea1a;
  }

  &:not(.table-head) {
    &:hover {
      background: #4cfcea0d;

      > span {
        position: relative;
        z-index: 10;
        overflow: visible;
        white-space: normal;
        word-break: break-word;
      }
    }
  }
}

/* 服务队表格样式 (4列) */
.service-team-table .table-row {
  position: relative;
  display: grid;
  align-items: center;
  grid-template-columns: repeat(4, 1fr);
  padding: 12px 4px;
  font-family: SourceHanSansCN-Medium;
  font-size: 14px;
  font-weight: normal;
  text-align: center;

  color: #4cfcea;

  > span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &.table-head {
    padding: 12px 4px;
    padding-bottom: 12px;
    border-bottom: 1px solid #4cfcea66;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    font-weight: 600;

    color: #c69c6d;
    background: #4cfcea1a;
  }

  &:not(.table-head) {
    &:hover {
      background: #4cfcea0d;

      > span {
        position: relative;
        z-index: 10;
        overflow: visible;
        white-space: normal;
        word-break: break-word;
      }
    }
  }
}

/* 地块表格样式 (3列) */
.plot-data-table .table-row {
  position: relative;
  display: grid;
  align-items: center;
  grid-template-columns: repeat(3, 1fr);
  padding: 12px 4px;
  font-family: SourceHanSansCN-Medium;
  font-size: 14px;
  font-weight: normal;
  text-align: center;

  color: #4cfcea;

  > span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &.table-head {
    padding: 12px 4px;
    padding-bottom: 12px;
    border-bottom: 1px solid #4cfcea66;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    font-weight: 600;

    color: #c69c6d;
    background: #4cfcea1a;
  }

  &:not(.table-head) {
    &:hover {
      background: #4cfcea0d;

      > span {
        position: relative;
        z-index: 10;
        overflow: visible;
        white-space: normal;
        word-break: break-word;
      }
    }
  }
}

/* 响应式设计 */
@media (max-width: 1400px) {
  .bottom-tables-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .bottom-tables-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .data-table-panel.finance-table,
  .data-table-panel.purchase-table,
  .data-table-panel.service-team-table,
  .data-table-panel.plot-data-table {
    height: 300px;
  }
}
</style>
