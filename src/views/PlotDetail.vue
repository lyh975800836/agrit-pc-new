<template>
  <div class="plot-detail-container">
    <DashboardLayout
      :weather="weather"
      :user="user"
      :project-data="projectData"
      :statistics-data="statisticsData"
      :ranking-data="rankingData"
      :quality-data="qualityData"
      :region-name="regionName"
      :show-back-button="true"
      :page-title="plotData.name || '地块详情'"
      @back="handleBackClick"
    >
    <template #center-map>
      <!-- 地块详情真实卫星地图 -->
      <RegionDetailMap
        :region-name="regionName"
        :show-plot-details="true"
        :show-plot-markers="false"
        :plot-data="plotData"
        :is-plot-detail-page="true"
      />
    </template>

    <template #left-panel>
      <!-- 左侧地块详情面板 -->
      <div class="plot-details-panel" :style="{ backgroundImage: `url(${images.leftPanelBg})` }">
        <div class="left-slide" :style="{ backgroundImage: `url(${images.leftSlide})` }"></div>
        <!-- 装饰线 -->
        <img class="panel-decoration-top" src="/images/decoration-1.jpg" />

        <!-- 地块标题信息 -->
        <div class="plot-title-section">
          <h2 class="left-plot-name">{{ plotData.name || '千户十亩-大楞乡基地' }}</h2>
          <img class="region-label" src="/images/region-label.jpg" />
          <span class="region-name">{{ plotData.district || '右江区' }}</span>
        </div>

        <img class="section-divider" src="/images/decoration-2.jpg" />

        <!-- 地块统计数据 -->
        <div class="plot-statistics">
          <div class="stat-item" :style="{ backgroundImage: `url(${images.statItem})` }">
            <span class="stat-label">总面积(亩)：</span>
            <span class="stat-value stat-value-large">{{ plotData.area || '40' }}</span>
          </div>

          <div class="stat-item" :style="{ backgroundImage: `url(${images.statItem})` }">
            <span class="stat-label">产量(万斤)：</span>
            <span class="stat-value stat-value-large">{{ plotData.yield || '48' }}</span>
          </div>

          <div class="stat-item" :style="{ backgroundImage: `url(${images.statItem})` }">
            <span class="stat-label">亩产量(斤/亩)：</span>
            <span class="stat-value stat-value-large">{{ plotData.unitYield || '1200' }}</span>
          </div>
        </div>

        <!-- 农户信息 -->
        <div class="farmer-profile" :style="{ backgroundImage: `url(${images.farmerProfile})` }">
          <img class="farmer-avatar" src="/images/farmer-avatar.jpg" />
          <div class="farmer-details">
            <div class="farmer-name">农户：{{ plotData.farmerName || '隆启雷' }}</div>
            <img class="detail-divider" src="/images/divider.png" />
            <div class="farmer-age">年龄：{{ plotData.farmerAge || '54' }}岁</div>
            <div class="farmer-rating">
              <span class="rating-filled">★★★★</span>
              <span class="rating-empty">★</span>
            </div>
            <div class="farmer-status">
              <div class="status-tag status-general">一般户</div>
              <div class="status-tag status-unpoverty">未脱贫</div>
              <div class="status-tag status-poverty">已脱贫</div>
            </div>
          </div>
        </div>

        <!-- 价格信息 -->
        <div class="price-info" :style="{ backgroundImage: `url(${images.priceInfo})` }">
          <img class="price-decoration-top" src="/images/price-icon.jpg" />
          <div class="price-display">
            <span class="price-label">今日价格：</span>
            <img class="down-arrow" src="/images/down-arrow.png">
            <span class="price-value">{{ plotData.price || '6.08' }}</span>
            <span class="price-unit">&nbsp;&nbsp;元/斤</span>
          </div>
          <img class="price-decoration-bottom" src="/images/decoration-3.jpg" />
        </div>

        <!-- 健康指标 -->
        <div class="health-section">
          <div class="health-header">
            <span class="health-title">林地健康指标</span>
            <div class="health-link" @click="showHealthModal">
              <span class="link-text">查看详情</span>
              <span class="link-arrow">>></span>
            </div>
          </div>
          <img class="third-divider" src="/images/decoration-2.jpg" />
          <!-- 健康指标圆形图表 -->
          <div class="health-indicators">
            <!-- 郁闭度 -->
            <div class="health-indicator">
              <div class="circular-progress" data-percentage="20">
                <div class="circle-bg"></div>
                <div class="circle" style="--percentage: 20;
