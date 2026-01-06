<template>
  <view class="edit-container">
    <view class="form-section">
      <!-- 头像上传 -->
      <view class="avatar-section">
        <view class="avatar-label">头像</view>
        <view class="avatar-upload" @click="handleChooseAvatar">
          <image
            v-if="avatarPreview"
            :src="avatarPreview"
            mode="aspectFill"
            class="avatar-preview"
          ></image>
          <view v-else class="avatar-placeholder">
            <uni-icons type="camera" size="40" color="#9ca3af"></uni-icons>
            <text class="avatar-placeholder-text">点击上传头像</text>
          </view>
          <view v-if="avatarPreview" class="avatar-mask">
            <uni-icons
              type="camera-filled"
              size="30"
              color="#ffffff"
            ></uni-icons>
          </view>
        </view>
      </view>

      <uni-forms ref="form" :model="formData" :rules="rules">
        <uni-forms-item label="姓名" name="name">
          <uni-easyinput
            v-model="formData.name"
            placeholder="请输入姓名"
            :clearable="true"
            :maxlength="50"
            :styles="inputStyles"
          ></uni-easyinput>
        </uni-forms-item>

        <uni-forms-item label="性别" name="gender">
          <picker
            mode="selector"
            :range="genderOptions"
            range-key="text"
            :value="genderIndex"
            @change="onGenderChange"
            style="margin-left: 20rpx"
          >
            <view class="picker-view">
              <text
                class="picker-text"
                :class="{ placeholder: !formData.gender }"
              >
                {{ formData.gender || "请选择性别" }}
              </text>
              <uni-icons type="arrowdown" size="16" color="#9ca3af"></uni-icons>
            </view>
          </picker>
        </uni-forms-item>

        <uni-forms-item label="地址" name="address">
          <uni-easyinput
            v-model="formData.address"
            placeholder="请输入地址"
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
import { ref, onMounted } from "vue";
import { userApi } from "../../utils/api.js";
import { storage } from "../../utils/storage.js";

const form = ref(null);
const isLoading = ref(false);
const avatarPreview = ref("");
const isUploadingAvatar = ref(false);

const formData = ref({
  name: "",
  gender: "",
  address: "",
  avatar: "",
});

const rules = {
  name: {
    rules: [
      {
        required: false,
        errorMessage: "请输入姓名",
      },
      {
        minLength: 1,
        maxLength: 50,
        errorMessage: "姓名长度在1-50个字符之间",
      },
    ],
  },
  gender: {
    rules: [
      {
        required: false,
        errorMessage: "请选择性别",
      },
    ],
  },
  address: {
    rules: [
      {
        required: false,
        errorMessage: "请输入地址",
      },
      {
        maxLength: 200,
        errorMessage: "地址长度不能超过200个字符",
      },
    ],
  },
};

const genderOptions = [
  { value: "男", text: "男" },
  { value: "女", text: "女" },
  { value: "其他", text: "其他" },
];

const genderIndex = ref(0);

// 性别选择变化
const onGenderChange = (e) => {
  const index = e.detail.value;
  genderIndex.value = index;
  formData.value.gender = genderOptions[index].value;
};

// 初始化性别索引
const initGenderIndex = () => {
  if (formData.value.gender) {
    const index = genderOptions.findIndex(
      (item) => item.value === formData.value.gender
    );
    genderIndex.value = index >= 0 ? index : 0;
  }
};

const inputStyles = {
  borderColor: "transparent",
  backgroundColor: "transparent",
};

// 获取用户信息
const getUserInfo = async () => {
  try {
    const user = storage.getUser();
    if (user) {
      formData.value = {
        name: user.name || "",
        gender: user.gender || "",
        address: user.address || "",
        avatar: user.avatar || "",
      };
      avatarPreview.value = user.avatar || "";
      initGenderIndex();
    }

    // 从服务器获取最新信息
    const res = await userApi.getUserInfo();
    if (res) {
      formData.value = {
        name: res.name || "",
        gender: res.gender || "",
        address: res.address || "",
        avatar: res.avatar || "",
      };
      avatarPreview.value = res.avatar || "";
      initGenderIndex();
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

// 选择头像
const handleChooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0];
      avatarPreview.value = tempFilePath;
      console.log("tempFilePath", tempFilePath);
      // 立即上传头像
      await handleUploadAvatar(tempFilePath);
    },
    fail: (error) => {
      console.error("选择图片失败:", error);
    },
  });
};

