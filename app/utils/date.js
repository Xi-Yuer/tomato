/**
 * 日期工具函数
 * 统一使用东八区（Asia/Shanghai）时区处理日期
 */

/**
 * 获取今天的日期字符串（东八区）
 * @returns {string} 日期字符串，格式：YYYY-MM-DD
 */
export function getTodayDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const bj = new Date(utc + 8 * 60 * 60 * 1000);

  const year = bj.getFullYear();
  const month = String(bj.getMonth() + 1).padStart(2, "0");
  const day = String(bj.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * 格式化日期显示（东八区）
 * @param {string|number|Date} dateStr - 日期字符串、时间戳或Date对象
 * @returns {string} 格式化后的日期字符串，格式：X月X日 星期X
 */
export function formatDate(dateStr) {
  if (!dateStr) {
    // 如果没有日期，显示今天
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
    const bj = new Date(utc + 8 * 60 * 60 * 1000);
    const month = bj.getMonth() + 1;
    const day = bj.getDate();
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    const weekday = weekdays[bj.getDay()];
    return `${month}月${day}日 星期${weekday}`;
  }

  // 解析日期
  let date;
  if (typeof dateStr === "string") {
    // 如果是字符串格式 YYYY-MM-DD
    const [year, month, day] = dateStr.split("-").map(Number);
    date = new Date(year, month - 1, day);
  } else if (typeof dateStr === "number") {
    // 如果是时间戳
    date = new Date(dateStr);
  } else {
    date = new Date(dateStr);
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  const weekday = weekdays[date.getDay()];

  // 判断是否是今天
  const today = new Date();
  const utc = today.getTime() + today.getTimezoneOffset() * 60 * 1000;
  const bjToday = new Date(utc + 8 * 60 * 60 * 1000);
  const isToday =
    date.getFullYear() === bjToday.getFullYear() &&
    date.getMonth() === bjToday.getMonth() &&
    date.getDate() === bjToday.getDate();

  return isToday
    ? `今天 ${month}月${day}日 星期${weekday}`
    : `${month}月${day}日 星期${weekday}`;
}

/**
 * 获取最小日期（30天前）
 * @returns {string} 日期字符串，格式：YYYY-MM-DD
 */
export function getMinDate() {
  const date = new Date();
  const utc = date.getTime() + date.getTimezoneOffset() * 60 * 1000;
  const bj = new Date(utc + 8 * 60 * 60 * 1000);
  bj.setDate(bj.getDate() - 30);
  const year = bj.getFullYear();
  const month = String(bj.getMonth() + 1).padStart(2, "0");
  const day = String(bj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 获取最大日期（今天）
 * @returns {string} 日期字符串，格式：YYYY-MM-DD
 */
export function getMaxDate() {
  return getTodayDate();
}

/**
 * 格式化时间（仅显示时分）
 * @param {string|Date} timeString - 时间字符串或Date对象
 * @returns {string} 格式化后的时间字符串，格式：HH:mm
 */
export function formatTimeOnly(timeString) {
  if (!timeString) return "";
  const date = new Date(timeString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * 获取问候语（根据当前时间）
 * @returns {string} 问候语
 */
export function getGreeting() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const bj = new Date(utc + 8 * 60 * 60 * 1000);
  const hour = bj.getHours();

  if (hour >= 5 && hour < 12) {
    return "早上好,";
  } else if (hour >= 12 && hour < 18) {
    return "下午好,";
  } else if (hour >= 18 && hour < 22) {
    return "晚上好,";
  } else {
    return "深夜好,";
  }
}

/**
 * 转换日期选择器的返回值
 * @param {string|number} e - 日期选择器返回的值
 * @returns {string} 日期字符串，格式：YYYY-MM-DD
 */
export function parseDatePickerValue(e) {
  if (!e) return null;

  let dateStr = "";
  if (typeof e === "number") {
    // 如果是时间戳，转换为日期字符串
    const date = new Date(e);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    dateStr = `${year}-${month}-${day}`;
  } else if (typeof e === "string") {
    // 如果是字符串，直接使用（可能是 YYYY-MM-DD 格式）
    dateStr = e.split(" ")[0]; // 如果有时间部分，只取日期部分
  } else {
    console.error("未知的日期格式:", e);
    return null;
  }

  return dateStr;
}

export function formatTime(input, format = "YYYY-MM-DD HH:mm:ss") {
  if (input == null) return "";

  const date = input instanceof Date ? input : new Date(input);
  if (isNaN(date.getTime())) return "";

  const pad = (n, len = 2) => String(n).padStart(len, "0");

  const map = {
    YYYY: date.getFullYear(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    SSS: pad(date.getMilliseconds(), 3),
  };

  return format.replace(/YYYY|MM|DD|HH|mm|ss|SSS/g, (k) => map[k]);
}

export function formatDistance(meters, options = {}) {
  if (meters == null || isNaN(meters)) return "";

  const {
    kmThreshold = 1000, // 超过多少米显示为 km
    meterUnit = "米",
    kmUnit = "公里",
    kmFixed = 1, // km 保留小数位
  } = options;
  if (meters < kmThreshold) {
    return `${Math.round(meters)} ${meterUnit}`;
  }

  return `${(meters / 1000).toFixed(kmFixed)}${kmUnit}`;
}

/**
 * 格式化工作时长（分钟转小时）
 * @param {number} minutes - 分钟数
 * @returns {string} 格式化后的时长字符串，如 "8小时" 或 "8.5小时"
 */
export function formatDuration(minutes) {
  if (minutes == null || isNaN(minutes) || minutes < 0) return "0小时";
  
  const hours = minutes / 60;
  // 如果是整数小时，不显示小数
  if (hours % 1 === 0) {
    return `${hours}小时`;
  }
  // 否则保留一位小数
  return `${hours.toFixed(1)}小时`;
}

/**
 * 生成日历数组（包含上月末尾和下月开头）
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @returns {Array} 日历数组，每个元素包含 { date: string, day: number, isCurrentMonth: boolean }
 */
export function getCalendarDays(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const firstDayWeek = firstDay.getDay(); // 0-6，0是周日
  const daysInMonth = lastDay.getDate();
  
  const calendarDays = [];
  
  // 添加上月末尾的日期
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 2, day);
    calendarDays.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      day: day,
      isCurrentMonth: false,
    });
  }
  
  // 添加当月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      day: day,
      isCurrentMonth: true,
    });
  }
  
  // 添加下月开头的日期，补齐到42天（6周）
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month, day);
    calendarDays.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      day: day,
      isCurrentMonth: false,
    });
  }
  
  return calendarDays;
}
