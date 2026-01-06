<template>
  <view
    :class="['task-card', cardClass]"
    @click="handleClick"
  >
    <!-- 任务标题和时间/状态标签 -->
    <view class="task-header-row">
      <text
        class="task-name"
        :class="{
          'task-name-completed': task.execution?.status === 'completed',
        }"
        >{{ task.name }}</text
      >
      <!-- 已完成：显示时间 -->
      <view
        v-if="
          task.execution?.status === 'completed' &&
          task.execution.completedAt
        "
        class="time-badge"
      >
        <text class="time-text">{{
          "提交时间：" + formatTimeOnly(task.execution.completedAt)
        }}</text>
      </view>
      <!-- 进行中：显示状态标签 -->
      <view
        v-else-if="
          task.execution?.status === 'pending' ||
          task.execution?.status === 'in_progress'
        "
        class="status-tag"
      >
        <text class="status-tag-text">进行中</text>
      </view>
      <!-- 待完成：显示触发时间 -->
      <view v-else-if="moduleStartTime" class="trigger-time">
        <text class="trigger-text"
          >{{ moduleStartTime }} 触发</text
        >
      </view>
    </view>

    <!-- 任务内容区域 -->
    <view class="task-body">
      <!-- 已完成：显示照片（最多3张） -->
      <view
        v-if="
          task.execution?.status === 'completed' &&
          task.execution.photoEvidence
        "
        class="task-photos"
      >
        <view
          v-for="(photo, index) in getPhotos(task.execution.photoEvidence)"
          :key="index"
          class="photo-item"
        >
          <image
            :src="photo"
            mode="aspectFill"
            class="photo-thumbnail"
            @click.stop="previewPhotos(task.execution.photoEvidence, index)"
          />
        </view>
      </view>
      <!-- 已完成：显示备注信息 -->
      <view
        v-if="
          task.execution?.status === 'completed' && task.execution.notes
        "
        class="task-notes"
      >
        <text class="task-notes-text">{{ task.execution.notes }}</text>
      </view>
      <!-- 进行中：显示描述信息 -->
      <view
        v-if="
          (task.execution?.status === 'pending' ||
            task.execution?.status === 'in_progress') &&
          task.description
        "
        class="task-description"
      >
        <text>{{ task.description }}</text>
      </view>

      <!-- 待完成：显示触发时间（带图标） -->
      <view
        v-if="
          !task.execution ||
          (task.execution?.status !== 'completed' &&
            task.execution?.status !== 'pending' &&
            task.execution?.status !== 'in_progress')
        "
        class="trigger-info"
      >
        <text class="trigger-icon">
          <uni-icons type="clock" size="16" color="#8c8c8c"></uni-icons>
        </text>
        <text class="trigger-text"
          >{{ moduleStartTime || "待触发" }} 触发</text
        >
      </view>
    </view>

    <!-- 操作按钮（进行中） -->
    <view
      v-if="
        task.execution?.status === 'pending' ||
        task.execution?.status === 'in_progress'
      "
      class="task-actions"
    >
      <button class="action-btn" @click.stop="handleTakePhoto">
        <uni-icons
          type="camera-filled"
          size="16"
          color="#ffffff"
        ></uni-icons>
        <text class="btn-text">去完成</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { formatTimeOnly } from "@/utils/date";
import { getPhotos, previewPhotos } from "@/utils/task";

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  moduleStartTime: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["click", "take-photo"]);

const cardClass = computed(() => {
  const status = props.task.execution?.status;
  if (
    !status ||
    (status !== "completed" &&
      status !== "pending" &&
      status !== "in_progress")
  ) {
    return "card-pending";
  }
  return "";
});

const handleClick = () => {
  emit("click", props.task);
};

const handleTakePhoto = () => {
  emit("take-photo", props.task);
};
</script>

<style lang="scss" scoped>
.task-card {
  flex: 1;
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  position: relative;

  &.card-pending {
    border: 1px dashed #d9d9d9;
  }
}

.task-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.task-name {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  flex: 1;
  line-height: 1.5;
}

.task-name-completed {
  text-decoration: line-through;
  color: #8c8c8c;
}

.time-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  border-radius: 12px;
  padding: 4px 10px;
  margin-left: 12px;
  flex-shrink: 0;
}

.time-text {
  font-size: 12px;
  color: white;
  font-weight: 400;
  margin-left: 4px;
}

.status-tag {
  margin-left: 12px;
  flex-shrink: 0;
}

.status-tag-text {
  display: inline-block;
  padding: 4px 12px;
  background-color: #f0f0ff;
  color: #722ed1;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
}

.trigger-time {
  margin-left: 12px;
  flex-shrink: 0;
}

.trigger-text {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 400;
}

.task-body {
  margin-bottom: 12px;
}

.task-description {
  margin-top: 0;
  margin-bottom: 0;

  text {
    font-size: 14px;
    color: #595959;
    line-height: 1.6;
    display: block;
  }
}

.trigger-info {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.trigger-icon {
  font-size: 14px;
  margin-right: 6px;
  color: #8c8c8c;
}

.task-photos {
  margin-top: 0;
  margin-bottom: 0;
  display: flex;
  flex-wrap: wrap;
}

.photo-item {
  flex: 0 0 calc(33.333% - 6px);
  width: calc(33.333% - 6px);
}

.photo-thumbnail {
  width: 150rpx;
  height: 150rpx;
  border-radius: 6px;
  object-fit: cover;
  background-color: #f5f5f5;
}

.task-notes {
  margin-top: 8px;
}

.task-notes-text {
  font-size: 12px;
  color: #8c8c8c;
  font-weight: 400;
  line-height: 1.4;
  display: block;
  text-align: left;
}

.task-actions {
  margin-top: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  padding: 0px 18px;
  font-size: 14px;
  font-weight: 500;
  min-height: 36px;
  box-shadow: none;

  &::after {
    border: none;
  }

  &:active {
    background-color: #333333;
    opacity: 0.9;
  }
}

.btn-text {
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  color: #ffffff;
  margin-left: 6px;
}
</style>

