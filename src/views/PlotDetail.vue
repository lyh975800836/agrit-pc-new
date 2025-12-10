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
      :full-screen-map="true"
      :show-bottom-nav="true"
      @back="handleBackClick"
    >
    <template #center-map>
      <!-- WMTS瓦片地图 -->
      <WMTSTileMap
        ref="wmtsTileMap"
        :region-name="regionName"
        :plot-data="plotData"
        @tile-metrics="handleTileMetrics"
      />
    </template>

    <template #left-panel>
      <!-- 左侧面板 - 根据type类型动态显示 -->
      <!-- 八角地块详情面板 -->
      <div v-if="plotData.type !== 'factory' && plotData.type !== 'warehouse'" class="plot-details-panel">
        <!-- 地块标题信息 -->
        <PlotTitleSection
          :plot-name="plotData.name || '千户十亩-大楞乡基地'"
          :region-name="plotData.district || '右江区'"
        />

        <!-- 农户信息 -->
        <FarmerProfileCard
          :farmer-name="farmerConfigData?.owner_name || plotData.farmerName || defaultFarmerName"
          :farmer-age="farmerConfigData?.owner_age || plotData.farmerAge || defaultFarmerAge"
          :avatar-url="farmerAvatarUrl"
          :background-image="images.farmerProfile"
          :status-tags="dynamicStatusTags"
        />
        <!-- 地块统计数据 -->
        <PlotStatisticsGrid
          :items="[
            { label: '总面积(亩)：', value: farmerConfigData?.total_area },
            { label: '产量(万斤)：', value: farmerConfigData?.total_yield },
            { label: '亩产量(斤/亩)：', value: farmerConfigData?.yield_per_mu }
          ]"
          :background-image="images.statItem"
        />
        <!-- 价格信息 -->
        <PriceInfoBox
          label="今日价格："
          :value="String(spicePriceDisplay?.price || DEFAULT_PLOT_DATA.price)"
          :unit="spicePriceDisplay?.unit || '元/斤'"
          :background-image="images.priceInfo"
        />

        <!-- 健康指标 -->
        <HealthIndicators
          :indicators="[
            { label: '郁闭度', percentage: 20 },
            { label: '生长匹配度', percentage: 30 },
            { label: '健康度', percentage: 90 }
          ]"
          @show-health-modal="showHealthModal"
        />
      </div>

      <!-- 烘干厂生产概况面板 -->
      <div v-if="plotData.type === 'factory'" class="plot-details-panel factory-panel">
        <!-- 装饰线 -->
        <img class="panel-decoration-top" src="/images/decoration-1.jpg" />

        <!-- 地块标题信息 -->
        <div class="plot-title-section">
          <h2 class="left-plot-name">{{ plotData.name || '六塘晒场' }}</h2>
          <img class="region-label" src="/images/region-label.jpg" />
          <span class="region-name">{{ regionName }}</span>
        </div>

        <img class="section-divider" src="/images/decoration-2.png" />

        <!-- 所有人信息 -->
        <div class="farmer-profile" :style="{ backgroundImage: `url(${images.farmerProfile})` }">
          <img class="farmer-avatar" :src="farmerAvatarUrl" />
          <div class="farmer-details">
            <div class="farmer-name">所有人：{{ farmerConfigData?.owner_name }}</div>
            <img class="detail-divider" src="/images/divider.png" />
            <div class="farmer-age">名下工厂数：{{ farmerConfigData?.owner_factory_num }}个</div>
            <div class="farmer-rating">
              <span class="rating-filled" v-for="i in (farmerConfigData?.owner_star_rank || 4)" :key="`filled-${i}`">★</span>
              <span class="rating-empty" v-for="i in (5 - (farmerConfigData?.owner_star_rank || 4))" :key="`empty-${i}`">★</span>
            </div>
            <div class="farmer-status">
              <div v-for="tag in factoryStatusTags" :key="tag" class="status-tag" :class="getStatusClass(tag)">{{ tag }}</div>
            </div>
          </div>
        </div>

        <!-- 工厂统计数据 -->
        <div class="plot-statistics">
          <div class="stat-item" :style="{ backgroundImage: `url(${images.statItem})` }">
            <span class="stat-label">总面积(亩)：</span>
            <span class="stat-value stat-value-large">{{ farmerConfigData?.total_area }}</span>
          </div>

          <div class="stat-item" :style="{ backgroundImage: `url(${images.statItem})` }">
            <span class="stat-label">年度加工产能(吨)：</span>
            <span class="stat-value stat-value-large">{{ farmerConfigData?.annual_capacity }}</span>
          </div>

          <div class="stat-item" :style="{ backgroundImage: `url(${images.statItem})` }">
            <span class="stat-label">今年累计产量(吨)：</span>
            <span class="stat-value stat-value-large">{{ farmerConfigData?.year_to_date_production }}</span>
          </div>
        </div>

        <!-- 鲜果收购价信息 -->
        <div class="price-info" :style="{ backgroundImage: `url(${images.priceInfo})` }">
          <div class="price-display">
            <span class="price-label">鲜果收购价：</span>
            <img class="down-arrow" src="/images/down-arrow.png">
            <span class="price-value">{{ farmerConfigData?.fresh_fruit_price }}</span>
            <span class="price-unit">&nbsp;&nbsp;元/斤</span>
          </div>
        </div>

        <!-- 加工价格信息 -->
        <div class="price-info" :style="{ backgroundImage: `url(${images.priceInfo})` }">
          <div class="price-display">
            <span class="price-label">加工价格：</span>
            <img class="down-arrow" src="/images/down-arrow.png">
            <span class="price-value">{{ farmerConfigData?.processing_price }}</span>
            <span class="price-unit">&nbsp;&nbsp;元/吨</span>
          </div>
        </div>

        <!-- 施工计划（日历形式） -->
        <div class="health-section">
          <div class="health-header">
            <span class="health-title">施工计划</span>
          </div>
          <img class="third-divider" src="/images/decoration-2.png" />
          <!-- 施工计划日历 -->
          <div class="construction-calendar" v-if="constructionCalendarData">
            <div class="calendar-header">
              <span class="calendar-month">{{ constructionCalendarData.monthDisplay }}</span>
            </div>
            <div class="calendar-grid">
              <div
                v-for="day in constructionCalendarData.daysInMonth"
                :key="day"
                class="calendar-day"
                :class="{ 'has-schedule': constructionCalendarData.scheduledDays.includes(day) }">
                <span class="day-number">{{ day }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 仓库概览面板 -->
      <div v-if="plotData.type === 'warehouse'" class="plot-details-panel warehouse-panel">
        <!-- 装饰线 -->
        <img class="panel-decoration-top" src="/images/decoration-1.jpg" />

        <!-- 地块标题信息 -->
        <div class="plot-title-section">
          <h2 class="left-plot-name">仓库</h2>
          <img class="region-label" src="/images/region-label.jpg" />
          <span class="region-name">{{ regionName }}</span>
        </div>

        <img class="section-divider" src="/images/decoration-2.png" />

        <!-- 所有人信息（仓库不显示状态标签） -->
        <div class="farmer-profile warehouse-owner" :style="{ backgroundImage: `url(${images.farmerProfile})` }">
          <img class="farmer-avatar" :src="farmerAvatarUrl" />
          <div class="farmer-details">
            <div class="farmer-name">所有人：{{ farmerConfigData?.owner_name }}</div>
            <img class="detail-divider" src="/images/divider.png" />
            <div class="farmer-age">管理仓库数：{{ farmerConfigData?.manager_warehouse_num }}个</div>
            <div class="farmer-rating">
              <span class="rating-filled" v-for="i in (farmerConfigData?.owner_star_rank || 4)" :key="`filled-${i}`">★</span>
              <span class="rating-empty" v-for="i in (5 - (farmerConfigData?.owner_star_rank || 4))" :key="`empty-${i}`">★</span>
            </div>
          </div>
        </div>

        <!-- 仓库统计数据 -->
        <div class="plot-statistics">
          <div class="stat-item" :style="{ backgroundImage: `url(${images.statItem})` }">
            <span class="stat-label">总面积(平方米)：</span>
            <span class="stat-value stat-value-large">{{ farmerConfigData?.warehouse_area }}</span>
          </div>

          <div class="stat-item" :style="{ backgroundImage: `url(${images.statItem})` }">
            <span class="stat-label">总存储量(吨)：</span>
            <span class="stat-value stat-value-large">{{ farmerConfigData?.total_storage }}</span>
          </div>
        </div>

        <!-- 存储价格信息 -->
        <div class="price-info" :style="{ backgroundImage: `url(${images.priceInfo})` }">
          <div class="price-display">
            <span class="price-label">存储价格：</span>
            <img class="down-arrow" src="/images/down-arrow.png">
            <span class="price-value">{{ farmerConfigData?.storage_price }}</span>
            <span class="price-unit">&nbsp;&nbsp;元/吨/天</span>
          </div>
        </div>

        <!-- 库存占比 -->
        <div class="health-section">
          <div class="health-header">
            <span class="health-title">库存占比</span>
            <div class="health-link" @click="showHealthModal">
              <span class="link-text">查看详情</span>
              <span class="link-arrow">>></span>
            </div>
          </div>
          <img class="third-divider" src="/images/decoration-2.png" />
          <!-- 库存占比圆形图表 -->
          <div class="health-indicators">
            <!-- 存储量 -->
            <div class="health-indicator">
              <div class="circular-progress" data-percentage="78">
                <div class="circle-bg"></div>
                <div class="circle" style="--percentage: 78;
--color: #c69c6d;"></div>
                <div class="percentage">78%</div>
              </div>
              <div class="indicator-label">存储量</div>
            </div>

            <!-- 容积占比 -->
            <div class="health-indicator">
              <div class="circular-progress" data-percentage="65">
                <div class="circle-bg"></div>
                <div class="circle" style="--percentage: 65;
--color: #ffa500;"></div>
                <div class="percentage">65%</div>
              </div>
              <div class="indicator-label">容积占比</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #right-panel>
      <!-- 右侧面板 - 根据type类型动态显示 -->
      <!-- 八角地块农情动态面板 -->
      <div v-if="plotData.type !== 'factory' && plotData.type !== 'warehouse'" class="farming-dynamics-panel">
        <!-- 面板标题区域 -->
        <div class="farming-dynamics__header">
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
                <h4 class="farming-dynamics__section-title">标准农事</h4>
              </div>

              <!-- 农事项目列表 -->
              <div class="farming-dynamics__items-list">
                <div class="farming-dynamics__item"
                     v-for="(item, index) in standardFarmingItems"
                     :key="index"
                     :class="{ 'farming-dynamics__item--active': selectedFarmingItemId === item.id }"
                     @click="handleFarmingItemClick(item, index)">
                  <img class="farming-dynamics__item-icon"
                       :src="getItemIconByStatus(item)" />
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

            <!-- 右侧: 农事预期固定内容 -->
            <div class="farming-dynamics__warning-section">
              <!-- 预警农事头部 -->
              <div class="farming-dynamics__warning-header" :style="{ backgroundImage: `url(${images.warningHeaderBg})` }">
                <div class="farming-dynamics__warning-title-row">
                  <h4 class="farming-dynamics__warning-title">预警农事</h4>
                  <div class="farming-dynamics__warning-alert-icon">⚠</div>
                </div>

                <div class="farming-dynamics__warning-basic-info">
                  <span class="farming-dynamics__warning-label">名称：</span>
                  <span class="farming-dynamics__warning-name-value">{{ warningFarmingInfo?.name }}</span>
                </div>

                <div class="farming-dynamics__warning-time-level">
                  <span class="farming-dynamics__warning-label">触发时间：</span>
                  <span class="farming-dynamics__warning-time-value">{{ warningFarmingInfo?.triggerMonth }}</span>
                  <span class="farming-dynamics__warning-level-label">等级：</span>
                  <span class="farming-dynamics__warning-level-value">{{ warningFarmingInfo?.level === 'high' ? '高' : '中' }}</span>
                </div>

                <div class="farming-dynamics__warning-prescription">
                  <span class="farming-dynamics__warning-label">处方：</span>
                  <span class="farming-dynamics__warning-prescription-text">
                    {{ warningFarmingInfo?.prescription }}
                  </span>
                </div>

                <div class="farming-dynamics__warning-cycle-info">
                  处理周期：{{ warningFarmingInfo?.processingDays }}天
                </div>
              </div>

              <!-- 当前任务 -->
              <div v-if="selectedFarmingDetails" class="farming-dynamics__current-task" :style="{ backgroundImage: `url(${images.currentTaskBg})` }">
                <span class="farming-dynamics__task-name">{{ selectedFarmingDetails.title?.replace(/\(.*?\)/, '').trim() }}</span>
                <span class="farming-dynamics__current-label" :class="`farming-dynamics__current-label--${selectedFarmingDetails.status}`">（{{ getStatusText(selectedFarmingDetails.status) }}）</span>
              </div>
              <div v-if="selectedFarmingDetails" class="farming-dynamics__task-time">
                <div class="farming-dynamics__time-item">
                  <span class="farming-dynamics__time-label">开始时间：</span>
                  <span class="farming-dynamics__time-value">{{ selectedFarmingDetails.startDate }}</span>
                </div>
                <div class="farming-dynamics__time-item">结束时间：{{ selectedFarmingDetails.endDate }}</div>
              </div>

              <img v-if="selectedFarmingDetails" class="farming-dynamics__divider" src="/images/divider.png" />

              <div v-if="selectedFarmingDetails" class="farming-dynamics__prescription">{{ selectedFarmingDetails.description }}</div>

              <img v-if="selectedFarmingDetails" class="farming-dynamics__divider" src="/images/divider.png" />

              <div v-if="selectedFarmingDetails" class="farming-dynamics__standards">{{ selectedFarmingDetails.requirement }}</div>

              <div class="farming-dynamics__view-details" @click="openFarmingDetail('current')">
                <span class="farming-dynamics__details-text">查看详情</span>
                <span class="farming-dynamics__details-arrow">>></span>
              </div>

              <!-- 下一任务 -->
              <div v-if="nextFarmingItem?.details" class="farming-dynamics__next-task" :style="{ backgroundImage: `url(${images.currentTaskBg})` }">
                <span class="farming-dynamics__next-task-name">{{ nextFarmingItem.details.title?.replace(/\(.*?\)/, '').trim() }}</span>
                <span class="farming-dynamics__next-label">（下阶段）</span>
              </div>
              <div v-if="nextFarmingItem?.details" class="farming-dynamics__next-task-time">
                <div class="farming-dynamics__time-item">
                  <span class="farming-dynamics__time-label">开始时间：</span>
                  <span class="farming-dynamics__time-value">{{ nextFarmingItem.details.startDate }}</span>
                </div>
                <div class="farming-dynamics__time-item">结束时间：{{ nextFarmingItem.details.endDate }}</div>
              </div>

              <img v-if="nextFarmingItem?.details" class="farming-dynamics__divider" src="/images/divider.png" />

              <div v-if="nextFarmingItem?.details" class="farming-dynamics__prescription">{{ nextFarmingItem.details.description }}</div>

              <img v-if="nextFarmingItem?.details" class="farming-dynamics__divider" src="/images/divider.png" />

              <div v-if="nextFarmingItem?.details" class="farming-dynamics__standards">{{ nextFarmingItem.details.requirement }}</div>

              <div class="farming-dynamics__view-details" @click="openFarmingDetail('next')">
                <span class="farming-dynamics__details-text">查看详情</span>
                <span class="farming-dynamics__details-arrow">>></span>
              </div>

              <!-- 三农服务 -->
              <div class="farming-dynamics__services" :style="{ backgroundImage: `url(${images.threeNong})` }">
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

      <!-- 仓库库存与物流面板 -->
      <div v-if="plotData.type === 'warehouse'" class="warehouse-inventory-panel">
        <div class="panel-header">
          <h3 class="panel-title">库存与物流</h3>
          <img class="title-divider" src="/images/divider.png" />
        </div>

        <!-- 库存分类 -->
        <div class="batch-module">
          <h4 class="batch-module-title">库存分类</h4>
          <div class="batch-content">
            <div class="batch-row">
              <span class="batch-label">一级品：</span>
              <span class="batch-value">180.5吨</span>
            </div>
            <div class="batch-row">
              <span class="batch-label">二级品：</span>
              <span class="batch-value">50.3吨</span>
            </div>
            <div class="batch-row">
              <span class="batch-label">三级品：</span>
              <span class="batch-value">20.0吨</span>
            </div>
          </div>
        </div>
        <img class="module-divider" src="/images/divider.png" />

        <!-- 保管条件 -->
        <div class="batch-module">
          <h4 class="batch-module-title">保管条件</h4>
          <div class="progress-content">
            <div class="progress-stage">
              <span class="stage-label">温度：</span>
              <span class="stage-value">18-22℃</span>
            </div>
            <div class="progress-stage">
              <span class="stage-label">湿度：</span>
              <span class="stage-value">55-65%</span>
            </div>
            <div class="progress-stage">
              <span class="stage-label">环境状态：</span>
              <span class="stage-value">正常</span>
            </div>
          </div>
        </div>
        <img class="module-divider" src="/images/divider.png" />

        <!-- 库存历史趋势 -->
        <div class="batch-module">
          <h4 class="batch-module-title">库存历史趋势</h4>
          <div class="trend-content">
            <p class="trend-description">最近7天库存量变化趋势</p>
            <div class="trend-chart">
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 35%;"></div>
                <span class="trend-label">周一</span>
              </div>
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 40%;"></div>
                <span class="trend-label">周二</span>
              </div>
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 38%;"></div>
                <span class="trend-label">周三</span>
              </div>
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 45%;"></div>
                <span class="trend-label">周四</span>
              </div>
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 50%;"></div>
                <span class="trend-label">周五</span>
              </div>
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 42%;"></div>
                <span class="trend-label">周六</span>
              </div>
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 55%;"></div>
                <span class="trend-label">周日</span>
              </div>
            </div>
          </div>
        </div>
        <img class="module-divider" src="/images/divider.png" />

        <!-- 待出库单据 -->
        <div class="batch-module">
          <h4 class="batch-module-title">待出库单据</h4>
          <div class="alert-content">
            <div class="alert-item">
              <span class="alert-label">待发货单：</span>
              <span class="alert-value">3笔</span>
            </div>
            <div class="alert-item">
              <span class="alert-label">预计出库(吨)：</span>
              <span class="alert-value">25.6</span>
            </div>
            <div class="alert-item">
              <span class="alert-label">最近发货时间：</span>
              <span class="alert-value">2025年11月2日 16:30</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 烘干厂生产流程与批次面板 -->
      <div v-if="plotData.type === 'factory'" class="factory-production-panel">
        <div class="panel-header">
          <h3 class="panel-title">生产流程与批次</h3>
          <img class="title-divider" src="/images/divider.png" />
        </div>

        <!-- 当前批次 -->
        <div class="batch-module">
          <h4 class="batch-module-title">当前批次</h4>
          <div class="batch-content">
            <div class="batch-row">
              <span class="batch-label">批次编号：</span>
              <span class="batch-value">DH-2025-001</span>
            </div>
            <div class="batch-row">
              <span class="batch-label">原料来源地：</span>
              <span class="batch-value">右江区马山镇</span>
            </div>
            <div class="batch-row">
              <span class="batch-label">烘干开始时间：</span>
              <span class="batch-value">2025年11月2日 08:30</span>
            </div>
          </div>
        </div>
        <img class="module-divider" src="/images/divider.png" />

        <!-- 批次进度 -->
        <div class="batch-module">
          <h4 class="batch-module-title">批次进度</h4>
          <div class="progress-content">
            <div class="progress-stage">
              <span class="stage-label">当前阶段：</span>
              <span class="stage-value">加热中</span>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar" style="width: 45%;"></div>
            </div>
            <div class="progress-percentage">45%</div>
          </div>
        </div>
        <img class="module-divider" src="/images/divider.png" />

        <!-- 历史产量趋势 -->
        <div class="batch-module">
          <h4 class="batch-module-title">历史产量趋势</h4>
          <div class="trend-content">
            <p class="trend-description">最近7天烘干量变化趋势</p>
            <div class="trend-chart">
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 42%;"></div>
                <span class="trend-label">周一</span>
              </div>
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 45%;"></div>
                <span class="trend-label">周二</span>
              </div>
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 43%;"></div>
                <span class="trend-label">周三</span>
              </div>
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 48%;"></div>
                <span class="trend-label">周四</span>
              </div>
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 50%;"></div>
                <span class="trend-label">周五</span>
              </div>
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 46%;"></div>
                <span class="trend-label">周六</span>
              </div>
              <div class="trend-bar-group">
                <div class="trend-bar" style="height: 44%;"></div>
                <span class="trend-label">周日</span>
              </div>
            </div>
          </div>
        </div>
        <img class="module-divider" src="/images/divider.png" />

        <!-- 预警与任务 -->
        <div class="batch-module">
          <h4 class="batch-module-title">预警与任务</h4>
          <div class="alert-content">
            <div class="alert-item">
              <span class="alert-label">温度异常：</span>
              <span class="alert-value">正常</span>
            </div>
            <div class="alert-item">
              <span class="alert-label">电流异常：</span>
              <span class="alert-value">正常</span>
            </div>
            <div class="alert-item">
              <span class="alert-label">下一批次排程时间：</span>
              <span class="alert-value">2025年11月2日 14:00</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 健康指标详情面板 - 在左侧面板旁边显示 -->
      <div v-if="healthModalVisible" class="health-detail-overlay" @click.self="healthModalVisible = false">
        <div class="health-detail-panel">
          <HealthIndicatorModal
            :visible="healthModalVisible"
            @close="healthModalVisible = false"
          />
        </div>
      </div>
    </template>
    </DashboardLayout>

    <!-- 耕作详情弹窗 -->
    <FarmingDetailDialog
      :visible="farmingDetailDialogVisible"
      :farming-item="farmingDetailDialogContent"
      @close="closeFarmingDetailDialog"
    />
  </div>
</template>

<script>
import DashboardLayout from '@/components/Dashboard/DashboardLayout.vue';
import WMTSTileMap from '@/components/Map/WMTSTileMap.vue';
import HealthIndicatorModal from '@/components/Dialogs/HealthIndicatorModal.vue';
import FarmingDetailDialog from '@/components/Dialogs/FarmingDetailDialog.vue';
import PlotTitleSection from '@/components/PlotDetail/PlotTitleSection.vue';
import FarmerProfileCard from '@/components/PlotDetail/FarmerProfileCard.vue';
import PlotStatisticsGrid from '@/components/PlotDetail/PlotStatisticsGrid.vue';
import PriceInfoBox from '@/components/PlotDetail/PriceInfoBox.vue';
import HealthIndicators from '@/components/PlotDetail/HealthIndicators.vue';
import { FARMER_CONFIG, RANKING_CONFIG, DEFAULT_PLOT_DATA, getFarmerInfo } from '@/config/farmerConfig';
import apiClient from '@/services/apiClient';

export default {
    name: 'PlotDetail',
    components: {
        DashboardLayout,
        WMTSTileMap,
        HealthIndicatorModal,
        FarmingDetailDialog,
        PlotTitleSection,
        FarmerProfileCard,
        PlotStatisticsGrid,
        PriceInfoBox,
        HealthIndicators
    },
    props: {
        plotId: {
            type: [String, Number],
            required: true
        }
    },
    data() {
        return {
            // 配置常量（模板中使用）
            FARMER_CONFIG,
            DEFAULT_PLOT_DATA,
            // 健康指标弹窗控制
            healthModalVisible: false,
            // 选中的农事项目ID
            selectedFarmingItemId: null,
            // API 返回的原始数据
            apiPlotDetail: null,      // 地块详情（包含 config_data）
            apiStandardFarming: [],   // 标准农事
            currentFarmingStageId: null, // 当前农事阶段ID
            apiWarningFarming: null,  // 预警农事
            apiServiceFarming: null,  // 三农服务
            apiSpicePrice: null,      // 八角价格
            // 数据加载状态
            isLoading: true,
            loadError: null,
            // 图片资源引用
            images: {
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
                decoration2: '/images/decoration-2.png',
                decoration3: '/images/decoration-3.jpg',
                regionLabel: '/images/region-label.jpg',
                divider: '/images/divider.png',
                downArrow: '/images/down-arrow.png',
                // 农业相关图标
                farmingDynamicIcon: '/images/farming-dynamic-icon.jpg',
                standardFarmingIcon: '/images/standard-farming-icon.jpg',
                warningFarmingIcon: '/images/warning-farming-icon.jpg',
                farmingIcon1: '/images/farming-icon-1.png',
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
            // 排名数据 - 从配置文件导入
            rankingData: RANKING_CONFIG,
            // 质量数据
            qualityData: {
                good: '50.9',
                average: '22.4',
                poor: '26.7'
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
                photo: '/images/farm-field-1.jpg',
                type: '' // 地块类型：tea-oil（油茶）、star-anise（八角）、factory（工厂）、warehouse（仓库）
            },
            tileMetrics: null,
            // 农情详情弹窗控制
            farmingDetailDialogVisible: false,
            farmingDetailDialogContent: null
        };
    },
    computed: {
        displayedPlotArea() {
            return this.plotData.area || '0';
        },

        // 农户配置信息 - 从 API 返回的 config_data 提取
        farmerConfigData() {
            if (!this.apiPlotDetail || !this.apiPlotDetail.config_data) {
                return null;
            }
            const configData = this.apiPlotDetail.config_data;

            // 如果已经是对象，直接返回
            if (typeof configData === 'object') {
                return configData;
            }

            // 如果是字符串，尝试解析
            if (typeof configData === 'string') {
                try {
                    return JSON.parse(configData);
                } catch (e) {
                    console.error('Failed to parse config_data:', e);
                    return null;
                }
            }

            return null;
        },

        // 标准农事项目 - 从 API 数据动态生成
        standardFarmingItems() {
            if (!this.apiStandardFarming || this.apiStandardFarming.length === 0) {
                return [];
            }

            // 首先确定当前农事的索引
            let currentIndex = -1;
            if (this.currentFarmingStageId) {
                currentIndex = this.apiStandardFarming.findIndex(
                    item => item.id === this.currentFarmingStageId
                );
            }
            if (currentIndex === -1) {
                currentIndex = 0;
            }

            // 转换为标准格式，暂不标记 isCurrent 和 isNext
            let items = this.apiStandardFarming.map((item, index) => ({
                id: `standard-${ item.id }`,
                originalId: item.id, // 保存原始ID用于匹配
                text: item.name,
                icon: this.images.farmingIcon1,
                isGold: false,
                isCurrent: false, // 暂时标记为false，后续重新排序后再标记
                isNext: false, // 暂时标记为false，后续重新排序后再标记
                details: {
                    title: item.name,
                    startDate: item.start_date,
                    endDate: item.end_date,
                    description: `处方：${ item.prescription || '' }`,
                    requirement: item.specification || '施工规范详见说明',
                    status: this.getTaskStatus(index, this.apiStandardFarming.length)
                }
            }));

            let currentItem = null;
            const totalItems = items.length;

            // 进行环形排列，使当前农事在中间位置
            const displayCount = totalItems; // 显示所有农事
            const middlePosition = Math.floor(displayCount / 2); // 中间位置索引
            const reorderedItems = [];

            // 从当前农事往前回绕 middlePosition 个位置开始
            for (let i = 0; i < displayCount; i++) {
                const index = (currentIndex - middlePosition + i + totalItems * 100) % totalItems;
                const item = items[index];
                reorderedItems.push(item);

                // 标记当前农事和下一个农事
                if (i === middlePosition) {
                    item.isCurrent = true;
                    // 当前农事的图标使用 farming-warm
                    item.icon = this.images.farmingWarm;
                    currentItem = item;
                }
                if (i === middlePosition + 1) {
                    item.isNext = true;
                    // 下一个农事的图标也使用 farming-warm
                    item.icon = this.images.farmingWarm;
                }
            }

            items = reorderedItems;

            // 自动选中逻辑：如果没有选中任何项目且列表非空，自动选中当前农事
            if (!this.selectedFarmingItemId && items.length > 0 && currentItem) {
                // 通过 $nextTick 来异步设置，避免在 computed 属性中产生副作用
                this.$nextTick(() => {
                    this.selectedFarmingItemId = currentItem.id;
                });
            }

            return items;
        },

        // 选中的农事项目详情
        selectedFarmingDetails() {
            if (!this.selectedFarmingItemId) {
                // 默认选中第一个
                const firstItem = this.standardFarmingItems[0];
                if (firstItem) {
                    return firstItem.details;
                }
                return null;
            }
            const selectedItem = this.standardFarmingItems.find(item => item.id === this.selectedFarmingItemId);
            return selectedItem ? selectedItem.details : null;
        },

        // 下一个农事项目（基于当前选中项目的下一个）
        nextFarmingItem() {
            if (!this.selectedFarmingItemId && this.standardFarmingItems.length === 0) {
                return null;
            }

            // 如果没有选中项目，默认选中第一个，返回第二个作为下一项
            if (!this.selectedFarmingItemId && this.standardFarmingItems.length > 0) {
                return this.standardFarmingItems.length > 1
                    ? { details: this.standardFarmingItems[1].details }
                    : null;
            }

            const currentIndex = this.standardFarmingItems.findIndex(item => item.id === this.selectedFarmingItemId);
            if (currentIndex === -1 || currentIndex === this.standardFarmingItems.length - 1) {
                // 如果没找到或者是最后一个，返回第一个
                const firstItem = this.standardFarmingItems[0];
                return firstItem ? { details: firstItem.details } : null;
            }

            return { details: this.standardFarmingItems[currentIndex + 1].details };
        },

        // 预警农事信息 - 从 API 数据提取
        warningFarmingInfo() {
            if (!this.apiWarningFarming) {
                return null;
            }
            return {
                name: this.apiWarningFarming.name,
                triggerMonth: this.apiWarningFarming.trigger_month,
                level: this.apiWarningFarming.level,
                prescription: this.apiWarningFarming.prescription,
                processingDays: this.apiWarningFarming.processing_days
            };
        },

        // 三农服务项目 - 从 API 数据动态生成
        servicesData() {
            if (!this.apiServiceFarming) {
                return [];
            }
            const iconMap = [
                this.images.serviceIcon1,
                this.images.serviceIcon2,
                this.images.serviceIcon3
            ];

            const services = [];
            if (this.apiServiceFarming.farm_tech) {
                services.push({
                    icon: iconMap[0] || this.images.serviceIcon1,
                    label: '农技',
                    provider: this.apiServiceFarming.farm_tech
                });
            }
            if (this.apiServiceFarming.farm_material) {
                services.push({
                    icon: iconMap[1] || this.images.serviceIcon2,
                    label: '农资',
                    provider: this.apiServiceFarming.farm_material
                });
            }
            if (this.apiServiceFarming.farm_invest) {
                services.push({
                    icon: iconMap[2] || this.images.serviceIcon3,
                    label: '投融',
                    provider: this.apiServiceFarming.farm_invest
                });
            }
            return services;
        },

        // 用户信息 - 使用集中管理的图片常量
        user() {
            return {
                name: '管理员',
                avatar: this.images.userAvatar
            };
        },

        // 默认农户名
        defaultFarmerName() {
            return this.FARMER_CONFIG.default.name;
        },

        // 默认农户年龄
        defaultFarmerAge() {
            return this.FARMER_CONFIG.default.age;
        },

        // 农户头像URL - 动态从 API 数据获取
        farmerAvatarUrl() {
            // 优先从 config_data 获取头像
            if (this.farmerConfigData && this.farmerConfigData.owner_avatar) {
                return this.farmerConfigData.owner_avatar;
            }
            // 其他类型（八角地块）使用默认配置获取农户头像
            const plotName = this.plotData?.name;
            if (plotName) {
                const farmerInfo = getFarmerInfo(plotName);
                return farmerInfo.avatar;
            }
            return this.FARMER_CONFIG.default.avatar;
        },

        // 动态状态标签 - 根据plot type和API数据动态生成
        dynamicStatusTags() {
            if (!this.apiPlotDetail) {
                return [];
            }

            // 八角地块(property_type_name 包含 "八角")
            if (this.apiPlotDetail.property_type_name && this.apiPlotDetail.property_type_name.includes('八角')) {
                const statusMap = {
                    normal: { label: '一般户', cssClass: 'status-general' },
                    not_alleviated: { label: '未脱贫', cssClass: 'status-unpoverty' },
                    alleviated: { label: '已脱贫', cssClass: 'status-poverty' }
                };
                const status = this.apiPlotDetail.status;
                const tagInfo = statusMap[status];
                return tagInfo ? [tagInfo] : [];
            }

            return [];
        },

        // 施工计划日历数据 - 从 config_data.work_schedule 提取
        constructionCalendarData() {
            const configData = this.farmerConfigData;
            if (!configData || !configData.work_schedule) {
                return null;
            }

            // 获取当前日期
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1; // 月份从 1-12

            // 获取本月的工作计划
            const yearData = configData.work_schedule[currentYear];
            if (!yearData) {
                return null;
            }

            const monthStr = String(currentMonth).padStart(2, '0');
            const monthData = yearData[currentMonth] || yearData[monthStr];

            if (!monthData || !Array.isArray(monthData)) {
                return null;
            }

            // 计算本月天数
            const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

            // 提取有工作安排的日期（值为 1 表示有工作）
            const scheduledDays = monthData
                .map((value, index) => value === 1 ? index + 1 : null)
                .filter(day => day !== null && day <= daysInMonth);

            return {
                monthDisplay: `${currentMonth}月`,
                daysInMonth: Array.from({ length: daysInMonth }, (_, i) => i + 1),
                scheduledDays
            };
        },

        // 八角价格显示 - 从 API 数据提取
        spicePriceDisplay() {
            if (!this.apiSpicePrice) {
                return null;
            }
            return {
                price: this.apiSpicePrice.todayPrice,
                unit: this.apiSpicePrice.skuUnit
            };
        },

        // 工厂状态标签 - 从API的status字段动态生成
        factoryStatusTags() {
            if (!this.apiPlotDetail) {
                return [];
            }

            // 工厂类型(property_type_name 包含 "工厂")
            if (this.apiPlotDetail.property_type_name && this.apiPlotDetail.property_type_name.includes('工厂')) {
                const statusMap = {
                    mechanical: '机械加工',
                    sunlight: '阳光晾晒',
                    mixed: '机械+阳光晾晒'
                };
                const status = this.apiPlotDetail.status;
                const displayLabel = statusMap[status] || status;
                return [displayLabel];
            }

            return [];
        }
    },
    mounted() {
        this.loadPlotData();
    },
    methods: {
        // 获取任务状态 - 根据任务索引判断
        getTaskStatus(index, totalItems) {
            // 简化处理：前几个已完成，当前和之后的为待执行
            if (index < totalItems / 2) {
                return 'completed';
            } else if (index === Math.floor(totalItems / 2)) {
                return 'current';
            } else {
                return 'pending';
            }
        },

        async loadPlotData() {
            try {
                this.isLoading = true;
                this.loadError = null;

                // 从路由参数获取区域名称和地块数据
                this.regionName = this.$route.query.region || '右江区';

                // 解码plotId参数（处理中文字符）
                const encodedPlotId = this.$route.params.plotId;
                const decodedPlotId = encodedPlotId ? decodeURIComponent(encodedPlotId) : null;

                // 从query参数获取地块数据
                const plotName = this.$route.query.plotName || decodedPlotId || '千户十亩-大楞乡基地';
                const area = this.$route.query.area || String(DEFAULT_PLOT_DATA.area);
                const output = this.$route.query.output || String(DEFAULT_PLOT_DATA.output);
                // 默认类型为八角
                const type = this.$route.query.type || 'star-anise';

                // 获取该地块的农户信息
                const farmerInfo = getFarmerInfo(plotName);

                // 从后端获取plot tiles列表，根据plotName找到真实的plot_id和layer_name
                const tileRecord = await this.fetchPlotTileRecord(plotName);

                // plotId优先级：后端返回的ID > 路由参数中解码后的ID > 报错提示
                let plotId = tileRecord?.plot_id || decodedPlotId;
                if (!plotId) {
                    console.warn('无法获取有效的plotId，使用默认值1000');
                    plotId = '1000';
                } else {
                    console.log('使用plotId:', plotId);
                }

                // 基础地块数据
                const outputNum = parseFloat(output) || DEFAULT_PLOT_DATA.output;
                const areaNum = parseFloat(area) || DEFAULT_PLOT_DATA.area;
                this.plotData = {
                    id: plotId,
                    name: plotName,
                    district: this.regionName,
                    area,
                    yield: Math.floor(outputNum * DEFAULT_PLOT_DATA.conversionFactor / DEFAULT_PLOT_DATA.conversionDivisor) || DEFAULT_PLOT_DATA.yield,
                    unitYield: output ? Math.floor(outputNum * DEFAULT_PLOT_DATA.conversionFactor / areaNum) : DEFAULT_PLOT_DATA.unitYield,
                    farmerName: farmerInfo.name,
                    farmerAge: farmerInfo.age,
                    price: DEFAULT_PLOT_DATA.price,
                    type, // 地块类型
                    layer: tileRecord?.layer_name // 从后端获取的layer_name
                };

                // 优先加载农事数据（只针对八角地块），其他数据后台加载
                if (type !== 'factory' && type !== 'warehouse') {
                    // 八角地块：农事数据优先加载
                    await Promise.all([
                        this.loadPlotDetail(plotId),
                        this.loadFarmingData()
                    ]);
                    // 价格数据后台加载，不阻塞页面显示
                    this.loadSpicePrice();
                } else {
                    // 工厂/仓库：只加载基本信息
                    await this.loadPlotDetail(plotId);
                    // 其他数据后台加载
                    this.loadFarmingData();
                    this.loadSpicePrice();
                }

                this.isLoading = false;
            } catch (error) {
                console.error('Failed to load plot data:', error);
                this.loadError = error.message;
                this.isLoading = false;
            }
        },

        // 加载地块详情（包含农户信息）
        async loadPlotDetail(plotId) {
            try {
                const result = await apiClient.getPlotDetail(plotId);
                if (result && result.code === 0 && result.data) {
                    this.apiPlotDetail = result.data;
                    // 提取当前农事阶段ID
                    if (result.data.current_farming_stage_id) {
                        this.currentFarmingStageId = result.data.current_farming_stage_id;
                    }
                }
            } catch (error) {
                console.warn('Failed to load plot detail:', error);
            }
        },

        // 加载农事数据
        async loadFarmingData() {
            try {
                // 并行加载三种类型的农事数据
                const [standardResult, warningResult, serviceResult] = await Promise.all([
                    apiClient.getFarmingList('standard'),
                    apiClient.getFarmingList('warning'),
                    apiClient.getFarmingList('service')
                ]);

                // 处理标准农事
                if (standardResult && standardResult.code === 0 && standardResult.data && standardResult.data.list) {
                    this.apiStandardFarming = standardResult.data.list;
                    // 自动选中逻辑由 standardFarmingItems computed property 处理
                }

                // 处理预警农事 - 取第一个或找到当前阶段的
                if (warningResult && warningResult.code === 0 && warningResult.data && warningResult.data.list) {
                    this.apiWarningFarming = warningResult.data.list[0] || null;
                }

                // 处理三农服务 - 取第一个
                if (serviceResult && serviceResult.code === 0 && serviceResult.data && serviceResult.data.list) {
                    this.apiServiceFarming = serviceResult.data.list[0] || null;
                }
            } catch (error) {
                console.warn('Failed to load farming data:', error);
            }
        },

        // 加载八角价格
        async loadSpicePrice() {
            try {
                const result = await apiClient.getSpicePrice(1, 1);
                if (result && result.code === 0 && result.data && result.data.list) {
                    this.apiSpicePrice = result.data.list[0] || null;
                }
            } catch (error) {
                console.warn('Failed to load spice price:', error);
            }
        },

        // 从后端获取plot tile记录
        async fetchPlotTileRecord(plotName) {
            try {
                const result = await apiClient.getPlotsList();

                if (result && result.code === 0 && Array.isArray(result.data)) {
                    // 按 plot_name 查找
                    const record = result.data.find(item => item.plot_name === plotName);
                    return record || null;
                }
            }
            catch (error) {
                console.warn('Failed to fetch plot tile record:', error);
            }
            return null;
        },


        handleTileMetrics(metrics) {
            this.tileMetrics = metrics || null;
        },

        formatNumber(value, fractionDigits = 2) {
            const numeric = Number(value);
            if (!Number.isFinite(numeric)) {
                return '0.00';
            }
            return numeric.toFixed(fractionDigits);
        },

        handleBackClick() {
            // 返回到上一级地图
            const regionName = this.$route.query.region || '右江区';
            // 使用push而不是go(-1)来确保正确的路由过渡和组件初始化
            this.$router.push({
                path: `/detail/${ encodeURIComponent(regionName) }`
            });
        },

        async handlePlotSelected(plot) {
            // 选中地块时更新详情信息
            const farmerInfo = getFarmerInfo(plot.name);
            const outputNum = plot.output || DEFAULT_PLOT_DATA.output;
            const areaNum = plot.area || DEFAULT_PLOT_DATA.area;

            // 获取plot ID（支持多种字段名）
            const plotId = plot.id || plot.plot_id || plot.plotId;

            this.plotData = {
                id: plotId,
                name: plot.name,
                district: this.regionName,
                area: plot.area,
                yield: Math.floor(outputNum * DEFAULT_PLOT_DATA.conversionFactor / DEFAULT_PLOT_DATA.conversionDivisor) || DEFAULT_PLOT_DATA.yield,
                unitYield: plot.output ? Math.floor(outputNum * DEFAULT_PLOT_DATA.conversionFactor / areaNum) : DEFAULT_PLOT_DATA.unitYield,
                farmerName: farmerInfo.name,
                farmerAge: farmerInfo.age,
                price: DEFAULT_PLOT_DATA.price,
                type: plot.type // 保持地块类型
            };

            // 重新加载该地块的API数据（农事、价格等）
            if (plotId) {
                try {
                    this.isLoading = true;
                    // 重置状态，防止旧数据污染
                    this.selectedFarmingItemId = null;
                    this.currentFarmingStageId = null;

                    await Promise.all([
                        this.loadPlotDetail(plotId),
                        this.loadFarmingData(),
                        this.loadSpicePrice()
                    ]);
                } catch (error) {
                    console.error('Failed to reload plot data:', error);
                    this.loadError = error.message;
                } finally {
                    this.isLoading = false;
                }
            } else {
                console.warn('Plot ID not found in selected plot object:', plot);
            }
        },

        handleTownshipClick(township) {
            // 点击下钻到乡镇轮廓地图
            // 这里可以加载乡镇级别的轮廓地图
            // 暂时显示提示信息
            this.$message && this.$message.info(`正在加载${ township.name }乡镇轮廓地图...`);
        },

        // 处理农事项目点击
        handleFarmingItemClick(item) {

            // 设置选中的农事项目ID
            this.selectedFarmingItemId = item.id;

            // 更新地图显示以反映选中的农事项目
            this.updateMapForFarmingItem(item);
        },

        // 更新地图显示以反映选中的农事项目
        updateMapForFarmingItem(farmingItem) {
            // 根据不同的农事项目改变地图显示

            // 可以调用RegionDetailMap组件的方法来改变地图内容
            // 例如：显示不同的覆盖层、标记或高亮区域
            const mapComponent = this.$refs.wmtsTileMap;
            if (mapComponent && typeof mapComponent.updateForFarmingActivity === 'function') {
                mapComponent.updateForFarmingActivity(farmingItem);
            }
        },

        openFarmingDetail(section) {
            let details = null;

            if (section === 'current') {
                details = this.selectedFarmingDetails || this.getDefaultCurrentFarmingDetails();
            }

            if (section === 'next') {
                details = this.nextFarmingItem && this.nextFarmingItem.details ? this.nextFarmingItem.details : null;
            }

            if (!details) {
                return;
            }

            this.farmingDetailDialogContent = { ...details };
            this.farmingDetailDialogVisible = true;
        },

        getDefaultCurrentFarmingDetails() {
            return {
                title: '秋季保花施肥',
                startDate: '8月01日',
                endDate: '8月30日',
                description: '处方：复合肥',
                requirement: '施工规范：要求再树根往外滴水三分之二处，勾绒树周围撒肥。',
                status: 'current'
            };
        },

        closeFarmingDetailDialog() {
            this.farmingDetailDialogVisible = false;
            this.farmingDetailDialogContent = null;
        },

        // 获取状态文本
        getStatusText(status) {
            const statusMap = {
                current: '当前',
                completed: '已完成',
                pending: '待执行',
                expected: '预期'
            };
            return statusMap[status] || status;
        },

        // 获取选中农事的月份
        getSelectedFarmingMonth() {
            if (!this.selectedFarmingDetails) {
                return '8月';
            }
            const { startDate } = this.selectedFarmingDetails;
            if (startDate.includes('月')) {
                return `${ startDate.split('月')[0] }月`;
            }
            return '8月';
        },

        // 获取选中农事的等级
        getSelectedFarmingLevel() {
            if (!this.selectedFarmingDetails) {
                return '高';
            }
            const { status } = this.selectedFarmingDetails;
            const levelMap = {
                current: '高',
                completed: '中',
                pending: '高',
                expected: '中'
            };
            return levelMap[status] || '高';
        },

        // 获取选中农事的处理周期
        getSelectedFarmingCycle() {
            if (!this.selectedFarmingDetails) {
                return '处理周期：30天';
            }
            const { startDate } = this.selectedFarmingDetails;
            const { endDate } = this.selectedFarmingDetails;
            if (startDate && endDate) {
                const start = parseInt(startDate.replace(/[^\d]/g, ''));
                const end = parseInt(endDate.replace(/[^\d]/g, ''));
                const cycle = end - start + 1;
                return `处理周期：${ cycle }天`;
            }
            return '处理周期：30天';
        },

        // 获取选中农事的处方信息
        getSelectedFarmingPrescription() {
            if (!this.selectedFarmingDetails) {
                return '多种复合配方加强版生物防治。';
            }
            const { description } = this.selectedFarmingDetails;
            return description.replace('处方：', '');
        },

        showHealthModal() {
            // 显示健康指标弹窗
            this.healthModalVisible = true;
        },

        // 根据农事状态获取对应的图标
        getItemIconByStatus(item) {
            // 当前农事（中间位置）及以下的农事使用 farming-warm (绿色)
            if (item.isCurrent) {
                return this.images.farmingWarm;
            }
            // 找到当前农事在列表中的位置
            const currentIndex = this.standardFarmingItems.findIndex(i => i.isCurrent);
            const itemIndex = this.standardFarmingItems.indexOf(item);

            // 中间位置及以下的农事使用 farming-warm
            if (itemIndex >= currentIndex) {
                return this.images.farmingWarm;
            }

            // 中间位置以上的农事使用默认图标
            return this.images.farmingIcon1;
        },

        // 获取工厂状态标签的CSS类名
        getStatusClass(tag) {
            const classMap = {
                '机械加工': 'status-general',
                '阳光晾晒': 'status-unpoverty',
                '机械+阳光晾晒': 'status-poverty'
            };
            return classMap[tag] || 'status-general';
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

.health-detail-overlay {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    background: #00000080;
}

.health-detail-panel {
    position: relative;
}

/* 左侧地块详情面板 */
.plot-details-panel {
    position: relative;
    display: flex;
    overflow-x: hidden;
    overflow-y: auto;
    flex-direction: column;
    box-sizing: border-box;
    width: 375px;
    min-height: 100%;
    margin: 0 0 0 5px;
    padding: 0 23px 35px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;

    gap: 10px;
}

/* 装饰元素 */
.panel-decoration-top {
    width: 100%;
    height: auto;
    margin-bottom: 35px;
    object-fit: fill;
}

.section-divider {
    width: 160px;
    height: 3px;
    margin: 6px 0 0;
    // object-fit: contain;
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
    font-size: 17px;
    font-weight: 500;

    color: #c69c6d;
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
}

/* 仓库页面的统计区域特殊样式 */
.warehouse-panel .plot-statistics {
    justify-content: center;
    gap: 40px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 99px;
    height: 107px;
    padding-top: 26px;
    text-align: center;

    background-size: cover;
}

.stat-label {
    margin-bottom: 10px;
    font-family: SourceHanSansCN-Medium;
    font-size: 11px;
    font-weight: 500;

    color: #c69c6d;
}

.stat-value-large {
    font-family: BebasNeueRegular;
    font-size: 44px;
    line-height: 1;
    color: #c69c6d;
}

.farmer-profile {
    display: flex;
    align-items: flex-start;
    width: 330px;
    height: 173px;
    margin: 21px 0 17px;
    padding: 8px 0 11px 13px;

    background-size: 100% 100%;
}

.farmer-avatar {
    width: 145px;
    height: 153px;
    object-fit: cover;
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
    object-fit: fill;
}

.farmer-name,
.farmer-age {
    font-family: SourceHanSansCN-Medium;
    font-size: 17px;
    font-weight: 500;
    line-height: 16px;

    color: #c69c6d;
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
    color: #c69c6d;
}

.rating-empty {
    font-size: 12px;
    color: #c69c6d;
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
    font-size: 10px;
    font-weight: 500;
    text-align: center;

    border-radius: 4px;
}

.status-general {
    color: #c69c6d;
    background: #8d7552;
}

.status-unpoverty {
    color: #c69c6d;
    background: #424821;
}

.status-poverty {
    color: #c69c6d;
    background: #424821;
}

/* 价格信息 */
.price-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 315px;
    margin-top: 22px;
    padding: 15px 16px;

    background-size: 100% 100%;
}

.price-decoration-top,
.price-decoration-bottom {
    width: 100%;
    height: 9px;
}

.price-display {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    text-align: center;

    gap: 8px;
}

.price-label {
    font-family: SourceHanSansCN-Medium;
    font-size: 18px;
    font-weight: 500;
    color: #c69c6d;
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
    color: #c69c6d;
}

.price-unit {
    font-family: SourceHanSansCN-Medium;
    font-size: 18px;
    color: #c69c6d;
}

.third-divider {
    display: block;
    width: 103px;
    height: 3px;
    margin-top: 5px;

    object-fit: contain;
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
    color: #c69c6d;
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
    font-size: 11px;
    font-weight: 500;
    color: #c69c6d;
}

.link-arrow {
    font-family: FZCKJW--GB1-0;
    font-size: 11px;
    color: #c69c6d;
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
    background: conic-gradient(from -90deg, #c69c6d 0deg, #c69c6d 72deg, transparent 72deg);
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
    background: conic-gradient(from -90deg, #c69c6d 0deg, #c69c6d 72deg, transparent 72deg);
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
    top: 55%;
    left: 50%;
    font-family: BebasNeueRegular;
    font-size: 36px;
    text-align: center;

    color: #c69c6d;
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
        border: 2px solid #c69c6d;

        border-radius: 50%;
    }

    .health-score {
        z-index: 1;
        font-family: BebasNeueRegular;
        font-size: 36px;
        color: #c69c6d;
    }
}

.indicator-label {
    margin-top: 5px;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    font-weight: 500;
    text-align: center;

    color: #c69c6d;
}

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

.farming-dynamics__header-decoration {
    width: 341px;
    height: 12px;
    margin-top: -1px;
    margin-left: -27px;
}

.farming-dynamics__title {
    margin: 20px 0 0;
    font-family: SourceHanSansCN-Medium;
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

.farming-dynamics__section-decoration {
    width: 141px;
    height: 5px;
    object-fit: none;
}

.farming-dynamics__section-title {
    margin: 12px 0 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 17px;
    font-weight: 500;
    line-height: 15px;

    color: #c7b299;
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
    margin: 8px 0 8px 10px;
    padding: 4px 8px;

    border-radius: 4px;
    transition: all .3s ease;
    cursor: pointer;

    gap: 12px;
}

.farming-dynamics__item:hover {
    background: #4cfdeb1a;
    transform: translateX(2px);
}

.farming-dynamics__item--active {
    border-left: 3px solid #c69c6d;
    background: #4cfdeb33;
    transform: translateX(2px);
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
    font-family: SourceHanSansCN-Normal;
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

.farming-dynamics__warning-icon {
    width: 177px;
    height: 5px;
    margin-left: -9px;
    object-fit: none;
}

.farming-dynamics__warning-title {
    margin: 12px 0 8px;
    font-family: SourceHanSansCN-Medium;
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

.farming-dynamics__warning-basic-info {
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

.farming-dynamics__warning-prescription {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    margin-bottom: 6px;
    font-weight: 600;
}

.farming-dynamics__warning-label {
    margin-right: 4px;
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__warning-name-value {
    flex: 1;
    max-width: 120px;
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;
    word-break: break-all;

    color: #c7b299;
}

.farming-dynamics__warning-time-value {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__warning-prescription-text {
    flex: 1;
    max-width: 140px;
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;
    word-break: break-all;

    color: #c7b299;
}

.farming-dynamics__warning-level-label {
    margin-right: 4px;
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__warning-level-value {
    font-family: SourceHanSansCN-Medium;
    font-size: 10px;
    font-weight: 500;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__warning-cycle-info {
    margin-top: 8px;
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__warning-description {
    margin-bottom: 15px;
    font-family: SourceHanSansCN-Light;
    font-size: 12px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__warning-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    font-weight: 600;
}

.farming-dynamics__trigger-time {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__warning-level {
    display: flex;
    align-items: center;
    font-weight: 600;
    gap: 4px;
}

.farming-dynamics__level-label {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__level-value--high {
    font-family: SourceHanSansCN-Medium;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__level-value--completed {
    padding: 2px 6px;
    font-family: SourceHanSansCN-Medium;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
    border-radius: 2px;
    background: #00ff7f;
}

.farming-dynamics__level-value--pending {
    padding: 2px 6px;
    font-family: SourceHanSansCN-Medium;
    font-size: 10px;
    font-weight: 500;
    line-height: 14px;

    color: #c7b299;
    border-radius: 2px;
    background: #faaf3b;
}

.farming-dynamics__level-value--expected {
    padding: 2px 6px;
    font-family: SourceHanSansCN-Medium;
    font-size: 10px;
    font-weight: 500;
    line-height: 14px;

    color: #c7b299;
    border-radius: 2px;
    background: #c69c6d;
}

/* 查看详情链接样式 */
.farming-dynamics__view-details {
    margin-top: 10px;
    text-align: right;
}

.farming-dynamics__view-link {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    color: #c7b299;
    cursor: pointer;
}

.farming-dynamics__view-link:hover {
    color: #c7b299;
}

/* 预期农事项目样式 */
.farming-dynamics__expected-section {
    padding: 15px;
}

.farming-dynamics__expected-title {
    margin: 0 0 8px;
    font-family: SourceHanSansCN-Medium;
    font-size: 12px;
    font-weight: 500;

    color: #c7b299;
}

.farming-dynamics__expected-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.farming-dynamics__expected-time {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    color: #c7b299;
}

.farming-dynamics__warning-details {
    display: flex;
    flex-direction: column;
    gap: 13px;
}

.farming-dynamics__treatment {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    line-height: 14px;
    color: #c7b299;
}

.farming-dynamics__cycle {
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
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
    font-family: SourceHanSansCN-Medium;
    font-size: 12px;
    font-weight: 500;
    line-height: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;

    color: #093036;
}

.farming-dynamics__current-label {
    padding: 2px 6px;
    font-family: SourceHanSansCN-Medium;
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
    font-family: SourceHanSansCN-Medium;
    font-size: 10px;
    font-weight: 600;
    line-height: 10px;

    color: #c7b299;
}

.farming-dynamics__time-item:last-child {
    font-family: SourceHanSansCN-Light;
    line-height: 14px;
}

.farming-dynamics__time-label {
    color: #c7b299;
}

.farming-dynamics__time-value {
    font-family: SourceHanSansCN-Light;
    font-weight: 600;
    color: #c7b299;
}

.farming-dynamics__prescription {
    margin: 0 0 0 17px;
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
}

.farming-dynamics__standards {
    width: 149px;
    margin: 0 0 0 17px;
    font-family: SourceHanSansCN-Light;
    font-size: 10px;
    font-weight: 600;
    line-height: 14px;

    color: #c7b299;
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
    font-size: 10px;
    line-height: 13px;
    color: #c7b299;
}

.farming-dynamics__details-arrow {
    font-family: FZCKJW--GB1-0;
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
    font-family: SourceHanSansCN-Medium;
    font-size: 12px;
    font-weight: 500;
    line-height: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;

    color: #093036;
}

.farming-dynamics__next-label {
    padding: 2px 6px;
    font-family: SourceHanSansCN-Medium;
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
    font-family: SourceHanSansCN-Light;
    font-size: 12px;
    font-weight: 600;
    line-height: 12px;

    color: #c7b299;
}

.farming-dynamics__service-provider {
    font-family: SourceHanSansCN-Medium;
    font-size: 12px;
    font-weight: 500;
    line-height: 12px;

    color: #c7b299;
}

/* ===== 地块详情页面样式 ===== */

/* ===== 烘干厂界面样式 ===== */

/* 左侧工厂概览面板 */
.factory-overview-panel {
    position: relative;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    box-sizing: border-box;
    width: 375px;
    height: 734px;
    margin: 0 0 0 5px;
    padding: 0 23px 35px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
}

.factory-title-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.factory-name {
    flex: 1;
    margin: 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 17px;
    font-weight: 500;

    color: #c69c6d;
}

.factory-info-module {
    margin-bottom: 15px;
}

.module-title {
    margin: 0 0 10px;
    font-family: SourceHanSansCN-Medium;
    font-size: 18px;
    font-weight: 500;

    color: #c69c6d;
}

.module-content {
    padding: 8px 12px;
    border-radius: 4px;
    background: #c69c6d0d;
}

.info-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
    font-size: 16px;
}

.info-label {
    font-family: SourceHanSansCN-Medium;
    color: #c69c6d;
}

.info-value {
    font-family: SourceHanSansCN-Medium;
    font-weight: 500;
    color: #39b44a;
}

.owner-info {
    padding: 8px 12px;
    border-radius: 4px;
    background: #c69c6d0d;
}

.owner-name {
    margin-bottom: 8px;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;
    font-weight: 500;

    color: #c69c6d;
}

.owner-details {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
}

.owner-label {
    color: #c69c6d;
}

.owner-value {
    font-weight: 500;
    color: #39b44a;
}

/* 右侧生产流程面板 */
.factory-production-panel {
    position: relative;
    display: flex;
    overflow-y: auto;
    flex-direction: column;
    width: 375px;
    height: 734px;
    padding: 0;

    background: #041f1d;
}

.panel-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 20px 0 0 30px;
}

.panel-title {
    margin: 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 18px;
    font-weight: 500;

    color: #c7b299;
}

.title-divider {
    width: 67px;
    height: 3px;
    margin: 5px 0 0;
}

.batch-module {
    margin: 15px 30px 0;
    padding: 12px;
    border-radius: 4px;
    background: #4ffdeb14;
}

.batch-module-title {
    margin: 0 0 10px;
    font-family: SourceHanSansCN-Medium;
    font-size: 18px;
    font-weight: 500;

    color: #c7b299;
}

.batch-content,
.progress-content,
.trend-content,
.alert-content {
    font-size: 15px;
    color: #c7b299;
}

.batch-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
}

.batch-label {
    font-family: SourceHanSansCN-Medium;
}

.batch-value {
    font-family: SourceHanSansCN-Light;
    color: #4cfcea;
}

.progress-stage {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.stage-label {
    font-family: SourceHanSansCN-Medium;
}

.stage-value {
    color: #4cfcea;
}

.progress-bar-container {
    overflow: hidden;
    width: 100%;
    height: 6px;
    margin-bottom: 4px;

    border-radius: 3px;
    background: #4cfdea33;
}

.progress-bar {
    height: 100%;
    border-radius: 3px;
    background: linear-gradient(to right, #4cfcea, #39b44a);
    transition: width .3s ease;
}

.progress-percentage {
    text-align: right;
    color: #4cfcea;
}

.trend-description {
    margin: 0 0 10px;
    font-size: 15px;
    color: #c7b299;
}

.trend-chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 60px;

    gap: 4px;
}

.trend-bar-group {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
}

.trend-bar {
    width: 100%;
    margin-bottom: 4px;
    border-radius: 2px 2px 0 0;
    background: linear-gradient(to top, #4cfcea, #39b44a);
}

.trend-label {
    font-size: 13px;
    color: #c7b299;
}

.alert-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
}

.alert-label {
    font-family: SourceHanSansCN-Medium;
}

.alert-value {
    font-family: SourceHanSansCN-Light;
    color: #4cfcea;
}

.module-divider {
    width: 100%;
    height: 1px;
    margin: 10px 0;
    object-fit: none;
}

/* ===== 仓库界面样式 ===== */

/* 左侧仓库概览面板 */
.warehouse-overview-panel {
    position: relative;
    display: flex;
    overflow-y: auto;
    flex-direction: column;
    box-sizing: border-box;
    width: 375px;
    height: 734px;
    margin: 0 0 0 5px;
    padding: 0 23px 35px;

    background-repeat: no-repeat;
    background-position: center;
    background-size: 100% 100%;
}

.warehouse-title-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.warehouse-name {
    flex: 1;
    margin: 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 18px;
    font-weight: 500;

    color: #c69c6d;
}

.warehouse-info-module {
    margin-bottom: 15px;
}

/* 右侧仓库库存与物流面板 */
.warehouse-inventory-panel {
    position: relative;
    display: flex;
    overflow-y: auto;
    flex-direction: column;
    width: 375px;
    height: 734px;
    padding: 0;

    background: #041f1d;
}

/* ===== 施工计划日历样式 ===== */
.construction-calendar {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 10px 0;
    padding: 15px 10px;

    border-radius: 8px;
    background: #0000004d;
}

.calendar-header {
    width: 100%;
    margin-bottom: 15px;
    text-align: center;
}

.calendar-month {
    font-family: SourceHanSansCN-Medium;
    font-size: 16px;
    font-weight: 500;
    color: #c69c6d;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    width: 100%;
    gap: 5px;
}

.calendar-day {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #666;

    border-radius: 4px;
    background: #00000080;
    transition: all .3s ease;
    cursor: pointer;

    aspect-ratio: 1;
}

.calendar-day:hover {
    border-color: #c69c6d;
    background: #c69c6d1a;
}

.calendar-day.has-schedule {
    border-color: #c69c6d;
    background: #c69c6d;
}

.calendar-day.has-schedule .day-number {
    font-weight: bold;
    color: #000;
}

.day-number {
    font-family: SourceHanSansCN-Medium;
    font-size: 12px;
    font-weight: 500;
    color: #c69c6d;
}

/* ===== 仓库面板特定样式 ===== */
.warehouse-owner .farmer-status {
    display: none;
}

.warehouse-owner .farmer-age {
    font-family: SourceHanSansCN-Medium;
    font-size: 12px;
    text-align: center;
    color: #c69c6d;
}

/* 无硫与有硫八角占比饼图样式 */
.sulfur-ratio-section {
    margin-top: 20px;
    padding-bottom: 10px;
}

.sulfur-ratio-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.sulfur-ratio-title {
    font-family: SourceHanSansCN-Medium;
    font-size: 16px;
    color: #c69c6d;
}

.sulfur-ratio-chart-container {
    box-sizing: border-box;
    width: 100%;
    height: 240px;
    padding: 10px;

    border-radius: 4px;
    background: #4cfcea0d;
}

/* ===== 工厂面板特定样式 ===== */
.factory-panel {
    background-color: #0d2a28;
    background-image: linear-gradient(135deg, #0d2a28f2 0%, #041f1df2 100%);
}

/* ===== 仓库面板特定样式 ===== */
.warehouse-panel {
    background-color: #0d2a28;
    background-image: linear-gradient(135deg, #0d2a28f2 0%, #041f1df2 100%);
}

</style>