--color: #4cfcea;"></div>
                <div class="percentage">20%</div>
              </div>
              <div class="indicator-label">郁闭度</div>
            </div>

            <!-- 生长匹配度 -->
            <div class="health-indicator">
              <div class="circular-progress" data-percentage="30">
                <div class="circle-bg"></div>
                <div class="circle" style="--percentage: 30;
--color: #ffa500;"></div>
                <div class="percentage">30%</div>
              </div>
              <div class="indicator-label">生长匹配度</div>
            </div>

            <!-- 健康度 -->
            <div class="health-indicator special">
              <div class="health-score-container">
                <div class="health-score-bg"></div>
                <div class="health-score">90</div>
              </div>
              <div class="indicator-label">健康度</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #right-panel>
      <!-- 右侧面板 - 农情动态 -->
      <div class="farming-dynamics-panel" :style="{ backgroundImage: `url(${images.rankingPanelBg})` }">
        <!-- 面板标题区域 -->
        <div class="farming-dynamics__header">
          <img class="farming-dynamics__header-decoration" src="/images/farming-dynamic-icon.jpg" />
          <h3 class="farming-dynamics__title">农情动态</h3>
          <img class="farming-dynamics__title-divider" src="/images/divider.png" />
        </div>

        <!-- 农情内容容器 -->
        <div class="farming-dynamics__content" :style="{ backgroundImage: `url(${images.farmerRight})` }">
          <div class="farming-dynamics__sections">
            <!-- 左侧: 标准农事 -->
            <div class="farming-dynamics__standard-section">
              <!-- 标准农事标题 -->
              <div class="farming-dynamics__section-header">
                <img class="farming-dynamics__section-decoration" src="/images/standard-farming-icon.jpg" />
                <h4 class="farming-dynamics__section-title">标准农事</h4>
                <img class="farming-dynamics__section-divider" src="/images/decoration-2.jpg" />
              </div>

              <!-- 农事项目列表 -->
              <div class="farming-dynamics__items-list">
                <div class="farming-dynamics__item" v-for="(item, index) in standardFarmingItems" :key="index">
                  <img class="farming-dynamics__item-icon" :src="item.icon" />
                  <span class="farming-dynamics__item-text" :class="{ 'farming-dynamics__item-text--gold': item.isGold }" v-html="item.text"></span>
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

            <!-- 右侧: 预警农事 -->
            <div class="farming-dynamics__warning-section">
              <!-- 预警农事头部 -->
              <div class="farming-dynamics__warning-header" :style="{ backgroundImage: `url(${images.warningHeaderBg})` }">
                <img class="farming-dynamics__warning-icon" src="/images/warning-farming-icon.jpg" />
                <h4 class="farming-dynamics__warning-title">预警农事</h4>
                <div class="farming-dynamics__warning-description">名称: 加强版生物防治</div>
                <div class="farming-dynamics__warning-info">
                  <span class="farming-dynamics__trigger-time">触发时间：8月</span>
                  <div class="farming-dynamics__warning-level">
                    <span class="farming-dynamics__level-label">等级:</span>
                    <span class="farming-dynamics__level-value farming-dynamics__level-value--high">高</span>
                  </div>
                </div>
                <div class="farming-dynamics__warning-details">
                  <div class="farming-dynamics__treatment">处方：多种复合配方加强版<br />生物防治。</div>
                  <div class="farming-dynamics__cycle">处理周期：7天</div>
                </div>
              </div>

              <img class="farming-dynamics__divider" src="/images/divider.png" />

              <!-- 当前任务 -->
              <div class="farming-dynamics__current-task" :style="{ backgroundImage: `url(${images.currentTaskBg})` }">
                <span class="farming-dynamics__task-name">秋季保花施肥</span>
                <span class="farming-dynamics__current-label">（当前）</span>
              </div>
              <div class="farming-dynamics__task-time">
                <div class="farming-dynamics__time-item">
                  <span class="farming-dynamics__time-label">开始时间：</span>
                  <span class="farming-dynamics__time-value">8月01日</span>
                </div>
                <div class="farming-dynamics__time-item">结束时间：8月30日</div>
              </div>

              <img class="farming-dynamics__divider" src="/images/divider.png" />

              <div class="farming-dynamics__prescription">处方：复合肥</div>

              <img class="farming-dynamics__divider" src="/images/divider.png" />

              <div class="farming-dynamics__standards">施工规范：要求再树根往外滴水的三分之二处，均匀绕树周围撒肥。</div>

              <img class="farming-dynamics__divider" src="/images/divider.png" />

              <div class="farming-dynamics__view-details">
                <span class="farming-dynamics__details-text">查看详情</span>
                <span class="farming-dynamics__details-arrow">>></span>
              </div>

              <!-- 下一任务 -->
              <div class="farming-dynamics__next-task" :style="{ backgroundImage: `url(${images.currentTaskBg})` }">
                <span class="farming-dynamics__next-task-name">冬季保果壮果</span>
              </div>
              <div class="farming-dynamics__next-task-time">
                <div class="farming-dynamics__time-item">
                  <span class="farming-dynamics__time-label">开始时间：</span>
                  <span class="farming-dynamics__time-value">11月01日</span>
                </div>
                <div class="farming-dynamics__time-item">结束时间：11月30日</div>
              </div>

              <img class="farming-dynamics__divider" src="/images/divider.png" />

              <!-- 三农服务 -->
              <div class="farming-dynamics__services" :style="{ backgroundImage: `url(${images.threeNong})` }">
                <img class="farming-dynamics__services-icon" src="/images/service-icon-main.jpg" />
                <h4 class="farming-dynamics__services-title">三农服务</h4>
                <div class="farming-dynamics__services-content">
                  <div class="farming-dynamics__service-item" v-for="(service, index) in servicesData" :key="index">
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

      <!-- 健康指标详情面板 - 在左侧面板旁边显示 -->
      <div v-if="healthModalVisible" class="health-detail-panel">
        <HealthIndicatorModal
          :visible="true"
          @close="healthModalVisible = false"
        />
      </div>
    </template>
    </DashboardLayout>
  </div>
