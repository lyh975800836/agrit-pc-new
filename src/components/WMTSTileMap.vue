<template>
  <div class="wmts-tile-map">
    <!-- 加载指示器 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </div>

    <!-- 缩放控制按钮 -->
    <div class="zoom-controls-overlay">
      <button class="btn-zoom" @click="zoomOut" :disabled="currentLevel <= 0" title="缩小">
        <span class="zoom-icon">-</span>
      </button>
      <span class="zoom-level">{{ currentLevel }}</span>
      <button class="btn-zoom" @click="zoomIn" :disabled="currentLevel >= maxLevel" title="放大">
        <span class="zoom-icon">+</span>
      </button>
    </div>

    <!-- WMTS瓦片网格 -->
    <div class="viewer" @wheel="onMouseWheel">
      <div class="tile-container">
        <div class="tile-grid" ref="tileGrid" :style="gridStyle">
        <div 
          v-for="tile in tiles" 
          :key="`${tile.row}-${tile.col}`"
          class="tile"
          @click="onTileClick(tile.actualRow, tile.actualCol)"
        >
          <img 
            v-if="tile.imageUrl && !tile.hasError" 
            :src="tile.imageUrl" 
            :alt="`Tile ${currentLevel}/${tile.actualRow}/${tile.actualCol}`"
            class="tile-image"
          />
          <div v-else-if="tile.hasError" class="tile-error">
            <div class="error-icon">❌</div>
            <div class="error-text">加载失败</div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WMTSTileMap',
  props: {
    regionName: {
      type: String,
      required: true
    },
    plotData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      currentLevel: 0,
      maxLevel: 5, // 限制最大级别为5，避免64个瓦片
      currentBounds: { row: 0, col: 0 },
      levelHistory: [],
      tiles: [],
      isLoading: true,
      loadingText: 'Loading...',
      tileSize: 256,
      resizeTimer: null,
      wheelTimeout: null
    };
  },
  computed: {
    gridStyle() {
      const tilesPerSide = Math.pow(2, this.currentLevel);
      
      // 正确的WMTS逻辑：
      // - 级别0: 1个瓦片，小尺寸显示整个区域
      // - 级别1: 4个瓦片，每个瓦片尺寸更大，显示更多细节  
      // - 级别2: 16个瓦片，每个瓦片尺寸更大，显示最多细节
      // 核心思想：级别越高，瓦片尺寸越大，看到的细节越多
      
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight - 120;
      
      // 基础瓦片大小随着级别增加而增大
      const baseSizes = [
        200, // 级别0: 200px
        280, // 级别1: 280px  
        350, // 级别2: 350px
        420, // 级别3: 420px
        500, // 级别4: 500px
        580, // 级别5: 580px
        650  // 级别6: 650px
      ];
      
      let idealTileSize = baseSizes[this.currentLevel] || 300;
      
      // 确保不会超出屏幕，但优先保证瓦片足够大
      const maxAllowedWidth = containerWidth * 0.95 / tilesPerSide;
      const maxAllowedHeight = containerHeight * 0.95 / tilesPerSide;
      const maxAllowed = Math.min(maxAllowedWidth, maxAllowedHeight);
      
      // 如果理想大小超出屏幕限制，才进行缩小
      if (idealTileSize * tilesPerSide > containerWidth * 0.95 || 
          idealTileSize * tilesPerSide > containerHeight * 0.95) {
        idealTileSize = Math.max(150, maxAllowed); // 最小150px
      }
      
      const tileSize = Math.floor(idealTileSize);
      
      return {
        gridTemplateColumns: `repeat(${tilesPerSide}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${tilesPerSide}, ${tileSize}px)`
      };
    }
  },
  mounted() {
    this.initViewer();
    // 监听窗口大小变化
    window.addEventListener('resize', this.handleResize);
  },
  
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    initViewer() {
      this.loadTileGrid();
    },

    async getTile(level, row, col) {
      // 部署环境直接请求外部服务器，本地开发时使用代理
      const isProduction = process.env.NODE_ENV === 'production';
      const baseUrl = isProduction ? 'http://43.136.169.150:8000' : '';
      const url = `${baseUrl}/api/v1/wmts/request?service=WMTS&request=GetTile&version=1.0.0&layer=test_layer&style=default&tilematrixset=GoogleMapsCompatible&tilematrix=${level}&tilerow=${row}&tilecol=${col}&format=image/png`;
      
      console.log(`正在请求瓦片: ${level}/${row}/${col}`);
      
      try {
        // 设置10秒超时
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(url, { 
          signal: controller.signal 
        });
        clearTimeout(timeoutId);
        
        console.log(`瓦片响应状态 (${level}/${row}/${col}):`, response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log(`瓦片数据 (${level}/${row}/${col}):`, result ? '有数据' : '无数据');
        
        if (result && result.data) {
          return `data:${result.content_type};base64,${result.data}`;
        } else {
          throw new Error('无效的响应格式');
        }
      } catch (error) {
        console.error(`获取瓦片失败 (${level}/${row}/${col}):`, error);
        throw error;
      }
    },

    async loadTileGrid() {
      console.log(`开始加载第${this.currentLevel}层瓦片网格`);
      this.isLoading = true;
      this.loadingText = 'Loading...';
      
      // 计算当前层级的瓦片数量
      const tilesPerSide = Math.pow(2, this.currentLevel);
      console.log(`需要加载 ${tilesPerSide}x${tilesPerSide} = ${tilesPerSide * tilesPerSide} 个瓦片`);
      
      // 生成瓦片数据结构
      this.tiles = [];
      for (let row = 0; row < tilesPerSide; row++) {
        for (let col = 0; col < tilesPerSide; col++) {
          const actualRow = this.currentBounds.row + row;
          const actualCol = this.currentBounds.col + col;
          
          this.tiles.push({
            row,
            col,
            actualRow,
            actualCol,
            hasError: false,
            imageUrl: null
          });
        }
      }
      
      // 异步加载所有瓦片
      console.log('开始异步加载瓦片...');
      const promises = this.tiles.map((tile) => this.loadTileAsync(tile));
      const results = await Promise.allSettled(promises);
      
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failCount = results.length - successCount;
      console.log(`瓦片加载完成: 成功${successCount}个, 失败${failCount}个`);
      
      this.isLoading = false;
    },

    async loadTileAsync(tile) {
      try {
        const imageUrl = await this.getTile(this.currentLevel, tile.actualRow, tile.actualCol);
        tile.imageUrl = imageUrl;
        return { success: true };
      } catch (error) {
        tile.hasError = true;
        return { success: false, error };
      }
    },

    onTileClick(row, col) {
      if (this.currentLevel >= this.maxLevel) {
        this.$message?.info(`已达到最大缩放级别 ${this.maxLevel}`);
        return;
      }
      
      // 保存当前状态到历史
      this.levelHistory.push({
        level: this.currentLevel,
        bounds: { ...this.currentBounds }
      });
      
      // 计算下一层级的边界
      this.currentLevel++;
      this.currentBounds = {
        row: row * 2,
        col: col * 2
      };
      
      this.loadTileGrid();
    },

    zoomIn() {
      if (this.currentLevel >= this.maxLevel) {
        this.$message?.info(`已达到最大缩放级别 ${this.maxLevel}，避免加载过多瓦片影响性能`);
        return;
      }
      
      // 保存当前状态到历史
      this.levelHistory.push({
        level: this.currentLevel,
        bounds: { ...this.currentBounds }
      });
      
      // 放大到中心区域
      const tilesPerSide = Math.pow(2, this.currentLevel);
      const centerTileRow = Math.floor(tilesPerSide / 2);
      const centerTileCol = Math.floor(tilesPerSide / 2);
      
      this.currentLevel++;
      this.currentBounds = {
        row: (this.currentBounds.row + centerTileRow) * 2,
        col: (this.currentBounds.col + centerTileCol) * 2
      };
      
      this.loadTileGrid();
    },

    zoomOut() {
      if (this.currentLevel <= 0) {
        this.$message?.info('已达到最小缩放级别');
        return;
      }
      
      if (this.levelHistory.length > 0) {
        this.goBack();
      } else {
        // 如果没有历史记录，直接回到上一级的中心
        this.currentLevel--;
        this.currentBounds = {
          row: Math.floor(this.currentBounds.row / 2),
          col: Math.floor(this.currentBounds.col / 2)
        };
        this.loadTileGrid();
      }
    },

    goBack() {
      if (this.levelHistory.length === 0) return;
      
      const previousState = this.levelHistory.pop();
      this.currentLevel = previousState.level;
      this.currentBounds = previousState.bounds;
      
      this.loadTileGrid();
    },

    goToLevel(targetLevel) {
      if (targetLevel === this.currentLevel) return;
      
      if (targetLevel === 0) {
        this.resetToRoot();
        return;
      }
      
      const targetIndex = this.levelHistory.findIndex(h => h.level === targetLevel - 1);
      if (targetIndex >= 0) {
        const targetState = this.levelHistory[targetIndex];
        this.levelHistory = this.levelHistory.slice(0, targetIndex);
        this.currentLevel = targetState.level;
        this.currentBounds = targetState.bounds;
        
        this.loadTileGrid();
      }
    },

    resetToRoot() {
      this.currentLevel = 0;
      this.currentBounds = { row: 0, col: 0 };
      this.levelHistory = [];
      
      this.loadTileGrid();
    },

    handleResize() {
      // 防抖处理，避免频繁调用
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.$forceUpdate(); // 强制更新计算属性
      }, 100); // 减少延迟，提高响应速度
    },

    onMouseWheel(event) {
      // 阻止页面滚动
      event.preventDefault();
      
      // 防抖处理，避免频繁触发
      if (this.wheelTimeout) {
        clearTimeout(this.wheelTimeout);
      }
      
      this.wheelTimeout = setTimeout(() => {
        const delta = event.deltaY;
        
        if (delta < 0) {
          // 向上滚动 = 放大
          this.zoomIn();
        } else if (delta > 0) {
          // 向下滚动 = 缩小
          this.zoomOut();
        }
        
        this.wheelTimeout = null;
      }, 50); // 50ms防抖
    }
  }
};
</script>

