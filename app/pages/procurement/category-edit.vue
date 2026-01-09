<template>
  <view class="edit-container">
    <view class="form-section">
      <uni-forms ref="form" :model="formData" :rules="rules">
        <uni-forms-item label="分类名称" name="name">
          <uni-easyinput
            v-model="formData.name"
            placeholder="请输入分类名称，如：各项食材费用、建店物料费用、开店杂费"
            :clearable="true"
            :maxlength="100"
            :styles="inputStyles"
          ></uni-easyinput>
        </uni-forms-item>

        <uni-forms-item label="颜色标签" name="color">
          <view class="color-picker-section">
            <view class="color-preview-list">
              <view
                v-for="(color, index) in presetColors"
                :key="index"
                class="color-item"
                :class="{ active: formData.color === color }"
                :style="{ backgroundColor: color }"
                @click="selectColor(color)"
              ></view>
            </view>
            <view class="color-input-section">
              <text class="color-label">或输入颜色值：</text>
              <uni-easyinput
                v-model="formData.color"
                placeholder="#e5e7eb"
                :clearable="true"
                :maxlength="20"
                :styles="inputStyles"
                class="color-input"
              ></uni-easyinput>
            </view>
            <view v-if="formData.color" class="color-preview">
              <view
                class="color-preview-box"
                :style="{ backgroundColor: formData.color }"
              ></view>
              <text class="color-preview-text">{{ formData.color }}</text>
            </view>
          </view>
        </uni-forms-item>
      </uni-forms>

      <view class="button-section">
        <button class="save-btn" @click="handleSave" :disabled="isLoading">
          {{ isLoading ? "保存中..." : "保存" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { procurementCategoryApi } from "../../utils/api.js";

const form = ref(null);
const isLoading = ref(false);
const isEdit = ref(false);
const categoryId = ref(null);

const formData = ref({
  name: "",
  color: "",
});

// 预设颜色
const presetColors = [
  "#f97316", // 橙色 - 各项食材费用
  "#3b82f6", // 蓝色 - 建店物料费用
  "#8b5cf6", // 紫色 - 开店杂费
  "#10b981", // 绿色
  "#ef4444", // 红色
  "#f59e0b", // 黄色
  "#06b6d4", // 青色
  "#6366f1", //  indigo
  "#ec4899", // 粉色
  "#6b7280", // 灰色
];

const rules = {
  name: {
    rules: [
      {
        required: true,
        errorMessage: "请输入分类名称",
      },
    ],
  },
};

const inputStyles = {
  borderColor: "transparent",
  backgroundColor: "transparent",
};

// 选择颜色
const selectColor = (color) => {
  formData.value.color = color;
};

// 获取分类信息
const getCategoryInfo = async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const id = currentPage.options?.id;

  if (id) {
    isEdit.value = true;
    categoryId.value = parseInt(id);

    try {
      const res = await procurementCategoryApi.getCategory(categoryId.value);
      if (res) {
        formData.value = {
          name: res.name || "",
          color: res.color || "",
        };
      }
    } catch (error) {
      console.error("获取分类信息失败:", error);
      uni.showToast({
        title: "获取分类信息失败",
        icon: "none",
      });
    }
  }
};

// 保存
const handleSave = async () => {
  if (isLoading.value) return;

  try {
    await form.value.validate();
  } catch (error) {
    console.error("表单验证失败:", error);
    return;
  }

  isLoading.value = true;

  try {
    uni.showLoading({
      title: "保存中...",
      mask: true,
    });

    const data = {
      name: formData.value.name.trim(),
      color: formData.value.color?.trim() || null,
    };

    if (isEdit.value && categoryId.value) {
      await procurementCategoryApi.updateCategory(categoryId.value, data);
    } else {
      await procurementCategoryApi.createCategory(data);
    }

    uni.hideLoading();
    uni.showToast({
      title: "保存成功",
      icon: "success",
    });

    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    uni.hideLoading();
    console.error("保存失败:", error);
    uni.showToast({
      title: error.message || "保存失败",
      icon: "none",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getCategoryInfo();
});
</script>

<style lang="scss" scoped>
.edit-container {
  min-height: 100vh;
  background-color: #ffffff;
}

.form-section {
  padding: 0;
  margin-top: 0;
}

:deep(.uni-forms) {
  background-color: #ffffff;
  border-radius: 0;
  overflow: hidden;
}

:deep(.uni-forms-item) {
  background-color: #ffffff;
  padding: 0 32rpx;
  margin-bottom: 0;
  border-bottom: 1rpx solid #f3f4f6;
}

:deep(.uni-forms-item__label) {
  font-size: 28rpx;
  color: #333;
  width: 160rpx;
}

.color-picker-section {
  padding: 32rpx 0;
}

.color-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.color-item {
  width: 64rpx;
  height: 64rpx;
  border-radius: 8rpx;
  border: 3rpx solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.color-item.active {
  border-color: #1a1a1a;
  transform: scale(1.1);
}

.color-input-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.color-label {
  font-size: 24rpx;
  color: #666;
  white-space: nowrap;
}

.color-input {
  flex: 1;
}

.color-preview {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background-color: #f9fafb;
  border-radius: 8rpx;
}

.color-preview-box {
  width: 48rpx;
  height: 48rpx;
  border-radius: 6rpx;
  border: 1rpx solid #e5e7eb;
}

.color-preview-text {
  font-size: 24rpx;
  color: #666;
  font-family: monospace;
}

.button-section {
  padding: 40rpx 32rpx;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background-color: #1a1a1a;
  color: #ffffff;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-btn::after {
  border: none;
}

.save-btn[disabled] {
  background-color: #d1d5db;
  color: #9ca3af;
}
</style>