</template>

<script>
import DashboardLayout from '@/components/DashboardLayout.vue';
import RegionDetailMap from '@/components/RegionDetailMap.vue';
import HealthIndicatorModal from '@/components/HealthIndicatorModal.vue';

export default {
    name: 'PlotDetail',
    components: {
        DashboardLayout,
        RegionDetailMap,
        HealthIndicatorModal
    },
    props: {
        plotId: {
            type: [String, Number],
            required: true
        }
    },
    data() {
        return {
            // 健康指标弹窗控制
            healthModalVisible: false,
            // 图片资源引用
            images: {
                leftPanelBg: '/images/left-panel-bg.png',
                leftSlide: '/images/left-slide.png',
                statItem: '/images/stat-item.png',
                farmerProfile: '/images/farmer-profile.png',
                farmerRight: '/images/farmer-right.png',
                priceInfo: '/images/price-info.png',
                priceChartContainer: '/images/price-chart-container.png',
                priceChartBg: '/images/price-chart-bg.png',
                priceIndicator: '/images/price-indicator.png',
                priceIcon: '/images/price-icon.png',
                rankingPanelBg: '/images/ranking-panel-bg.png',
                tableDivider: '/images/table-divider.png',
                warningHeaderBg: '/images/warning-header-bg.png',
                currentTaskBg: '/images/current-task-bg.png',
                threeNong: '/images/three-nong.png',
                // 装饰图片
                decoration1: '/images/decoration-1.jpg',
                decoration2: '/images/decoration-2.jpg',
                decoration3: '/images/decoration-3.jpg',
                regionLabel: '/images/region-label.jpg',
                divider: '/images/divider.png',
                downArrow: '/images/down-arrow.png',
                // 农业相关图标
                farmingDynamicIcon: '/images/farming-dynamic-icon.jpg',
                standardFarmingIcon: '/images/standard-farming-icon.jpg',
                warningFarmingIcon: '/images/warning-farming-icon.jpg',
                farmingIcon1: '/images/farming-icon-1.jpg',
                farmingWarm: '/images/farming-warm.png',
                serviceIconMain: '/images/service-icon-main.jpg',
                serviceIcon1: '/images/service-icon-1.jpg',
                serviceIcon2: '/images/service-icon-2.jpg',
                serviceIcon3: '/images/service-icon-3.jpg',
                // 用户头像
                farmerAvatar: '/images/farmer-avatar.jpg',
                userAvatar: '/images/user-avatar.png'
            },
            // 天气数据
            weather: {
                temperature: '26.8°C',
                description: '晴多云转阵雨'
            },
            // 用户数据 - 迁移到计算属性
            // 项目数据
            projectData: {
                title: '八角数字农业示范区',
                subtitle: '智慧农业管理平台'
            },
            // 统计数据
            statisticsData: {
                totalArea: 1200,
                totalBlocks: 45,
                totalProduction: 2400
            },
            // 排名数据
            rankingData: [
                {
                    manager: '张三',
                    location: '东岗农业地块',
                    area: 45,
                    yield: 1200,
                    district: '田林县'
                },
                {
                    manager: '李四',
                    location: '西岭林地块',
                    area: 38,
                    yield: 1150,
                    district: '田阳区'
                },
                {
                    manager: '王五',
                    location: '南坡种植地块',
                    area: 42,
                    yield: 1180,
                    district: '德保县'
                }
            ],
            // 质量数据
            qualityData: {
                good: '60%',
                average: '25%',
                poor: '15%'
            },
            regionName: '',
            plotData: {
                name: '',
                district: '',
                area: '',
                yield: '',
                unitYield: '',
                farmerName: '',
                farmerAge: '',
                price: '',
                photo: '/images/farm-field-1.jpg'
            },
        };
    },
    computed: {
        // 标准农事项目 - 使用集中管理的图片常量
        standardFarmingItems() {
            return [
                { text: '冬季施肥', icon: this.images.farmingIcon1, isGold: false },
                { text: '春季<br />生物防治', icon: this.images.farmingIcon1, isGold: false },
                { text: '春季<br />强梢施肥', icon: this.images.farmingIcon1, isGold: false },
                { text: '夏季除草', icon: this.images.farmingIcon1, isGold: false },
                { text: '夏季加强版<br />生物防治+<br />催花', icon: this.images.farmingIcon1, isGold: false },
                { text: '秋季<br />保花施肥', icon: this.images.farmingIcon1, isGold: false },
                { text: '冬季<br />保果壮果', icon: this.images.farmingWarm, isGold: true },
                { text: '春季保果', icon: this.images.farmingWarm, isGold: true },
                { text: '夏季壮果', icon: this.images.farmingWarm, isGold: true },
                { text: '秋果采摘', icon: this.images.farmingWarm, isGold: true }
            ];
        },
        // 三农服务项目 - 使用集中管理的图片常量
        servicesData() {
            return [
                { icon: this.images.serviceIcon1, label: '-农投-', provider: '泮香科技' },
                { icon: this.images.serviceIcon2, label: '-农资-', provider: '泮香科技' },
                { icon: this.images.serviceIcon3, label: '-农服-', provider: '隆启雷' }
            ];
        },
        // 用户信息 - 使用集中管理的图片常量
        user() {
            return {
                name: '管理员',
                avatar: this.images.userAvatar
            };
        }
    },
    mounted() {
        console.log('=== PlotDetail 组件已挂载 ===');
        console.log('路由参数:', this.$route.params);
        console.log('路由查询:', this.$route.query);
        this.loadPlotData();
    },
    methods: {
        loadPlotData() {
            // 从路由参数获取区域名称和地块数据
            this.regionName = this.$route.query.region || '右江区';

            // 从query参数获取地块数据
            const plotName = this.$route.query.plotName || '千户十亩-大楞乡基地';
            const area = this.$route.query.area || '40';
            const output = this.$route.query.output || '25';

            this.plotData = {
                name: plotName,
                district: this.regionName,
                area,
                yield: Math.floor((parseFloat(output) || 25) * 2000 / 10000) || '48', // 转换为万斤
                unitYield: output ? Math.floor(parseFloat(output) * 2000 / parseFloat(area)) : '1200',
                farmerName: '隆启雷',
                farmerAge: '54',
                price: '6.08'
            };

            console.log('加载地块数据:', this.plotData);
        },

        handleBackClick() {
            // 返回到上一级地图
            this.$router.go(-1);
        },

        handlePlotSelected(plot) {
            // 选中地块时更新详情信息
            console.log('选中地块:', plot);
            this.plotData = {
                name: plot.name,
                district: this.regionName,
                area: plot.area,
                yield: Math.floor((plot.output || 25) * 2000 / 10000),
                unitYield: plot.output ? Math.floor(plot.output * 2000 / plot.area) : '1200',
                farmerName: '隆启雷',
                farmerAge: '54',
                price: '6.08'
            };
        },

        handleTownshipClick(township) {
            // 点击下钻到乡镇轮廓地图
            console.log('点击乡镇:', township);
            // 这里可以加载乡镇级别的轮廓地图
            // 暂时显示提示信息
            this.$message && this.$message.info(`正在加载${ township.name }乡镇轮廓地图...`);
        },

        showHealthModal() {
            // 显示健康指标弹窗
            this.healthModalVisible = true;
        }
    }
};
</script>

