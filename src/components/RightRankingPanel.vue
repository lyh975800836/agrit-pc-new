<template>
  <div class="group_15">
    <!-- 排名标题 -->
    <div class="box_8 flex-row">
      <div class="section_6 flex-col">
        <span class="text_45">{{ titlePrefix }}产量排名</span>
        <img
          class="image_25"
          referrerpolicy="no-referrer"
          src="https://lanhu-oss-proxy.lanhuapp.com/75260bd23d40da1e119910ffa77ebdb9"
        />
      </div>
      <div class="section_7 flex-col">
        <span class="text_46">专业队排名</span>
        <img
          class="image_26"
          referrerpolicy="no-referrer"
          src="https://lanhu-oss-proxy.lanhuapp.com/ce1dbcf18c01cf3c974f871c464a1017"
        />
      </div>
    </div>

    <!-- Top5标题 -->
    <div class="text-wrapper_19">
      <span class="text_47">Top5&nbsp;{{ itemType }}&nbsp;</span>
      <span class="text_48">｜&nbsp;&nbsp;{{ subTitle }}</span>
    </div>

    <!-- 分隔线 -->
    <img
      class="image_27"
      referrerpolicy="no-referrer"
      src="https://lanhu-oss-proxy.lanhuapp.com/777b95a97dc470f520a204fca6730182"
    />

    <!-- 排名列表 -->
    <div class="box_9 flex-row justify-between">
      <img
        class="image_28"
        referrerpolicy="no-referrer"
        src="https://lanhu-oss-proxy.lanhuapp.com/880fc3f34c247efe0a4a2042db0ed358"
      />
      <div class="group_16 flex-col">
        <!-- 排名项目1 -->
        <div class="box_10 flex-row">
          <img
            class="image_29"
            referrerpolicy="no-referrer"
            src="https://lanhu-oss-proxy.lanhuapp.com/52bf36ad5e30ea17b9112caef8c27c87"
          />
          <div class="section_8 flex-col justify-between">
            <div class="block_1 flex-col">
              <span class="text_49">负责人：{{ rankingData[0].manager }}</span>
              <img
                class="image_30"
                referrerpolicy="no-referrer"
                src="https://lanhu-oss-proxy.lanhuapp.com/3f609849f513c28624a3219135e612db"
              />
            </div>
            <div class="block_2 flex-row justify-between">
              <div class="text-group_4 flex-col justify-between">
                <div class="text-wrapper_20">
                  <span class="paragraph_6">{{ rankingData[0].location }}<br /></span>
                  <span class="text_50">{{ rankingData[0].area }}</span>
                  <span class="text_51">亩</span>
                </div>
                <span class="text_52">{{ rankingData[0].district }}</span>
              </div>
              <div class="text-wrapper_21 flex-col justify-between">
                <span class="text_53 number-display number-medium">{{ rankingData[0].yield }}</span>
                <span class="text_54">斤/亩</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 排名项目2 -->
        <div class="box_11 flex-row">
          <img
            class="image_31"
            referrerpolicy="no-referrer"
            src="https://lanhu-oss-proxy.lanhuapp.com/b7e8db7f31322989f319ca7f44a1234c"
          />
          <div class="group_17 flex-col justify-between">
            <div class="group_18 flex-col">
              <span class="text_55">负责人：{{ rankingData[1].manager }}</span>
              <img
                class="image_32"
                referrerpolicy="no-referrer"
                src="https://lanhu-oss-proxy.lanhuapp.com/16eb9b68b7bc235cbd6ea3203fbf60b3"
              />
            </div>
            <div class="group_19 flex-row justify-between">
              <div class="text-group_5 flex-col justify-between">
                <div class="text-wrapper_22">
                  <span class="paragraph_7">{{ rankingData[1].location }}<br /></span>
                  <span class="text_56">{{ rankingData[1].area }}</span>
                  <span class="text_57">亩</span>
                </div>
                <span class="text_58">{{ rankingData[1].district }}</span>
              </div>
              <div class="text-wrapper_23 flex-col justify-between">
                <span class="text_59 number-display number-medium">{{ rankingData[1].yield }}</span>
                <span class="text_60">斤/亩</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 排名项目3 -->
        <div class="box_12 flex-row">
          <img
            class="image_33"
            referrerpolicy="no-referrer"
            src="https://lanhu-oss-proxy.lanhuapp.com/a45c100031ad5c87dd145f1905d318a3"
          />
          <div class="box_13 flex-col justify-between">
            <div class="box_14 flex-col">
              <span class="text_61">负责人：{{ rankingData[2].manager }}</span>
              <img
                class="image_34"
                referrerpolicy="no-referrer"
                src="https://lanhu-oss-proxy.lanhuapp.com/d9d1515572da9e73e26aef4d07343ea5"
              />
            </div>
            <div class="box_15 flex-row justify-between">
              <div class="text-group_6 flex-col justify-between">
                <div class="text-wrapper_24">
                  <span class="paragraph_8">{{ rankingData[2].location }}<br /></span>
                  <span class="text_62">{{ rankingData[2].area }}</span>
                  <span class="text_63">亩</span>
                </div>
                <span class="text_64">{{ rankingData[2].district }}</span>
              </div>
              <div class="text-wrapper_25 flex-col justify-between">
                <span class="text_65 number-display number-medium">{{ rankingData[2].yield }}</span>
                <span class="text_66">斤/亩</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 林地质量类别 -->
    <div class="box_16 flex-row justify-between">
      <span class="text_67">林地质量类别</span>
      <img
        class="image_35"
        referrerpolicy="no-referrer"
        src="https://lanhu-oss-proxy.lanhuapp.com/d186bc884f6d13dcee5c02d00597d9bf"
      />
    </div>

    <!-- 质量分隔线 -->
    <img
      class="image_36"
      referrerpolicy="no-referrer"
      src="https://lanhu-oss-proxy.lanhuapp.com/60709f28201d6e80f2451d9319961265"
    />

    <!-- 质量百分比 -->
    <div class="box_17 flex-row">
      <div class="text-wrapper_26 flex-col">
        <span class="text_68 number-display">{{ qualityData.good }}</span>
      </div>
      <div class="text-wrapper_27 flex-col">
        <span class="text_69 number-display">{{ qualityData.average }}</span>
      </div>
      <div class="text-wrapper_28 flex-col">
        <span class="text_70 number-display">{{ qualityData.poor }}</span>
      </div>
    </div>

    <!-- 质量标签 -->
    <div class="text-wrapper_29 flex-row justify-between">
      <span class="text_71">良好</span>
      <span class="text_72">一般</span>
      <span class="text_73">较差</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RightRankingPanel',
  props: {
    regionName: {
      type: String,
      default: '百色市'
    },
    rankingData: {
      type: Array,
      required: true
    },
    qualityData: {
      type: Object,
      required: true
    }
  },
  computed: {
    titlePrefix() {
      return this.regionName === '百色市' ? '八角基地' : this.regionName
    },
    itemType() {
      return this.regionName === '百色市' ? '八角地' : '地块'
    },
    subTitle() {
      return this.regionName === '百色市' ? '优质产区排行榜' : `${this.regionName}优质地块排行榜`
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/dashboard.less';
</style>