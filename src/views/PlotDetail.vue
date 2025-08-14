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
                <div class="circle" style="--percentage: 20; --color: #4CFCEA;"></div>
                <div class="percentage">20%</div>
              </div>
              <div class="indicator-label">郁闭度</div>
            </div>
            
            <!-- 生长匹配度 -->
            <div class="health-indicator">
              <div class="circular-progress" data-percentage="30">
                <div class="circle-bg"></div>
                <div class="circle" style="--percentage: 30; --color: #FFA500;"></div>
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
      <div class="farming-dynamics-panel flex-col" :style="{ backgroundImage: `url(${images.rankingPanelBg})` }">
        <img class="panel-header-decoration" src="/images/farming-dynamic-icon.jpg" />
        <span class="panel-title">农情动态</span>
        <img class="title-divider" src="/images/divider.png" />
        <div class="farmer-right" :style="{ backgroundImage: `url(${images.farmerRight})` }">
          <div class="farming-content flex-col">
            <div class="farming-sections flex-row justify-between">
              <!-- 标准农事 -->
              <div class="standard-farming flex-col">
                <!-- 标题区域 -->
                <img class="section-header-decoration" src="/images/standard-farming-icon.jpg" />
                <span class="section-title">标准农事</span>
                <img class="section-divider2" src="/images/decoration-2.jpg" />
                
                <!-- 农事项目列表 -->
                <div class="farming-items">
                  <div class="farming-item flex-row">
                    <img class="farming-icon" src="/images/farming-icon-1.jpg" />
                    <span class="farming-text">冬季施肥</span>
                  </div>
                  <img class="item-divider" src="/images/divider.png" />
                  
                  <div class="farming-item flex-row">
                    <img class="farming-icon" src="/images/farming-icon-1.jpg" />
                    <span class="farming-text">春季<br />生物防治</span>
                  </div>
                  <img class="item-divider" src="/images/divider.png" />
                  
                  <div class="farming-item flex-row">
                    <img class="farming-icon" src="/images/farming-icon-1.jpg" />
                    <span class="farming-text">春季<br />强梢施肥</span>
                  </div>
                  <img class="item-divider" src="/images/divider.png" />
                  
                  <div class="farming-item flex-row">
                    <img class="farming-icon" src="/images/farming-icon-1.jpg" />
                    <span class="farming-text">夏季除草</span>
                  </div>
                  <img class="item-divider" src="/images/divider.png" />
                  
                  <div class="farming-item flex-row">
                    <img class="farming-icon" src="/images/farming-icon-1.jpg" />
                    <span class="farming-text">夏季加强版<br />生物防治+<br />催花</span>
                  </div>
                  <img class="item-divider" src="/images/divider.png" />
                  
                  <div class="farming-item flex-row">
                    <img class="farming-icon" src="/images/farming-icon-1.jpg" />
                    <span class="farming-text">秋季<br />保花施肥</span>
                  </div>
                  <img class="item-divider" src="/images/divider.png" />
                  <div class="farming-item flex-row">
                    <img class="farming-icon" src="/images/farming-warm.png" />
                    <span class="farming-text gold">冬季<br />保果壮果</span>
                  </div>
                  <img class="item-divider" src="/images/divider.png" />
                  <div class="farming-item flex-row">
                    <img class="farming-icon" src="/images/farming-warm.png" />
                    <span class="farming-text gold">春季保果</span>
                  </div>
                  <img class="item-divider" src="/images/divider.png" />
                  
                  <div class="farming-item flex-row">
                    <img class="farming-icon" src="/images/farming-warm.png" />
                    <span class="farming-text gold">夏季壮果</span>
                  </div>
                  <img class="item-divider" src="/images/divider.png" />
                  
                  <div class="farming-item flex-row">
                    <img class="farming-icon" src="/images/farming-warm.png" />
                    <span class="farming-text gold">秋果采摘</span>
                  </div>
                </div>
                
                <!-- 底部状态指示 -->
                <div class="status-indicators flex-row justify-between">
                  <div class="status-item">
                    <span class="status-text">已执行</span>
                    <div class="status-bar executed"></div>
                  </div>
                  <div class="status-item">
                    <span class="status-text">未执行</span>
                    <div class="status-bar not-executed"></div>
                  </div>
                </div>
              </div>
              
              <!-- 预警农事 -->
              <div class="warning-farming flex-col">
                <div class="warning-header flex-col" :style="{ backgroundImage: `url(${images.warningHeaderBg})` }">
                  <img class="warning-icon" src="/images/warning-farming-icon.jpg" />
                  <span class="warning-title">预警农事</span>
                  <span class="warning-description">名称: 加强版生物防治</span>
                  <div class="warning-info flex-row justify-between">
                    <span class="trigger-time">触发时间：8月</span>
                    <div class="warning-level">
                      <span class="level-label">等级:</span>
                      <span class="level-value high">高</span>
                    </div>
                  </div>
                  <div class="warning-details flex-col justify-between">
                    <span class="treatment-prescription">处方：多种复合配方加强版<br />生物防治。</span>
                    <span class="treatment-cycle">处理周期：7天</span>
                  </div>
                </div>
                
                <img class="section-divider" src="/images/divider.png" />
                
                <div class="current-task flex-row" :style="{ backgroundImage: `url(${images.currentTaskBg})` }">
                  <span class="task-name">秋季保花施肥</span>
                  <span class="current-label">（当前）</span>
                  <span class="current-label-duplicate">（当前）</span>
                </div>
                <div class="task-schedule">
                  <span class="start-time-label">开始时间：</span>
                  <span class="start-time-value">8月01日</span>
                </div>
                <span class="end-time">结束时间：8月30日</span>
                
                <img class="section-divider" src="/images/divider.png" />
                
                <span class="prescription">处方：复合肥</span>
                
                <img class="section-divider" src="/images/divider.png" />
                
                <span class="work-standards">施工规范：要求再树根往外滴水的三分之二处，均匀绕树周围撒肥。</span>
                
                <img class="section-divider" src="/images/divider.png" />
                
                <div class="view-details">
                  <span class="details-text">查看详情</span>
                  <span class="details-arrow">>></span>
                </div>
                
                <div class="next-task flex-col" :style="{ backgroundImage: `url(${images.currentTaskBg})` }">
                  <span class="next-task-name">冬季保果壮果</span>
                </div>
                <div class="next-task-schedule">
                  <span class="next-start-label">开始时间：</span>
                  <span class="next-start-value">11月01日</span>
                </div>
                <span class="next-end-time">结束时间：11月30日</span>
                
                <img class="section-divider" src="/images/divider.png" />

                <!-- 三农服务部分 -->
                <div class="agricultural-services flex-col" :style="{ backgroundImage: `url(${images.threeNong})` }">
                  <img class="service-header-icon" src="/images/service-icon-main.jpg" />
                  <span class="service-title">三农服务</span>
                  <div class="service-content">
                    <div class="service-item">
                      <img class="service-icon" src="/images/service-icon-1.jpg" />
                      <span class="service-label">-农投-</span>
                      <span class="provider-name">泮香科技</span>
                    </div>
                    <div class="service-item">
                      <img class="service-icon" src="/images/service-icon-2.jpg" />
                      <span class="service-label">-农资-</span>
                      <span class="provider-name">泮香科技</span>
                    </div>
                    <div class="service-item">
                      <img class="service-icon" src="/images/service-icon-3.jpg" />
                      <span class="service-label">-农服-</span>
                      <span class="provider-name">隆启雷</span>
                    </div>
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
import DashboardLayout from '@/components/DashboardLayout.vue'
import RegionDetailMap from '@/components/RegionDetailMap.vue'
import HealthIndicatorModal from '@/components/HealthIndicatorModal.vue'

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
        statItem: '/images/stat-item.png',
        farmerProfile: '/images/farmer-profile.png',
        priceInfo: '/images/price-info.png',
        rankingPanelBg: '/images/ranking-panel-bg.png',
        farmerRight: '/images/farmer-right.png',
        titleDecoration: '/images/title-decoration.png',
        titleUnderline: '/images/title-underline.png',
        blockCountCard: '/images/block-count-card.png',
        totalAreaCard: '/images/total-area-card.png',
        cardLabelBlock: '/images/card-label-block.png',
        cardLabelArea: '/images/card-label-area.png',
        priceChartContainer: '/images/price-chart-container.png',
        priceChartBg: '/images/price-chart-bg.png',
        priceIndicator: '/images/price-indicator.png',
        priceIcon: '/images/price-icon.png',
        tableDivider: '/images/table-divider.png',
        leftSlide: '/images/left-slide.png',
        warningHeaderBg: '/images/warning-header-bg.png',
        currentTaskBg: '/images/current-task-bg.png',
        threeNong: '/images/three-nong.png',
        plotSatelliteMap: '/images/map-image.jpg',
      },
      // 天气数据
      weather: {
        temperature: '26.8°C',
        description: '晴多云转阵雨'
      },
      // 用户数据
      user: {
        name: '管理员',
        avatar: '/images/user-avatar.png'
      },
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
        photo: '/images/gallery-1.jpg'
      },
    }
  },
  mounted() {
    console.log('=== PlotDetail 组件已挂载 ===')
    console.log('路由参数:', this.$route.params)
    console.log('路由查询:', this.$route.query)
    this.loadPlotData()
  },
  methods: {
    loadPlotData() {
      // 从路由参数获取区域名称和地块数据
      this.regionName = this.$route.query.region || '右江区'
      
      // 从query参数获取地块数据
      const plotName = this.$route.query.plotName || '千户十亩-大楞乡基地'
      const area = this.$route.query.area || '40'
      const output = this.$route.query.output || '25'
      
      this.plotData = {
        name: plotName,
        district: this.regionName,
        area: area,
        yield: Math.floor((parseFloat(output) || 25) * 2000 / 10000) || '48', // 转换为万斤
        unitYield: output ? Math.floor(parseFloat(output) * 2000 / parseFloat(area)) : '1200',
        farmerName: '隆启雷',
        farmerAge: '54',
        price: '6.08'
      }
      
      console.log('加载地块数据:', this.plotData)
    },
    
    handleBackClick() {
      // 返回到上一级地图
      this.$router.go(-1)
    },
    
    handlePlotSelected(plot) {
      // 选中地块时更新详情信息
      console.log('选中地块:', plot)
      this.plotData = {
        name: plot.name,
        district: this.regionName,
        area: plot.area,
        yield: Math.floor((plot.output || 25) * 2000 / 10000),
        unitYield: plot.output ? Math.floor(plot.output * 2000 / plot.area) : '1200',
        farmerName: '隆启雷',
        farmerAge: '54',
        price: '6.08'
      }
    },
    
    handleTownshipClick(township) {
      // 点击下钻到乡镇轮廓地图
      console.log('点击乡镇:', township)
      // 这里可以加载乡镇级别的轮廓地图
      // 暂时显示提示信息
      this.$message && this.$message.info(`正在加载${township.name}乡镇轮廓地图...`)
    },
    
    showHealthModal() {
      // 显示健康指标弹窗
      this.healthModalVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
/* ===== 地块详情页面样式 ===== */

/* 根容器样式 */
.plot-detail-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.health-detail-panel {
  position: absolute;
  left: 402px;
  top: 0;
  z-index: 100;
}

/* 左侧地块详情面板 */
.plot-details-panel {
  width: 375px;
  height: 734px;
  margin: 0 0 0 5px;
  padding: 0 23px 35px 33px;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* 背景图样式 */
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
}

/* 左侧滑块装饰 */
.left-slide {
  position: absolute;
  right: 0;
  top: 230px;
  width: 14px;
  height: 279px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  z-index: 1;
}

/* 装饰元素 */
.panel-decoration-top {
  margin-bottom: 35px;
  width: 100%;
  height: auto;
  object-fit: none;
}

.section-divider {
  margin: 6px 0 0;
  width: 160px;
  height: 3px;
  object-fit: contain;
}

/* 地块标题区域 */
.plot-title-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-plot-name {
  color: rgba(76, 252, 234, 1);
  font-size: 16px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  margin: 0;
  flex: 1;
}

.region-label {
  margin-right: 9px;
  width: 13px;
  height: 18px;
}

.region-name {
  color: rgba(57, 180, 74, 1);
  font-size: 16px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
}

/* 统计数据区域 */
.plot-statistics {
  display: flex;
  justify-content: space-between;
  margin: 21px 0 17px;
}

.stat-item {
  padding-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 99px;
  height: 107px;
}


.stat-label {
  margin-bottom: 10px;
  color: #4CFCEA;
  font-size: 11px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
}

.stat-value-large {
  color: #4CFCEA;
  font-size: 30px;
  font-family: BebasNeueRegular;
  font-weight: normal;
  line-height: 1;
}

.farmer-profile {
  padding: 8px 0 11px 13px;
  display: flex;
  align-items: flex-start;
  width: 315px;
  height: 173px;
  background-size: 100% 100%;
}

.farmer-avatar {
  width: 145px;
  height: 153px;
}

.farmer-details {
  margin-top: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-divider {
  margin: 5px 0 13px;
  width: 95px;
  height: 3px;
  object-fit: none;
}

.farmer-name,
.farmer-age {
  color: rgba(76, 252, 234, 1);
  font-size: 17px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  line-height: 16px;
}

.farmer-age {
  margin-bottom: 13px;
}

.farmer-rating {
  display: flex;
  gap: 2px;
}

.rating-filled {
  color: rgba(76, 252, 234, 1);
  font-size: 12px;
}

.rating-empty {
  color: rgba(32, 119, 106, 1);
  font-size: 12px;
}

.farmer-status {
  display: flex;
  justify-content: space-around;
  margin-top: 36px;
  gap: 3px;
}

.status-tag {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 9px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: center;
}

.status-general {
  background: rgba(14, 164, 164, 0.2);
  color: rgba(14, 164, 164, 1);
}

.status-unpoverty {
  background: rgba(14, 164, 164, 0.2);
  color: rgba(14, 164, 164, 1);
}

.status-poverty {
  background: rgba(76, 252, 234, 0.2);
  color: rgba(76, 252, 234, 1);
}

/* 价格信息 */
.price-info {
  padding: 0 16px 0 18px;
  margin-top: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 315px;
  height: 107px;
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
  color: rgba(76, 252, 234, 1);
  font-size: 18px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
}

.down-arrow {
  margin-right: 13px;
  width: 11px;
  height: 20px;
}

.price-value {
  color: rgba(76, 252, 234, 1);
  font-size: 52px;
  font-family: BebasNeueRegular;
  font-weight: normal;
  line-height: 1;
}

.price-unit {
  color: rgba(76, 252, 234, 1);
  font-size: 18px;
  font-family: SourceHanSansCN-Medium;
}


.third-divider {
    display: block;
    margin-top: 5px;
    width: 103px;
    height: 3px;
    object-fit: none;
}

/* 健康指标区域 */
.health-section {
  margin-top: auto;
  padding-top: 20px;
}

.health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.health-title {
  color: rgba(76, 252, 234, 1);
  font-size: 16px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
}

.health-link {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(76, 252, 234, 0.1);
    transform: translateX(2px);
  }
}

.link-text {
  color: rgba(76, 252, 234, 1);
  font-size: 9px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
}

.link-arrow {
  color: rgba(76, 252, 234, 1);
  font-size: 9px;
  font-family: FZCKJW--GB1-0;
}

/* 健康指标容器 */
.health-indicators {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-top: 26px;
}

.health-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
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
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 6px solid rgba(76, 252, 234, 0.2);
  box-sizing: border-box;
}

.circle {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-sizing: border-box;
}

.circle[style*="--percentage: 20"] {
  background: conic-gradient(from -90deg, #4CFCEA 0deg, #4CFCEA 72deg, transparent 72deg);
  border: none;
  border-radius: 50%;
  transform: none;
  
  &::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 6px;
    right: 6px;
    bottom: 6px;
    background: rgba(16, 40, 56, 1);
    border-radius: 50%;
  }
}

.circle[style*="--percentage: 30"] {
  background: conic-gradient(from -90deg, #FFA500 0deg, #FFA500 108deg, transparent 108deg);
  border: none;
  border-radius: 50%;
  transform: none;
  
  &::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 6px;
    right: 6px;
    bottom: 6px;
    background: rgba(16, 40, 56, 1);
    border-radius: 50%;
  }
}

.percentage {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(76, 252, 234, 1);
  font-size: 16px;
  font-family: BebasNeueRegular;
  font-weight: normal;
  text-align: center;
}

/* 特殊的健康度指标 */
.health-indicator.special {
  .health-score-container {
    position: relative;
    width: 80px;
    height: 80px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .health-score-bg {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 255, 0, 0.2) 0%, rgba(0, 255, 0, 0.1) 50%, transparent 70%);
    border: 2px solid rgba(0, 255, 0, 0.8);
    box-sizing: border-box;
  }
  
  .health-score {
    color: rgba(0, 255, 0, 1);
    font-size: 24px;
    font-family: BebasNeueRegular;
    font-weight: normal;
    z-index: 1;
  }
}

