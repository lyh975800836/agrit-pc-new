# 全局函数迁移指南

## 概述

本指南说明如何将项目中的全局函数迁移到新的 EventBus 系统,以解决以下问题:

- ✅ 避免全局命名空间污染
- ✅ 防止内存泄漏
- ✅ 提高代码可测试性
- ✅ 改善组件解耦

## 迁移步骤

### 第一步: 识别需要迁移的代码

#### 旧代码模式 (需要迁移):

**App.vue** (行 45, 64-65, 72):
```javascript
// ❌ 旧方式: 直接操作 window 对象
window.__INTRO_TARGET__ = target;
window.dispatchEvent(new CustomEvent('intro-transition', { detail: target }));
```

**MapViewBaise.vue** (行 78-79):
```javascript
// ❌ 旧方式: 注册全局函数
window.zoomToField = this.zoomToField;
window.showFieldDetails = this.showFieldDetails;
```

**MapViewBaise.vue / RegionDetailMap.vue** (beforeDestroy):
```javascript
// ❌ 旧方式: 手动清理全局函数
beforeDestroy() {
  if (window.zoomToField === this.zoomToField) {
    delete window.zoomToField;
  }
  if (window.showFieldDetails === this.showFieldDetails) {
    delete window.showFieldDetails;
  }
}
```

### 第二步: 使用新的 EventBus 系统

#### 方案 A: 使用 mapOperationsMixin (推荐)

**发送方组件** (触发事件):
```vue
<template>
  <button @click="handleZoomClick">缩放到地块</button>
</template>

<script>
import mapOperationsMixin from '@/mixins/mapOperationsMixin';

export default {
  mixins: [mapOperationsMixin],

  methods: {
    handleZoomClick() {
      // ✅ 新方式: 使用 mixin 方法
      this.zoomToField({
        lat: 23.9,
        lng: 106.6,
        zoom: 14,
        name: '地块名称'
      });
    },

    handleShowDetails() {
      this.showFieldDetails({
        id: 'field-001',
        name: '测试地块',
        details: { area: 100, crop: '八角' }
      });
    }
  }
};
</script>
```

**接收方组件** (监听事件):
```vue
<script>
import mapOperationsMixin from '@/mixins/mapOperationsMixin';

export default {
  mixins: [mapOperationsMixin],

  mounted() {
    // ✅ 新方式: 注册事件监听(自动清理)
    this.onMapZoomToField(this.handleZoomToField);
    this.onShowFieldDetails(this.handleShowFieldDetails);
  },

  methods: {
    handleZoomToField(fieldData) {
      console.log('缩放到地块:', fieldData);
      // 执行缩放逻辑
      if (this.map) {
        this.map.setView([fieldData.lat, fieldData.lng], fieldData.zoom || 14);
      }
    },

    handleShowFieldDetails(fieldData) {
      console.log('显示地块详情:', fieldData);
      // 显示详情面板
      this.currentField = fieldData;
      this.showDetailsPanel = true;
    }
  }
};
</script>
```

#### 方案 B: 直接使用 EventBus (灵活性更高)

```javascript
import eventBus, { EVENTS } from '@/services/eventBus';

export default {
  mounted() {
    // ✅ 监听事件
    eventBus.on(EVENTS.MAP_ZOOM_TO_FIELD, this.handleZoomToField);
  },

  beforeDestroy() {
    // ⚠️ 需要手动清理
    eventBus.off(EVENTS.MAP_ZOOM_TO_FIELD, this.handleZoomToField);
  },

  methods: {
    triggerZoom() {
      // ✅ 触发事件
      eventBus.emit(EVENTS.MAP_ZOOM_TO_FIELD, {
        lat: 23.9,
        lng: 106.6,
        zoom: 14
      });
    },

    handleZoomToField(data) {
      console.log('缩放到:', data);
    }
  }
};
```

### 第三步: 迁移场景过渡事件

#### App.vue - 旧代码:
```javascript
// ❌ 旧方式
window.__INTRO_TARGET__ = target;
window.dispatchEvent(new CustomEvent('intro-transition', { detail: target }));
```