<style lang="less" scoped>
/* 响应式优化 */
@media (max-width: 1200px) {
    .farming-dynamics-panel {
        width: 320px;
    }

    .plot-details-panel {
        width: 320px;
    }
}

/* 根容器样式 */
.plot-detail-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.health-detail-panel {
    position: absolute;
    z-index: 100;
    top: 0;
    left: 402px;
}

/* 左侧地块详情面板 */
.plot-details-panel {
    position: relative;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    box-sizing: border-box;
    width: 375px;
    height: 734px;
    margin: 0 0 0 5px;
    padding: 0 23px 35px 33px;

    background-repeat: no-repeat;
    background-position: center;

    /* 背景图样式 */
    background-size: 100% 100%;
}

/* 左侧滑块装饰 */
.left-slide {
    position: absolute;
    z-index: 1;
    top: 230px;
    right: 0;
    width: 14px;
    height: 279px;

    background-repeat: no-repeat;
    background-size: 100% 100%;
}

/* 装饰元素 */
.panel-decoration-top {
    width: 100%;
    height: auto;
    margin-bottom: 35px;
    object-fit: none;
}

.section-divider {
    width: 160px;
    height: 3px;
    margin: 6px 0 0;
    object-fit: contain;
}

/* 地块标题区域 */
.plot-title-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.left-plot-name {
    flex: 1;
    margin: 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 16px;
    font-weight: 500;

    color: #4cfcea;
}

