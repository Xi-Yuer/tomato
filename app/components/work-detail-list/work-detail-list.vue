<template>
  <view class="work-detail-section">
    <uni-collapse>
      <uni-collapse-item :title="title" :open="false" :border="false">
        <view v-if="records.length > 0" class="records-list">
          <view
            v-for="(record, index) in records"
            :key="index"
            class="record-item"
          >
            <!-- 管理员视图显示员工信息 -->
            <view v-if="isAdmin" class="employee-info">
              <image
                v-if="record.userAvatar"
                :src="record.userAvatar"
                mode="aspectFill"
                class="employee-avatar"
              ></image>
              <uni-icons
                v-else
                type="person-filled"
                size="32"
                color="#8c8c8c"
                class="employee-avatar-icon"
              ></uni-icons>
              <text class="employee-name">{{ record.userName }}</text>
            </view>
            <!-- 班次列表 -->
            <view class="sessions-list">
              <view
                v-for="(session, sessionIndex) in record.sessions"
                :key="sessionIndex"
                class="session-item"
              >
                <view class="session-time">
                  <text class="time-text">{{
                    formatTimeOnly(session.startTime)
                  }}</text>
                  <text class="time-separator">-</text>
                  <text class="time-text">{{
                    formatTimeOnly(session.endTime)
                  }}</text>
                </view>
                <text class="session-duration">{{
                  formatDuration(session.duration)
                }}</text>
              </view>
            </view>
            <!-- 当日总时长 -->
            <view class="daily-total">
              <text class="total-label">当日总计：</text>
              <text class="total-value">{{
                formatDuration(record.totalDuration)
              }}</text>
            </view>
          </view>
        </view>
        <view v-else class="empty-state">
          <text class="empty-text">暂无打卡记录</text>
        </view>
      </uni-collapse-item>
    </uni-collapse>
  </view>
</template>

<script setup>
import { formatTimeOnly, formatDuration } from "@/utils/date";

defineProps({
  title: {
    type: String,
    required: true,
  },
  records: {
    type: Array,
    default: () => [],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.work-detail-section {
  margin-top: 16rpx;
  border-radius: 12rpx;
}

.records-list {
  padding: 24rpx 32rpx;
}

.record-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.employee-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.employee-avatar-icon {
  flex-shrink: 0;
}

.employee-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.sessions-list {
  margin-bottom: 12rpx;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
}

.session-time {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.time-text {
  font-size: 26rpx;
  color: #1a1a1a;
}

.time-separator {
  font-size: 26rpx;
  color: #8c8c8c;
}

.session-duration {
  font-size: 26rpx;
  color: #8c8c8c;
}

.daily-total {
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

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #8c8c8c;
}
</style>

