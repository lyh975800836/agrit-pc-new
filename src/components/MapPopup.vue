<template>
  <div v-if="visible" class="group_10 flex-col" :style="combinedPopupStyle" @click.stop>
    
    <!-- 温度显示区域 section_11 -->
    <div class="section_11 flex-row">
      <img
        class="image_38"
        referrerpolicy="no-referrer"
        src="/images/popup-temperature-icon.png"
      />
      <span class="text_71">{{ regionData.temperature || '26.8°C' }}</span>
      <img
        class="label_1"
        referrerpolicy="no-referrer"
        src="/images/popup-close-btn.png"
        @click="closePopup"
        style="cursor: pointer;"
      />
    </div>
    
    <!-- 主要内容区域 section_12 -->
    <div class="section_12 flex-col" :style="contentBgStyle">
      <span class="text_72">品种&nbsp;｜&nbsp;{{ regionData.variety || '大红八角' }}</span>
      <img
        class="image_39"
        referrerpolicy="no-referrer"
        src="/images/popup-divider-1.png"
      />
      
      <!-- 异常果率和预计产量标题 -->
      <div class="box_14 flex-row justify-between">
        <span class="text_73">异常果率:</span>
        <div class="text-wrapper_28">
          <span class="text_74">预计产量（</span>
          <span class="text_75">斤）</span>
          <span class="text_76">:</span>
        </div>
      </div>
      
      <!-- 异常果率和预计产量数值 -->
      <div class="text-wrapper_29 flex-row justify-between">
        <span class="text_77">{{ regionData.abnormalRate || '11%' }}</span>
        <span class="text_78">{{ regionData.expectedYield || '1474' }}</span>
      </div>
      
      <img
        class="image_40"
        referrerpolicy="no-referrer"
        src="/images/popup-divider-2.png"
      />
      
      <span class="text_79">Top3&nbsp;地块</span>
      
      <!-- Top3地块列表 -->
      <div class="box_15 flex-col" :style="top3BgStyle">
        <div class="group_11 flex-row justify-between" v-if="topPlots[0]">
          <span class="text_80">{{ topPlots[0].name }}</span>
          <div class="text-wrapper_30">
            <span class="text_81">{{ topPlots[0].area }}</span>
            <span class="text_82">亩</span>
          </div>
        </div>
        <div class="group_12 flex-row justify-between" v-if="topPlots[1]">
          <span class="text_83">{{ topPlots[1].name }}</span>
          <div class="text-wrapper_31">
            <span class="text_84">{{ topPlots[1].area }}</span>
            <span class="text_85">亩</span>
          </div>
        </div>
      </div>
      
      <!-- 底部装饰图片 - 详情按钮 -->
      <div class="image-wrapper_4 flex-col" :style="bottomBtnBgStyle">
        <img
          class="image_41"
          referrerpolicy="no-referrer"
          src="/images/popup-detail-btn.png"
          @click="goToDetailMap"
          style="cursor: pointer;"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapPopup',
  data() {
    return {
      mainBgImage: '/images/popup-main-bg.png',
      contentBgImage: '/images/popup-content-bg.png',
      top3BgImage: '/images/popup-top3-bg.png',
      bottomBtnBgImage: '/images/popup-bottom-btn-bg.png'
    }
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    region: {
      type: Object,
      default: null
    },
    position: {
      type: Object,
      default: () => ({ x: 0, y: 0 })
    },
    hasProjects: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    mainBgStyle() {
      return {
        backgroundImage: `url(${this.mainBgImage})`,
        backgroundPosition: '100%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%'
      }
    },
    
    contentBgStyle() {
      return {
        backgroundImage: `url(${this.contentBgImage})`,
        backgroundPosition: '100%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%'
      }
    },
    
    top3BgStyle() {
      return {
        backgroundImage: `url(${this.top3BgImage})`,
        backgroundPosition: '100%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%'
      }
    },
    
    bottomBtnBgStyle() {
      return {
        backgroundImage: `url(${this.bottomBtnBgImage})`,
        backgroundPosition: '100%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%'
      }
    },
    
    regionData() {
      if (!this.region) return {}
      
      const name = this.region.properties?.name || '未知区域'
      const adcode = this.region.properties?.adcode
      
      // 根据区域名称返回对应的项目数据
      const projectData = this.getProjectData(name)
      
      return {
        name,
        adcode,
        hasProjects: this.hasProjects,
        ...projectData
      }
    },
    
    popupStyle() {
      const { x, y } = this.position
      
      // 使用demo的精确尺寸（缩放50%以适应屏幕）
      const popupWidth = 334   // 668 * 0.5
      const popupHeight = 486  // 972 * 0.5
      
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      // 确保弹窗不超出视口边界
      const adjustedX = Math.max(10, Math.min(x, viewportWidth - popupWidth - 10))
      const adjustedY = Math.max(10, Math.min(y, viewportHeight - popupHeight - 10))
      
      return {
        left: `${adjustedX}px`,
        top: `${adjustedY}px`,
        width: `${popupWidth}px`,
        height: `${popupHeight}px`,
        position: 'fixed',
        zIndex: 9999,
        transform: 'scale(1)',  // 不再缩放
        transformOrigin: 'top left'
      }
    },
    
    combinedPopupStyle() {
      return {
        ...this.popupStyle,
        ...this.mainBgStyle
      }
    },
    
    topPlots() {
      // 根据区域返回Top3地块数据
      const regionName = this.regionData.name
      const plotsDatabase = {
        '右江区': [
          { name: '那满八角林场', area: '35.7' },
          { name: '田阳八角示范园', area: '28.4' }
        ],
        '德保县': [
          { name: '德保八角园', area: '42.1' },
          { name: '那甲八角基地', area: '31.8' }
        ],
        '田林县': [
          { name: '田林八角示范区', area: '25.3' },
          { name: '那色八角园', area: '18.7' }
        ]
      }
      
      return plotsDatabase[regionName] || [
        { name: '那满八角林场', area: '35.7' },
        { name: '田阳八角示范园', area: '28.4' }
      ]
    }
  },
  methods: {
    closePopup() {
      this.$emit('close')
    },
    
    goToDetailMap() {
      // 先关闭弹窗
      this.closePopup()
      // 延迟跳转确保弹窗完全关闭
      this.$nextTick(() => {
        // 下钻到二级地图页面
        this.$router.push({
          name: 'DetailMap',
          params: {
            region: this.regionData.name || '右江区'
          }
        })
      })
    },
    
    // 获取项目数据
    getProjectData(regionName) {
      const projectDatabase = {
        '右江区': {
          projectCount: 4,
          totalArea: 810,
          expectedYield: 1474,
          abnormalRate: '11%',
          variety: '大红八角',
          temperature: '26.8°C'
        },
        '田林县': {
          projectCount: 1,
          totalArea: 30,
          expectedYield: 1800,
          abnormalRate: '9%',
          variety: '大红八角',
          temperature: '25.2°C'
        },
        '德保县': {
          projectCount: 2,
          totalArea: 380,
          expectedYield: 1650,
          abnormalRate: '12%',
          variety: '大红八角',
          temperature: '27.1°C'
        }
      }
      
      return projectDatabase[regionName] || {
        projectCount: 0,
        totalArea: 0,
        expectedYield: 0,
        abnormalRate: '0%',
        variety: '大红八角',
        temperature: '26.0°C'
      }
    }
  }
}
</script>

