<template>
  <view class="detail-container">
    <view class="content">
      <!-- 任务信息 -->
      <view class="info-section">
        <view class="info-item">
          <text class="info-label">任务名称</text>
          <text class="info-value">{{ execution?.task?.name || "" }}</text>
        </view>
        <view class="info-item" v-if="execution?.task?.description">
          <text class="info-label">任务描述</text>
          <text class="info-value">{{ execution.task.description }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">所属模块</text>
          <text class="info-value">{{
            execution?.task?.module?.name || ""
          }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">执行日期</text>
          <text class="info-value">{{
            formatDate(execution?.executionDate)
          }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">当前状态</text>
          <view class="info-value">
            <view :class="['status-badge', getStatusClass(execution?.status)]">
              {{ getStatusText(execution?.status) }}
            </view>
          </view>
        </view>
        <view class="info-item" v-if="execution?.user">
          <text class="info-label">执行人</text>
          <view class="info-value user-info">
            <image
              v-if="execution.user.avatar"
              :src="execution.user.avatar"
              mode="aspectFill"
              class="user-avatar"
            ></image>
            <text class="user-name">{{ execution.user.name }}</text>
            <text class="user-phone" v-if="execution.user.phone">
              {{ execution.user.phone }}
            </text>
          </view>
        </view>
        <view class="info-item" v-if="execution?.completedAt">
          <text class="info-label">完成时间</text>
          <text class="info-value">{{
            formatDateTime(execution.completedAt)
          }}</text>
        </view>
      </view>

      <!-- 照片证据 -->
      <view class="photo-section" v-if="execution?.photoEvidence">
        <text class="section-title">照片证据</text>
        <view class="photo-list">
          <image
            v-for="(photo, index) in photoList"
            :key="index"
            :src="photo"
            mode="aspectFill"
            class="photo-item"
            @click="previewImage(index)"
          ></image>
        </view>
      </view>

      <!-- 备注信息 -->
      <view class="notes-section" v-if="execution?.notes">
        <text class="section-title">备注信息</text>
        <text class="notes-content">{{ execution.notes }}</text>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <button
          class="action-btn submit-btn"
          @click="handleSubmit"
          :disabled="execution?.status === 'completed'"
        >
          {{ execution?.status === "completed" ? "已完成" : "去完成" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { taskApi } from "../../utils/api.js";

const execution = ref(null);
const executionId = ref(null);

// 照片列表
const photoList = computed(() => {
  if (!execution.value?.photoEvidence) return [];
  return execution.value.photoEvidence.split(",").filter((url) => url.trim());
});

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: "待执行",
    in_progress: "进行中",
    completed: "已完成",
    overdue: "已逾期",
  };
  return statusMap[status] || status || "未知";
};

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    pending: "status-pending",
    in_progress: "status-progress",
    completed: "status-completed",
    overdue: "status-overdue",
  };
  return classMap[status] || "";
};

// 预览图片
const previewImage = (index) => {
  uni.previewImage({
    urls: photoList.value,
    current: index,
  });
};

// 加载任务执行记录详情
const loadExecutionDetail = async () => {
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
      execution.value = res;
    }
  } catch (error) {
    console.error("获取任务详情失败:", error);
    uni.showToast({
      title: "获取任务详情失败",
      icon: "none",
    });
  }
};

// 提交任务完成
const handleSubmit = () => {
  uni.navigateTo({
    url: `/pages/task/execution-submit?id=${executionId.value}`,
  });
};

onShow(() => {
  loadExecutionDetail();
});
</script>

<style lang="scss" scoped>
.detail-container {
  background-color: #fafafa90;
}

.content {
  padding: 0;
}

.info-section {
  padding: 0;
  margin-bottom: 16rpx;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f3f4f6;
  min-height: 96rpx;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #6b7280;
  font-weight: 400;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  font-size: 28rpx;
  color: #111827;
  font-weight: 400;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-direction: row;
  justify-content: flex-end;
}

.user-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background-color: #f3f4f6;
  flex-shrink: 0;
}

.user-name {
  font-size: 28rpx;
  color: #111827;
  font-weight: 400;
}

.user-phone {
  font-size: 24rpx;
  color: #6b7280;
  font-weight: 400;
}

.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 500;
  display: inline-block;
}

.status-badge.status-pending {
  background-color: #fef3c7;
  color: #d97706;
}

.status-badge.status-progress {
  background-color: #dbeafe;
  color: #2563eb;
}

.status-badge.status-completed {
  background-color: #d1fae5;
  color: #059669;
}

.status-badge.status-overdue {
  background-color: #fee2e2;
  color: #dc2626;
}

.photo-section,
.notes-section {
  padding: 32rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111827;
  margin-bottom: 24rpx;
  display: block;
}

.photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.photo-item {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background-color: #f3f4f6;
  overflow: hidden;
  transition: opacity 0.2s;
}

.photo-item:active {
  opacity: 0.8;
}

.notes-content {
  font-size: 28rpx;
  color: #374151;
  line-height: 1.8;
}

.action-section {
  padding: 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
}

.action-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.submit-btn {
  background-color: #111827;
  color: #ffffff;
}

.submit-btn::after {
  border: none;
}

.submit-btn:active {
  background-color: #1f2937;
  transform: translateY(1rpx);
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
}

.submit-btn:disabled {
  background-color: #e5e7eb;
  color: #9ca3af;
  box-shadow: none;
  opacity: 1;
}
</style>
