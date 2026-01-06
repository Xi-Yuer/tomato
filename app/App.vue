<script>
import { storage } from "./utils/storage.js";

export default {
  onLaunch: function () {
    // 检查是否已登录
    this.checkAuth();
  },
  onShow: function () {},
  onHide: function () {},
  methods: {
    // 检查登录状态
    checkAuth() {
      const token = storage.getToken();
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const currentRoute = currentPage ? currentPage.route : "";

      // 如果没有token且不在登录页，跳转到登录页
      if (!token && currentRoute !== "pages/login/login") {
        uni.reLaunch({
          url: "/pages/login/login",
        });
      }
    },
  },
};
</script>

<style lang="scss">
/*每个页面公共css */
@import "@/uni_modules/uni-scss/index.scss";
/* #ifndef APP-NVUE */
@import "@/static/customicons.css";
// 设置整个项目的背景色
page {
  position: relative;
  min-height: 100vh;
  overflow: auto;
  padding-top: 0;
  box-sizing: border-box;
  padding-bottom: 60rpx;
}

page::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100%;
  background: linear-gradient(to bottom, #e8f0fe 0%, #f5f0ff 50%, #f1eeff 100%);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  z-index: -1;
}
</style>
