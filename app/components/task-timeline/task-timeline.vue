<template>
  <view class="task-item" :class="statusClass">
    <!-- 左侧时间线 -->
    <view class="timeline-indicator">
      <view :class="['timeline-dot', statusClass]">
        <!-- 已完成：绿色对勾 -->
        <text v-if="status === 'completed'" class="check-icon">✓</text>
        <!-- 进行中：蓝色圆点 -->
        <view
          v-else-if="status === 'pending' || status === 'in_progress'"
          class="progress-dot"
        ></view>
        <!-- 待完成：灰色数字 -->
        <text v-else class="task-number">{{ index + 1 }}</text>
      </view>
      <!-- 时间线连接线 -->
      <view v-if="!isLast" :class="['timeline-line', lineClass]"></view>
    </view>

    <!-- 任务卡片内容 -->
    <view class="task-card-container">
      <task-card
        :task="task"
        :module-start-time="moduleStartTime"
        @click="handleTaskClick"
        @take-photo="handleTakePhoto"
      />
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import TaskCard from "../task-card/task-card.vue";
import { getStatusClass, getLineClass } from "@/utils/task";

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  isLast: {
    type: Boolean,
    default: false,
  },
  moduleStartTime: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["task-click", "take-photo"]);

const status = computed(() => props.task.execution?.status);
const statusClass = computed(() => getStatusClass(status.value));
const lineClass = computed(() => getLineClass(status.value));

const handleTaskClick = (task) => {
  emit("task-click", task);
};

const handleTakePhoto = (task) => {
  emit("take-photo", task);
};
</script>

<style lang="scss" scoped>
.task-item {
  display: flex;
  position: relative;
  margin-bottom: 16px;
  padding-bottom: 0;

  &:last-child {
    padding-bottom: 0;
    margin-bottom: 0;
  }
}

.timeline-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 16px;
  position: relative;
  width: 10px;
  flex-shrink: 0;
}

.timeline-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  flex-shrink: 0;

  &.status-completed {
    background-color: #52c41a;
    color: #ffffff;
  }

  &.status-in-progress {
    background-color: #1890ff;
  }

  &.status-pending {
    background-color: #000000;
    color: #ffffff;
  }

  &.status-overdue {
    background-color: #ff4d4f;
    color: #ffffff;
  }
}

.check-icon {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.progress-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ffffff;
}

.task-number {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1;
}

.timeline-line {
  width: 2px;
  flex: 1;
  min-height: 24px;
  margin-top: 4px;
  background-color: #1890ff;

  &.line-completed {
    background-color: #52c41a;
  }

  &.line-in-progress {
    background-color: #000000;
  }

  &.line-pending {
    background-color: #d9d9d9;
  }
}

.task-card-container {
  flex: 1;
  margin-bottom: 30rpx;
}
</style>
