<template>
  <div class="group_11">
    <!-- 管护项目标题 -->
    <img
      class="image_9"
      referrerpolicy="no-referrer"
      src="https://lanhu-oss-proxy.lanhuapp.com/7451f139b44e5e704e72f39013cf9f51"
    />
    <span class="text_32">管护项目</span>
    <img
      class="image_10"
      referrerpolicy="no-referrer"
      src="https://lanhu-oss-proxy.lanhuapp.com/0d65687288071b64604f9b0551635661"
    />
    
    <!-- 数据卡片区域 -->
    <div class="group_12 flex-row justify-between">
      <div class="box_5 flex-col justify-between">
        <!-- 地块数和总面积卡片 -->
        <div class="section_2 flex-row justify-between">
          <!-- 地块数卡片 -->
          <div class="box_6 flex-col">
            <img
              class="image_11"
              referrerpolicy="no-referrer"
              src="https://lanhu-oss-proxy.lanhuapp.com/774e8693b45f1f644b5049c4c478ac3f"
            />
            <div class="image-text_1 flex-row">
              <div class="text-group_1 flex-col justify-between">
                <span class="text_33 number-display number-large">{{ projectData.blockCount }}</span>
                <span class="paragraph_1">{{ projectData.blockDetails }}</span>
              </div>
              <div class="section_3 flex-col">
                <span class="text_35">-地块数-</span>
                <img
                  class="image_12"
                  referrerpolicy="no-referrer"
                  src="https://lanhu-oss-proxy.lanhuapp.com/fcfea6707ca0eac808631408233d0648"
                />
              </div>
            </div>
            <img
              class="image_13"
              referrerpolicy="no-referrer"
              src="https://lanhu-oss-proxy.lanhuapp.com/cb2413f6589b9d5c25083ef37581aac3"
            />
          </div>
          
          <!-- 总面积卡片 -->
          <div class="box_7 flex-col">
            <img
              class="image_14"
              referrerpolicy="no-referrer"
              src="https://lanhu-oss-proxy.lanhuapp.com/ddd833a0e62876afe934d9d1365ad754"
            />
            <div class="image-text_2 flex-row">
              <div class="text-group_2 flex-col justify-between">
                <span class="text_36 number-display number-large">{{ projectData.totalArea }}</span>
                <span class="paragraph_2">{{ projectData.areaDetails }}</span>
              </div>
              <div class="group_13 flex-col">
                <span class="text_37">-总面积（亩）-</span>
                <img
                  class="image_15"
                  referrerpolicy="no-referrer"
                  src="https://lanhu-oss-proxy.lanhuapp.com/274de69ffdba221c26e3b1f3ee11f74e"
                />
              </div>
            </div>
            <img
              class="image_16"
              referrerpolicy="no-referrer"
              src="https://lanhu-oss-proxy.lanhuapp.com/379769da570d2ad196390f88f3dd3e90"
            />
          </div>
        </div>

        <!-- 价格信息区域 -->
        <div class="section_4 flex-col">
          <div class="section_5 flex-row">
            <div class="image-text_3 flex-col justify-between">
              <img
                class="image_17"
                referrerpolicy="no-referrer"
                src="https://lanhu-oss-proxy.lanhuapp.com/97cb855c78453181076c93762eb1970b"
              />
              <span class="text-group_3">{{ projectData.price }}</span>
            </div>
          </div>
          <img
            class="image_18"
            referrerpolicy="no-referrer"
            src="https://lanhu-oss-proxy.lanhuapp.com/e97bc04b6c1e3ce10ed54b9582e75754"
          />
        </div>

        <!-- 月份图表 -->
        <img
          class="image_19"
          referrerpolicy="no-referrer"
          src="https://lanhu-oss-proxy.lanhuapp.com/87cf43b9b45f58b54924d2081fc9f221"
        />
      </div>

      <!-- 右侧图表 -->
      <img
        class="image_20"
        referrerpolicy="no-referrer"
        src="https://lanhu-oss-proxy.lanhuapp.com/1939925a1e232b4d96312887a3dbcabf"
      />
    </div>

    <!-- 月份标签 -->
    <span class="text_38">1月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;6月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;7月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;8月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;9月&nbsp;&nbsp;&nbsp;&nbsp;10月&nbsp;&nbsp;&nbsp;11月&nbsp;&nbsp;&nbsp;12月</span>

    <!-- 统计图表 -->
    <img
      class="image_21"
      referrerpolicy="no-referrer"
      src="https://lanhu-oss-proxy.lanhuapp.com/eac0cd175513518b4e45e67acf49a415"
    />

    <!-- 表格标题 -->
    <div class="text-wrapper_18 flex-row">
      <span class="text_39">区县</span>
      <span class="text_40">面积（万亩）</span>
      <span class="text_41">占比</span>
      <span class="text_42">总面积：</span>
      <span class="text_43 number-display">{{ statisticsData.totalArea }}</span>
      <span class="text_44">万亩</span>
    </div>

    <!-- 分隔线 -->
    <img
      class="image_22"
      referrerpolicy="no-referrer"
      src="https://lanhu-oss-proxy.lanhuapp.com/5dc3ed5d837b98ef3ffd23073a0afadd"
    />

    <!-- 统计数据表格 -->
    <div class="group_14 flex-row">
      <span class="paragraph_3">德保县<br />那坡县<br />右江区<br />田林县<br />凌云县<br />乐业县</span>
      <span class="paragraph_4">38<br />30<br />23.6<br />21<br />17<br />10</span>
      <span class="paragraph_5">27.34%<br />21.58%<br />16.98%<br />15.11%<br />12.23%<br />7.19%</span>
      <img
        class="image_23"
        referrerpolicy="no-referrer"
        src="https://lanhu-oss-proxy.lanhuapp.com/61a26040865f18eb7284a578a5ddfc4a"
      />
    </div>

    <!-- 底部图表 -->
    <img
      class="image_24"
      referrerpolicy="no-referrer"
      src="https://lanhu-oss-proxy.lanhuapp.com/f0e325638a0ec6f0b636ddf7548a58bc"
    />
  </div>
</template>

<script>
export default {
  name: 'LeftDataPanel',
  props: {
    projectData: {
      type: Object,
      required: true
    },
    statisticsData: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="less" scoped>
@import '@/styles/dashboard.less';
</style>