// 上传头像
const handleUploadAvatar = async (filePath) => {
  if (isUploadingAvatar.value) return;

  isUploadingAvatar.value = true;

  try {
    uni.showLoading({
      title: "上传中...",
      mask: true,
    });

    const res = await userApi.uploadAvatar(filePath);
    // 确保关闭Loading
    uni.hideLoading();

    if (res && res.data && res.data.avatar) {
      const avatarUrl = res.data.avatar;
      formData.value.avatar = avatarUrl;
      avatarPreview.value = avatarUrl;

      // 更新本地存储 - 优先使用后端返回的完整用户信息
      if (res.data.user) {
        storage.setUser(res.data.user);
      } else {
        // 如果没有返回完整用户信息，只更新头像
        const currentUser = storage.getUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, avatar: avatarUrl };
          storage.setUser(updatedUser);
        }
      }

      uni.showToast({
        title: "头像上传成功",
        icon: "success",
        duration: 2000,
      });
    } else {
      // 如果没有返回avatar，提示错误
      uni.showToast({
        title: "头像上传失败，请重试",
        icon: "none",
        duration: 2000,
      });
    }
  } catch (error) {
    // 确保错误时也关闭Loading
    uni.hideLoading();
    console.error("上传头像失败:", error);
    // 上传失败时恢复原头像
    const user = storage.getUser();
    if (user) {
      avatarPreview.value = user.avatar || "";
    }
  } finally {
    isUploadingAvatar.value = false;
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

    // 构建更新数据（只包含有值的字段）
    const updateData = {};
    if (formData.value.name) {
      updateData.name = formData.value.name;
    }
    if (formData.value.gender) {
      updateData.gender = formData.value.gender;
    }
    if (formData.value.address) {
      updateData.address = formData.value.address;
    }
    // 头像URL必须包含，如果已上传
    if (formData.value.avatar) {
      updateData.avatar = formData.value.avatar;
    }

    console.log("保存时的更新数据:", updateData);
    console.log("当前formData.avatar:", formData.value.avatar);

    // 调用更新接口
    const res = await userApi.updateProfile(updateData);

    // 更新本地存储
    const currentUser = storage.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...res };
      storage.setUser(updatedUser);
    }

    uni.hideLoading();
    uni.showToast({
      title: "保存成功",
      icon: "success",
    });

    // 延迟返回，让用户看到成功提示
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    uni.hideLoading();
    console.error("保存失败:", error);
  } finally {
    isLoading.value = false;
  }
};

// 返回
const handleBack = () => {
  uni.navigateBack();
};

onMounted(() => {
  getUserInfo();
});
</script>

<style lang="scss" scoped>
.edit-container {
  min-height: 100vh;
  background-color: #fafafa;
}

.form-section {
  padding: 0;
  margin-top: 0;
}

/* 头像上传 - 扁平化设计 */
.avatar-section {
  background-color: #ffffff;
  padding: 60rpx 40rpx;
  margin-bottom: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-label {
  font-size: 26rpx;
  color: #6b7280;
  margin-bottom: 32rpx;
  font-weight: 400;
  letter-spacing: 0.5rpx;
}

.avatar-upload {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 80rpx;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.avatar-placeholder-text {
  font-size: 22rpx;
  color: #9ca3af;
  font-weight: 400;
}

.avatar-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.8) 0%,
    rgba(139, 92, 246, 0.8) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 80rpx;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-upload:active .avatar-mask {
  opacity: 1;
}

/* 表单样式 - 扁平化 */
:deep(.uni-forms) {
  background-color: #ffffff;
  border-radius: 0;
  overflow: hidden;
}

:deep(.uni-forms-item) {
  background-color: #ffffff;
  padding: 0 32rpx;
  margin-bottom: 0;
  border-bottom: 1rpx solid #f3f4f6;
}

/* 选择器样式 */
.picker-view {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 0;
  min-height: auto;
}

.picker-text {
  font-size: 28rpx;
  color: #111827;
  flex: 1;
}

.picker-text.placeholder {
  color: #9ca3af;
}

/* 按钮区域 */
.button-section {
  margin-top: 48rpx;
  padding: 0 32rpx 40rpx;
}

.save-btn {
  width: 100%;
  height: 96rpx;
  background: #000000;
  border-radius: 12rpx;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.save-btn::after {
  border: none;
}

.save-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(99, 102, 241, 0.3);
}

.save-btn:disabled {
  background: #e5e7eb;
  box-shadow: none;
  opacity: 0.6;
}
</style>
