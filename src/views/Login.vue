<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="login-bg"></div>

    <!-- 登录面板 -->
    <div class="login-panel">
      <!-- 标题区域 -->
      <div class="login-header">
        <h1 class="login-title">八角数据管理平台</h1>
        <p class="login-subtitle">Star Anise Data Management Platform</p>
      </div>

      <!-- 表单区域 -->
      <div class="login-form">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <div class="input-wrapper">
            <input
              v-model="loginForm.username"
              type="text"
              class="form-input"
              placeholder="请输入用户名"
              @keyup.enter="handleLogin"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <div class="input-wrapper">
            <input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="请输入密码"
              @keyup.enter="handleLogin"
            />
            <span class="password-toggle" @click="showPassword = !showPassword">
              {{ showPassword ? '隐藏' : '显示' }}
            </span>
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input v-model="loginForm.rememberMe" type="checkbox" />
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-password" @click.prevent>忘记密码?</a>
        </div>

        <button
          class="login-button"
          :class="{ 'is-loading': loading }"
          :disabled="loading"
          @click="handleLogin"
        >
          <span v-if="!loading">登录</span>
          <span v-else>登录中...</span>
        </button>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>

      <!-- 底部装饰 -->
      <div class="login-footer">
        <div class="decoration-line"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        username: '',
        password: '',
        rememberMe: false
      },
      showPassword: false,
      loading: false,
      errorMessage: ''
    };
  },
  methods: {
    async handleLogin() {
      // 表单验证
      if (!this.loginForm.username) {
        this.errorMessage = '请输入用户名';
        return;
      }
      if (!this.loginForm.password) {
        this.errorMessage = '请输入密码';
        return;
      }

      this.loading = true;
      this.errorMessage = '';

      try {
        // TODO: 调用登录API
        // const response = await login(this.loginForm);

        // 模拟登录请求
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 保存登录状态
        localStorage.setItem('isAuthenticated', 'true');
        if (this.loginForm.rememberMe) {
          localStorage.setItem('username', this.loginForm.username);
        }

        // 登录成功后跳转
        this.$router.push({ name: 'Dashboard' });
      } catch (error) {
        this.errorMessage = error.message || '登录失败，请重试';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.login-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0a1420;
}

// 背景
.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at center, #102838 0%, #0a1420 100%);
  opacity: .5;

  &::after {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, transparent 0%, #0a1420 100%);
    content: '';
  }
}

// 登录面板
.login-panel {
  position: relative;
  z-index: 1;
  width: 480px;
  padding: 60px 50px;
  background: linear-gradient(135deg, rgba(16, 40, 56, 0.95) 0%, rgba(8, 28, 36, 0.98) 100%);
  border: 1px solid rgba(198, 156, 109, 0.3);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5),
              0 0 40px rgba(76, 207, 234, 0.1),
              inset 0 1px 0 rgba(198, 156, 109, 0.2);
  backdrop-filter: blur(10px);
}

// 标题区域
.login-header {
  margin-bottom: 40px;
  text-align: center;
}

.login-title {
  margin-bottom: 12px;
  font-family: SourceHanSansCN-Medium, sans-serif;
  font-size: 32px;
  font-weight: 500;
  color: #c69c6d;
  letter-spacing: 2px;
  text-shadow: 0 0 20px rgba(198, 156, 109, 0.3);
}

.login-subtitle {
  font-family: BebasNeueRegular, sans-serif;
  font-size: 14px;
  color: #4cfcea;
  letter-spacing: 1px;
  text-transform: uppercase;
}

// 表单
.login-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-family: SourceHanSansCN-Regular, sans-serif;
  font-size: 14px;
  color: #c69c6d;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  font-family: SourceHanSansCN-Regular, sans-serif;
  font-size: 15px;
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(198, 156, 109, 0.3);
  border-radius: 6px;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    background: rgba(255, 255, 255, 0.08);
    border-color: #4cfcea;
    box-shadow: 0 0 0 3px rgba(76, 207, 234, 0.1);
  }

  &:hover {
    border-color: rgba(198, 156, 109, 0.5);
  }
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 16px;
  font-size: 13px;
  color: #4cfcea;
  cursor: pointer;
  user-select: none;
  transform: translateY(-50%);
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
}

// 表单选项
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.remember-me {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    cursor: pointer;
    accent-color: #4cfcea;
  }

  span {
    user-select: none;
  }
}

.forgot-password {
  font-size: 14px;
  color: #4cfcea;
  text-decoration: none;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
    text-decoration: underline;
  }
}

// 登录按钮
.login-button {
  width: 100%;
  height: 52px;
  font-family: SourceHanSansCN-Medium, sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #0a1420;
  cursor: pointer;
  background: linear-gradient(135deg, #c69c6d 0%, #d4ae81 100%);
  border: none;
  border-radius: 6px;
  outline: none;
  box-shadow: 0 4px 15px rgba(198, 156, 109, 0.3);
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(198, 156, 109, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  &.is-loading {
    position: relative;

    &::after {
      position: absolute;
      top: 50%;
      right: 20px;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(10, 20, 32, 0.3);
      border-top-color: #0a1420;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      content: '';
      transform: translateY(-50%);
    }
  }
}

@keyframes spin {
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}

// 错误提示
.error-message {
  margin-top: 16px;
  padding: 12px;
  font-size: 14px;
  color: #ff6b4a;
  text-align: center;
  background: rgba(255, 107, 74, 0.1);
  border: 1px solid rgba(255, 107, 74, 0.3);
  border-radius: 6px;
}

// 底部装饰
.login-footer {
  margin-top: 40px;
}

.decoration-line {
  height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(198, 156, 109, 0.3) 20%,
    rgba(76, 207, 234, 0.5) 50%,
    rgba(198, 156, 109, 0.3) 80%,
    transparent 100%);
}

// 响应式
@media (max-width: 768px) {
  .login-panel {
    width: 90%;
    max-width: 400px;
    padding: 40px 30px;
  }

  .login-title {
    font-size: 24px;
  }

  .login-subtitle {
    font-size: 12px;
  }
}
</style>
