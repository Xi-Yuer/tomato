<template>
  <view class="employee-stats-section">
    <uni-collapse>
      <uni-collapse-item :title="title" :open="false" :border="false">
        <view class="employee-stats-list">
          <view
            v-for="(employee, index) in employeeStats"
            :key="employee.userId"
            class="employee-stat-item"
          >
            <view class="employee-info-row">
              <image
                v-if="employee.userAvatar"
                :src="employee.userAvatar"
                mode="aspectFill"
                class="employee-avatar-small"
              ></image>
              <uni-icons
                v-else
                type="person-filled"
                size="24"
                color="#8c8c8c"
                class="employee-avatar-icon-small"
              ></uni-icons>
              <text class="employee-name-text">{{ employee.userName }}</text>
            </view>
            <text class="employee-duration-text">{{
              formatDuration(employee.totalMinutes)
            }}</text>
          </view>
          <!-- 总和统计 -->
          <view class="employee-total">
            <text class="total-label">总计：</text>
            <text class="total-value">{{
              formatDuration(totalMinutes)
            }}</text>
          </view>
        </view>
      </uni-collapse-item>
    </uni-collapse>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { formatDuration } from "@/utils/date";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  employeeStats: {
    type: Array,
    default: () => [],
  },
});

const totalMinutes = computed(() => {
  return props.employeeStats.reduce((sum, employee) => {
    return sum + (employee.totalMinutes || 0);
  }, 0);
});
</script>

<style lang="scss" scoped>
.employee-stats-section {
  margin-top: 16rpx;
  border-radius: 12rpx;
}

.employee-stats-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 24rpx 32rpx 32rpx;
}

.employee-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background-color: #ffffff;
  border-radius: 8rpx;
}

.employee-info-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex: 1;
}

.employee-avatar-small {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.employee-avatar-icon-small {
  flex-shrink: 0;
}

.employee-name-text {
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 500;
}

.employee-duration-text {
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 600;
}

.employee-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8rpx;
  padding-top: 12rpx;
  margin-top: 12rpx;
  border-top: 1rpx solid #f0f0f0;
}

.total-label {
  font-size: 24rpx;
  color: #8c8c8c;
}

.total-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}
</style>

