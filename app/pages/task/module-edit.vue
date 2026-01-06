<template>
  <view class="edit-container">
    <view class="form-section">
      <uni-forms ref="form" :model="formData" :rules="rules">
        <uni-forms-item label="模块名称" name="name">
          <uni-easyinput
            v-model="formData.name"
            placeholder="请输入模块名称，如：上午、中午、晚上、打烊"
            :clearable="true"
            :maxlength="50"
            :styles="inputStyles"
          ></uni-easyinput>
        </uni-forms-item>

        <uni-forms-item label="开始时间" name="startTime">
          <picker
            mode="time"
            :value="formData.startTime"
            @change="onStartTimeChange"
          >
            <view class="picker-view">
              <text
                class="picker-text"
                :class="{ placeholder: !formData.startTime }"
              >
                {{ formData.startTime || "请选择开始时间" }}
              </text>
              <uni-icons type="arrowdown" size="16" color="#999999"></uni-icons>
            </view>
          </picker>
        </uni-forms-item>

        <uni-forms-item label="结束时间" name="endTime">
          <picker
            mode="time"
            :value="formData.endTime"
            @change="onEndTimeChange"
          >
            <view class="picker-view">
              <text
                class="picker-text"
                :class="{ placeholder: !formData.endTime }"
              >
                {{ formData.endTime || "请选择结束时间" }}
              </text>
              <uni-icons type="arrowdown" size="16" color="#999999"></uni-icons>
            </view>
          </picker>
        </uni-forms-item>

        <uni-forms-item label="描述" name="description" class="textarea-item">
          <uni-easyinput
            v-model="formData.description"
            placeholder="请输入模块描述"
            :clearable="true"
            :maxlength="200"
            type="textarea"
            :autoHeight="true"
            :styles="inputStyles"
          ></uni-easyinput>
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
import { taskApi } from "../../utils/api.js";

const form = ref(null);
const isLoading = ref(false);
const isEdit = ref(false);
const moduleId = ref(null);

const formData = ref({
  name: "",
  startTime: "",
  endTime: "",
  description: "",
});

const rules = {
  name: {
    rules: [
      {
        required: true,
        errorMessage: "请输入模块名称",
      },
    ],
  },
  startTime: {
    rules: [
      {
        required: true,
        errorMessage: "请选择开始时间",
      },
    ],
  },
  endTime: {
    rules: [
      {
        required: true,
        errorMessage: "请选择结束时间",
      },
      {
        validateFunction: (rule, value, data, callback) => {
          if (data.startTime && value && value <= data.startTime) {
            callback("结束时间必须晚于开始时间");
          } else {
            callback();
          }
        },
      },
    ],
  },
};

const inputStyles = {
  borderColor: "transparent",
  backgroundColor: "transparent",
};

// 将时间格式从 HH:mm 转换为 HH:mm:ss
const formatTimeToHHmmss = (timeStr) => {
  if (!timeStr) return null;
  // 如果已经是 HH:mm:ss 格式，直接返回
  if (timeStr.split(":").length === 3) return timeStr;
  // 如果是 HH:mm 格式，添加 :00
  if (timeStr.split(":").length === 2) return timeStr + ":00";
  return timeStr;
};

// 开始时间选择变化
const onStartTimeChange = (e) => {
  formData.value.startTime = e.detail.value;
  // 如果结束时间早于或等于开始时间，清空结束时间
  if (
    formData.value.endTime &&
    formData.value.endTime <= formData.value.startTime
  ) {
    formData.value.endTime = "";
  }
};

// 结束时间选择变化
const onEndTimeChange = (e) => {
  const endTime = e.detail.value;
  if (formData.value.startTime && endTime <= formData.value.startTime) {
    uni.showToast({
      title: "结束时间必须晚于开始时间",
      icon: "none",
    });
    return;
  }
  formData.value.endTime = endTime;
};

