<template>
    <div class="forum-page">
        <div v-if="loading" class="loading-state" style="text-align:center; padding:60px;">加载中...</div>
        <div v-else-if="!isAdmin" class="empty-state glass" style="text-align:center; padding:60px;">
            <p>无权限访问</p>
            <router-link to="/forum" class="back-link">返回论坛</router-link>
        </div>
        <div v-else class="admin-wrapper">
            <div class="admin-header">
                <h1>后台管理</h1>
                <router-link to="/forum" class="back-link"><i class="fas fa-arrow-left"></i> 返回论坛</router-link>
            </div>

            <div class="stats-row">
                <div class="stat-card glass stat-posts">
                    <i class="fas fa-file-alt"></i>
                    <div class="stat-number">{{ stats.posts }}</div>
                    <div class="stat-label">总帖子数</div>
                </div>
                <div class="stat-card glass stat-users">
                    <i class="fas fa-users"></i>
                    <div class="stat-number">{{ stats.users }}</div>
                    <div class="stat-label">注册用户</div>
                </div>
                <div class="stat-card glass stat-comments">
                    <i class="fas fa-comments"></i>
                    <div class="stat-number">{{ stats.comments }}</div>
                    <div class="stat-label">总评论数</div>
               </div>
                <div v-if="false">
                    <div class="table-wrapper" v-if="comments.length > 0">
                        <table class="data-table">
                            <thead>
                                <tr><th>内容</th><th>作者</th><th>所属帖子</th><th>时间</th><th>操作</th></tr>
                            </thead>
                            <tbody>
                                <tr v-for="c in comments" :key="c.id">
                                    <td><strong>{{ c.content }}</strong></td>
                                    <td><div class="user-cell"><img :src="c.author_avatar" class="mini-avatar"><span>{{ c.author }}</span></div></td>
                                    <td>{{ c.post_title }}</td>
                                    <td>{{ formatTime(c.created_at) }}</td>
                                    <td><button class="btn-delete" @click="deleteComment(c.id)">删除</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="empty-state-table"><i class="fas fa-comments"></i> 暂无评论</div>
               </div>
                <div v-if="false">
                   <div class="table-wrapper" v-if="comments.length > 0">
                        <table class="data-table">
                            <thead>
                                <tr><th>内容</th><th>作者</th><th>所属帖子</th><th>时间</th><th>操作</th></tr>
                            </thead>
                            <tbody>
                                <tr v-for="c in comments" :key="c.id">
                                    <td><strong>{{ c.content }}</strong></td>
                                    <td><div class="user-cell"><img :src="c.author_avatar" class="mini-avatar"><span>{{ c.author }}</span></div></td>
                                    <td>{{ c.post_title }}</td>
                                    <td>{{ formatTime(c.created_at) }}</td>
                                    <td><button class="btn-delete" @click="deleteComment(c.id)">删除</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="empty-state-table"><i class="fas fa-comments"></i> 暂无评论</div>
                </div>
            </div>

            <div class="admin-panel admin-glass">
                <div class="panel-tabs">
                    <button class="panel-tab" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">帖子管理</button>
                   <button class="panel-tab" :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">用户管理</button>
                    <button class="panel-tab" :class="{ active: activeTab === 'comments' }" @click="activeTab = 'comments'">评论管理</button>
                </div>

                <div v-if="activeTab === 'posts'">
                    <div class="table-wrapper" v-if="posts.length > 0">
                        <table class="data-table">
                            <thead>
                                <tr><th>标题</th><th>作者</th><th>评论数</th><th>发布时间</th><th>操作</th></tr>
                            </thead>
                            <tbody>
                                <tr v-for="post in posts" :key="post.id">
                                    <td><strong>{{ post.title }}</strong></td>
                                    <td><div class="user-cell"><img :src="post.avatar" class="mini-avatar"><span>{{ post.username }}</span></div></td>
                                    <td>{{ post.commentCount }}</td>
                                    <td>{{ formatTime(post.created_at) }}</td>
                                    <td><button class="btn-delete" @click="deletePost(post.id)">删除</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="empty-state-table"><i class="fas fa-inbox"></i>暂无帖子，去首页发一个试试吧</div>
                </div>

                <div v-if="activeTab === 'users'">
                    <div class="table-wrapper" v-if="users.length > 0">
                        <table class="data-table">
                            <thead>
                                <tr><th>用户</th><th>角色</th><th>发帖数</th><th>评论数</th><th>注册时间</th><th>操作</th></tr>
                            </thead>
                            <tbody>
                                <tr v-for="u in users" :key="u.id">
                                    <td><div class="user-cell"><img :src="u.avatar" class="mini-avatar"><span>{{ u.username }}</span></div></td>
                                    <td><span v-if="u.is_admin === 1" class="admin-badge">管理员</span><span v-else style="color:#5a7a8a;">普通用户</span></td>
                                    <td>{{ u.postCount }}</td>
                                    <td>{{ u.commentCount }}</td>
                                    <td>{{ formatTime(u.created_at) }}</td>
                                    <td><button class="btn-delete" @click="deleteUser(u.id)">删除</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                   <div v-else class="empty-state-table"><i class="fas fa-users"></i>暂时还没有注册用户</div>
               </div>
                <div v-if="activeTab === 'comments'">
                    <div class="table-wrapper" v-if="comments.length > 0">
                        <table class="data-table">
                            <thead>
                                <tr><th>内容</th><th>作者</th><th>所属帖子</th><th>时间</th><th>操作</th></tr>
                            </thead>
                            <tbody>
                                <tr v-for="c in comments" :key="c.id">
                                    <td><strong>{{ c.content }}</strong></td>
                                    <td><div class="user-cell"><img :src="c.author_avatar" class="mini-avatar"><span>{{ c.author }}</span></div></td>
                                    <td>{{ c.post_title }}</td>
                                    <td>{{ formatTime(c.created_at) }}</td>
                                    <td><button class="btn-delete" @click="deleteComment(c.id)">删除</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div v-else class="empty-state-table"><i class="fas fa-comments"></i> 暂无评论</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const isAdmin = ref(false)