.region-label {
    width: 13px;
    height: 18px;
    margin-right: 9px;
}

.region-name {
    font-family: SourceHanSansCN-Medium;
    font-size: 16px;
    font-weight: 500;
    color: #39b44a;
}

/* 统计数据区域 */
.plot-statistics {
    display: flex;
    justify-content: space-between;
    margin: 21px 0 17px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 99px;
    height: 107px;
    padding-top: 30px;
    text-align: center;
}

.stat-label {
    margin-bottom: 10px;
    font-family: SourceHanSansCN-Medium;
    font-size: 11px;
    font-weight: 500;

    color: #4cfcea;
}

.stat-value-large {
    font-family: BebasNeueRegular;
    font-size: 30px;
    line-height: 1;

    color: #4cfcea;
}

.farmer-profile {
    display: flex;
    align-items: flex-start;
    width: 315px;
    height: 173px;
    padding: 8px 0 11px 13px;

    background-size: 100% 100%;
}

.farmer-avatar {
    width: 145px;
    height: 153px;
}

.farmer-details {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    margin-top: 8px;
}

.detail-divider {
    width: 95px;
    height: 3px;
    margin: 5px 0 13px;
    object-fit: none;
}

.farmer-name,
.farmer-age {
    font-family: SourceHanSansCN-Medium;
    font-size: 17px;
    font-weight: 500;
    line-height: 16px;

    color: #4cfcea;
}