<style lang="less" scoped>
/* 直接使用demo的弹窗样式（缩放50%） */
.group_10 {
  width: 334px;  /* 668 * 0.5 */
  height: 486px; /* 972 * 0.5 */
}


.section_11 {
  width: 269px;  /* 539 * 0.5 */
  height: 74px;  /* 149 * 0.5 */
  margin: 16px 0 0 40px; /* 33,0,0,80 * 0.5 */
  display: flex;
  align-items: center;
}

.image_38 {
  width: 65px;  /* 130 * 0.5 */
  height: 58px; /* 117 * 0.5 */
  margin-top: 16px; /* 32 * 0.5 */
}

.text_71 {
  width: 89px;   /* 179 * 0.5 */
  height: 34px;  /* 69 * 0.5 */
  overflow-wrap: break-word;
  color: rgba(8, 196, 182, 1);
  font-size: 47px; /* 94 * 0.5 */
  font-family: DINCondensed-Bold, Arial, sans-serif;
  font-weight: 700;
  text-align: right;
  white-space: nowrap;
  line-height: 47px;
  margin: 31px 0 0 73px; /* 62,0,0,146 * 0.5 */
}

.label_1 {
  width: 23px;  /* 46 * 0.5 */
  height: 23px; /* 46 * 0.5 */
  margin-left: 19px; /* 38 * 0.5 */
}

