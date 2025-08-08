<template>
  <DashboardLayout
    :weather="weather"
    :user="user"
    :project-data="projectData"
    :statistics-data="statisticsData"
    :ranking-data="rankingData"
    :quality-data="qualityData"
    :region-name="regionName"
    :show-back-button="true"
    :page-title="regionName + '详情'"
    @back="goBack"
  >
    <template #center-map>
      <RegionDetailMap :region-name="regionName" />
    </template>
  </DashboardLayout>
</template>

<script>
import DashboardLayout from '@/components/DashboardLayout.vue'
import RegionDetailMap from '@/components/RegionDetailMap.vue'

export default {
  name: 'DetailMap',
  components: {
    DashboardLayout,
    RegionDetailMap
  },
  data() {
    return {
      regionName: '',
      // 复用Dashboard的所有数据
      weather: {
        temperature: '26.8°C',
        description: '晴多云转阵雨'
      },
      user: {
        name: '管理员',
        avatar: 'https://lanhu-oss-proxy.lanhuapp.com/d49070cc001560a5a4eb371bc487d8ba'
      },
      projectData: {
        blockCount: 5,
        blockDetails: '右江区泮水乡那眉村集体八角基地\n右江区大楞乡那花科华昌八角基地\n千户十亩-右江区大楞乡巴平村八角基地\n千户十亩-右江区汪甸乡伟阳村八角基地\n千户十亩-田林县那色村巴塘八角基地',
        totalArea: 810,
        areaDetails: '右江区泮水乡那眉村：400亩\n右江区大楞乡那花科华昌：300亩\n千户十亩-右江区大楞乡巴平村：30亩\n千户十亩-右江区汪甸乡伟阳村：50亩\n千户十亩-田林县那色村巴塘：30亩',
        price: '3.08元'
      },
      statisticsData: {
        totalArea: 139
      },
      rankingData: [
        {
          manager: '隆起雷',
          location: '千户十亩-大楞乡巴平村',
          area: 30,
          district: '右江区',
          yield: 1970
        },
        {
          manager: '李子顺',
          location: '千户十亩-大楞乡巴平村',
          area: 30,
          district: '右江区',
          yield: 1970
        },
        {
          manager: '李子顺',
          location: '千户十亩-大楞乡巴平村',
          area: 30,
          district: '右江区',
          yield: 1970
        }
      ],
      qualityData: {
        good: '20%',
        average: '30%',
        poor: '50%'
      }
    }
  },
  computed: {
    currentTime() {
      const now = new Date()
      return now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    },
    currentDate() {
      const now = new Date()
      return now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '年').replace(/年(\d+)年/, '年$1月') + '日'
    },
    weekday() {
      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      return days[new Date().getDay()]
    }
  },
  mounted() {
    console.log('DetailMap mounted')
    this.regionName = this.$route.params.region || '右江区'
    console.log('Region name:', this.regionName)
    
    // 启动定时器更新时间
    this.timeInterval = setInterval(() => {
      this.$forceUpdate()
    }, 1000)
  },
  beforeDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval)
    }
  },
  methods: {
    goBack() {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/dashboard.less';
</style>