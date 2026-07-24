<template>
    <div class="login-page">
        <div class="login-container">
            <div class="login-glass-card">
                <div class="login-header">
                    <img src="/img/saki.png" alt="Saki" class="header-icon">
                    <h1>MyGO &amp; Ave Mujica</h1>
                    <img src="/img/tomori.png" alt="Tomori" class="header-icon">
                </div>
                <p class="login-subtitle">要和我组一辈子乐队吗？</p>

                <div class="tab-bar">
                    <button class="tab-btn" :class="{ active: activeTab === 'login' }" @click="switchTab('login')">
                        <img src="/img/liaofa.png" class="img-sm" alt=""> 登录
                    </button>
                    <button class="tab-btn" :class="{ active: activeTab === 'register' }" @click="switchTab('register')">
                        <img src="/img/cge.png" class="img-sm" alt=""> 注册
                    </button>
                </div>

                <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="auth-form">
                    <div class="input-group">
                        <i class="fas fa-user"></i>
                        <input v-model="loginForm.username" placeholder="用户名" autocomplete="off">
                    </div>
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input :type="showLoginPwd ? 'text' : 'password'" v-model="loginForm.password" placeholder="密码">
                        <i :class="showLoginPwd ? 'fas fa-eye-slash' : 'fas fa-eye'" @click="toggleLoginPwd"
                           style="cursor:pointer; color:#4f93ce; margin-left:8px;"></i>
                    </div>
                    <button type="submit" class="btn-login" :disabled="loading">
                        <i class="fas" :class="loading ? 'fa-spinner fa-pulse' : 'fa-arrow-right'"></i>
                        登&nbsp;录
                    </button>
                </form>

                <form v-else @submit.prevent="handleRegister" class="auth-form">
                    <p class="form-label">选择你的头像</p>
                    <div class="avatar-grid">
                        <img v-for="i in 12" :key="i" :src="'/img/icon/' + i + '.png'" class="avatar-option"
                            :class="{ selected: registerForm.avatar === '/img/icon/' + i + '.png' }"
                            @click="registerForm.avatar = '/img/icon/' + i + '.png'">
                    </div>
                    <div class="input-group">
                        <i class="fas fa-user"></i>
                        <input v-model="registerForm.username" placeholder="昵称">
                    </div>
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input :type="showRegisterPwd ? 'text' : 'password'" v-model="registerForm.password"
                            placeholder="密码 (至少8位，含字母和数字)">
                      
                    </div>
                    <div class="input-group">
                        <i class="fas fa-check-circle"></i>
                        <input :type="showRegisterPwd ? 'text' : 'password'" v-model="registerForm.confirmPassword"
                            placeholder="确认密码">
                    </div>
                    <button type="submit" class="btn-login" :disabled="loading">
                        <i class="fas" :class="loading ? 'fa-spinner fa-pulse' : 'fa-user-plus'"></i>
                        注册并登录
                    </button>
                </form>
                <p class="login-footer">MyGO!!!!! Ave Mujica</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from "vue"

const activeTab = ref("login")
const loading = ref(false)
const loginForm = reactive({ username: "", password: "" })
const registerForm = reactive({ username: "", password: "", confirmPassword: "", avatar: "/img/icon/1.png" })
const showLoginPwd = ref(false)
const showRegisterPwd = ref(false)

const switchTab = (tab) => { activeTab.value = tab }
const toggleLoginPwd = () => { showLoginPwd.value = !showLoginPwd.value }
const toggleRegisterPwd = () => { showRegisterPwd.value = !showRegisterPwd.value }

const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
        alert("输入用户名和密码")
        return
    }
    loading.value = true
    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginForm)
        }).then(r => r.json())
        if (res.success) {
            localStorage.setItem("mygo_user", JSON.stringify(res.user))
            window.location.href = "/forum"
        } else {
            alert("账号或密码错误")
        }
    } catch (err) {
        alert("网络错误")
    } finally {
        loading.value = false
    }
}

const handleRegister = async () => {
    if (!registerForm.username || !registerForm.password || !registerForm.confirmPassword) {
        alert("请填写完整的注册信息")
        return
    }
    if (registerForm.password.length < 8) {
        alert("密码长度至少需要 8 位")
        return
    }
    const hasLetter = /[a-zA-Z]/.test(registerForm.password)
    const hasNumber = /\d/.test(registerForm.password)
    if (!hasLetter || !hasNumber) {
        alert("密码必须同时包含英文字母和数字")
        return
    }
    if (registerForm.password !== registerForm.confirmPassword) {
        alert("两次输入的密码不一致，请重新输入")
        return
    }

    loading.value = true
    try {
        const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerForm)
        }).then(r => r.json())
        if (res.success) {
            alert("注册成功！正在登录..")
            loginForm.username = registerForm.username
            loginForm.password = registerForm.password
            await handleLogin()
        } else {
            alert("注册失败：" + (res.msg || "用户名已存在"))
        }
    } catch (err) {
        alert("网络错误")
    } finally {
        loading.value = false
    }
}
</script>

<style>
@import "../assets/styles/auth.css";

.login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
}
</style>
