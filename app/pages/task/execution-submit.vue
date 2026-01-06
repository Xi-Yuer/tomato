<template>
  <view class="submit-container">
    <view class="content">
      <uni-forms ref="form" :model="formData" :rules="rules">
        <uni-forms-item label="完成状态" name="status">
          <picker
            mode="selector"
            :range="statusOptions"
            range-key="text"
            :value="statusIndex"
            @change="onStatusChange"
          >
            <view class="picker-view">
              <text class="picker-text">
                {{ statusOptions[statusIndex].text }}
              </text>
              <uni-icons type="arrowdown" size="16" color="#999999"></uni-icons>
            </view>
          </picker>
        </uni-forms-item>

        <uni-forms-item label="照片证据" name="photos">
          <view class="photo-upload-section">
            <view class="photo-list">
              <view
                v-for="(photo, index) in photoList"
                :key="index"
                class="photo-item-wrapper"
              >
                <image
                  :src="photo"
                  mode="aspectFill"
                  class="photo-item"
                  @click="previewImage(index)"
                ></image>
                <view
                  class="photo-delete"
                  @click="removePhoto(index)"
                >
                  <uni-icons type="close" size="16" color="#ffffff"></uni-icons>
                </view>
              </view>
              <view
                v-if="photoList.length < 10"
                class="photo-upload-btn"
                @click="choosePhoto"
              >
                <uni-icons type="camera" size="30" color="#999999"></uni-icons>
                <text class="upload-text">添加照片</text>
              </view>
            </view>
          </view>
        </uni-forms-item>

        <uni-forms-item label="备注" name="notes">
          <uni-easyinput
            v-model="formData.notes"
            placeholder="请输入备注信息（可选）"
            :clearable="true"
            :maxlength="200"
            type="textarea"
            :autoHeight="true"
            :styles="inputStyles"
          ></uni-easyinput>
        </uni-forms-item>
      </uni-forms>

      <view class="button-section">
        <button
          class="save-btn"
          @click="handleSave"
          :disabled="isLoading || isUploading"
        >
          {{ isLoading || isUploading ? "提交中..." : "提交" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { taskApi, BASE_URL } from "../../utils/api.js";
import { storage } from "../../utils/storage.js";

const form = ref(null);
const isLoading = ref(false);
const isUploading = ref(false);
const executionId = ref(null);
const photoList = ref([]);

const formData = ref({
  status: "completed",
  notes: "",
});

const statusOptions = [
  { value: "completed", text: "已完成" },
  { value: "in_progress", text: "进行中" },
  { value: "pending", text: "待执行" },
  { value: "overdue", text: "已逾期" },
];

const statusIndex = computed(() => {
  return statusOptions.findIndex(
    (option) => option.value === formData.value.status
  );
});

const rules = {
  status: {
    rules: [
      {
        required: true,
        errorMessage: "请选择完成状态",
      },
    ],
  },
};

const inputStyles = {
  borderColor: "transparent",
  backgroundColor: "transparent",
};

// 状态选择变化
const onStatusChange = (e) => {
  const index = e.detail.value;
  formData.value.status = statusOptions[index].value;
};

// 选择照片
const choosePhoto = () => {
  const remaining = 10 - photoList.value.length;
  uni.chooseImage({
    count: remaining,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: (res) => {
      photoList.value.push(...res.tempFilePaths);
    },
    fail: (error) => {
      console.error("选择图片失败:", error);
    },
  });
};

// 预览图片
const previewImage = (index) => {
  uni.previewImage({
    urls: photoList.value,
    current: index,
  });
};

// 删除照片
const removePhoto = (index) => {
  photoList.value.splice(index, 1);
};

// 上传照片
const uploadPhotos = async () => {
  if (photoList.value.length === 0) return [];

  isUploading.value = true;
  uni.showLoading({
    title: "上传照片中...",
    mask: true,
  });

  try {
    const token = storage.getToken();

    const uploadPromises = photoList.value.map((filePath) => {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: `${BASE_URL}/task-executions/upload`,
          filePath: filePath,
          name: "files",
          header: {
            Authorization: `Bearer ${token}`,
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data);
              // 检查响应格式
              if (res.statusCode === 200 || res.statusCode === 201) {
                // 如果返回的是统一格式 { code, message, data }
                if (data.code === 200 && data.data && data.data.files) {
                  // 返回第一个文件的URL
                  resolve(data.data.files[0]);
                } else if (data.files && data.files.length > 0) {
                  // 直接返回 files 数组
                  resolve(data.files[0]);
                } else {
                  reject(new Error(data.message || "上传失败"));
                }
              } else {
                reject(new Error(data.message || "上传失败"));
              }
            } catch (error) {
              reject(error);
            }
          },
          fail: (error) => {
            reject(error);
          },
        });
      });
    });

    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error("上传照片失败:", error);
    throw error;
  } finally {
    isUploading.value = false;
    uni.hideLoading();
  }
};

