<template>
  <view class="scheduling-container">
    <!-- 顶部标题和年月选择 -->
    <view class="header-section">
      <text class="page-title">打卡情况统计</text>
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
    <attendance-stats-card
      :attendance-days="attendanceDays"
      :total-work-hours="totalWorkHours"
    />

    <!-- 日历视图 -->
    <attendance-calendar
      :selected-year="selectedYear"
      :selected-month="selectedMonth"
      :attendance-records="attendanceRecords"
      :is-admin="isAdmin"
      :selected-date="selectedDate"
      @day-click="handleDayClick"
    />

    <!-- 工作明细（选中日期或今天） -->
    <work-detail-list
      :title="
        selectedDate ? formatSelectedDateTitle(selectedDate) : '工作明细'
      "
      :records="selectedDate ? selectedDateRecords : todayRecords"
      :is-admin="isAdmin"
    />

    <!-- 员工工作时长统计（仅管理员可见） -->
    <employee-stats-list
      v-if="isAdmin && employeeStats.length > 0"
      :title="`${displayYearMonth}员工工作时长统计`"
      :employee-stats="employeeStats"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { onTabItemTap } from "@dcloudio/uni-app";
import { attendanceApi, userApi } from "@/utils/api";
import { storage } from "@/utils/storage";
import { formatDuration } from "@/utils/date";
import AttendanceStatsCard from "@/components/attendance-stats-card/attendance-stats-card.vue";
import AttendanceCalendar from "@/components/attendance-calendar/attendance-calendar.vue";
import WorkDetailList from "@/components/work-detail-list/work-detail-list.vue";
import EmployeeStatsList from "@/components/employee-stats-list/employee-stats-list.vue";

// 响应式数据
const userInfo = ref(null);
const isAdmin = ref(false);
const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);
const attendanceRecords = ref([]);
const isLoading = ref(false);
const selectedDate = ref(null);
const todayRecords = ref([]); // 今天的工作明细
const selectedDateRecords = ref([]); // 选中日期的工作明细

// 双击刷新相关
const lastTabTapTime = ref(0);
const lastTabIndex = ref(-1);
const DOUBLE_TAP_DELAY = 500; // 双击间隔时间（毫秒）

// 计算属性：选中的年月字符串（用于picker）
const selectedYearMonth = computed(() => {
  return `${selectedYear.value}-${String(selectedMonth.value).padStart(
    2,
    "0"
  )}-01`;
});

// 计算属性：显示的年月文本
const displayYearMonth = computed(() => {
  return `${selectedYear.value}年${selectedMonth.value}月`;
});


// 计算属性：打卡天数
const attendanceDays = computed(() => {
  if (isAdmin.value) {
    // 管理员视图：统计有多少个不同的日期
    const uniqueDates = new Set(attendanceRecords.value.map((r) => r.date));
    return uniqueDates.size;
  } else {
    // 员工视图：直接返回记录数量（每个记录代表一天）
    return attendanceRecords.value.length;
  }
});

// 计算属性：总工作时长
const totalWorkHours = computed(() => {
  const totalMinutes = attendanceRecords.value.reduce((sum, record) => {
    return sum + (record.totalDuration || 0);
  }, 0);
  return formatDuration(totalMinutes);
});

// 计算属性：员工工作时长统计（仅管理员）
const employeeStats = computed(() => {
  if (!isAdmin.value) return [];

  const statsMap = new Map();
  attendanceRecords.value.forEach((record) => {
    const userId = record.userId;
    const userName = record.userName;
    const userAvatar = record.userAvatar;

    if (!statsMap.has(userId)) {
      statsMap.set(userId, {
        userId,
        userName,
        userAvatar,
        totalMinutes: 0,
      });
    }

    statsMap.get(userId).totalMinutes += record.totalDuration || 0;
  });

  return Array.from(statsMap.values()).sort(
    (a, b) => b.totalMinutes - a.totalMinutes
  );
});


