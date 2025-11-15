<template>
  <div>
    <!-- 瓦片图片管理弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content tile-image-modal" @click.stop>
        <div class="modal-header">
          <h3>
            <span v-if="!showPreview">瓦片图片</span>
            <span v-else>图片预览 ({{ currentIndex + 1 }}/{{ images.length }})</span>
            - {{ tileZ }}/{{ tileX }}/{{ tileY }}
          </h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <!-- 网格视图 -->
          <div v-if="!showPreview">
            <!-- 图片网格 -->
            <div class="tile-images-grid">
              <div
                v-for="(image, index) in images"
                :key="image.id"
                class="tile-image-item"
                @click="openPreview(index)"
              >
                <img :src="image.image_url" :alt="`图片 ${image.id}`" />
              </div>
            </div>

            <div v-if="images.length === 0" class="empty-message">
              该瓦片暂无图片
            </div>
          </div>

          <!-- 预览视图 -->
          <div v-else class="preview-view">
            <div class="preview-navigation">
              <button
                class="nav-btn nav-prev"
                @click.stop="previousImage"
                :disabled="currentIndex === 0"
                title="上一张 (←)"
              >
                ←
              </button>

              <div class="preview-image-container">
                <img
                  :src="currentImage.image_url"
                  :alt="`图片 ${currentImage.id}`"
                  class="marker-image"
                  @click="openFullscreen"
                />
              </div>

              <button
                class="nav-btn nav-next"
                @click.stop="nextImage"
                :disabled="currentIndex === images.length - 1"
                title="下一张 (→)"
              >
                →
              </button>
            </div>

            <div class="marker-details">
              <p><strong>上传时间:</strong> {{ currentImage.created_at || '未知' }}</p>
              <p><strong>描述:</strong> {{ currentImage.description || '暂无描述' }}</p>
            </div>

            <!-- 农事建议 -->
            <div class="farming-suggestion">
              <div class="suggestion-header">
                <strong class="suggestion-title">
                  <span>智能</span>
                  <span>农事</span>
                  <span>建议</span>
                </strong>
              </div>
              <div class="suggestion-content">
                <p>1、该区域作物长势良好，叶色浓绿，整体健康状态优良</p>
                <p>2、未发现明显病虫害迹象，无需进行病虫害防治</p>
                <p>3、建议保持当前管理措施，继续观察作物生长动态</p>
                <p>4、近期如遇连续阴雨天气，注意排水防涝工作</p>
              </div>
              <div class="suggestion-back">
                返回列表
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isFullscreenMode"
      class="fullscreen-image-overlay"
      @click="closeFullscreen"
    >
      <div class="fullscreen-image-wrapper" @click.stop>
        <button
          type="button"
          class="fullscreen-close-btn"
          @click.stop="closeFullscreen"
          aria-label="关闭全屏预览"
          title="关闭 (Esc)"
        >
          ×
        </button>

        <button
          type="button"
          class="fullscreen-nav-btn fullscreen-nav-prev"
          @click.stop="previousImage"
          :disabled="currentIndex === 0"
          aria-label="上一张"
          title="上一张 (←)"
        >
          ←
        </button>

        <img
          :src="currentImage.image_url"
          :alt="currentImage.id ? `图片 ${currentImage.id}` : '图片预览'"
        />

        <button
          type="button"
          class="fullscreen-nav-btn fullscreen-nav-next"
          @click.stop="nextImage"
          :disabled="currentIndex === images.length - 1"
          aria-label="下一张"
          title="下一张 (→)"
        >
          →
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'TileImageManager',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        images: {
            type: Array,
            default: () => []
        },
        tilePosition: {
            type: Object,
            default: () => ({ x: 0, y: 0, z: 0 })
        }
    },
    data() {
        return {
            showPreview: false,
            currentIndex: 0,
            isFullscreenMode: false
        };
    },
    computed: {
        showModal() {
            return this.visible;
        },
        tileX() {
            return this.tilePosition.x;
        },
        tileY() {
            return this.tilePosition.y;
        },
        tileZ() {
            return this.tilePosition.z;
        },
        currentImage() {
            if (!this.images.length || this.currentIndex < 0) {
                return {};
            }
            return this.images[this.currentIndex] || {};
        }
    },
    watch: {
        visible(newVal) {
            if (newVal) {
                document.addEventListener('keydown', this.handleKeyboard);
            }
            else {
                document.removeEventListener('keydown', this.handleKeyboard);
            }
        }
    },
    beforeDestroy() {
        document.removeEventListener('keydown', this.handleKeyboard);
    },
    methods: {
        closeModal() {
            this.$emit('close');
            this.showPreview = false;
            this.currentIndex = 0;
            this.isFullscreenMode = false;
        },
        openPreview(index) {
            this.currentIndex = index;
            this.showPreview = true;
            this.isFullscreenMode = false;
        },
        openFullscreen() {
            if (!this.currentImage || !this.currentImage.image_url) {
                return;
            }
            this.isFullscreenMode = true;
        },
        closeFullscreen() {
            if (!this.isFullscreenMode) {
                return;
            }
            this.isFullscreenMode = false;
        },
        previousImage() {
            if (this.currentIndex > 0) {
                this.currentIndex -= 1;
            }
        },
        nextImage() {
            if (this.currentIndex < this.images.length - 1) {
                this.currentIndex += 1;
            }
        },
        handleKeyboard(event) {
            if (!this.showModal) {
                return;
            }

            if (this.isFullscreenMode) {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    this.closeFullscreen();
                    return;
                }
            }

            // 如果在预览模式
            if (this.showPreview) {
                switch (event.key) {
                    case 'ArrowLeft':
                        this.previousImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                    case 'Escape':
                        this.showPreview = false;
                        break;
                    default:
                        break;
                }
            }
            else {
                // 如果在网格模式，Esc 关闭整个弹窗
                if (event.key === 'Escape') {
                    this.closeModal();
                }
            }
        }
    }
};
</script>