// 加载任务执行记录
const loadExecution = async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const id = currentPage.options?.id;

  if (!id) {
    uni.showToast({
      title: "参数错误",
      icon: "none",
    });
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
    return;
  }

  executionId.value = parseInt(id);

  try {
    const res = await taskApi.getTaskExecutionDetail(executionId.value);
    if (res) {
      formData.value.status = res.status || "completed";
      formData.value.notes = res.notes || "";
      if (res.photoEvidence) {
        photoList.value = res.photoEvidence
          .split(",")
          .filter((url) => url.trim());
      }
    }
  } catch (error) {
    console.error("获取任务详情失败:", error);
  }
};

// 保存
const handleSave = async () => {
  if (isLoading.value || isUploading.value) return;

  try {
    await form.value.validate();
  } catch (error) {
    console.error("表单验证失败:", error);
    return;
  }

  isLoading.value = true;

  try {
    uni.showLoading({
      title: "提交中...",
      mask: true,
    });

    // 上传照片
    let photoUrls = [];
    if (photoList.value.length > 0) {
      photoUrls = await uploadPhotos();
    }

    // 提交任务执行记录
    const submitData = {
      status: formData.value.status,
      photoUrls: photoUrls,
      notes: formData.value.notes || null,
    };

    await taskApi.submitTaskExecution(executionId.value, submitData);

    uni.hideLoading();
    uni.showToast({
      title: "提交成功",
      icon: "success",
    });

    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    uni.hideLoading();
    console.error("提交失败:", error);
    uni.showToast({
      title: `提交失败: ${error.message || "未知错误"}`,
      icon: "none",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadExecution();
});
</script>

<style lang="scss" scoped>
.submit-container {
  min-height: 100vh;
  background-color: #ffffff;
}

.content {
  padding: 0;
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
}

:deep(.uni-forms-item__label) {
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 500;
  padding: 32rpx 0;
  width: 140rpx !important;
  letter-spacing: -0.3rpx;
}

.picker-view {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0;
  min-height: auto;
}

.picker-text {
  font-size: 28rpx;
  color: #1a1a1a;
  flex: 1;
  letter-spacing: -0.3rpx;
}

.photo-upload-section {
  padding: 32rpx 0;
}

.photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.photo-item-wrapper {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.photo-item {
  width: 100%;
  height: 100%;
  border-radius: 0;
  background-color: #f5f5f5;
}

.photo-delete {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #d1d5db;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background-color: #fafafa;
}

.upload-text {
  font-size: 22rpx;
  color: #999999;
}

:deep(.uni-easyinput) {
  border: none;
  background: transparent;
}

:deep(.uni-easyinput__content) {
  padding: 32rpx 0;
  min-height: auto;
  border: none;
  background: transparent;
}

:deep(.uni-easyinput__content-textarea) {
  font-size: 28rpx;
  color: #1a1a1a;
  padding: 0;
  min-height: 120rpx;
  line-height: 1.6;
  width: 100%;
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

