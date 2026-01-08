<template>
  <view class="stats-section">
    <view class="stat-card">
      <text class="stat-value">{{ attendanceDays }}</text>
      <text class="stat-label">打卡天数</text>
    </view>
    <view class="stat-card">
      <text class="stat-value">{{ totalWorkHours }}</text>
      <text class="stat-label">总工作时长</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  attendanceDays: {
    type: Number,
    required: true,
  },
  totalWorkHours: {
    type: String,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.stats-section {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  background-color: #ffffff50;
  margin-top: 16rpx;
  border-radius: 12rpx;
}

.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #8c8c8c;
}
</style>

