<template>
  <nav v-if="shouldShow" class="breadcrumb-navigation" aria-label="位置导航">
    <div class="breadcrumb-navigation__container">
      <div class="breadcrumb-navigation__left">
        <button class="breadcrumb-navigation__back-btn" @click="handleBackClick" type="button">
          <span class="breadcrumb-navigation__back-arrow">‹</span>
          <span class="breadcrumb-navigation__back-text">返回上级</span>
        </button>
      </div>

      <ol class="breadcrumb-list">
        <template v-for="(item, index) in breadcrumbs">
          <li :key="'item-' + index" class="breadcrumb-list__item">
            <a
              class="breadcrumb-list__link"
              :class="{ 'breadcrumb-list__link--current': item.current }"
              :aria-current="item.current ? 'page' : undefined"
              @click="handleBreadcrumbClick(item)">
              {{ item.name }}
            </a>
            <span
              v-if="index < breadcrumbs.length - 1"
              :key="'sep-' + index"
              class="breadcrumb-list__separator"
              aria-hidden="true">
              >
            </span>
          </li>
        </template>
      </ol>
    </div>
  </nav>
</template>

<script>
export default {
    name: 'BreadcrumbNavigation',
    props: {
        regionName: {
            type: String,
            default: '右江区'
        },
        showBottomNav: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        shouldShow() {
            return this.showBottomNav && this.breadcrumbs.length > 0;
        },
        breadcrumbs() {
            const route = this.$route;
            const breadcrumbs = [];

            // 根据当前路由生成面包屑
            switch (route.name) {
                case 'Dashboard':
                case 'DataDashboard':
                    // 首页不显示面包屑
                    break;

                case 'DetailMap': {
                    // 区县详情页面：百色 > 右江区
                    breadcrumbs.push({ name: '百色', path: '/' });
                    const regionName = route.params.region || this.regionName;
                    breadcrumbs.push({ name: regionName, path: route.path, current: true });
                    break;
                }

                case 'PlotDetail': {
                    // 地块详情页面：百色 > XX县 > 具体地块名
                    breadcrumbs.push({ name: '百色', path: '/' });

                    // 从query参数获取区域信息
                    const plotRegion = route.query.region || this.regionName;
                    breadcrumbs.push({
                        name: plotRegion,
                        path: `/detail/${ plotRegion }`
                    });

                    // 当前地块名称
                    const plotName = route.query.plotName || '地块详情';
                    breadcrumbs.push({
                        name: plotName,
                        path: route.path,
                        current: true
                    });
                    break;
                }
            }

            return breadcrumbs;
        }
    },
    methods: {
        handleBackClick() {
            this.$emit('back');
        },
        handleBreadcrumbClick(item) {
            if (!item.current && item.path) {
                this.$emit('breadcrumb-click', item);
            }
        }
    }
};
</script>

<style lang="less" scoped>
.breadcrumb-navigation {
    position: absolute;
    z-index: 10;
    bottom: 26px;
    left: 50%;
    box-sizing: border-box;
    max-width: 550px;
    height: 40px;

    transform: translate(-50%, 0);
}

.breadcrumb-navigation__container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 550px;
    height: 100%;
    margin: 0 auto;
}

.breadcrumb-navigation__left {
    display: flex;
    align-items: center;
}

.breadcrumb-navigation__back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 154px;
    height: 40px;
    margin-left: 5px;
    padding: 8px 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 14px;

    color: #c69c6d;
    background: #7c714c;
    cursor: pointer;
}

.breadcrumb-navigation__back-arrow {
    margin-right: 20px;
    font-size: 18px;
    font-weight: bold;
}

.breadcrumb-navigation__back-text {
    font-size: 14px;
    font-weight: 500;
}

// 面包屑列表
.breadcrumb-list {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 100%;
    margin-left: 5px;
    padding: 0 30px;
    border: 1px solid #937c57;

    list-style: none;
    opacity: .9;
    background: #041f1c;

    gap: 8px;
}

.breadcrumb-list__item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.breadcrumb-list__link {
    font-family: SourceHanSansCN-Regular;
    font-size: 14px;

    opacity: .5;
    color: #c69c6d;
    transition: color .3s ease;
    cursor: pointer;

    &:not(.breadcrumb-list__link--current):hover {
        opacity: 1;
        color: #c69c6d;
    }

    &.breadcrumb-list__link--current {
        font-weight: 500;
        opacity: 1;
        color: #c69c6d;
        cursor: default;
    }
}

.breadcrumb-list__separator {
    font-size: 14px;
    opacity: .5;
    color: #c69c6d;
    user-select: none;
}
</style>