.indicator-label {
  color: rgba(76, 252, 234, 1);
  font-size: 11px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: center;
  margin-top: 5px;
}

/* ===== 右侧面板样式 - 语义化命名 ===== */
.farming-dynamics-panel {
  width: 375px;
  height: 734px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  padding: 0;
  position: relative;
}

.panel-header-decoration {
  width: 341px;
  height: 12px;
  margin: -1px 0 0 -3px;
}

.farmer-right {
  margin-top: 25px;
  width: 347px;
  height: 646px;
  background-size: 100% 100%;
}

.panel-title {
  width: 68px;
  height: 16px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 16px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 16px;
  margin: 14px 0 0 30px;
}

.title-divider {
  width: 67px;
  height: 3px;
  margin: 5px 0 0 31px;
}

.farming-content {
  min-height: 644px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  width: 345px;
}

.farming-sections {
  width: 345px;
  min-height: 389px;
  margin-left: 1px;
}

.standard-farming {
  width: 141px;
  min-height: 389px;
  overflow: hidden;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.section-header-decoration {
  width: 141px;
  height: 5px;
}

.section-title {
  width: 62px;
  height: 14px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 15px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 12px auto 0;
}

.section-divider2 {
  width: 101px;
  height: 3px;
  margin: 5px auto 22px;
  object-fit: none;
}

.group_9 {
  width: 141px;
  height: 10px;
  margin: 15px 0 0 18px;
}

.text_35 {
  width: 61px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
}

.text-wrapper_10 {
  width: 37px;
  height: 10px;
  overflow-wrap: break-word;
  font-size: 0;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
}

.text_36 {
  width: 37px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
}

.text_37 {
  width: 37px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(250, 175, 59, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
}

.text-group_2 {
  width: 140px;
  height: 47px;
  margin: 10px 0 17px 17px;
}

.paragraph_5 {
  width: 140px;
  height: 24px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  line-height: 14px;
}

.text_38 {
  width: 73px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
  margin-top: 13px;
}

.text-wrapper_11 {
  position: relative;
  width: 174px;
  height: 20px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin: 8px 0 0 12px;
}

.text_39 {
  width: 62px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(9, 48, 54, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
  margin: 6px 0 0 24px;
}

.text_40 {
  width: 27px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(0, 255, 0, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: right;
  white-space: nowrap;
  line-height: 10px;
  margin: 6px 17px 0 44px;
}

.text-wrapper_12 {
  width: 82px;
  height: 10px;
  overflow-wrap: break-word;
  font-size: 0;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
  margin: 9px 0 0 17px;
}

.text_42 {
  width: 82px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
}

.text_43 {
  width: 82px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
}

.text_44 {
  width: 82px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
  margin: 8px 0 0 17px;
}

.text_45 {
  width: 78px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
  margin: 6px 0 0 17px;
}

.paragraph_6 {
  width: 149px;
  height: 24px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  line-height: 14px;
  margin: 5px 0 0 17px;
}

.text-wrapper_13 {
  width: 47px;
  height: 9px;
  overflow-wrap: break-word;
  font-size: 0;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 13px;
  margin: 7px 0 0 130px;
}

.text_46 {
  width: 47px;
  height: 9px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 9px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 13px;
}

.text_47 {
  width: 47px;
  height: 9px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 9px;
  font-family: FZCKJW--GB1-0;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 13px;
}

.section_15 {
  width: 346px;
  height: 177px;
  margin: 7px 0 1px 0;
}

.group_11 {
  width: 200px;
  height: 159px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: 16px;
}

.image_56 {
  width: 177px;
  height: 5px;
  margin-left: 10px;
}

.text_60 {
  width: 61px;
  height: 14px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 15px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 12px 0 0 20px;
}

.image-wrapper_8 {
  width: 175px;
  height: 44px;
  margin: 18px 0 0 12px;
}

.image_57 {
  width: 53px;
  height: 44px;
}

.image_58 {
  width: 53px;
  height: 44px;
  margin-left: 8px;
}

.image_59 {
  width: 53px;
  height: 40px;
  margin: 3px 0 0 8px;
}

.text-wrapper_18 {
  width: 151px;
  height: 10px;
  margin: 12px 0 0 23px;
}

.text_61 {
  width: 29px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(93, 215, 206, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: center;
  white-space: nowrap;
  line-height: 10px;
}

.text_62 {
  width: 29px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(93, 215, 206, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: center;
  white-space: nowrap;
  line-height: 10px;
  margin-left: 32px;
}

.text_63 {
  width: 29px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(93, 215, 206, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: center;
  white-space: nowrap;
  line-height: 10px;
  margin-left: 32px;
}

.text-wrapper_19 {
  width: 161px;
  height: 10px;
  margin: 7px 0 26px 16px;
}

.text_64 {
  width: 44px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(93, 215, 206, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  line-height: 10px;
}

.text_65 {
  width: 44px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(93, 215, 206, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  line-height: 10px;
  margin-left: 17px;
}

.text_66 {
  width: 32px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(93, 215, 206, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  line-height: 10px;
  margin-left: 23px;
}

/* 新增的section样式 */
.section_12 {
  width: 217px;
  height: 10px;
  margin: 5px 0 0 24px;
}

.image_44 {
  width: 100px;
  height: 1px;
  margin-top: 9px;
}

.text_52 {
  width: 78px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
}

.image-wrapper_5 {
  width: 165px;
  height: 1px;
  margin: 6px 0 0 162px;
}

.image_45 {
  width: 165px;
  height: 1px;
}

.section_13 {
  width: 289px;
  height: 30px;
  margin: 5px 0 0 24px;
}

.image_46 {
  width: 24px;
  height: 23px;
  margin-top: 5px;
}

.paragraph_7 {
  width: 52px;
  height: 27px;
  overflow-wrap: break-word;
  color: rgba(250, 175, 59, 1);
  font-size: 12px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  line-height: 12px;
  margin: 3px 0 0 12px;
}

.paragraph_8 {
  width: 149px;
  height: 24px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  line-height: 14px;
  margin-left: 51px;
}

.image-wrapper_6 {
  width: 165px;
  height: 1px;
  margin-left: 162px;
}

.image_47 {
  width: 165px;
  height: 1px;
}

.section_14 {
  width: 299px;
  height: 9px;
  margin: 5px 0 0 24px;
}

.image_48 {
  width: 100px;
  height: 1px;
  margin-top: 7px;
}

.text-wrapper_16 {
  width: 47px;
  height: 9px;
  overflow-wrap: break-word;
  font-size: 0;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 13px;
}

.text_53 {
  width: 47px;
  height: 9px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 9px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 13px;
}

.text_54 {
  width: 47px;
  height: 9px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 9px;
  font-family: FZCKJW--GB1-0;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 13px;
}

/* group_10相关样式 */
.group_10 {
  width: 141px;
  height: 177px;
}

.section_16 {
  width: 88px;
  height: 24px;
  margin-left: 24px;
}

.image_49 {
  width: 24px;
  height: 24px;
}

.text_55 {
  width: 51px;
  height: 12px;
  overflow-wrap: break-word;
  color: rgba(250, 175, 59, 1);
  font-size: 12px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 12px;
  margin-top: 8px;
}

.image_50 {
  width: 100px;
  height: 1px;
  margin: 11px 0 0 24px;
}

.section_17 {
  width: 88px;
  height: 24px;
  margin: 6px 0 0 24px;
}

.image_51 {
  width: 24px;
  height: 24px;
}

.text_56 {
  width: 51px;
  height: 12px;
  overflow-wrap: break-word;
  color: rgba(250, 175, 59, 1);
  font-size: 12px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 12px;
  margin-top: 9px;
}

.image_52 {
  width: 100px;
  height: 1px;
  margin: 12px 0 0 24px;
}

.section_18 {
  width: 88px;
  height: 24px;
  margin: 6px 0 0 24px;
}

.image_53 {
  width: 24px;
  height: 24px;
}

.text_57 {
  width: 51px;
  height: 12px;
  overflow-wrap: break-word;
  color: rgba(250, 175, 59, 1);
  font-size: 12px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 12px;
  margin-top: 8px;
}

.section_19 {
  height: 47px;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  margin-top: 22px;
  width: 141px;
}

.text-wrapper_17 {
  width: 94px;
  height: 11px;
  margin: 13px 0 0 28px;
}

.text_58 {
  width: 33px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Normal;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
  margin-top: 1px;
}

.text_59 {
  width: 33px;
  height: 11px;
  overflow-wrap: break-word;
  color: rgba(250, 175, 59, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Normal;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
}

.image-wrapper_7 {
  width: 93px;
  height: 3px;
  margin: 6px 0 14px 29px;
}

.image_54 {
  width: 32px;
  height: 3px;
}

.image_55 {
  width: 32px;
  height: 3px;
}

/* 其他缺失的样式 */
.text_32 {
  position: absolute;
  left: 37px;
  top: 7px;
  width: 51px;
  height: 12px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 12px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 12px;
}

.text_41 {
  position: absolute;
  left: 130px;
  top: 6px;
  width: 27px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(0, 255, 0, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: right;
  white-space: nowrap;
  line-height: 10px;
}

.text_48 {
  width: 62px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(9, 48, 54, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
  margin: 6px 0 0 25px;
}

.text-wrapper_15 {
  width: 88px;
  height: 10px;
  overflow-wrap: break-word;
  font-size: 0;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
  margin: 10px 0 0 17px;
}

.text_49 {
  width: 88px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
}

.text_50 {
  width: 88px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
}

.text_51 {
  width: 88px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
  margin: 7px 0 0 17px;
}

.image_39 {
  width: 177px;
  height: 5px;
  margin: 3px 0 0 10px;
}

.image_40 {
  width: 165px;
  height: 1px;
  margin: 7px 0 0 17px;
}

.image_41 {
  width: 165px;
  height: 1px;
  margin: 5px 0 0 17px;
}

.image_42 {
  width: 165px;
  height: 1px;
  margin: 6px 0 0 17px;
}

.image_43 {
  width: 165px;
  height: 1px;
  margin: 8px 0 0 17px;
}

/* ===== 预警农事区域样式 - 语义化命名 ===== */
.warning-farming {
  width: 200px;
  height: 389px;
}

.warning-header {
  width: 200px;
  height: 157px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.warning-icon {
  width: 177px;
  height: 5px;
  margin-left: 10px;
}

.warning-title {
  width: 61px;
  height: 14px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 15px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin: 12px 0 0 19px;
}

.warning-description {
  width: 119px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
  margin: 16px 0 0 19px;
}

.warning-info {
  width: 141px;
  height: 10px;
  margin: 15px 0 0 18px;
}

.trigger-time {
  width: 61px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
}

.warning-level {
  width: 37px;
  height: 10px;
  overflow-wrap: break-word;
  font-size: 0;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
}

.level-label {
  width: 37px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
}

.level-value.high {
  width: 37px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(250, 175, 59, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
}

.warning-details {
  width: 140px;
  height: 47px;
  margin: 10px 0 17px 17px;
}

.treatment-prescription {
  width: 140px;
  height: 24px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  line-height: 14px;
}

.treatment-cycle {
  width: 73px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
  margin-top: 13px;
}

.current-task {
  position: relative;
  width: 174px;
  height: 20px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin: 8px 0 0 12px;
}

.task-name {
  width: 62px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(9, 48, 54, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
  margin: 6px 0 0 24px;
}

.current-label {
  width: 27px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(0, 255, 0, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: right;
  white-space: nowrap;
  line-height: 10px;
  margin: 6px 17px 0 44px;
}

.current-label-duplicate {
  position: absolute;
  left: 130px;
  top: 6px;
  width: 27px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(0, 255, 0, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: right;
  white-space: nowrap;
  line-height: 10px;
}

.task-schedule {
  width: 82px;
  height: 10px;
  overflow-wrap: break-word;
  font-size: 0;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
  margin: 9px 0 0 17px;
}

.start-time-label {
  width: 82px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
}

.start-time-value {
  width: 82px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
}

.end-time {
  width: 82px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
  margin: 8px 0 0 17px;
}

.prescription {
  width: 78px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
  margin: 6px 0 0 17px;
}

.work-standards {
  width: 149px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  line-height: 14px;
  margin: 5px 0 0 17px;
}

.view-details {
  width: 47px;
  height: 9px;
  overflow-wrap: break-word;
  font-size: 0;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 13px;
  margin: 7px 0 0 130px;
}

.details-text {
  width: 47px;
  height: 9px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 9px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 13px;
}

.details-arrow {
  width: 47px;
  height: 9px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 9px;
  font-family: FZCKJW--GB1-0;
  font-weight: normal;
  text-align: left;
  white-space: nowrap;
  line-height: 13px;
}

.next-task {
  position: relative;
  width: 174px;
  height: 20px;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  margin: 8px 0 0 12px;
}

.next-task-name {
  width: 62px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(9, 48, 54, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
  margin: 6px 0 0 25px;
}

.next-task-schedule {
  width: 88px;
  height: 10px;
  overflow-wrap: break-word;
  font-size: 0;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
  margin: 10px 0 0 17px;
}

.next-start-label {
  width: 88px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
}

.next-start-value {
  width: 88px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 10px;
}

.next-end-time {
  width: 88px;
  height: 10px;
  overflow-wrap: break-word;
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 14px;
  margin: 7px 0 0 17px;
}

/* 标准农事区域样式 */
.farming-items {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.extra-items {
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.farming-item {
  display: flex;
  align-items: center;
  margin: 8px 0 8px 23px;
  gap: 12px;
}

.farming-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.farming-icon.gold {
  filter: hue-rotate(45deg) saturate(1.5);
}

.farming-text {
  color: rgba(76, 252, 234, 1);
  font-size: 12px;
  font-family: SourceHanSansCN-Light;
  line-height: 16px;
  flex: 1;
}

.farming-text.gold {
  color: rgba(250, 175, 59, 1);
}

.item-divider {
  width: 100px;
  height: 1px;
  margin: 4px 0 4px 23px;
}

.status-indicators {
  margin-top: auto;
  padding: 8px 16px;
  display: flex;
  justify-content: center;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin: 0 14px;
}

.status-text {
  color: rgba(76, 252, 234, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Normal;
  font-weight: normal;
  line-height: 10px;
}

.status-bar {
  width: 32px;
  height: 3px;
}

.status-bar.executed {
  background: rgba(76, 252, 234, 1);
}

.status-bar.not-executed {
  background: rgba(250, 175, 59, 1);
}

/* 三农服务区域样式 - 使用CSS Grid简化实现 */
.agricultural-services {
  width: 200px;
  height: 159px;
  margin: 76px 0 0 0;
  padding: 0;
  align-items: start;
  background-size: 100% 100%;
}

.service-header-icon {
  grid-column: 1 / -1;
  width: 177px;
  height: 5px;
  margin-left: 10px;
  object-fit: none;
}

.service-title {
  margin-top: 13px;
  grid-column: 1 / -1;
  color: rgba(76, 252, 234, 1);
  font-size: 15px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  margin-left: 20px;
}

.service-content {
  padding: 0 14px 0 12px;
  display: flex;
  width: 100%;
  justify-content: space-around;
  margin-top: 18px;
}

.service-item {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.service-icon {
  width: 53px;
  height: 44px;
  justify-self: center;
}

.service-icon:nth-of-type(3) {
  height: 40px;
  margin-top: 3px;
}

.service-label {
  margin: 12px 0 8px;
  color: rgba(93, 215, 206, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Light;
  font-weight: 300;
  text-align: center;
  line-height: 10px;
  justify-self: center;
}

.provider-name {
  color: rgba(93, 215, 206, 1);
  font-size: 10px;
  font-family: SourceHanSansCN-Medium;
  font-weight: 500;
  text-align: center;
  line-height: 10px;
  justify-self: center;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .right-content-wrapper {
    width: 320px;
  }
  
  .plot-details-panel {
    width: 320px;
  }
  
  .farming-dynamics-panel {
    width: 100%;
  }
}

</style>