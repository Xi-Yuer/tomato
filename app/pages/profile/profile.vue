<template>
  <view class="profile-container">
    <!-- 用户信息卡片 -->
    <view class="user-info-card">
      <view class="user-avatar">
        <image
          v-if="userInfo?.avatar"
          :src="userInfo.avatar"
          mode="aspectFill"
          class="avatar-image"
        ></image>
        <uni-icons
          v-else
          type="person-filled"
          size="60"
          color="#6366f1"
        ></uni-icons>
      </view>
      <view class="user-details">
        <view class="user-name-row">
          <text class="user-name">{{ userInfo?.name || "未设置" }}</text>
          <view v-if="userInfo?.isAdmin" class="admin-badge">
            <uni-icons type="staff" size="14" color="#ffffff"></uni-icons>
            <text class="admin-text">管理员</text>
          </view>
        </view>
        <text class="user-phone">{{ userInfo?.phone || "" }}</text>
        <text v-if="userInfo?.address" class="user-address">
          <uni-icons type="location" size="14" color="#9ca3af"></uni-icons>
          {{ userInfo.address }}
        </text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="function-list">
      <uni-list>
        <uni-list-item
          title="编辑资料"
          :clickable="true"
          :show-arrow="true"
          @click="handleEditProfile"
        >
          <template v-slot:header>
            <view class="list-item-icon">
              <uni-icons type="compose" size="20" color="#000000"></uni-icons>
            </view>
          </template>
        </uni-list-item>

        <uni-list-item
          v-if="userInfo?.isAdmin"
          title="任务管理"
          :clickable="true"
          :show-arrow="true"
          @click="handleTaskManagement"
        >
          <template v-slot:header>
            <view class="list-item-icon">
              <uni-icons type="list" size="20" color="#000000"></uni-icons>
            </view>
          </template>
        </uni-list-item>

        <uni-list-item
          v-if="userInfo?.isAdmin"
          title="添加用户"
          :clickable="true"
          :show-arrow="true"
          @click="handleAddUser"
        >
          <template v-slot:header>
            <view class="list-item-icon">
              <uni-icons type="person" size="20" color="#000000"></uni-icons>
            </view>
          </template>
        </uni-list-item>

        <uni-list-item
          title="关于"
          :clickable="true"
          :show-arrow="true"
          @click="handleAbout"
        >
          <template v-slot:header>
            <view class="list-item-icon">
              <uni-icons type="info" size="20" color="#000000"></uni-icons>
            </view>
          </template>
        </uni-list-item>
      </uni-list>

      <!-- 退出登录按钮 -->
      <view class="logout-section">
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { onShow, onTabItemTap } from "@dcloudio/uni-app";
import { storage } from "../../utils/storage.js";
import { userApi } from "../../utils/api.js";

const userInfo = ref(null);

// 双击刷新相关
const lastTabTapTime = ref(0);
const lastTabIndex = ref(-1);
const DOUBLE_TAP_DELAY = 500; // 双击间隔时间（毫秒）

// 获取用户信息
const getUserInfo = async () => {
  // 先从本地存储获取
  const localUser = storage.getUser();
  if (localUser) {
    userInfo.value = localUser;
  }

  // 从服务器获取最新信息
  try {
    const res = await userApi.getUserInfo();
    if (res) {
      userInfo.value = res;
      // 更新本地存储
      storage.setUser(res);
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    // 如果服务器获取失败，使用本地存储的信息
    if (!userInfo.value) {
      uni.showToast({
        title: "获取用户信息失败",
        icon: "none",
      });
    }
  }
};

// 编辑资料
const handleEditProfile = () => {
  console.log("handleEditProfile");
  uni.navigateTo({
    url: "/pages/profile/edit",
  });
};

// 任务管理
const handleTaskManagement = () => {
  uni.navigateTo({
    url: "/pages/task/management",
  });
};

// 添加用户
const handleAddUser = () => {
  uni.navigateTo({
    url: "/pages/profile/add-user",
  });
};

// 关于
const handleAbout = () => {
  uni.showModal({
    title: "关于",
    content: "凯德溜冰土豆\nKade Ice Cream Tomato\n版本 1.0.0",
    showCancel: false,
    confirmText: "确定",
  });
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: "提示",
    content: "确定要退出登录吗？",
    success: (res) => {
      if (res.confirm) {
        // 清除登录信息
        storage.clearAuth();
        userInfo.value = null;

        uni.showToast({
          title: "已退出登录",
          icon: "success",
        });

        // 跳转到登录页
        setTimeout(() => {
          uni.reLaunch({
            url: "/pages/login/login",
          });
        }, 1500);
      }
    },
  });
};

onMounted(() => {
  getUserInfo();
});

// 页面显示时刷新用户信息（从编辑页面返回时）
onShow(() => {
  getUserInfo();
});

// 监听tabBar点击事件，实现双击刷新
onTabItemTap((e) => {
  const currentTime = Date.now();
  const currentTabIndex = e.index;
  
  // 判断是否为双击（同一tab，间隔小于500ms）
  if (
    lastTabIndex.value === currentTabIndex &&
    currentTime - lastTabTapTime.value < DOUBLE_TAP_DELAY
  ) {
    // 双击刷新
    uni.showToast({
      title: "刷新中...",
      icon: "loading",
      duration: 1000,
    });
    getUserInfo();
  }
  
  // 更新记录
  lastTabTapTime.value = currentTime;
  lastTabIndex.value = currentTabIndex;
});
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  padding-bottom: 40rpx;
}

/* 用户信息卡片 */
.user-info-card {
  background: linear-gradient(135deg, #000000 80%, #ffffff 100%);
  padding: 60rpx 40rpx 40rpx;
  display: flex;
  align-items: center;
  color: #ffffff;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 60rpx;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: 600;
  margin-right: 16rpx;
}

.admin-badge {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.25);
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  backdrop-filter: blur(10rpx);
}

.admin-text {
  font-size: 20rpx;
  margin-left: 4rpx;
  color: #ffffff;
}

.user-phone {
  font-size: 28rpx;
  opacity: 0.9;
  margin-bottom: 8rpx;
}

.user-address {
  font-size: 24rpx;
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

/* 功能列表 */
.function-list {
  background-color: #ffffff;
  margin: 0 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
  padding-bottom: 40rpx;
}

.list-item-icon {
  margin-right: 20rpx;
  display: flex;
  align-items: center;
}

/* 退出登录按钮 */
.logout-section {
  margin-top: 40rpx;
  padding: 0 20rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background-color: #000000;
  border-radius: 16rpx;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 500;
  border: 2rpx solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.logout-btn::after {
  border: none;
}

.logout-btn:active {
  background-color: #000000;
  border-color: #fecaca;
}
</style>
