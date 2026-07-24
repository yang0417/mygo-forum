import { createRouter, createWebHistory } from "vue-router"
import Login from "../views/Login.vue"
import Forum from "../views/Forum.vue"
import Detail from "../views/Detail.vue"
import Admin from "../views/Admin.vue"

const routes = [
    {
        path: "/",
        name: "Login",
        component: Login
    },
    {
        path: "/forum",
        name: "Forum",
        component: Forum
    },
    {
        path: "/detail/:id",
        name: "Detail",
        component: Detail
    },
    {
        path: "/admin",
        name: "Admin",
        component: Admin
    },
    // 向后兼容：旧链接跳转
    {
        path: "/index.html",
        redirect: "/forum"
    },
    {
        path: "/login.html",
        redirect: "/"
    },
    {
        path: "/admin.html",
        redirect: "/admin"
    },
    {
        path: "/detail.html",
        redirect: "/forum"
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫：未登录用户跳转到登录页
router.beforeEach((to) => {
    const savedUser = localStorage.getItem("mygo_user")
    if (to.name === "Login" || !to.name) return true
    if (!savedUser) return { name: "Login" }
})

export default router