<style scoped>
/* 瓦片图片数量徽章样式 */
.tile-image-count {
    position: absolute;
    z-index: 10;
    right: 6px;
    bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 37px;
    height: 37px;
    font-size: 14px;
    font-weight: 700;

    color: #fff;
    background: url('/public/images/mark-point.png') no-repeat center/contain;
    filter: drop-shadow(0 2px 6px rgba(255, 71, 87, 0.45));
    transition: transform .2s ease, filter .2s ease;
    cursor: pointer;
}

.tile-image-count:hover {
    transform: scale(1.08);
    filter: drop-shadow(0 4px 10px rgba(255, 71, 87, 0.55));
}

/* 瓦片图片管理弹窗样式 */
.tile-image-modal {
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 50%;
    max-width: 92vw;
    max-height: 88vh;
    padding: 26px 12px 32px;
    border: 1px solid rgba(76, 252, 234, 0.25);
    border-radius: 12px;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(16, 40, 56, 0.95) 0%, rgba(8, 28, 36, 0.95) 100%);
    box-shadow: 0 18px 46px rgba(0, 0, 0, 0.72);
    color: #c7b299;
    gap: 20px;
}

.tile-image-modal .modal-body {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: calc(88vh - 120px);
    display: flex;
    flex-direction: column;
    gap: 20px;
    scrollbar-width: none;
}

.tile-image-modal .modal-body::-webkit-scrollbar {
    display: none;
}

.tile-images-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 18px;
    padding: 18px;
    border: 1px solid rgba(76, 252, 234, 0.18);
    border-radius: 12px;
    background: rgba(12, 38, 54, 0.55);
    backdrop-filter: blur(2px);
}

.tile-image-item {
    position: relative;
    overflow: hidden;
    padding-top: 72%;
    border-radius: 10px;
    border: 1px solid rgba(199, 178, 153, 0.18);
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
    transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
    cursor: pointer;
}

.tile-image-item:hover {
    transform: translateY(-4px);
    border-color: rgba(199, 178, 153, 0.45);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.45);
}

.tile-image-item img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    object-fit: cover;
}

.empty-message {
    padding: 42px;
    text-align: center;
    font-family: SourceHanSansCN-Regular;
    font-size: 16px;
    color: #c7b299;
    border: 1px dashed rgba(199, 178, 153, 0.45);
    border-radius: 12px;
    background: rgba(12, 38, 54, 0.55);
}

/* 模态框基础样式 */
.modal-overlay {
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

.modal-content {
    border-radius: 12px;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 42px 14px 24px;
}

.modal-header h3 {
    margin: 0;
    font-family: SourceHanSansCN-Medium;
    font-size: 20px;
    font-weight: 500;
    color: #c7b299;
}

.close-btn {
    position: absolute;
    top: 18px;
    right: 22px;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid rgba(199, 178, 153, 0.45);
    border-radius: 50%;
    background: rgba(8, 28, 36, 0.65);
    color: #c7b299;
    font-size: 18px;
    line-height: 26px;
    text-align: center;
    transition: transform .2s ease, background .2s ease;
    cursor: pointer;
}

.close-btn:hover {
    background: rgba(199, 178, 153, 0.18);
    transform: scale(1.05);
}

/* 预览视图样式 */
.preview-view {
    display: flex;
    flex-direction: column;
    gap: 18px;
    border-radius: 12px;
    background: rgba(12, 38, 54, 0.55);
}

.preview-navigation {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 300px;
    max-height: 52vh;
}

.preview-image-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 12px;
}

