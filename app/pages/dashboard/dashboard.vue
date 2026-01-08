<template>
  <view> 看板页面 </view>
</template>

<script>
export default {
  data() {
    return {
      lastTabTapTime: 0,
      lastTabIndex: -1,
      DOUBLE_TAP_DELAY: 500, // 双击间隔时间（毫秒）
    };
  },
  methods: {
    refreshData() {
      // 刷新页面数据
      uni.showToast({
        title: "刷新中...",
        icon: "loading",
        duration: 1000,
      });
      // 这里可以添加具体的刷新逻辑
      console.log("刷新看板页面数据");
    },
  },
  onTabItemTap(e) {
    const currentTime = Date.now();
    const currentTabIndex = e.index;
    
    // 判断是否为双击（同一tab，间隔小于500ms）
    if (
      this.lastTabIndex === currentTabIndex &&
      currentTime - this.lastTabTapTime < this.DOUBLE_TAP_DELAY
    ) {
      // 双击刷新
      this.refreshData();
    }
    
    // 更新记录
    this.lastTabTapTime = currentTime;
    this.lastTabIndex = currentTabIndex;
  },
};
</script>

<style></style>
