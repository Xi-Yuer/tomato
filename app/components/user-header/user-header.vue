<template>
  <view class="user-header">
    <view class="greeting-section">
      <text class="greeting-text"
        >{{ greeting }}{{ userInfo?.name || "用户" }}</text
      >
      <text class="location-text" v-if="locationInfo">
        {{ locationInfo }}
      </text>
    </view>
    <view class="avatar-section">
      <view class="avatar-wrapper">
        <image
          v-if="userInfo?.avatar"
          :src="userInfo.avatar"
          mode="aspectFill"
          class="avatar-image"
        ></image>
        <uni-icons
          v-else
          type="person-filled"
          size="40"
          color="#8c8c8c"
        ></uni-icons>
        <view class="notification-dot"></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { getGreeting } from "@/utils/date";

const props = defineProps({
  userInfo: {
    type: Object,
    default: null,
  },
  locationInfo: {
    type: String,
    default: "",
  },
});

const greeting = computed(() => getGreeting());
</script>

<style lang="scss" scoped>
.user-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 16px 16px 16px;
}

.greeting-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.greeting-text {
  font-size: 28px;
  font-weight: 700;
  font-style: italic;
  color: #1a1a1a;
  line-height: 1.2;
  margin-bottom: 4px;
}

.location-text {
  margin-left: 12rpx;
  font-size: 14px;
  color: #6b7280;
  font-weight: 400;
  line-height: 1.4;
}

.avatar-section {
  flex-shrink: 0;
  margin-left: 16px;
}

.avatar-wrapper {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.notification-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #52c41a;
  border: 2px solid #ffffff;
}
</style>