.preview-image-container img {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
    cursor: zoom-in;
}

.preview-navigation .nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
}

.preview-navigation .nav-prev {
    left: 12px;
}

.preview-navigation .nav-next {
    right: 12px;
}

.fullscreen-image-overlay {
    position: fixed;
    z-index: 1500;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    background: rgba(4, 12, 18, 0.1);
    backdrop-filter: blur(2px);
}

.fullscreen-image-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 28px;
    max-width: 100%;
}

.fullscreen-image-overlay img {
    max-width: 88vw;
    max-height: 88vh;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.6);
    cursor: zoom-out;
}

.fullscreen-nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border: 1px solid rgba(199, 178, 153, 0.45);
    border-radius: 50%;
    background: rgba(8, 28, 36, 0.7);
    color: #c7b299;
    font-size: 26px;
    line-height: 1;
    cursor: pointer;
    transition: transform .2s ease, background .2s ease;
}

.fullscreen-nav-btn:hover:not(:disabled) {
    background: rgba(199, 178, 153, 0.2);
    transform: scale(1.08);
}

.fullscreen-nav-btn:active:not(:disabled) {
    transform: scale(0.95);
}

.fullscreen-nav-btn:disabled {
    opacity: .35;
    cursor: not-allowed;
}

.fullscreen-nav-prev,
.fullscreen-nav-next {
    flex-shrink: 0;
}

.fullscreen-close-btn {
    position: absolute;
    top: 26px;
    right: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border: 1px solid rgba(199, 178, 153, 0.45);
    border-radius: 50%;
    background: rgba(8, 28, 36, 0.7);
    color: #c7b299;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    transition: transform .2s ease, background .2s ease;
}

.fullscreen-close-btn:hover {
    background: rgba(199, 178, 153, 0.2);
    transform: scale(1.05);
}

.fullscreen-close-btn:active {
    transform: scale(0.92);
}

.nav-btn {
    flex-shrink: 0;
    width: 46px;
    height: 46px;
    border: 1px solid rgba(199, 178, 153, 0.35);
    border-radius: 50%;
    background: rgba(8, 28, 36, 0.65);
    color: #c7b299;
    font-size: 20px;
    cursor: pointer;
}

.nav-btn:disabled {
    opacity: .35;
    cursor: not-allowed;
}

.marker-details {
    margin-top: 12px;
    padding: 0 40px;
    line-height: 1.6;
    text-align: left;
    color: #c7b299;
    font-size: 17px;
}

.marker-details strong {
    color: #c7b299;
}

.marker-image {
    max-width: 100%;
    max-height: 50vh;
    border-radius: 8px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
}

/* 农事建议样式 */
.farming-suggestion {
    position: relative;
    margin-top: 14px;
    padding: 24px 32px;
    border-radius: 18px;
    background-color: rgba(8, 28, 36, 0.65);
    background-image: url('/public/images/ai-advice.png');
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
    color: #c7b299;
}

.suggestion-header {
    position: relative;
    display: flex;
    align-items: flex-start;
    margin-bottom: 12px;
    color: #c7b299;
}

.suggestion-title {
    position: absolute;
    top: 10px;
    left: 1.5vw;
    display: flex;
    flex-direction: column;
    font-size: 38px;
    line-height: 1.1;
    text-align: center;
}

.suggestion-title span {
    display: inline-block;
    white-space: nowrap;
}

.suggestion-title span + span {
    margin-top: 6px;
}

.suggestion-content {
    line-height: 1.8;
    padding-left: 9vw;
}

.suggestion-content p {
    margin: 6px 0;
    padding-left: 4px;
    font-size: 18px;
    color: #c7b299;
}

.suggestion-content p:first-child {
    margin-top: 0;
}

.suggestion-content p:last-child {
    margin-bottom: 0;
}

.suggestion-back {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translate(0, -40%);
    width: 160px;
    height: 50px;
    line-height: 50px;
    text-align: center;
    color: #D8AF87;
    font-weight: 600;
    text-shadow: 0 1px 1px rgba(255, 255, 255, 0.35);
    background-image: url('/public/images/back-list.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-position: center;
    border-radius: 14px;
    cursor: pointer;
}
</style>
