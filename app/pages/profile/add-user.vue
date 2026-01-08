<template>
  <view class="add-user-container">
    <view class="form-section">
      <uni-forms ref="form" :model="formData" :rules="rules" label-width="140rpx">
        <uni-forms-item label="姓名" name="name">
          <uni-easyinput
            v-model="formData.name"
            placeholder="请输入姓名"
            :clearable="true"
            :maxlength="50"
            :styles="inputStyles"
          ></uni-easyinput>
        </uni-forms-item>

        <uni-forms-item label="手机号" name="phone">
          <uni-easyinput
            v-model="formData.phone"
            placeholder="请输入11位手机号"
            :clearable="true"
            :maxlength="11"
            type="number"
            :styles="inputStyles"
          ></uni-easyinput>
        </uni-forms-item>

        <uni-forms-item label="密码" name="password">
          <uni-easyinput
            v-model="formData.password"
            placeholder="请输入密码（6-100位）"
            :clearable="true"
            :maxlength="100"
            type="password"
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
                {{ formData.gender || "请选择性别（可选）" }}
              </text>
              <uni-icons type="arrowdown" size="16" color="#9ca3af"></uni-icons>
            </view>
          </picker>
        </uni-forms-item>

        <uni-forms-item label="地址" name="address">
          <uni-easyinput
            v-model="formData.address"
            placeholder="请输入地址（可选）"
            :clearable="true"
            :maxlength="200"
            type="textarea"
            :autoHeight="true"
            :styles="inputStyles"
          ></uni-easyinput>
        </uni-forms-item>

        <uni-forms-item label="权限" name="isAdmin">
          <view class="switch-container">
            <switch
              :checked="formData.isAdmin"
              @change="onAdminChange"
              color="#000000"
              style="transform:scale(0.7)"
            />
            <text class="switch-label">
              {{ formData.isAdmin ? "管理员" : "普通用户" }}
            </text>
          </view>
        </uni-forms-item>
      </uni-forms>

      <view class="button-section">
        <button class="save-btn" @click="handleCreate" :disabled="isLoading">
          {{ isLoading ? "创建中..." : "创建用户" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { userApi } from "../../utils/api.js";

const form = ref(null);
const isLoading = ref(false);

const formData = ref({
  name: "",
  phone: "",
  password: "",
  gender: "",
  address: "",
  isAdmin: false,
});

const rules = {
  name: {
    rules: [
      {
        required: true,
        errorMessage: "请输入姓名",
      },
      {
        minLength: 1,
        maxLength: 50,
        errorMessage: "姓名长度在1-50个字符之间",
      },
    ],
  },
  phone: {
    rules: [
      {
        required: true,
        errorMessage: "请输入手机号",
      },
      {
        pattern: /^1[3-9]\d{9}$/,
        errorMessage: "请输入正确的11位手机号",
      },
    ],
  },
  password: {
    rules: [
      {
        required: true,
        errorMessage: "请输入密码",
      },
      {
        minLength: 6,
        maxLength: 100,
        errorMessage: "密码长度在6-100个字符之间",
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

// 管理员权限变化
const onAdminChange = (e) => {
  formData.value.isAdmin = e.detail.value;
};

const inputStyles = {
  borderColor: "transparent",
  backgroundColor: "transparent",
};

// 创建用户
const handleCreate = async () => {
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
      title: "创建中...",
      mask: true,
    });

    // 构建创建数据
    const createData = {
      name: formData.value.name,
      phone: formData.value.phone,
      password: formData.value.password,
    };

    // 可选字段
    if (formData.value.gender) {
      createData.gender = formData.value.gender;
    }
    if (formData.value.address) {
      createData.address = formData.value.address;
    }
    if (formData.value.isAdmin) {
      createData.isAdmin = formData.value.isAdmin;
    }

    // 调用创建接口
    await userApi.createUser(createData);

    uni.hideLoading();
    uni.showToast({
      title: "创建成功",
      icon: "success",
    });

    // 延迟返回，让用户看到成功提示
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    uni.hideLoading();
    console.error("创建用户失败:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.add-user-container {
  min-height: 100vh;
  background-color: #fafafa;
}

.form-section {
  padding: 0;
  margin-top: 0;
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

/* 开关样式 */
.switch-container {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.switch-label {
  font-size: 28rpx;
  color: #111827;
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

