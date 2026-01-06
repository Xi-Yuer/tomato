/**
 * 任务相关工具函数
 */

/**
 * 获取状态样式类
 * @param {string} status - 任务状态
 * @returns {string} 样式类名
 */
export function getStatusClass(status) {
  if (!status) return "";
  const classMap = {
    pending: "status-pending",
    in_progress: "status-in-progress",
    completed: "status-completed",
    overdue: "status-overdue",
  };
  return classMap[status] || "";
}

/**
 * 获取时间线连接线样式类
 * @param {string} status - 任务状态
 * @returns {string} 样式类名
 */
export function getLineClass(status) {
  if (status === "completed") return "line-completed";
  if (status === "in_progress" || status === "pending")
    return "line-in-progress";
  return "line-pending";
}

/**
 * 获取卡片样式类
 * @param {string} status - 任务状态
 * @returns {string} 样式类名
 */
export function getCardClass(status) {
  if (
    !status ||
    (status !== "completed" &&
      status !== "pending" &&
      status !== "in_progress")
  ) {
    return "card-pending";
  }
  return "";
}

/**
 * 获取照片列表（最多3张）
 * @param {string} photoEvidence - 照片证据字符串（逗号分隔）
 * @returns {string[]} 照片URL数组
 */
export function getPhotos(photoEvidence) {
  if (!photoEvidence) return [];
  const photos = photoEvidence
    .split(",")
    .filter((url) => url && url.trim().length > 0)
    .map((url) => url.trim());
  // 最多返回3张
  return photos.slice(0, 3);
}

/**
 * 预览照片
 * @param {string} photoEvidence - 照片证据字符串（逗号分隔）
 * @param {number} currentIndex - 当前照片索引
 */
export function previewPhotos(photoEvidence, currentIndex) {
  if (!photoEvidence) return;
  const photos = photoEvidence
    .split(",")
    .filter((url) => url && url.trim().length > 0)
    .map((url) => url.trim());

  uni.previewImage({
    urls: photos,
    current: currentIndex,
  });
}

/**
 * 计算模块完成度
 * @param {Object} module - 任务模块对象
 * @returns {Object} 完成度统计 { completed, total }
 */
export function calculateModuleCompletion(module) {
  if (!module || !module.tasks) {
    return { completed: 0, total: 0 };
  }

  const completed = module.tasks.filter(
    (task) => task.execution?.status === "completed"
  ).length;
  const total = module.tasks.length;

  return { completed, total };
}

/**
 * 计算所有模块的总完成度
 * @param {Array} modules - 任务模块数组
 * @returns {Object} 完成度统计 { completed, total }
 */
export function calculateTotalCompletion(modules) {
  if (!modules || modules.length === 0) {
    return { completed: 0, total: 0 };
  }

  let completed = 0;
  let total = 0;

  modules.forEach((module) => {
    if (module.tasks && module.tasks.length > 0) {
      completed += module.tasks.filter(
        (task) => task.execution?.status === "completed"
      ).length;
      total += module.tasks.length;
    }
  });

  return { completed, total };
}

