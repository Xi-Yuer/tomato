/**
 * 日期工具函数
 * 统一使用东八区（Asia/Shanghai）时区处理日期
 */

/**
 * 将日期字符串转换为东八区的 Date 对象
 * @param dateStr 日期字符串，格式：YYYY-MM-DD
 * @returns Date 对象（东八区时间，当天 00:00:00）
 */
export function parseDateToCST(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  // 使用本地时间创建，因为已经设置了 TZ=Asia/Shanghai
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * 将 Date 对象格式化为 YYYY-MM-DD 格式（东八区）
 * @param date Date 对象
 * @returns 日期字符串，格式：YYYY-MM-DD
 */
export function formatDateToCST(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取今天的日期字符串（东八区）
 * @returns 日期字符串，格式：YYYY-MM-DD
 */
export function getTodayDateStr(): string {
  const now = new Date();
  return formatDateToCST(now);
}

/**
 * 获取指定日期的开始时间（东八区，00:00:00）
 * @param dateStr 日期字符串，格式：YYYY-MM-DD
 * @returns Date 对象（东八区时间，当天 00:00:00）
 */
export function getStartOfDayCST(dateStr: string): Date {
  return parseDateToCST(dateStr);
}

/**
 * 获取指定日期的结束时间（东八区，23:59:59.999）
 * @param dateStr 日期字符串，格式：YYYY-MM-DD
 * @returns Date 对象（东八区时间，当天 23:59:59.999）
 */
export function getEndOfDayCST(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}
