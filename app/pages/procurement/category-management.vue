<template>
  <view class="management-container">
    <view class="content">
      <!-- 采购分类管理 -->
      <view class="section">
        <view v-if="categories.length === 0" class="empty-state">
          <uni-icons type="info" size="40" color="#9ca3af"></uni-icons>
          <text class="empty-text">暂无采购分类</text>
        </view>

        <view v-else class="category-list">
          <view
            v-for="category in categories"
            :key="category.id"
            class="category-item"
          >
            <view class="category-info">
              <view
                class="category-color-tag"
                :style="{
                  backgroundColor: category.color || '#e5e7eb',
                }"
              ></view>
              <text class="category-name">{{ category.name }}</text>
            </view>
            <view class="category-actions">
              <view
                class="action-icon"
                @click="handleEditCategory(category)"
              >
                <uni-icons
                  type="compose"
                  size="20"
                  color="#1a1a1a"
                ></uni-icons>
              </view>
              <view
                class="action-icon"
                @click="handleDeleteCategory(category)"
              >
                <uni-icons
                  type="trash"
                  size="20"
                  color="#ef4444"
                ></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 右下角悬浮按钮 -->
    <view class="fab-button" @click="handleAddCategory">
      <uni-icons type="plusempty" size="28" color="#ffffff"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { procurementCategoryApi } from "../../utils/api.js";

const categories = ref([]);

// 获取采购分类列表
const getCategories = async () => {
  try {
    const res = await procurementCategoryApi.getCategories();
    if (res) {
      categories.value = res;
    }
  } catch (error) {
    console.error("获取采购分类失败:", error);
    uni.showToast({
      title: "获取采购分类失败",
      icon: "none",
    });
  }
};

// 添加分类
const handleAddCategory = () => {
  uni.navigateTo({
    url: "/pages/procurement/category-edit",
  });
};

// 编辑分类
const handleEditCategory = (category) => {
  uni.navigateTo({
    url: `/pages/procurement/category-edit?id=${category.id}`,
  });
};

// 删除分类
const handleDeleteCategory = (category) => {
  uni.showModal({
    title: "确认删除",
    content: `确定要删除分类"${category.name}"吗？\n如果该分类下存在采购记录，将无法删除。`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await procurementCategoryApi.deleteCategory(category.id);
          uni.showToast({
            title: "删除成功",
            icon: "success",
          });
          getCategories();
        } catch (error) {
          console.error("删除分类失败:", error);
          uni.showToast({
            title: error.message || "删除失败",
            icon: "none",
          });
        }
      }
    },
  });
};

onMounted(() => {
  getCategories();
});
</script>

<style lang="scss" scoped>
.management-container {
  min-height: 100vh;
  width: 100%;
  background-color: #ffffff;
}

.content {
  padding: 0;
}

.section {
  width: 100%;
  background-color: #ffffff;
  padding: 0;
  margin-bottom: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999999;
}

.category-list {
  display: flex;
  flex-direction: column;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
}

.category-item:last-child {
  border-bottom: none;
}

.category-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.category-color-tag {
  width: 32rpx;
  height: 32rpx;
  border-radius: 6rpx;
  flex-shrink: 0;
}

.category-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #1a1a1a;
  letter-spacing: -0.3rpx;
}

.category-actions {
  display: flex;
  gap: 24rpx;
  align-items: center;
}

.action-icon {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 悬浮按钮 */
.fab-button {
  position: fixed;
  right: 32rpx;
  bottom: 32rpx;
  width: 112rpx;
  height: 112rpx;
  background-color: #1a1a1a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
  z-index: 999;
  transition: transform 0.2s, box-shadow 0.2s;
}

.fab-button:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}
</style>
