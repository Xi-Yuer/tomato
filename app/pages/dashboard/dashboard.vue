<template>
  <view class="dashboard-container">
    <!-- 顶部年月选择器 -->
    <view class="header-section">
      <text class="page-title">采购管理</text>
      <picker
        mode="date"
        fields="month"
        :value="selectedYearMonth"
        @change="handleMonthChange"
        class="month-picker"
      >
        <view class="picker-display">
          <text class="picker-text">{{ displayYearMonth }}</text>
          <uni-icons type="arrowdown" size="14" color="#8c8c8c"></uni-icons>
        </view>
      </picker>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-section" v-if="statistics.length > 0">
      <view class="stat-card">
        <text class="stat-label">当月总金额</text>
        <text class="stat-value">¥{{ totalAmount.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 操作栏 -->
    <view class="action-bar">
      <button class="filter-btn" @click="showFilterPopup">
        <uni-icons type="settings" size="18" color="#1a1a1a"></uni-icons>
        <text class="filter-btn-text">筛选</text>
        <view v-if="selectedCategoryId" class="filter-badge"></view>
      </button>
      <button class="add-btn" @click="showAddForm" :disabled="!isAdmin">
        + 添加采购记录
      </button>
    </view>

    <!-- 采购记录表格 -->
    <view class="table-container">
      <scroll-view class="table-scroll" scroll-x="true" :show-scrollbar="false">
        <view class="table-wrapper">
          <view class="table-header">
            <view class="table-cell" style="min-width: 120rpx">采购单号</view>
            <view class="table-cell" style="min-width: 140rpx">采购分类</view>
            <view class="table-cell" style="min-width: 180rpx">物品名称</view>
            <view class="table-cell" style="min-width: 100rpx">数量</view>
            <view class="table-cell" style="min-width: 120rpx">单价</view>
            <view class="table-cell" style="min-width: 120rpx">总价</view>
            <view class="table-cell" style="min-width: 140rpx">采购时间</view>
            <view class="table-cell" style="min-width: 120rpx">付款截图</view>
            <view v-if="isAdmin" class="table-cell" style="min-width: 100rpx"
              >操作</view
            >
          </view>
          <view class="table-body" v-if="procurements.length > 0">
            <view
              class="table-row"
              v-for="item in procurements"
              :key="item.id"
              @click="handleRowClick(item)"
            >
              <view class="table-cell" style="min-width: 120rpx">{{
                item.id
              }}</view>
              <view class="table-cell" style="min-width: 140rpx">
                <view
                  class="category-tag"
                  :style="{
                    backgroundColor: item.category?.color || '#e5e7eb',
                  }"
                >
                  {{ item.category?.name || "未知" }}
                </view>
              </view>
              <view class="table-cell" style="min-width: 180rpx">{{
                item.itemName
              }}</view>
              <view class="table-cell" style="min-width: 100rpx">{{
                item.quantity
              }}</view>
              <view class="table-cell" style="min-width: 120rpx"
                >¥{{ item.unitPrice }}</view
              >
              <view class="table-cell" style="min-width: 120rpx"
                >¥{{ item.totalPrice }}</view
              >
              <view class="table-cell" style="min-width: 140rpx">
                {{ formatDate(item.procurementDate) }}
              </view>
              <view class="table-cell" style="min-width: 120rpx">
                <image
                  v-if="item.paymentScreenshot"
                  :src="item.paymentScreenshot"
                  class="screenshot-thumb"
                  mode="aspectFill"
                  @click.stop="previewImage(item.paymentScreenshot)"
                />
                <text v-else class="no-image">-</text>
              </view>
              <view
                v-if="isAdmin"
                class="table-cell actions-cell"
                style="min-width: 100rpx"
                @click.stop
              >
                <view class="row-actions">
                  <view class="action-icon" @click.stop="handleEdit(item)">
                    <uni-icons
                      type="compose"
                      size="18"
                      color="#1a1a1a"
                    ></uni-icons>
                  </view>
                  <view class="action-icon" @click.stop="handleDelete(item)">
                    <uni-icons
                      type="trash"
                      size="18"
                      color="#ef4444"
                    ></uni-icons>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view class="empty-state" v-else>
            <text class="empty-text">暂无采购记录</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 筛选弹窗 -->
    <uni-popup ref="filterPopup" type="bottom" :safe-area="false">
      <view class="filter-popup">
        <view class="popup-header">
          <text class="popup-title">筛选条件</text>
          <view class="popup-close" @click="closeFilterPopup">
            <uni-icons type="close" size="20" color="#666"></uni-icons>
          </view>
        </view>
        <scroll-view class="filter-content" scroll-y>
          <view class="filter-section">
            <text class="filter-label">采购分类</text>
            <picker
              mode="selector"
              :range="filterCategoryOptions"
              range-key="name"
              :value="filterCategoryIndex"
              @change="onFilterCategoryChange"
            >
              <view class="picker-view">
                <text
                  class="picker-text"
                  :class="{ placeholder: !filterData.categoryId }"
                >
                  {{ selectedFilterCategoryName || "全部分类" }}
                </text>
                <uni-icons
                  type="arrowdown"
                  size="16"
                  color="#999999"
                ></uni-icons>
              </view>
            </picker>
          </view>
        </scroll-view>
        <view class="popup-footer">
          <button class="reset-btn" @click="resetFilter">重置</button>
          <button class="confirm-btn" @click="applyFilter">确认</button>
        </view>
      </view>
    </uni-popup>

    <!-- 添加/编辑采购记录弹窗 -->
    <uni-popup ref="formPopup" type="bottom" :safe-area="false">
      <view class="form-popup">
        <view class="popup-header">
          <text class="popup-title">{{
            isEdit ? "编辑采购记录" : "添加采购记录"
          }}</text>
          <view class="popup-close" @click="closeForm">
            <uni-icons type="close" size="20" color="#666"></uni-icons>
          </view>
        </view>
        <scroll-view class="form-content" scroll-y :show-scrollbar="false">
          <uni-forms ref="form" :model="formData" :rules="rules">
            <uni-forms-item label="采购分类" name="categoryId">
              <picker
                mode="selector"
                :range="categoryOptions"
                range-key="name"
                :value="categoryIndex"
                @change="onCategoryChange"
              >
                <view class="picker-view">
                  <text
                    class="picker-text"
                    :class="{ placeholder: !formData.categoryId }"
                  >
                    {{ selectedCategoryName || "请选择采购分类" }}
                  </text>
                  <uni-icons
                    type="arrowdown"
                    size="16"
                    color="#999999"
                  ></uni-icons>
                </view>
              </picker>
            </uni-forms-item>

            <uni-forms-item label="物品名称" name="itemName">
              <uni-easyinput
                v-model="formData.itemName"
                placeholder="请输入物品名称"
                :clearable="true"
                :maxlength="200"
                :styles="inputStyles"
              ></uni-easyinput>
            </uni-forms-item>

            <uni-forms-item label="采购数量" name="quantity">
              <uni-easyinput
                v-model="formData.quantity"
                placeholder="请输入采购数量"
                type="number"
                :clearable="true"
                :styles="inputStyles"
                @input="calculateTotal"
              ></uni-easyinput>
            </uni-forms-item>

            <uni-forms-item label="单价" name="unitPrice">
              <uni-easyinput
                v-model="formData.unitPrice"
                placeholder="请输入单价"
                type="number"
                :clearable="true"
                :styles="inputStyles"
                @input="calculateTotal"
              ></uni-easyinput>
            </uni-forms-item>

            <uni-forms-item label="总价" name="totalPrice">
              <view class="total-price-display"
                >¥{{ calculatedTotal.toFixed(2) }}</view
              >
            </uni-forms-item>

            <uni-forms-item label="采购时间" name="procurementDate">
              <picker
                mode="date"
                :value="formData.procurementDate"
                @change="onDateChange"
              >
                <view class="picker-view">
                  <text
                    class="picker-text"
                    :class="{ placeholder: !formData.procurementDate }"
                  >
                    {{ formData.procurementDate || "请选择采购时间" }}
                  </text>
                  <uni-icons
                    type="arrowdown"
                    size="16"
                    color="#999999"
                  ></uni-icons>
                </view>
              </picker>
            </uni-forms-item>

            <uni-forms-item label="付款截图" name="paymentScreenshot">
              <view class="upload-section">
                <view v-if="formData.paymentScreenshot" class="image-preview">
                  <image
                    :src="formData.paymentScreenshot"
                    mode="aspectFill"
                    class="preview-image"
                    @click="previewImage(formData.paymentScreenshot)"
                  />
                  <view class="image-delete" @click="removeImage">
                    <uni-icons type="close" size="16" color="#fff"></uni-icons>
                  </view>
                </view>
                <view v-else class="upload-btn" @click="chooseImage">
                  <uni-icons type="camera" size="24" color="#999"></uni-icons>
                  <text class="upload-text">上传截图</text>
                </view>
              </view>
            </uni-forms-item>
          </uni-forms>
        </scroll-view>
        <view class="popup-footer">
          <button class="cancel-btn" @click="closeForm">取消</button>
          <button
            class="save-btn"
            @click="handleSave"
            :disabled="isLoading || isUploading"
          >
            {{ isLoading || isUploading ? "保存中..." : "保存" }}
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { onTabItemTap } from "@dcloudio/uni-app";
import { procurementApi, procurementCategoryApi, userApi } from "@/utils/api";
import { storage } from "@/utils/storage";

// 响应式数据
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const procurements = ref([]);
const categories = ref([]);
const statistics = ref([]);
const isLoading = ref(false);
const isUploading = ref(false);
const isEdit = ref(false);
const editingId = ref(null);
const formPopup = ref(null);
const filterPopup = ref(null);
const form = ref(null);
const categoryIndex = ref(0);
const filterCategoryIndex = ref(0);
const selectedCategoryId = ref(null);
const isAdmin = ref(false);
// 筛选数据
const filterData = ref({
  categoryId: null,
});

// 表单数据
const formData = ref({
  categoryId: null,
  itemName: "",
  quantity: "",
  unitPrice: "",
  procurementDate: "",
  paymentScreenshot: "",
});

// 表单验证规则
const rules = {
  categoryId: {
    rules: [{ required: true, errorMessage: "请选择采购分类" }],
  },
  itemName: {
    rules: [{ required: true, errorMessage: "请输入物品名称" }],
  },
  quantity: {
    rules: [
      { required: true, errorMessage: "请输入采购数量" },
      {
        pattern: /^[0-9]+(\.[0-9]+)?$/,
        errorMessage: "请输入有效的数量",
      },
    ],
  },
  unitPrice: {
    rules: [
      { required: true, errorMessage: "请输入单价" },
      {
        pattern: /^[0-9]+(\.[0-9]+)?$/,
        errorMessage: "请输入有效的单价",
      },
    ],
  },
  procurementDate: {
    rules: [{ required: true, errorMessage: "请选择采购时间" }],
  },
};

const inputStyles = {
  borderColor: "transparent",
  backgroundColor: "transparent",
};

// 计算属性
const selectedYearMonth = computed(() => {
  return `${selectedYear.value}-${String(selectedMonth.value).padStart(
    2,
    "0"
  )}-01`;
});

const displayYearMonth = computed(() => {
  return `${selectedYear.value}年${selectedMonth.value}月`;
});

const categoryOptions = computed(() => {
  return categories.value;
});

const filterCategoryOptions = computed(() => {
  return [{ id: null, name: "全部分类" }, ...categories.value];
});

const selectedCategoryName = computed(() => {
  if (!formData.value.categoryId) return "";
  const category = categories.value.find(
    (c) => c.id === formData.value.categoryId
  );
  return category ? category.name : "";
});

const selectedFilterCategoryName = computed(() => {
  if (!filterData.value.categoryId) return "";
  const category = categories.value.find(
    (c) => c.id === filterData.value.categoryId
  );
  return category ? category.name : "";
});

const calculatedTotal = computed(() => {
  const quantity = parseFloat(formData.value.quantity) || 0;
  const unitPrice = parseFloat(formData.value.unitPrice) || 0;
  return quantity * unitPrice;
});

const totalAmount = computed(() => {
  return statistics.value.reduce((sum, stat) => sum + stat.totalAmount, 0);
});

// 方法：获取用户信息
const getUserInfo = async () => {
  try {
    // 先从本地存储获取
    const localUser = storage.getUser();
    if (localUser) {
      isAdmin.value = localUser.isAdmin || false;
    }

    // 从服务器获取最新信息
    const res = await userApi.getUserInfo();
    if (res) {
      isAdmin.value = res.isAdmin || false;
      storage.setUser(res);
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

// 方法：加载采购分类
const loadCategories = async () => {
  try {
    const res = await procurementCategoryApi.getCategories();
    categories.value = res || [];
  } catch (error) {
    console.error("加载采购分类失败:", error);
    categories.value = [];
  }
};

// 方法：加载采购记录
const loadProcurements = async () => {
  isLoading.value = true;
  try {
    const res = await procurementApi.getProcurementsByMonth(
      selectedYear.value,
      selectedMonth.value,
      selectedCategoryId.value || undefined
    );
    procurements.value = res || [];
  } catch (error) {
    console.error("加载采购记录失败:", error);
    procurements.value = [];
    uni.showToast({
      title: "加载失败，请重试",
      icon: "none",
    });
  } finally {
    isLoading.value = false;
  }
};

// 方法：加载统计数据
const loadStatistics = async () => {
  try {
    const res = await procurementApi.getStatistics(
      selectedYear.value,
      selectedMonth.value
    );
    statistics.value = res || [];
  } catch (error) {
    console.error("加载统计数据失败:", error);
    statistics.value = [];
  }
};

// 方法：处理年月选择
const handleMonthChange = (e) => {
  const value = e.detail.value;
  const [year, month] = value.split("-").map(Number);
  selectedYear.value = year;
  selectedMonth.value = month;
  loadProcurements();
  loadStatistics();
};

// 方法：格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

// 方法：显示添加表单
const showAddForm = () => {
  isEdit.value = false;
  editingId.value = null;
  resetForm();
  formPopup.value.open();
};

// 方法：重置表单
const resetForm = () => {
  formData.value = {
    categoryId: null,
    itemName: "",
    quantity: "",
    unitPrice: "",
    procurementDate: "",
    paymentScreenshot: "",
  };
  categoryIndex.value = 0;
};

// 方法：关闭表单
const closeForm = () => {
  formPopup.value.close();
  resetForm();
};

// 方法：计算总价
const calculateTotal = () => {
  // 总价由计算属性自动计算
};

// 方法：选择分类
const onCategoryChange = (e) => {
  const index = e.detail.value;
  categoryIndex.value = index;
  if (categories.value[index]) {
    formData.value.categoryId = categories.value[index].id;
  }
};

// 方法：显示筛选弹窗
const showFilterPopup = () => {
  // 同步当前筛选条件到弹窗数据
  filterData.value.categoryId = selectedCategoryId.value;
  // 更新筛选分类选择器的索引
  if (selectedCategoryId.value) {
    const index = filterCategoryOptions.value.findIndex(
      (c) => c.id === selectedCategoryId.value
    );
    filterCategoryIndex.value = index >= 0 ? index : 0;
  } else {
    filterCategoryIndex.value = 0; // "全部分类"
  }
  filterPopup.value.open();
};

// 方法：关闭筛选弹窗
const closeFilterPopup = () => {
  filterPopup.value.close();
};

// 方法：筛选分类选择变化
const onFilterCategoryChange = (e) => {
  const index = e.detail.value;
  filterCategoryIndex.value = index;
  const selectedOption = filterCategoryOptions.value[index];
  if (selectedOption) {
    filterData.value.categoryId = selectedOption.id;
  }
};

// 方法：重置筛选
const resetFilter = () => {
  filterData.value.categoryId = null;
  filterCategoryIndex.value = 0;
};

// 方法：应用筛选
const applyFilter = () => {
  selectedCategoryId.value = filterData.value.categoryId;
  closeFilterPopup();
  loadProcurements();
};

// 方法：选择日期
const onDateChange = (e) => {
  formData.value.procurementDate = e.detail.value;
};

// 方法：选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0];
      isUploading.value = true;
      try {
        uni.showLoading({
          title: "上传中...",
          mask: true,
        });
        const url = await procurementApi.uploadScreenshot(tempFilePath);
        formData.value.paymentScreenshot = url;
        uni.hideLoading();
        uni.showToast({
          title: "上传成功",
          icon: "success",
        });
      } catch (error) {
        uni.hideLoading();
        console.error("上传失败:", error);
        uni.showToast({
          title: "上传失败",
          icon: "none",
        });
      } finally {
        isUploading.value = false;
      }
    },
  });
};