.farmer-age {
    margin-bottom: 13px;
}

.farmer-rating {
    display: flex;
    gap: 2px;
}

.rating-filled {
    font-size: 12px;
    color: #4cfcea;
}

.rating-empty {
    font-size: 12px;
    color: #20776a;
}

.farmer-status {
    display: flex;
    justify-content: space-around;
    margin-top: 36px;
    gap: 3px;
}

.status-tag {
    padding: 3px 8px;
    font-family: SourceHanSansCN-Medium;
    font-size: 9px;
    font-weight: 500;
    text-align: center;

    border-radius: 4px;
}

.status-general {
    color: #0ea4a4;
    background: #0ea4a433;
}

.status-unpoverty {
    color: #0ea4a4;
    background: #0ea4a433;
}

.status-poverty {
    color: #4cfcea;
    background: #4cfcea33;
}

/* 价格信息 */
.price-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 315px;
    height: 107px;
    margin-top: 22px;
    padding: 0 16px 0 18px;

    background-size: 100% 100%;
}

.price-decoration-top,
.price-decoration-bottom {
    width: 100%;
    height: auto;
    height: 9px;
}

.price-display {
    display: flex;
    flex: 1;
    align-items: center;
    text-align: center;
}

.price-label {
    font-family: SourceHanSansCN-Medium;
    font-size: 18px;
    font-weight: 500;
    color: #4cfcea;
}

.down-arrow {
    width: 11px;
    height: 20px;
    margin-right: 13px;
}

.price-value {
    font-family: BebasNeueRegular;
    font-size: 52px;
    line-height: 1;

    color: #4cfcea;
}

.price-unit {
    font-family: SourceHanSansCN-Medium;
    font-size: 18px;
    color: #4cfcea;
}

.third-divider {
    display: block;
    width: 103px;
    height: 3px;
    margin-top: 5px;

    object-fit: none;
}

/* 健康指标区域 */
.health-section {
    margin-top: auto;
    padding-top: 20px;
}

.health-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.health-title {
    font-family: SourceHanSansCN-Medium;
    font-size: 16px;
    font-weight: 500;
    color: #4cfcea;
}

.health-link {
    display: flex;
    align-items: center;
    padding: 5px 8px;

    border-radius: 4px;
    transition: all .2s ease;
    cursor: pointer;

    gap: 5px;

    &:hover {
        background: #4cfcea1a;
        transform: translateX(2px);
    }
}

.link-text {
    font-family: SourceHanSansCN-Light;
    font-size: 9px;
    font-weight: 300;
    color: #4cfcea;
}

.link-arrow {
    font-family: FZCKJW--GB1-0;
    font-size: 9px;
    color: #4cfcea;
}

/* 健康指标容器 */
.health-indicators {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 26px;

    gap: 10px;
}

.health-indicator {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
}

/* 圆形进度条 */
.circular-progress {
    position: relative;
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
}

.circle-bg {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    border: 6px solid #4cfcea33;

    border-radius: 50%;
}

.circle {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    height: 100%;

    border-radius: 50%;
}

