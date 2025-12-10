<template>
  <div class="farmer-profile" :style="{ backgroundImage: `url(${backgroundImage})` }">
    <img class="farmer-avatar" :src="avatarUrl" />
    <div class="farmer-details">
      <div class="farmer-name">农户：{{ farmerName }}</div>
      <img class="detail-divider" src="/images/divider.png" />
      <div class="farmer-age">年龄：{{ farmerAge }}岁</div>
      <div class="farmer-rating">
        <span class="rating-filled">★★★★</span>
        <span class="rating-empty">★</span>
      </div>
      <div class="farmer-status">
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
            type: String,
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