// 方法：移除图片
const removeImage = () => {
  formData.value.paymentScreenshot = "";
};

// 方法：预览图片
const previewImage = (url) => {
  uni.previewImage({
    urls: [url],
    current: url,
  });
};

// 方法：处理行点击
const handleRowClick = (item) => {
  // 普通员工只能查看，不能编辑
  if (!isAdmin.value) {
    return;
  }
  // 管理员可以点击行进行编辑
  handleEdit(item);
};

// 方法：编辑采购记录
const handleEdit = (item) => {
  if (!isAdmin.value) return;

  isEdit.value = true;
  editingId.value = item.id;
  formData.value = {
    categoryId: item.categoryId,
    itemName: item.itemName,
    quantity: item.quantity.toString(),
    unitPrice: item.unitPrice.toString(),
    procurementDate: item.procurementDate.split("T")[0], // 只取日期部分
    paymentScreenshot: item.paymentScreenshot || "",
  };
  // 设置分类选择器的索引
  const categoryIdx = categories.value.findIndex(
    (c) => c.id === item.categoryId
  );
  categoryIndex.value = categoryIdx >= 0 ? categoryIdx : 0;
  formPopup.value.open();
};

// 方法：删除采购记录
const handleDelete = (item) => {
  if (!isAdmin.value) return;

  uni.showModal({
    title: "确认删除",
    content: `确定要删除采购记录"${item.itemName}"吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await procurementApi.deleteProcurement(item.id);
          uni.showToast({
            title: "删除成功",
            icon: "success",
          });
          await loadProcurements();
          await loadStatistics();
        } catch (error) {
          console.error("删除失败:", error);
          uni.showToast({
            title: error.message || "删除失败",
            icon: "none",
          });
        }
      }
    },
  });
};

// 方法：保存
const handleSave = async () => {
  if (isLoading.value || isUploading.value) return;

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

    const data = {
      categoryId: Number(formData.value.categoryId),
      itemName: formData.value.itemName.trim(),
      quantity: parseFloat(formData.value.quantity),
      unitPrice: parseFloat(formData.value.unitPrice),
      procurementDate: formData.value.procurementDate,
      paymentScreenshot: formData.value.paymentScreenshot || null,
    };

    if (isEdit.value && editingId.value) {
      await procurementApi.updateProcurement(editingId.value, data);
    } else {
      await procurementApi.createProcurement(data);
    }

    uni.hideLoading();
    uni.showToast({
      title: "保存成功",
      icon: "success",
    });

    closeForm();
    await loadProcurements();
    await loadStatistics();
  } catch (error) {
    uni.hideLoading();
    console.error("保存失败:", error);
    uni.showToast({
      title: error.message || "保存失败",
      icon: "none",
    });
  } finally {
    isLoading.value = false;
  }
};

// 方法：刷新数据
const refreshData = async () => {
  await getUserInfo();
  await loadCategories();
  await loadProcurements();
  await loadStatistics();
};

// 双击刷新相关
const lastTabTapTime = ref(0);
const lastTabIndex = ref(-1);
const DOUBLE_TAP_DELAY = 500;

onMounted(async () => {
  await refreshData();
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
    refreshData();
  }

  // 更新记录
  lastTabTapTime.value = currentTime;
  lastTabIndex.value = currentTabIndex;
});
</script>

<style lang="scss" scoped>
.dashboard-container {
  min-height: 100vh;
  padding-bottom: 40rpx;
}

/* 顶部标题和年月选择 */
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.month-picker {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.picker-display {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

/* 统计卡片 */
.stats-section {
  padding: 32rpx;
}

.stat-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.stat-value {
  font-size: 48rpx;
  font-weight: 600;
  color: #1a1a1a;
}

/* 操作栏 */
.action-bar {
  padding: 24rpx 32rpx;
  display: flex;
  gap: 16rpx;
}

.filter-btn {
  flex: 0 0 auto;
  height: 88rpx;
  background-color: #ffffff;
  color: #1a1a1a;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 0 32rpx;
  position: relative;
}

.filter-btn::after {
  border: none;
}

.filter-btn-text {
  font-size: 28rpx;
  color: #1a1a1a;
}

.filter-badge {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 16rpx;
  height: 16rpx;
  background-color: #ef4444;
  border-radius: 50%;
  border: 2rpx solid #ffffff;
}

.add-btn {
  flex: 1;
  height: 88rpx;
  background-color: #1a1a1a;
  color: #ffffff;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn::after {
  border: none;
}

.add-btn[disabled] {
  background-color: #d1d5db;
  color: #9ca3af;
  opacity: 0.6;
}

/* 表格容器 */
.table-container {
  background-color: #ffffff;
  margin: 0 32rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.table-scroll {
  width: 100%;
  white-space: nowrap;
}

.table-wrapper {
  display: inline-block;
  min-width: 100%;
}

.table-header {
  display: flex;
  background-color: #f9fafb;
  border-bottom: 1rpx solid #e5e7eb;
  padding: 24rpx 16rpx;
  white-space: nowrap;
}

.table-row {
  display: flex;
  border-bottom: 1rpx solid #f0f0f0;
  padding: 24rpx 16rpx;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.table-row:active {
  background-color: #f9fafb;
}

.table-cell {
  font-size: 24rpx;
  color: #333;
  display: flex;
  align-items: center;
  padding: 0 8rpx;
  flex-shrink: 0;
  white-space: nowrap;
}

.table-header .table-cell {
  font-weight: 600;
  color: #666;
  font-size: 24rpx;
}

.actions-cell {
  justify-content: center;
}

.row-actions {
  display: flex;
  gap: 24rpx;
  align-items: center;
}

.row-actions .action-icon {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions-cell {
  justify-content: center;
}

.row-actions {
  display: flex;
  gap: 24rpx;
  align-items: center;
}

.row-actions .action-icon {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-tag {
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
  color: #ffffff;
  white-space: nowrap;
  display: inline-block;
}

.screenshot-thumb {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  background-color: #f0f0f0;
}

.no-image {
  color: #999;
  font-size: 24rpx;
}

.empty-state {
  padding: 120rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 弹窗样式 */
.form-popup {
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.popup-close {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-content {
  flex: 1;
  padding: 0;
}

:deep(.uni-forms) {
  background-color: #ffffff;
  padding: 0;
}

:deep(.uni-forms-item) {
  background-color: #ffffff;
  padding: 0 32rpx;
  margin-bottom: 0;
  border-bottom: 1rpx solid #f3f4f6;
}

:deep(.uni-forms-item__label) {
  font-size: 28rpx;
  color: #333;
  width: 160rpx;
}

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

.total-price-display {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  padding: 32rpx 0;
}

.upload-section {
  padding: 32rpx 0;
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #d1d5db;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
}

.image-preview {
  position: relative;
  width: 200rpx;
  height: 200rpx;
}

.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.image-delete {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  width: 40rpx;
  height: 40rpx;
  background-color: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-footer {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  border-top: 1rpx solid #f0f0f0;
}

.cancel-btn,
.save-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  background-color: #f3f4f6;
  color: #666;
}

.save-btn {
  background-color: #1a1a1a;
  color: #ffffff;
}

.cancel-btn::after,
.save-btn::after {
  border: none;
}

.save-btn[disabled] {
  background-color: #d1d5db;
  color: #9ca3af;
}

/* 筛选弹窗样式 */
.filter-popup {
  background-color: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  height: 60vh;
  display: flex;
  flex-direction: column;
}

.filter-content {
  flex: 1;
  padding: 0;
}

.filter-section {
  padding: 32rpx;
}

.filter-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 24rpx;
  display: block;
}

.filter-section .picker-view {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  min-height: auto;
}

.filter-section .picker-text {
  font-size: 28rpx;
  color: #111827;
  flex: 1;
}

.filter-section .picker-text.placeholder {
  color: #9ca3af;
}

.reset-btn,
.confirm-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-btn {
  background-color: #f3f4f6;
  color: #666;
}

.confirm-btn {
  background-color: #1a1a1a;
  color: #ffffff;
}

.reset-btn::after,
.confirm-btn::after {
  border: none;
}
</style>