const loading = ref(true)
const stats = ref({ posts: 0, users: 0, comments: 0 })
const posts = ref([])
const users = ref([])
const comments = ref([])
const activeTab = ref("posts")

const formatTime = (ts) => {
    if (!ts) return "未知"
    return new Date(ts).toLocaleString("zh-CN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit"
    })
}

const fetchAll = async () => {
    const savedUser = localStorage.getItem("mygo_user")
    if (!savedUser) { loading.value = false; return }
    const user = JSON.parse(savedUser)
    if (user.is_admin !== 1) { isAdmin.value = false; loading.value = false; return }
    isAdmin.value = true

    try {
        const [statsRes, postsRes, usersRes, commentsRes] = await Promise.all([
            fetch(`/api/admin/stats?userId=${user.id}`).then(r => r.json()),
            fetch(`/api/admin/posts?userId=${user.id}`).then(r => r.json()),
            fetch(`/api/admin/users?userId=${user.id}`).then(r => r.json()),
            fetch(`/api/admin/comments?userId=${user.id}`).then(r => r.json())
        ])
        if (statsRes.success) stats.value = { posts: statsRes.posts, users: statsRes.users, comments: statsRes.comments }
        posts.value = postsRes
        users.value = usersRes
        comments.value = commentsRes
    } catch (err) {
        console.error("加载失败", err)
    }
    loading.value = false
}

const deleteComment = async (commentId) => {
    if (!confirm("确定删除这个评论吗？")) return
    const savedUser = localStorage.getItem("mygo_user")
    const user = JSON.parse(savedUser)
    try {
        const res = await fetch(`/api/admin/comment/${commentId}?userId=${user.id}`, { method: "DELETE" }).then(r => r.json())
        if (res.success) {
            comments.value = comments.value.filter(c => c.id !== commentId)
            stats.value.comments--
        }
    } catch (err) {
        alert("删除失败")
    }
}

const deleteUser = async (userId) => {
    if (!confirm("确定删除这个用户吗？\n该用户的所有帖子、评论也将被删除。")) return
    const savedUser = localStorage.getItem("mygo_user")
    const admin = JSON.parse(savedUser)
    try {
        const res = await fetch(`/api/admin/user/${userId}?userId=${admin.id}`, { method: "DELETE" }).then(r => r.json())
        if (res.success) {
            users.value = users.value.filter(u => u.id !== userId)
            stats.value.users--
        }
    } catch (err) {
        alert("删除失败")
    }
}