.circle[style*="--percentage: 20"] {
    border: none;
    border-radius: 50%;
    background: conic-gradient(from -90deg, #4cfcea 0deg, #4cfcea 72deg, transparent 72deg);
    transform: none;

    &::before {
        content: "";
        position: absolute;
        top: 6px;
        right: 6px;
        bottom: 6px;
        left: 6px;

        border-radius: 50%;
        background: #102838;
    }
}

.circle[style*="--percentage: 30"] {
    border: none;
    border-radius: 50%;
    background: conic-gradient(from -90deg, #ffa500 0deg, #ffa500 108deg, transparent 108deg);
    transform: none;

    &::before {
        content: "";
        position: absolute;
        top: 6px;
        right: 6px;
        bottom: 6px;
        left: 6px;

        border-radius: 50%;
        background: #102838;
    }
}

.percentage {
    position: absolute;
    top: 50%;
    left: 50%;
    font-family: BebasNeueRegular;
    font-size: 16px;
    text-align: center;

    color: #4cfcea;
    transform: translate(-50%, -50%);
}

/* 特殊的健康度指标 */
.health-indicator.special {
    .health-score-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80px;
        height: 80px;
        margin-bottom: 10px;
    }

    .health-score-bg {
        position: absolute;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        border: 2px solid #0f0c;

        border-radius: 50%;
        background: radial-gradient(circle, #0f03 0%, #00ff001a 50%, transparent 70%);
    }

    .health-score {
        z-index: 1;
        font-family: BebasNeueRegular;
        font-size: 24px;
        color: #0f0;
    }
}

.indicator-label {
    margin-top: 5px;
    font-family: SourceHanSansCN-Medium;
    font-size: 11px;
    font-weight: 500;
    text-align: center;

    color: #4cfcea;
}

/* ===== 右侧农情动态面板样式 - BEM命名规范 ===== */
.farming-dynamics-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 375px;
    height: 734px;
    padding: 0;

    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
}

/* 农情动态标题区域 */
.farming-dynamics__header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-top: 0;
    padding-left: 30px;
}

.farming-dynamics__header-decoration {
    width: 341px;
    height: 12px;
    margin-top: -1px;
    margin-left: -27px;
}