#### App.vue - 新代码:
```vue
<script>
import mapOperationsMixin from '@/mixins/mapOperationsMixin';

export default {
  mixins: [mapOperationsMixin],

  methods: {
    handleIntroClick(target) {
      // ✅ 新方式
      this.setIntroTarget(target);
      this.triggerIntroTransition(target, {
        duration: 2000,
        easing: 'ease-in-out'
      });
    }
  }
};
</script>
```

#### EarthIntro.vue - 监听场景过渡:
```vue
<script>
import mapOperationsMixin from '@/mixins/mapOperationsMixin';

export default {
  mixins: [mapOperationsMixin],

  mounted() {
    // ✅ 监听过渡事件
    this.onIntroTransition(this.handleTransition);
    this.onIntroTargetChange(this.handleTargetChange);
  },

  methods: {
    handleTransition({ target, duration, easing }) {
      console.log(`过渡到 ${target}`, duration, easing);
      // 执行场景过渡动画
    },

    handleTargetChange(target) {
      console.log('目标场景:', target);
      this.currentTarget = target;
    }
  }
};
</script>
```

## 迁移优先级

### 高优先级 (立即迁移)

1. **App.vue** - 场景过渡事件
   - `window.__INTRO_TARGET__`
   - `window.dispatchEvent(new CustomEvent('intro-transition', ...))`

2. **MapViewBaise.vue** - 地图全局函数
   - `window.zoomToField`
   - `window.showFieldDetails`

3. **RegionDetailMap.vue** - 地图全局函数
   - 同 MapViewBaise.vue

### 中优先级 (后续迁移)

- 其他使用 `window.addEventListener` 的自定义事件
- 跨组件的数据共享逻辑

## 兼容性方案

如果需要逐步迁移,可以使用 `globalFunctionMixin` 作为过渡方案:

```vue
<script>
import globalFunctionMixin from '@/mixins/globalFunctionMixin';
import mapOperationsMixin from '@/mixins/mapOperationsMixin';

export default {
  mixins: [globalFunctionMixin, mapOperationsMixin],

  mounted() {
    // 新代码: 使用 EventBus
    this.onMapZoomToField(this.zoomToField);

    // 兼容旧代码: 保留全局函数(将逐步废弃)
    this.registerGlobalFunction('zoomToField', this.zoomToField);
  },

  methods: {
    zoomToField(data) {
      // 统一的实现逻辑
      console.log('缩放到地块:', data);
    }
  }
};
</script>
```

## 测试迁移结果

### 检查全局函数是否已清理

在浏览器控制台运行:
```javascript
// 检查是否还有全局函数
console.log('zoomToField' in window);  // 应该为 false
console.log('showFieldDetails' in window);  // 应该为 false
```

### 检查 EventBus 事件

```javascript
import eventBus from '@/services/eventBus';

// 查看所有注册的事件
console.log(eventBus.getEvents());

// 查看特定事件的监听器数量
console.log(eventBus.getListenerCount('map:zoom-to-field'));
```

## 常见问题

### Q: 为什么要迁移?
A:
- 避免全局命名空间污染
- 防止内存泄漏(组件销毁后全局函数仍存在)
- 提高可维护性和可测试性
- 更好的类型支持和 IDE 提示

### Q: 性能会受影响吗?
A:
- EventBus 基于 Vue 的事件系统,性能开销极小
- 相比直接调用函数,几乎没有性能差异

### Q: 如何调试 EventBus 事件?
A:
```javascript
// 开发环境下启用调试
if (process.env.NODE_ENV === 'development') {
  import eventBus from '@/services/eventBus';
  window.__eventBus__ = eventBus;  // 方便调试
}
```

## 迁移检查清单

- [ ] 识别所有使用 `window.*` 的全局函数
- [ ] 将全局函数调用替换为 EventBus 事件
- [ ] 添加 `mapOperationsMixin` 到相关组件
- [ ] 测试功能是否正常
- [ ] 移除旧的全局函数代码
- [ ] 验证组件销毁后事件监听被正确清理
- [ ] 更新相关文档和注释

## 参考文件

- `src/services/eventBus.js` - EventBus 服务
- `src/mixins/globalFunctionMixin.js` - 全局函数管理 mixin
- `src/mixins/mapOperationsMixin.js` - 地图操作 mixin
