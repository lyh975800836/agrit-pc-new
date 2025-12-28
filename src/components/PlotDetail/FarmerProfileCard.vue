<template>
  <div class="farmer-profile" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <img class="farmer-avatar" :src="avatarUrl" />
    <div class="farmer-details">
      <div class="farmer-name">{{ labelPrefix }}{{ farmerName }}</div>
      <img class="detail-divider" src="/images/divider.png" />
      <div class="farmer-age">{{ ageLabel }}{{ farmerAge }}{{ ageSuffix }}</div>
      <div class="farmer-rating">
        <span
          v-for="i in 5"
          :key="i"
          :class="i <= rating ? 'rating-filled' : 'rating-empty'"
        >★</span>
      </div>
      <div v-if="statusTags && statusTags.length > 0" class="farmer-status">
        <div
          v-for="tag in statusTags"
          :key="tag.label"
          class="status-tag"
          :class="tag.cssClass"
        >
          {{ tag.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'FarmerProfileCard',
    props: {
        farmerName: {
            type: String,
            required: true
        },
        farmerAge: {
            type: [String, Number],
            required: true
        },
        avatarUrl: {
            type: String,
            required: true
        },
        backgroundImage: {
            type: String,
            required: true
        },
        statusTags: {
            type: Array,
            default: () => []
        },
        // 星级评分 (1-5)
        rating: {
            type: Number,
            default: 4,
            validator: (val) => val >= 0 && val <= 5
        },
        // 标签前缀 (如: "农户：", "所有人：", "管理员：")
        labelPrefix: {
            type: String,
            default: '所有人：'
        },
        // 年龄标签 (如: "年龄：", "名下工厂数：", "管理仓库数：")
        ageLabel: {
            type: String,
            default: '年龄：'
        },
        // 年龄后缀 (如: "岁", "个")
        ageSuffix: {
            type: String,
            default: '岁'
        }
    }
};
</script>

<style lang="less" scoped>
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
    font-family: SourceHanSansCN-Medium, sans-serif;
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
    font-family: sans-serif;
}

.rating-empty {
    font-size: 12px;
    color: #c69c6d;
    font-family: sans-serif;
}

.farmer-status {
    display: flex;
    justify-content: space-around;
    margin-top: 36px;
    gap: 3px;
}

.status-tag {
    padding: 3px 8px;
    font-family: SourceHanSansCN-Medium, sans-serif;
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
</style>