const deletePost = async (postId) => {
    if (!confirm("确定删除这个帖子吗？")) return
    const savedUser = localStorage.getItem("mygo_user")
    const user = JSON.parse(savedUser)
    try {
        const res = await fetch(`/api/post/${postId}?userId=${user.id}`, { method: "DELETE" }).then(r => r.json())
        if (res.success) {
            posts.value = posts.value.filter(p => p.id !== postId)
            stats.value.posts--
        }
    } catch (err) {
        alert("删除失败")
    }
}

// 切标签时滚动到管理面板顶部
watch(activeTab, () => {
    const el = document.querySelector(".admin-panel")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
})

onMounted(() => { fetchAll() })
</script>

<style>
.admin-glass {
    background: rgba(245, 250, 255, 0.88) !important;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-light);
    border-radius: 32px;
    box-shadow: var(--shadow-sm);
    transition: all 0.25s ease;
}
.admin-glass:hover { box-shadow: var(--shadow-hover); background: rgba(245, 250, 255, 0.92) !important; }
.admin-wrapper { max-width: 1100px; margin: 0 auto; padding: 20px; }
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding: 0 5px; }
.admin-header h1 { color: #1e4460; font-size: 2rem; font-family: var(--font-serif); }
.back-link { color: #2c5a7a; text-decoration: none; font-weight: 600; transition: 0.2s; }
.back-link:hover { color: #1e6fa3; transform: translateX(-3px); }
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
.stat-card { text-align: center; padding: 30px 20px; border-radius: 32px; background: rgba(255, 255, 255, 0.75) !important; cursor: default; transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-4px); background: rgba(255, 255, 255, 0.95) !important; }
.stat-card .stat-number { font-size: 3rem; font-weight: 700; color: #0a2a3b; margin: 10px 0 5px; }
.stat-card .stat-label { color: #5a7a8a; font-size: 1rem; font-weight: 500; }
.stat-card i { font-size: 2.2rem; margin-bottom: 5px; }
.stat-posts i { color: #4a9eda; }
.stat-users i { color: #f7b731; }
.stat-comments i { color: #7b9ed4; }
.admin-panel { margin-top: 20px; padding: 25px; border-radius: 32px; }
.panel-tabs { display: flex; gap: 10px; margin-bottom: 25px; }
.panel-tab { padding: 10px 24px; border-radius: 60px; border: none; background: rgba(255, 255, 255, 0.5); cursor: pointer; font-weight: 600; color: #2c5a7a; transition: 0.2s; }
.panel-tab:hover { background: rgba(255, 255, 255, 0.8); }
.panel-tab.active { background: #3b9eff; color: white; box-shadow: 0 4px 12px rgba(59, 158, 255, 0.3); }
.table-wrapper { border-radius: 20px; overflow: hidden; background: rgba(255, 255, 255, 0.4); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; padding: 16px 20px; color: #1e4460; font-size: 0.95rem; background: rgba(59, 158, 255, 0.08); }
.data-table td { padding: 16px 20px; border-bottom: 1px solid rgba(0, 0, 0, 0.04); color: #1e3b4f; font-size: 0.95rem; }
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: rgba(59, 158, 255, 0.05); }
.data-table .user-cell { display: flex; align-items: center; gap: 12px; }
.data-table .mini-avatar { width: 36px; height: 36px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); }
.btn-delete { background: #fee2e2; color: #d34f4f; border: none; padding: 6px 14px; border-radius: 60px; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
.btn-delete:hover { background: #fca5a5; transform: scale(1.05); }
.empty-state-table { text-align: center; padding: 40px 20px; color: #5a7a8a; background: rgba(255, 255, 255, 0.3); border-radius: 20px; margin-top: 15px; }
.empty-state-table i { font-size: 2.5rem; opacity: 0.6; margin-bottom: 10px; display: block; }
.admin-badge { background: #f7b731; color: white; padding: 4px 12px; border-radius: 30px; font-size: 0.8rem; display: inline-block; }
@media (max-width: 768px) { .stats-row { grid-template-columns: 1fr; } .data-table { font-size: 0.9rem; } .data-table th, .data-table td { padding: 12px; } .panel-tabs { flex-wrap: wrap; } }
</style>