<style lang="less" scoped>
.wmts-tile-map {
  position: relative;
  width: 100%;
  height: 100%;
  background: #102838;
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.loading-spinner {
  text-align: center;
  color: white;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4cfcea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #4cfcea;
}

.zoom-controls-overlay {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(16, 40, 56, 0.9);
  border: 1px solid #4cfcea33;
  border-radius: 25px;
  padding: 8px 15px;
  backdrop-filter: blur(10px);
}

.zoom-level {
  color: #4cfcea;
  font-weight: bold;
  font-size: 16px;
  min-width: 20px;
  text-align: center;
}

.btn-zoom {
  width: 35px;
  height: 35px;
  background: #4cfcea;
  color: #102838;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: #39b44a;
    transform: scale(1.1);
  }
  
  &:disabled {
    background: #666;
    color: #999;
    cursor: not-allowed;
    transform: none;
  }
}

.zoom-icon {
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
}

.viewer {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.tile-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

.tile-grid {
  display: grid !important;
  gap: 0;
  background: transparent;
  border: none;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(76, 252, 234, 0.3);
  max-width: 100%;
  max-height: 100%;
  width: fit-content !important;
  height: fit-content !important;
  margin: auto;
}

.tile {
  width: 100%;
  height: 100%;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background: #102838;
}

.tile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}



.tile-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(204, 0, 0, 0.1);
  color: #ff6b6b;
  width: 100%;
  height: 100%;
}

.error-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.error-text {
  font-size: 12px;
}

</style>