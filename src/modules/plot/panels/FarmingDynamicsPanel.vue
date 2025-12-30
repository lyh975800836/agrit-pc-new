<template>
  <div class="farming-dynamics-panel">
    <!-- 面板标题区域 -->
    <div class="farming-dynamics__header">
      <h3 class="farming-dynamics__title">农情动态</h3>
      <img class="farming-dynamics__title-divider" src="/images/divider.png" />
    </div>

    <!-- 农情内容容器 -->
    <div class="farming-dynamics__content" :style="{ backgroundImage: `url(/images/farmer-right.png)` }">
      <div class="farming-dynamics__sections">
        <!-- 左侧: 标准农事 -->
        <div class="farming-dynamics__standard-section">
          <!-- 标准农事标题 -->
          <div class="farming-dynamics__section-header">
            <h4 class="farming-dynamics__section-title">标准农事</h4>
          </div>

          <!-- 农事项目列表 -->
          <div class="farming-dynamics__items-list">
            <div
              v-for="(item, index) in standardFarmingItems"
              :key="index"
              class="farming-dynamics__item"
              :class="{ 'farming-dynamics__item--active': selectedFarmingItemId === item.id }"
              @click="handleFarmingItemClick(item)"
            >
              <img class="farming-dynamics__item-icon" :src="item.icon" />
              <span
                class="farming-dynamics__item-text"
                :class="{ 'farming-dynamics__item-text--gold': item.isGold }"
                v-html="item.text"
              ></span>
            </div>
          </div>

          <!-- 状态指示器 -->
          <div class="farming-dynamics__status-indicators">
            <div class="farming-dynamics__status-item">
              <span class="farming-dynamics__status-text">已执行</span>
              <div class="farming-dynamics__status-bar farming-dynamics__status-bar--executed"></div>
            </div>
            <div class="farming-dynamics__status-item">
              <span class="farming-dynamics__status-text">未执行</span>
              <div class="farming-dynamics__status-bar farming-dynamics__status-bar--pending"></div>
            </div>
          </div>
        </div>

        <!-- 右侧: 农事预期固定内容 -->
        <div class="farming-dynamics__warning-section">
          <!-- 预警农事头部 -->
          <div
            v-if="warningFarmingInfo"
            class="farming-dynamics__warning-header"
            :style="{ backgroundImage: `url(/images/warning-header-bg.png)` }"
          >
            <div class="farming-dynamics__warning-title-row">
              <h4 class="farming-dynamics__warning-title">预警农事</h4>
              <div class="farming-dynamics__warning-alert-icon">⚠</div>
            </div>

            <div class="farming-dynamics__warning-basic-info">
              <span class="farming-dynamics__warning-label">名称：</span>
              <span class="farming-dynamics__warning-name-value">{{ warningFarmingInfo.name }}</span>
            </div>

            <div class="farming-dynamics__warning-time-level">
              <span class="farming-dynamics__warning-label">触发时间：</span>
              <span class="farming-dynamics__warning-time-value">{{ warningFarmingInfo.triggerMonth }}</span>
              <span class="farming-dynamics__warning-level-label">等级：</span>
              <span class="farming-dynamics__warning-level-value">{{
                warningFarmingInfo.level === 'high' ? '高' : '中'
              }}</span>
            </div>

            <div class="farming-dynamics__warning-prescription">
              <span class="farming-dynamics__warning-label">处方：</span>
              <span class="farming-dynamics__warning-prescription-text">
                {{ warningFarmingInfo.prescription }}
              </span>
            </div>

            <div class="farming-dynamics__warning-cycle-info">
              处理周期：{{ warningFarmingInfo.processingDays }}天
            </div>
          </div>

          <!-- 当前任务 -->
          <div
            v-if="selectedFarmingDetails"
            class="farming-dynamics__current-task"
            :style="{ backgroundImage: `url(/images/current-task-bg.png)` }"
          >
            <span class="farming-dynamics__task-name">{{
              selectedFarmingDetails.title?.replace(/\(.*?\)/, '').trim()
            }}</span>
            <span
              class="farming-dynamics__current-label"
              :class="`farming-dynamics__current-label--${selectedFarmingDetails.status}`"
              >({{ getStatusText(selectedFarmingDetails.status) }})</span
            >
          </div>
          <div v-if="selectedFarmingDetails" class="farming-dynamics__task-time">
            <div class="farming-dynamics__time-item">
              <span class="farming-dynamics__time-label">开始时间：</span>
              <span class="farming-dynamics__time-value">{{ selectedFarmingDetails.startDate }}</span>
            </div>
            <div class="farming-dynamics__time-item">
              结束时间：{{ selectedFarmingDetails.endDate }}
            </div>
          </div>

          <img
            v-if="selectedFarmingDetails"
            class="farming-dynamics__divider"
            src="/images/divider.png"
          />

          <div v-if="selectedFarmingDetails" class="farming-dynamics__prescription">
            {{ selectedFarmingDetails.description }}
          </div>

          <img
            v-if="selectedFarmingDetails"
            class="farming-dynamics__divider"
            src="/images/divider.png"
          />

          <div v-if="selectedFarmingDetails" class="farming-dynamics__standards">
            {{ selectedFarmingDetails.requirement }}
          </div>

          <div class="farming-dynamics__view-details" @click="$emit('view-farming-detail', 'current')">
            <span class="farming-dynamics__details-text">查看详情</span>
            <span class="farming-dynamics__details-arrow">>></span>
          </div>

          <!-- 下一任务 -->
          <div
            v-if="nextFarmingItem"
            class="farming-dynamics__next-task"
            :style="{ backgroundImage: `url(/images/current-task-bg.png)` }"
          >
            <span class="farming-dynamics__next-task-name">{{
              nextFarmingItem.title?.replace(/\(.*?\)/, '').trim()
            }}</span>
            <span class="farming-dynamics__next-label">（下阶段）</span>
          </div>
          <div v-if="nextFarmingItem" class="farming-dynamics__next-task-time">
            <div class="farming-dynamics__time-item">
              <span class="farming-dynamics__time-label">开始时间：</span>
              <span class="farming-dynamics__time-value">{{ nextFarmingItem.startDate }}</span>
            </div>
            <div class="farming-dynamics__time-item">
              结束时间：{{ nextFarmingItem.endDate }}
            </div>
          </div>

          <img
            v-if="nextFarmingItem"
            class="farming-dynamics__divider"
            src="/images/divider.png"
          />

          <div v-if="nextFarmingItem" class="farming-dynamics__prescription">
            {{ nextFarmingItem.description }}
          </div>

          <img
            v-if="nextFarmingItem"
            class="farming-dynamics__divider"
            src="/images/divider.png"
          />

          <div v-if="nextFarmingItem" class="farming-dynamics__standards">
            {{ nextFarmingItem.requirement }}
          </div>

          <div class="farming-dynamics__view-details" @click="$emit('view-farming-detail', 'next')">
            <span class="farming-dynamics__details-text">查看详情</span>
            <span class="farming-dynamics__details-arrow">>></span>
          </div>

          <!-- 三农服务 -->
          <div
            v-if="servicesData.length > 0"
            class="farming-dynamics__services"
            :style="{ backgroundImage: `url(/images/three-nong.png)` }"
          >
            <h4 class="farming-dynamics__services-title">三农服务</h4>
            <div class="farming-dynamics__services-content">
              <div
                v-for="(service, index) in servicesData"
                :key="index"
                class="farming-dynamics__service-item"
              >
                <img class="farming-dynamics__service-icon" :src="service.icon" />
                <div class="farming-dynamics__service-label">{{ service.label }}</div>
                <div class="farming-dynamics__service-provider">{{ service.provider }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 农情动态右侧面板
 *
 * 显示标准农事、预警农事、当前任务、下一任务和三农服务
 * 使用策略提供的extraData获取农事信息
 *
 * @component FarmingDynamicsPanel
 */
export default {
    name: 'FarmingDynamicsPanel',
    props: {
        // 标准农事列表
        standardFarmingItems: {
            type: Array,
            default: () => []
        },
        // 预警农事信息
        warningFarmingInfo: {
            type: Object,
            default: null
        },
        // 三农服务数据
        servicesData: {
            type: Array,
            default: () => []
        }
    },
    emits: ['view-farming-detail', 'farming-item-selected'],
    data() {
        return {
            // 选中的农事项目ID
            selectedFarmingItemId: null
        }
    },
    computed: {
        /**
         * 选中的农事详情
         */
        selectedFarmingDetails() {
            if (!this.selectedFarmingItemId) {
                // 默认选中第一个
                const firstItem = this.standardFarmingItems[0]
                return firstItem?.details || null
            }
            const selectedItem = this.standardFarmingItems.find(
                (item) => item.id === this.selectedFarmingItemId
            )
            return selectedItem?.details || null
        },
        /**
         * 下一个农事项目
         */
        nextFarmingItem() {
            if (!this.selectedFarmingItemId && this.standardFarmingItems.length === 0) {
                return null
            }

            // 如果没有选中项目，默认选中第一个，返回第二个作为下一项
            if (!this.selectedFarmingItemId && this.standardFarmingItems.length > 0) {
                return this.standardFarmingItems.length > 1
                    ? this.standardFarmingItems[1].details
                    : null
            }

            const currentIndex = this.standardFarmingItems.findIndex(
                (item) => item.id === this.selectedFarmingItemId
            )
            if (currentIndex === -1 || currentIndex === this.standardFarmingItems.length - 1) {
                // 如果没找到或者是最后一个，返回第一个
                const firstItem = this.standardFarmingItems[0]
                return firstItem?.details || null
            }

            return this.standardFarmingItems[currentIndex + 1].details
        }
    },
    watch: {
        standardFarmingItems: {
            handler(newItems) {
                // 自动选中逻辑：如果没有选中任何项目且列表非空，自动选中当前农事
                if (!this.selectedFarmingItemId && newItems.length > 0) {
                    const currentItem = newItems.find((item) => item.isCurrent)
                    if (currentItem) {
                        this.$nextTick(() => {
                            this.selectedFarmingItemId = currentItem.id
                        })
                    }
                }
            },
            immediate: true
        }
    },
    methods: {
        /**
         * 处理农事项目点击
         */
        handleFarmingItemClick(item) {
            this.selectedFarmingItemId = item.id
            this.$emit('farming-item-selected', item)
        },
        /**
         * 获取状态文本
         */
        getStatusText(status) {
            const statusMap = {
                current: '当前',
                completed: '已完成',
                pending: '待执行',
                expected: '预期'
            }
            return statusMap[status] || status
        }
    }
}
</script>

<style lang="less" scoped>
/* ===== 右侧农情动态面板样式 - BEM命名规范 ===== */
.farming-dynamics-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 375px;
    height: 734px;
    padding: 0;

    background: #041f1d;
}

