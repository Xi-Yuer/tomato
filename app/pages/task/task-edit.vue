<template>
  <view class="edit-container">
    <view class="form-section">
      <uni-forms ref="form" :model="formData" :rules="rules">
        <uni-forms-item label="所属模块" name="moduleId">
          <picker
            mode="selector"
            :range="moduleOptions"
            range-key="name"
            :value="moduleIndex"
            @change="onModuleChange"
            :disabled="!!moduleId"
          >
            <view class="picker-view">
              <text
                class="picker-text"
                :class="{ placeholder: !formData.moduleId }"
              >
                {{ selectedModuleName || "请选择所属模块" }}
              </text>
              <uni-icons
                v-if="!moduleId"
                type="arrowdown"
                size="16"
                color="#999999"
              ></uni-icons>
            </view>
          </picker>
        </uni-forms-item>

        <uni-forms-item label="任务名称" name="name">
          <uni-easyinput
            v-model="formData.name"
            placeholder="请输入任务名称"
            :clearable="true"
            :maxlength="100"
            :styles="inputStyles"
          ></uni-easyinput>
        </uni-forms-item>

        <uni-forms-item label="描述" name="description" class="textarea-item">
          <uni-easyinput
            v-model="formData.description"
            placeholder="请输入任务描述"
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
import { ref, onMounted, computed } from "vue";
import { taskApi } from "../../utils/api.js";

const form = ref(null);
const isLoading = ref(false);
const isEdit = ref(false);
const taskId = ref(null);
const moduleId = ref(null);
const moduleOptions = ref([]);
const moduleIndex = ref(0);

const formData = ref({
  name: "",
  moduleId: null,
  description: "",
});

const selectedModuleName = computed(() => {
  if (!formData.value.moduleId) return "";
  const module = moduleOptions.value.find(
    (m) => m.id === formData.value.moduleId
  );
  return module ? module.name : "";
});

const rules = {
  name: {
    rules: [
      {
        required: true,
        errorMessage: "请输入任务名称",
      },
    ],
  },
  moduleId: {
    rules: [
      {
        required: true,
        errorMessage: "请选择所属模块",
      },
    ],
  },
};

const inputStyles = {
  borderColor: "transparent",
  backgroundColor: "transparent",
};

// 获取模块列表
const getModules = async () => {
  try {
    const res = await taskApi.getModules();
    if (res) {
      moduleOptions.value = res;
    }
  } catch (error) {
    console.error("获取模块列表失败:", error);
  }
};

// 模块选择变化
const onModuleChange = (e) => {
  const index = e.detail.value;
  moduleIndex.value = index;
  formData.value.moduleId = moduleOptions.value[index].id;
};

// 获取任务信息
const getTaskInfo = async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const id = currentPage.options?.id;
  const mId = currentPage.options?.moduleId;
  const mName = currentPage.options?.moduleName;

  if (mId) {
    moduleId.value = parseInt(mId);
    formData.value.moduleId = moduleId.value;
  }

  if (id) {
    isEdit.value = true;
    taskId.value = parseInt(id);

    try {
      // 直接通过ID获取任务详情
      const res = await taskApi.getTaskDetail(taskId.value);
      if (res) {
        formData.value = {
          name: res.name || "",
          moduleId: res.moduleId || moduleId.value,
          description: res.description || "",
        };

        // 设置模块索引
        const index = moduleOptions.value.findIndex(
          (m) => m.id === res.moduleId
        );
        moduleIndex.value = index >= 0 ? index : 0;
      }
    } catch (error) {
      console.error("获取任务信息失败:", error);
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

    // 确保数据类型正确
    const data = {
      name: formData.value.name.trim(),
      moduleId: Number(formData.value.moduleId),
      description: formData.value.description
        ? formData.value.description.trim()
        : null,
    };

    // 验证必填字段
    if (!data.name) {
      uni.showToast({
        title: "请输入任务名称",
        icon: "none",
      });
      isLoading.value = false;
      return;
    }

    if (!data.moduleId) {
      uni.showToast({
        title: "请选择所属模块",
        icon: "none",
      });
      isLoading.value = false;
      return;
    }

    if (isEdit.value) {
      await taskApi.updateTask(taskId.value, data);
    } else {
      await taskApi.createTask(data);
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

onMounted(async () => {
  await getModules();
  await getTaskInfo();
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

:deep(.uni-easyinput__placeholder-class) {
  color: #999999;
  font-size: 28rpx;
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