.section_12 {
  width: 283px;  /* 566 * 0.5 */
  height: 336px; /* 673 * 0.5 */
  margin: 21px 0 37px 22px; /* 43,0,74,44 * 0.5 */
}

.text_72 {
  width: 145px;  /* 290 * 0.5 */
  height: 20px;  /* 40 * 0.5 */
  overflow-wrap: break-word;
  color: rgba(8, 196, 182, 1);
  font-size: 19px; /* 39 * 0.5 */
  font-family: SourceHanSansCN-Regular, 'Microsoft YaHei', Arial, sans-serif;
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  line-height: 19px;
  margin: 17px 0 0 69px; /* 35,0,0,138 * 0.5 */
}

.image_39 {
  width: 275px;  /* 551 * 0.5 */
  height: 1px;   /* 3 * 0.5 */
  margin: 15px 0 0 3px; /* 31,0,0,7 * 0.5 */
}

.box_14 {
  width: 216px;  /* 433 * 0.5 */
  height: 15px;  /* 31 * 0.5 */
  margin: 19px 0 0 35px; /* 39,0,0,71 * 0.5 */
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.text_73 {
  width: 65px;   /* 131 * 0.5 */
  height: 15px;  /* 30 * 0.5 */
  overflow-wrap: break-word;
  color: rgba(8, 196, 182, 1);
  font-size: 15px; /* 31 * 0.5 */
  font-family: SourceHanSansCN-Light, 'Microsoft YaHei', Arial, sans-serif;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
  margin-top: 0px; /* 1 * 0.5 */
}

.text-wrapper_28 {
  width: 98px;   /* 196 * 0.5 */
  height: 15px;  /* 31 * 0.5 */
  overflow-wrap: break-word;
  font-size: 0;
  font-family: SourceHanSansCN-Light, 'Microsoft YaHei', Arial, sans-serif;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 15px;
}

.text_74 {
  color: rgba(8, 196, 182, 1);
  font-size: 15px; /* 31 * 0.5 */
  font-family: SourceHanSansCN-Light, 'Microsoft YaHei', Arial, sans-serif;
  font-weight: 300;
  line-height: 15px;
}

.text_75 {
  color: rgba(8, 196, 182, 1);
  font-size: 15px; /* 31 * 0.5 */
  font-family: SourceHanSansCN-Normal, 'Microsoft YaHei', Arial, sans-serif;
  font-weight: normal;
  line-height: 15px;
}

.text_76 {
  color: rgba(8, 196, 182, 1);
  font-size: 15px; /* 31 * 0.5 */
  font-family: SourceHanSansCN-Light, 'Microsoft YaHei', Arial, sans-serif;
  font-weight: 300;
  line-height: 15px;
}

.text-wrapper_29 {
  width: 182px;  /* 365 * 0.5 */
  height: 30px;  /* 61 * 0.5 */
  margin: 12px 0 0 46px; /* 24,0,0,92 * 0.5 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text_77 {
  width: 43px;   /* 87 * 0.5 */
  height: 30px;  /* 61 * 0.5 */
  overflow-wrap: break-word;
  color: rgba(8, 196, 182, 1);
  font-size: 41px; /* 83 * 0.5 */
  font-family: DINCondensed-Bold, Arial, sans-serif;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
  line-height: 41px;
}

.text_78 {
  width: 60px;   /* 120 * 0.5 */
  height: 30px;  /* 60 * 0.5 */
  overflow-wrap: break-word;
  color: rgba(8, 196, 182, 1);
  font-size: 41px; /* 83 * 0.5 */
  font-family: DINCondensed-Bold, Arial, sans-serif;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
  line-height: 41px;
}

.image_40 {
  width: 275px;  /* 551 * 0.5 */
  height: 1px;   /* 3 * 0.5 */
  margin: 20px 0 0 3px; /* 41,0,0,7 * 0.5 */
}

.text_79 {
  width: 89px;   /* 179 * 0.5 */
  height: 21px;  /* 43 * 0.5 */
  overflow-wrap: break-word;
  color: rgba(8, 196, 182, 1);
  font-size: 19px; /* 39 * 0.5 */
  font-family: SourceHanSansCN-Regular, 'Microsoft YaHei', Arial, sans-serif;
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  line-height: 19px;
  margin: 9px 0 0 95px; /* 19,0,0,191 * 0.5 */
}

.box_15 {
  height: 73px;  /* 147 * 0.5 */
  width: 237px; /* 474 * 0.5 */
  margin: 10px 0 0 23px; /* 21,0,0,46 * 0.5 */
}

.group_11 {
  width: 209px;  /* 418 * 0.5 */
  height: 17px;  /* 35 * 0.5 */
  margin: 7px 0 0 13px; /* 14,0,0,26 * 0.5 */
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.text_80 {
  width: 100px;  /* 200 * 0.5 */
  height: 16px;  /* 32 * 0.5 */
  overflow-wrap: break-word;
  color: rgba(76, 253, 235, 1);
  font-size: 16px; /* 33 * 0.5 */
  font-family: SourceHanSansCN-Light, 'Microsoft YaHei', Arial, sans-serif;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 16px;
}

.text-wrapper_30 {
  width: 41px;   /* 83 * 0.5 */
  height: 16px;  /* 32 * 0.5 */
  overflow-wrap: break-word;
  font-size: 0;
  font-family: DINCondensed-Bold, Arial, sans-serif;
  font-weight: 700;
  text-align: right;
  white-space: nowrap;
  line-height: 19px; /* 39 * 0.5 */
  margin-top: 1px; /* 3 * 0.5 */
}

.text_81 {
  color: rgba(76, 253, 235, 1);
  font-size: 19px; /* 39 * 0.5 */
  font-family: DINCondensed-Bold, Arial, sans-serif;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
  line-height: 19px;
}

.text_82 {
  color: rgba(76, 253, 235, 1);
  font-size: 16px; /* 33 * 0.5 */
  font-family: SourceHanSansCN-Light, 'Microsoft YaHei', Arial, sans-serif;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 16px;
}

.group_12 {
  width: 208px;  /* 416 * 0.5 */
  height: 17px;  /* 35 * 0.5 */
  margin: 26px 0 5px 14px; /* 52,0,11,28 * 0.5 */
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.text_83 {
  width: 115px;  /* 231 * 0.5 */
  height: 16px;  /* 32 * 0.5 */
  overflow-wrap: break-word;
  color: rgba(76, 253, 235, 1);
  font-size: 16px; /* 33 * 0.5 */
  font-family: SourceHanSansCN-Light, 'Microsoft YaHei', Arial, sans-serif;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 16px;
}

.text-wrapper_31 {
  width: 41px;   /* 83 * 0.5 */
  height: 16px;  /* 32 * 0.5 */
  overflow-wrap: break-word;
  font-size: 0;
  font-family: DINCondensed-Bold, Arial, sans-serif;
  font-weight: 700;
  text-align: right;
  white-space: nowrap;
  line-height: 19px; /* 39 * 0.5 */
  margin-top: 1px; /* 3 * 0.5 */
}

.text_84 {
  color: rgba(76, 253, 235, 1);
  font-size: 19px; /* 39 * 0.5 */
  font-family: DINCondensed-Bold, Arial, sans-serif;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
  line-height: 19px;
}

.text_85 {
  color: rgba(76, 253, 235, 1);
  font-size: 16px; /* 33 * 0.5 */
  font-family: SourceHanSansCN-Light, 'Microsoft YaHei', Arial, sans-serif;
  font-weight: 300;
  text-align: left;
  white-space: nowrap;
  line-height: 16px;
}

.image-wrapper_4 {
  height: 39px;  /* 78 * 0.5 */
  width: 161px; /* 323 * 0.5 */
  margin: 22px 0 6px 61px; /* 44,0,13,122 * 0.5 */
  position: relative;
}

.image_41 {
  width: 37px;   /* 75 * 0.5 */
  height: 16px;  /* 32 * 0.5 */
  margin: 10px 0 0 60px; /* 20,0,0,120 * 0.5 */
}

/* 公共布局类 */
.flex-col {
  display: flex;
  flex-direction: column;
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}
</style>