/* 农情动态标题区域 */
.farming-dynamics__header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-top: 0;
    padding-left: 30px;
}

.farming-dynamics__title {
    margin: 20px 0 0;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 17px;
    font-weight: 500;
    line-height: 16px;

    color: #c7b299;
}

.farming-dynamics__title-divider {
    width: 67px;
    height: 3px;
    margin: 5px 0 0 1px;
}

/* 农情内容区域 */
.farming-dynamics__content {
    flex: 1;
    width: 347px;
    height: 646px;
    margin-top: 25px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
}

.farming-dynamics__sections {
    display: flex;
    justify-content: space-between;
    width: 345px;
    min-height: 389px;
    margin-left: 1px;
    padding-top: 0;
}

/* 标准农事区域 */
.farming-dynamics__standard-section {
    display: flex;
    flex-direction: column;
    width: 141px;
    min-height: 389px;
}

.farming-dynamics__section-header {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.farming-dynamics__section-title {
    margin: 12px 0 0;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 17px;
    font-weight: 500;
    line-height: 15px;

    color: #c7b299;
}

/* 农事项目列表 */
.farming-dynamics__items-list {
    display: flex;
    flex: 1;
    flex-direction: column;
}

.farming-dynamics__item {
    display: flex;
    align-items: center;
    margin: 8px 0 8px 10px;
    padding: 4px 8px;

    border-radius: 4px;
    transition: all 0.3s ease;
    cursor: pointer;

    gap: 12px;
}

.farming-dynamics__item:hover {
    background: rgba(76, 253, 235, 0.1);
    transform: translateX(2px);
}

.farming-dynamics__item--active {
    border-left: 3px solid #c69c6d;
    background: rgba(76, 253, 235, 0.2);
    transform: translateX(2px);
}

.farming-dynamics__item + .farming-dynamics__item {
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid rgba(76, 252, 234, 0.2);
}

.farming-dynamics__item-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.farming-dynamics__item-text {
    flex: 1;
    font-family: SourceHanSansCN-Light, sans-serif;
    font-size: 16px;
    font-weight: 600;
    line-height: 17px;

    color: #c7b299;
}

.farming-dynamics__item-text--gold {
    color: #c7b299;
}

/* 状态指示器 */
.farming-dynamics__status-indicators {
    display: flex;
    justify-content: center;
    padding: 8px 16px;
    gap: 28px;
}

.farming-dynamics__status-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.farming-dynamics__status-text {
    font-family: SourceHanSansCN-Normal, sans-serif;
    font-size: 12px;
    line-height: 10px;
    color: #c7b299;
}

.farming-dynamics__status-bar {
    width: 32px;
    height: 3px;
}

.farming-dynamics__status-bar--executed {
    background: #c69c6d;
}

.farming-dynamics__status-bar--pending {
    background: #faaf3b;
}

/* 预警农事区域 */
.farming-dynamics__warning-section {
    display: flex;
    flex-direction: column;
    width: 200px;
    height: 389px;
}

.farming-dynamics__warning-header {
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 200px;
    height: 157px;
    padding: 0 19px 17px;

    background-repeat: no-repeat;
    background-size: 100% 100%;
}

.farming-dynamics__warning-title-row {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.farming-dynamics__warning-title {
    margin: 12px 0 8px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 17px;
    font-weight: 500;

    color: #c7b299;
}

.farming-dynamics__warning-alert-icon {
    position: absolute;
    top: 15px;
    right: 10px;
    font-size: 18px;

    color: #c7b299;
}

.farming-dynamics__warning-basic-info,
.farming-dynamics__warning-prescription {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    margin-bottom: 6px;
    font-weight: 600;
}

.farming-dynamics__warning-time-level {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 6px;
    font-weight: 600;

    gap: 8px;
}

.farming-dynamics__warning-label,
.farming-dynamics__warning-level-label {
    margin-right: 4px;
    font-family: SourceHanSansCN-Light, sans-serif;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__warning-name-value,
.farming-dynamics__warning-time-value,
.farming-dynamics__warning-prescription-text {
    font-family: SourceHanSansCN-Light, sans-serif;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;
    word-break: break-all;

    color: #c7b299;
}

.farming-dynamics__warning-name-value {
    flex: 1;
    max-width: 120px;
}

.farming-dynamics__warning-prescription-text {
    flex: 1;
    max-width: 140px;
}

.farming-dynamics__warning-level-value {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 10px;
    font-weight: 500;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__warning-cycle-info {
    margin-top: 8px;
    font-family: SourceHanSansCN-Light, sans-serif;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__divider {
    width: 165px;
    height: 1px;
    margin: 6px 0 6px 17px;
    object-fit: none;
}

/* 当前任务 */
.farming-dynamics__current-task {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    width: 174px;
    height: auto;
    min-height: 20px;
    margin: 18px 0 0 12px;
    padding: 2px 17px 2px 24px;

    background-repeat: no-repeat;
    background-size: 100% 100%;
}

.farming-dynamics__task-name {
    overflow: hidden;
    flex: 1;
    max-width: 100px;
    margin-right: 8px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 12px;
    font-weight: 500;
    line-height: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;

    color: #093036;
}

.farming-dynamics__current-label {
    padding: 2px 6px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 10px;
    font-weight: 500;
    line-height: 10px;

    color: #fcee21;
    border-radius: 2px;
}

.farming-dynamics__task-time {
    margin: 9px 0 0 17px;
}

.farming-dynamics__time-item {
    margin-bottom: 4px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 10px;
    font-weight: 600;
    line-height: 10px;

    color: #c7b299;
}

.farming-dynamics__time-item:last-child {
    font-family: SourceHanSansCN-Light, sans-serif;
    line-height: 14px;
}

.farming-dynamics__time-label {
    color: #c7b299;
}

.farming-dynamics__time-value {
    font-family: SourceHanSansCN-Light, sans-serif;
    font-weight: 600;
    color: #c7b299;
}

.farming-dynamics__prescription {
    margin: 0 0 0 17px;
    font-family: SourceHanSansCN-Light, sans-serif;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__standards {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    width: 149px;
    min-height: 28px;
    margin: 0 0 0 17px;
    font-family: SourceHanSansCN-Light, sans-serif;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__view-details {
    display: flex;
    align-items: center;
    margin: 5px 0 0 130px;

    cursor: pointer;

    gap: 4px;
}

.farming-dynamics__details-text {
    font-family: SourceHanSansCN-Light, sans-serif;
    font-size: 10px;
    line-height: 13px;
    color: #c7b299;
}

.farming-dynamics__details-arrow {
    font-family: FZCKJW--GB1-0, sans-serif;
    font-size: 10px;
    line-height: 13px;
    color: #c7b299;
}

/* 下一任务 */
.farming-dynamics__next-task {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    width: 174px;
    height: auto;
    min-height: 20px;
    margin: 8px 0 0 12px;
    padding: 2px 8px 2px 25px;

    background-repeat: no-repeat;
    background-size: 100% 100%;
}

.farming-dynamics__next-task-name {
    overflow: hidden;
    flex: 1;
    max-width: 100px;
    margin-right: 8px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 12px;
    font-weight: 500;
    line-height: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;

    color: #093036;
}

.farming-dynamics__next-label {
    padding: 2px 6px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 10px;
    font-weight: 500;
    line-height: 10px;

    color: #fcee21;
    border-radius: 2px;
}

.farming-dynamics__next-task-time {
    margin: 10px 0 0 17px;
}

/* 三农服务区域 */
.farming-dynamics__services {
    position: absolute;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 200px;
    height: 159px;
    margin-top: 36px;
    padding: 0;

    background-repeat: no-repeat;
    background-size: 100% 100%;
}

.farming-dynamics__services-title {
    margin: 12px 0 18px 20px;
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 15px;
    font-weight: 500;
    line-height: 15px;

    color: #c7b299;
}

.farming-dynamics__services-content {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    width: 100%;
    padding: 0 10px 20px;

    gap: 10px;
}

.farming-dynamics__service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.farming-dynamics__service-icon {
    width: 50px;
    height: 40px;
    margin-bottom: 8px;
    object-fit: contain;
}

.farming-dynamics__service-label {
    margin-bottom: 8px;
    font-family: SourceHanSansCN-Light, sans-serif;
    font-size: 12px;
    font-weight: 600;
    line-height: 12px;

    color: #c7b299;
}

.farming-dynamics__service-provider {
    font-family: SourceHanSansCN-Medium, sans-serif;
    font-size: 12px;
    font-weight: 500;
    line-height: 12px;

    color: #c7b299;
}
</style>