.farming-dynamics__title {
    margin: 14px 0 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 16px;
    font-weight: 500;
    line-height: 16px;

    color: #4cfcea;
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

.farming-dynamics__section-decoration {
    width: 141px;
    height: 5px;
    object-fit: none;
}

.farming-dynamics__section-title {
    margin: 12px 0 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 15px;
    font-weight: 500;
    line-height: 15px;

    color: #4cfcea;
}

.farming-dynamics__section-divider {
    width: 101px;
    height: 3px;
    margin: 5px 0 22px;
    object-fit: none;
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
    margin: 8px 0 8px 23px;
    gap: 12px;
}

.farming-dynamics__item + .farming-dynamics__item {
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid #4cfcea33;
}

.farming-dynamics__item-icon {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    object-fit: contain;
}

.farming-dynamics__item-text {
    flex: 1;
    font-family: SourceHanSansCN-Light;
    font-size: 12px;
    font-weight: 300;
    line-height: 16px;

    color: #4cfcea;
}

.farming-dynamics__item-text--gold {
    color: #faaf3b;
}

/* 状态指示器 */
.farming-dynamics__status-indicators {
    display: flex;
    justify-content: center;
    margin-top: 20px;
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
    font-family: SourceHanSansCN-Normal;
    font-size: 10px;
    line-height: 10px;

    color: #4cfcea;
}

.farming-dynamics__status-bar {
    width: 32px;
    height: 3px;
}

.farming-dynamics__status-bar--executed {
    background: #4cfcea;
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
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 200px;
    height: 157px;
    padding: 0 19px 17px;

    background-repeat: no-repeat;
    background-size: 100% 100%;
}

.farming-dynamics__warning-icon {
    width: 177px;
    height: 5px;
    margin-left: -9px;
    object-fit: none;
}

.farming-dynamics__warning-title {
    margin: 12px 0 16px;
    font-family: SourceHanSansCN-Medium;
    font-size: 15px;
    font-weight: 500;
    line-height: 15px;

    color: #4cfcea;
}

.farming-dynamics__warning-description {
    margin-bottom: 15px;
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;
    line-height: 14px;

    color: #4cfcea;
}

.farming-dynamics__warning-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.farming-dynamics__trigger-time {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;
    line-height: 14px;

    color: #4cfcea;
}

.farming-dynamics__warning-level {
    display: flex;
    align-items: center;
    gap: 4px;
}

.farming-dynamics__level-label {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;
    line-height: 14px;

    color: #4cfcea;
}

.farming-dynamics__level-value--high {
    font-family: SourceHanSansCN-Medium;
    font-size: 10px;
    font-weight: 500;
    line-height: 14px;

    color: #faaf3b;
}

.farming-dynamics__warning-details {
    display: flex;
    flex-direction: column;
    gap: 13px;
}

.farming-dynamics__treatment {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;
    line-height: 14px;

    color: #4cfcea;
}

.farming-dynamics__cycle {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;
    line-height: 14px;

    color: #4cfcea;
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
    height: 20px;
    margin: 8px 0 0 12px;
    padding: 0 17px 0 24px;

    background-repeat: no-repeat;
    background-size: 100% 100%;
}

.farming-dynamics__task-name {
    font-family: SourceHanSansCN-Medium;
    font-size: 10px;
    font-weight: 500;
    line-height: 10px;

    color: #093036;
}

.farming-dynamics__current-label {
    font-family: SourceHanSansCN-Medium;
    font-size: 10px;
    font-weight: 500;
    line-height: 10px;

    color: #0f0;
}

.farming-dynamics__task-time {
    margin: 9px 0 0 17px;
}

.farming-dynamics__time-item {
    margin-bottom: 8px;
    font-family: SourceHanSansCN-Medium;
    font-size: 10px;
    font-weight: 500;
    line-height: 10px;

    color: #4cfcea;
}

.farming-dynamics__time-item:last-child {
    font-family: SourceHanSansCN-Light;
    font-weight: 300;
    line-height: 14px;
}

.farming-dynamics__time-label {
    color: #4cfcea;
}

.farming-dynamics__time-value {
    font-family: SourceHanSansCN-Light;
    font-weight: 300;
    color: #4cfcea;
}

.farming-dynamics__prescription {
    margin: 6px 0 0 17px;
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;
    line-height: 14px;

    color: #4cfcea;
}

.farming-dynamics__standards {
    width: 149px;
    margin: 5px 0 0 17px;
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;
    line-height: 14px;

    color: #4cfcea;
}

.farming-dynamics__view-details {
    display: flex;
    align-items: center;
    margin: 7px 0 0 130px;

    cursor: pointer;

    gap: 4px;
}

.farming-dynamics__details-text {
    font-family: SourceHanSansCN-Light;
    font-size: 9px;
    font-weight: 300;
    line-height: 13px;

    color: #4cfcea;
}

.farming-dynamics__details-arrow {
    font-family: FZCKJW--GB1-0;
    font-size: 9px;
    line-height: 13px;

    color: #4cfcea;
}

/* 下一任务 */
.farming-dynamics__next-task {
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 174px;
    height: 20px;
    margin: 8px 0 0 12px;
    padding: 0 17px 0 25px;

    background-repeat: no-repeat;
    background-size: 100% 100%;
}

.farming-dynamics__next-task-name {
    font-family: SourceHanSansCN-Medium;
    font-size: 10px;
    font-weight: 500;
    line-height: 10px;

    color: #093036;
}

.farming-dynamics__next-task-time {
    margin: 10px 0 0 17px;
}

/* 三农服务区域 */
.farming-dynamics__services {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 200px;
    height: 159px;
    margin-top: 76px;
    padding: 0;

    background-repeat: no-repeat;
    background-size: 100% 100%;
}

.farming-dynamics__services-icon {
    width: 177px;
    height: 5px;
    margin-left: 10px;
    object-fit: none;
}

.farming-dynamics__services-title {
    margin: 12px 0 18px 20px;
    font-family: SourceHanSansCN-Medium;
    font-size: 15px;
    font-weight: 500;
    line-height: 15px;

    color: #4cfcea;
}

.farming-dynamics__services-content {
    display: flex;
    justify-content: space-around;
    box-sizing: border-box;
    width: 100%;
    padding: 0 12px;
}

.farming-dynamics__service-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.farming-dynamics__service-icon {
    width: 53px;
    height: 44px;
    margin-bottom: 12px;
    object-fit: contain;
}

.farming-dynamics__service-icon:nth-child(3) {
    height: 40px;
    margin-top: 3px;
}

.farming-dynamics__service-label {
    margin-bottom: 8px;
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 300;
    line-height: 10px;

    color: #5dd7ce;
}

.farming-dynamics__service-provider {
    font-family: SourceHanSansCN-Medium;
    font-size: 10px;
    font-weight: 500;
    line-height: 10px;

    color: #5dd7ce;
}

/* ===== 地块详情页面样式 ===== */

</style>
