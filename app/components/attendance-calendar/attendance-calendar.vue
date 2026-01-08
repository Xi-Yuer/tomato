<template>
  <view class="calendar-section">
    <view class="calendar-weekdays">
      <text
        v-for="(weekday, index) in weekdays"
        :key="index"
        class="weekday-text"
      >
        {{ weekday }}
      </text>
    </view>
    <view class="calendar-grid">
      <view
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="[
          'calendar-day',
          {
            'not-current-month': !day.isCurrentMonth,
            'is-today': day.isToday,
            'has-attendance': day.hasAttendance,
            selected: selectedDate === day.date,
          },
        ]"
        @click="handleDayClick(day)"
      >
        <text class="day-number">{{ day.day }}</text>
        <view v-if="day.hasAttendance" class="attendance-indicator">
          <view class="indicator-dot"></view>
          <text v-if="day.duration" class="duration-text">{{
            day.durationText
          }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from "vue";
import { getCalendarDays, formatDuration } from "@/utils/date";

const props = defineProps({
  selectedYear: {
    type: Number,
    required: true,
  },
  selectedMonth: {
    type: Number,
    required: true,
  },
  attendanceRecords: {
    type: Array,
    default: () => [],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  selectedDate: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["day-click"]);

const weekdays = ["日", "一", "二", "三", "四", "五", "六"];

const calendarDays = computed(() => {
  const days = getCalendarDays(props.selectedYear, props.selectedMonth);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // 创建日期到记录的映射
  const dateMap = new Map();
  if (props.isAdmin) {
    // 管理员视图：按日期分组
    props.attendanceRecords.forEach((record) => {
      if (!dateMap.has(record.date)) {
        dateMap.set(record.date, {
          hasAttendance: true,
          duration: 0,
          records: [],
        });
      }
      const dayData = dateMap.get(record.date);
      dayData.duration += record.totalDuration;
      dayData.records.push(record);
    });
  } else {
    // 员工视图：直接映射
    props.attendanceRecords.forEach((record) => {
      dateMap.set(record.date, {
        hasAttendance: true,
        duration: record.totalDuration,
        records: [record],
      });
    });
  }

  return days.map((day) => {
    const dayData = dateMap.get(day.date);
    const isToday = day.date === todayStr;
    return {
      ...day,
      isToday,
      hasAttendance: !!dayData,
      duration: dayData?.duration || 0,
      durationText: dayData?.duration ? formatDuration(dayData.duration) : "",
    };
  });
});

const handleDayClick = (day) => {
  emit("day-click", day);
};
</script>

<style lang="scss" scoped>
.calendar-section {
  background-color: #ffffff50;
  margin-top: 16rpx;
  padding: 32rpx 24rpx;
  border-radius: 12rpx;
}

.calendar-weekdays {
  display: flex;
  margin-bottom: 16rpx;
}

.weekday-text {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #8c8c8c;
  font-weight: 500;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
}

.calendar-day {
  width: calc(100% / 7);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 8rpx;
  box-sizing: border-box;
}

.day-number {
  font-size: 28rpx;
  color: #1a1a1a;
  margin-bottom: 4rpx;
}

.calendar-day.not-current-month .day-number {
  color: #d0d0d0;
}

.calendar-day.is-today {
  background-color: #000000;
  border-radius: 8rpx;
}

.calendar-day.is-today .day-number {
  color: #ffffff !important;
}

.calendar-day.selected {
  background-color: #1a1a1a;
  border-radius: 8rpx;
  color: #ffffff !important;
}

.calendar-day.selected .day-number {
  color: #ffffff;
}

.attendance-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
}

.indicator-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #1a1a1a;
}

.calendar-day.selected .indicator-dot {
  background-color: #ffffff50;
}

.duration-text {
  font-size: 18rpx;
  color: #8c8c8c;
  line-height: 1.2;
}

.calendar-day.selected .duration-text {
  color: #ffffff50;
}
</style>