// 获取模块信息
const getModuleInfo = async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const id = currentPage.options?.id;

  if (id) {
    isEdit.value = true;
    moduleId.value = parseInt(id);

    try {
      const res = await taskApi.getModules();
      const module = res.find((m) => m.id === moduleId.value);
      if (module) {
        // 后端返回的时间格式是 HH:mm:ss，picker 需要 HH:mm 格式
        const formatTimeToHHmm = (timeStr) => {
          if (!timeStr) return "";
          // 如果是 HH:mm:ss 格式，去掉秒
          if (timeStr.split(":").length === 3) {
            return timeStr.substring(0, 5);
          }
          return timeStr;
        };
        formData.value = {
          name: module.name || "",
          startTime: formatTimeToHHmm(module.startTime) || "",
          endTime: formatTimeToHHmm(module.endTime) || "",
          description: module.description || "",
        };
      }
    } catch (error) {
      console.error("获取模块信息失败:", error);
    }
  }
};

// 保存
const handleSave = async () => {
  if (isLoading.value) return;

  // 表单验证
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
      name: formData.value.name,
      startTime: formatTimeToHHmmss(formData.value.startTime),
      endTime: formatTimeToHHmmss(formData.value.endTime),
      description: formData.value.description || null,
    };

    if (isEdit.value) {
      await taskApi.updateModule(moduleId.value, data);
    } else {
      await taskApi.createModule(data);
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
      title: "保存失败",
      icon: "none",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getModuleInfo();
});
</script>

<style lang="scss" scoped>
.edit-container {
  min-height: 100vh;
  background-color: #ffffff;
}

/* 顶部导航栏 */
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-left {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  letter-spacing: -0.5rpx;
}

.nav-right {
  width: 60rpx;
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
  border-bottom: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  min-height: 96rpx;
}

:deep(.uni-forms-item__label) {
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 500;
  padding: 0;
  width: 140rpx !important;
  letter-spacing: -0.3rpx;
  line-height: 1.5;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

:deep(.uni-forms-item__content) {
  display: flex;
  align-items: center;
  flex: 1;
  min-height: auto;
  padding-left: 24rpx;
}

:deep(.uni-easyinput) {
  border: none;
  background: transparent;
  flex: 1;
}

:deep(.uni-easyinput__content) {
  padding: 0;
  min-height: auto;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  flex: 1;
}

:deep(.uni-easyinput__content-input) {
  font-size: 28rpx;
  color: #1a1a1a;
  padding: 0;
  line-height: 1.5;
  letter-spacing: -0.3rpx;
}

:deep(.uni-easyinput__content-textarea) {
  padding: 0;
  min-height: auto;
  display: flex;
  align-items: flex-start;
}

:deep(.uni-easyinput__content-textarea .uni-easyinput__content-input) {
  padding: 0;
  min-height: 60rpx;
}

/* textarea 类型的表单项，label 和内容都顶部对齐 */
:deep(.textarea-item) {
  align-items: flex-start;
  padding-top: 32rpx;
  padding-bottom: 32rpx;
}

:deep(.textarea-item .uni-forms-item__label) {
  padding-top: 0;
  align-items: flex-start;
}

:deep(.uni-easyinput__placeholder-class) {
  color: #999999;
  font-size: 28rpx;
}

.picker-view {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  min-height: auto;
  flex: 1;
}

.picker-text {
  font-size: 28rpx;
  color: #1a1a1a;
  flex: 1;
  letter-spacing: -0.3rpx;
}

.picker-text.placeholder {
  color: #999999;
}

.button-section {
  margin-top: 48rpx;
  padding: 0 32rpx;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.save-btn {
  width: 100%;
  height: 96rpx;
  background-color: #1a1a1a;
  border-radius: 0;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: -0.5rpx;
}

.save-btn::after {
  border: none;
}

.save-btn:disabled {
  background-color: #e5e7eb;
  color: #999999;
  opacity: 1;
}
</style>