// 方法：获取用户信息
const getUserInfo = async () => {
  try {
    // 先从本地存储获取
    const localUser = storage.getUser();
    if (localUser) {
      userInfo.value = localUser;
      isAdmin.value = localUser.isAdmin || false;
    }

    // 从服务器获取最新信息
    const res = await userApi.getUserInfo();
    if (res) {
      userInfo.value = res;
      isAdmin.value = res.isAdmin || false;
      storage.setUser(res);
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
  }
};

// 方法：加载打卡记录
const loadAttendanceRecords = async () => {
  isLoading.value = true;
  try {
    let records;
    if (isAdmin.value) {
      records = await attendanceApi.getAllAttendanceRecords(
        selectedYear.value,
        selectedMonth.value
      );
    } else {
      records = await attendanceApi.getMyAttendanceRecords(
        selectedYear.value,
        selectedMonth.value
      );
    }
    attendanceRecords.value = records || [];
  } catch (error) {
    console.error("加载打卡记录失败:", error);
    attendanceRecords.value = [];
    uni.showToast({
      title: "加载失败，请重试",
      icon: "none",
      duration: 2000,
    });
  } finally {
    isLoading.value = false;
  }
};

// 方法：处理年月选择
const handleMonthChange = (e) => {
  const value = e.detail.value;
  const [year, month] = value.split("-").map(Number);
  selectedYear.value = year;
  selectedMonth.value = month;
  selectedDate.value = null;
  selectedDateRecords.value = [];
  loadAttendanceRecords();
};

// 方法：格式化选中日期的标题
const formatSelectedDateTitle = (dateStr) => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日 工作明细`;
};

// 方法：加载指定日期工作明细
const loadDateRecords = async (dateStr) => {
  try {
    let records;
    if (isAdmin.value) {
      records = await attendanceApi.getAllAttendanceRecordsByDate(dateStr);
    } else {
      const record = await attendanceApi.getMyAttendanceRecordsByDate(dateStr);
      records = record ? [record] : [];
    }
    selectedDateRecords.value = records || [];
  } catch (error) {
    console.error("加载日期工作明细失败:", error);
    selectedDateRecords.value = [];
    uni.showToast({
      title: "加载失败，请重试",
      icon: "none",
      duration: 2000,
    });
  }
};

// 方法：处理日期点击
const handleDayClick = async (day) => {
  const date = new Date(day.date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  // 如果点击的日期不在当前已加载的月份，需要切换月份并重新加载月份数据
  if (year !== selectedYear.value || month !== selectedMonth.value) {
    selectedYear.value = year;
    selectedMonth.value = month;
    selectedDate.value = null;
    selectedDateRecords.value = [];
    await loadAttendanceRecords();
    // 加载完成后设置选中日期并加载该日期的数据
    selectedDate.value = day.date;
    await loadDateRecords(day.date);
  } else {
    // 如果日期在当前月份，设置选中日期并加载该日期的数据
    selectedDate.value = day.date;
    await loadDateRecords(day.date);
  }
};

// 方法：加载今天的工作明细
const loadTodayRecords = async () => {
  try {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    let records;
    if (isAdmin.value) {
      records = await attendanceApi.getAllAttendanceRecordsByDate(todayStr);
    } else {
      const record = await attendanceApi.getMyAttendanceRecordsByDate(todayStr);
      records = record ? [record] : [];
    }
    todayRecords.value = records || [];
  } catch (error) {
    console.error("加载今天工作明细失败:", error);
    todayRecords.value = [];
  }
};

// 刷新页面数据
const refreshData = async () => {
  await getUserInfo();
  await loadAttendanceRecords();
  await loadTodayRecords();
};

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
    uni.showToast({
      title: "刷新中...",
      icon: "loading",
      duration: 1000,
    });
    refreshData();
  }
  
  // 更新记录
  lastTabTapTime.value = currentTime;
  lastTabIndex.value = currentTabIndex;
});
</script>

<style lang="scss" scoped>
.scheduling-container {
  min-height: 100vh;
  padding: 24rpx;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  background-color: #ffffff50;
  border-radius: 12rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.month-picker {
  display: flex;
  align-items: center;
}

.picker-display {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.picker-text {
  font-size: 28rpx;
  color: #1a1a1a;
}

</style>
