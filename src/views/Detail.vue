<template>
    <div class="forum-page">
        <div v-if="loading" class="loading-state" style="text-align:center; padding:60px; color:#2c5a7a;">
            <p>加载中...</p>
        </div>
        <div v-else-if="post" class="detail-wrapper">
            <div class="detail-layout">
                <!-- 左侧边栏：帖子列表 -->
                <aside class="detail-sidebar glass">
                    <h3><img src="/img/liaofa.png" class="section-icon"> 所有帖子</h3>
                    <router-link v-for="p in allPosts" :key="p.id" :to="'/detail/' + p.id" class="sidebar-post-link"
                        :class="{ active: p.id == post.id }">
                        {{ p.title }}
                    </router-link>
                    <p v-if="allPosts.length === 0" style="color:#5a7a8a;">暂无帖子</p>
                </aside>

                <!-- 主内容区 -->
                <main class="detail-main glass">
                    <router-link to="/forum" class="back-link">
                        <i class="fas fa-arrow-left"></i> 返回列表
                    </router-link>

                    <div class="post-header">
                        <div class="post-author">
                            <img :src="post.avatar" class="avatar">
                            <div class="author-info">
                                <span class="author-name">{{ post.username }}</span>
                                <span class="post-time"><i class="far fa-clock"></i> {{ formatTime(post.created_at) }}</span>
                            </div>
                        </div>
                        <div class="post-actions">
                            <div class="like-wrapper">
                                <button class="like-btn" :class="{ liked: post.liked }" @click="toggleLike">
                                    <i class="fas fa-heart"></i>
                                    <span>{{ post.likeCount || 0 }}</span>
                                </button>
                            </div>
                            <span class="post-tag" :class="'tag-' + post.tag">
                                {{ post.tag === 'mygo' ? 'MyGO!!!!!' : 'Ave Mujica' }}
                            </span>
                            <button v-if="user && (user.is_admin === 1 || user.id === post.user_id)"
                                class="btn-icon btn-danger" @click="deletePost" title="删除">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>

                    <div class="post-body">
                        <h3 class="post-title">{{ post.title }}</h3>
                        <p class="post-content">{{ post.content }}</p>
                        <div class="post-images-grid" v-if="post.images && post.images.length">
                            <img v-for="(img, idx) in post.images" :src="img" class="post-thumb" @click="openLightbox(idx)">
                        </div>
                    </div>

                    <div class="post-likers" v-if="post.likeCount > 0">
                        <i class="fas fa-thumbs-up" style="color: #3b9eff; margin-right: 6px;"></i>
                        <span class="likers-list">
                            <template v-for="(u, idx) in likeUsers" :key="u.username">
                                <span class="liker-name">{{ u.username }}</span>
                                <span v-if="idx < likeUsers.length - 1">、</span>
                            </template>
                        </span>
                    </div>

                    <!-- 评论区 -->
                    <div class="comments-section">
                        <div class="comments-header">评论 ({{ comments.length }})</div>
                        <div class="comment-list">
                            <div v-for="comment in comments" :key="comment.id" class="comment-item">
                                <img :src="comment.avatar" class="comment-avatar">
                                <div class="comment-bubble">
                                    <div class="comment-meta">
                                        <span class="comment-author">{{ comment.username }}</span>
                                        <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
                                    </div>
                                    <p class="comment-content">{{ comment.content }}</p>
                                </div>
                            </div>
                            <div v-if="comments.length === 0" class="no-comments">还没有评论，快来发表第一条吧</div>
                        </div>
                        <div class="comment-input-wrapper">
                           <input v-model="commentInput" placeholder="写下你的评论..." class="comment-input" @keyup.enter="publishComment">
                           <button class="btn-send" @click="publishComment">发送</button>
                        </div>
                    </div>
                </main>

                <!-- 右侧边栏 -->
                <aside class="detail-right-sidebar glass">
                    <h3 class="sidebar-card-title"><img src="/img/tomori.png" class="section-icon" /> 番剧</h3>
                    <div class="sidebar-preview-box">
                        <div class="preview-item">
                            <img src="/img/song/mujica.jpg" alt="番剧封面"
                                onclick="window.open('https://www.bilibili.com/bangumi/play/ss73081')">
                            <span>BanG Dream Ave Mujica</span>
                        </div>
                        <div class="preview-item">
                            <img src="/img/song/mygo.jpg" alt="番剧封面"
                                onclick="window.open('https://www.bilibili.com/bangumi/play/ss73077')">
                            <span>BanG Dream! It's MyGO!!!!!</span>
                        </div>
                    </div>
                    <!-- 音乐栏 -->
                    <h3 class="sidebar-card-title" style="margin-top: 15px;"><img src="/img/saki.png" class="section-icon" /> 音乐</h3>
                    <div class="sidebar-preview-box">
                        <div class="preview-item">
                            <img src="/img/song/mujica-musica.jpg" alt="专辑封面"
                                onclick="window.open('https://www.bilibili.com/video/BV14iZ3YcEZw/')">
                            <span>天球(そら)のMúsica</span>
                        </div>
                        <div class="preview-item">
                            <img src="/img/song/mujica-choir.jpg" alt="专辑封面"
                                onclick="window.open('https://www.bilibili.com/video/BV1JZ4y1n7yz/')">
                            <span>Choir S Choir</span>
                        </div>
                        <div class="preview-item">
                            <img src="/img/song/mujica-ark.jpg" alt="专辑封面"
                                onclick="window.open('https://www.bilibili.com/video/BV13Ma2zjEMA/')">
                            <span>in your blue eyes</span>
                        </div>
                        <div class="preview-item">
                            <img src="/img/song/mujica-birthday.jpg" alt="专辑封面"
                                onclick="window.open('https://www.bilibili.com/video/BV16v4y1H7ZR/')">
                            <span>黒のバースデイ</span>
                        </div>
                        <div class="preview-item">
                            <img src="/img/song/mygo-magical.jpg" alt="专辑封面"
                                onclick="window.open('https://www.bilibili.com/video/BV1pc2UYhETL/')">
                            <span>過惰幻</span>
                        </div>
                        <div class="preview-item">
                            <img src="/img/song/mygo-star.jpg" alt="专辑封面"
                                onclick="window.open('https://www.bilibili.com/video/BV1hG4y1o74w/')">
                            <span>名無声</span>
                        </div>
                        <div class="preview-item">
                            <img src="/img/song/mygo-kan.jpg" alt="专辑封面"
                                onclick="window.open('https://www.bilibili.com/video/BV1na4y1c7bR/')">
                            <span>栞</span>
                        </div>
                        <div class="preview-item">
                            <img src="/img/song/mygo-autumn.jpg" alt="专辑封面"
                                onclick="window.open('https://www.bilibili.com/video/BV1YbZVYCEko/')">
                            <span>聿日箋秋</span>
                        </div>
                    </div>

                    <div class="sidebar-bottom-tag">Per aspera ad astra</div>
                </aside>
            </div>
        </div>

        <!-- 帖子不存在 -->
        <div v-else class="empty-state glass" style="text-align:center; padding:60px;">
            <p>帖子不存在或已被删除</p>
            <router-link to="/forum" class="back-link" style="margin-top:20px;">返回论坛</router-link>
        </div>

        <!-- 灯箱 -->
        <Lightbox
            :images="lightboxImages"
            :visible="lightboxVisible"
            :start-index="lightboxIndex"
            @close="lightboxVisible = false"
        />

    </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue"
import Lightbox from "../components/Lightbox.vue"

import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()
const post = ref(null)
const loading = ref(true)
const commentInput = ref("")
const comments = ref([])
const likeUsers = ref([])
const user = ref(null)
const allPosts = ref([])
const postId = ref(Number(route.params.id))
const lightboxVisible = ref(false)
const lightboxImages = ref([])
const lightboxIndex = ref(0)

const formatTime = (ts) => ts ? new Date(ts).toLocaleString("zh-CN") : ""

const fetchAllPosts = async () => {
    try {
        const savedUser = localStorage.getItem("mygo_user")
        const uid = savedUser ? JSON.parse(savedUser).id : ""
        const res = await fetch(`/api/posts?userId=${uid}&limit=20`).then(r => r.json())
        allPosts.value = Array.isArray(res) ? res : []
    } catch (e) {
        console.error("加载所有帖子失败", e)
        allPosts.value = []
    }
}

const fetchPostDetail = async () => {
    const savedUser = localStorage.getItem("mygo_user")
    if (savedUser) user.value = JSON.parse(savedUser)

    try {
        const res = await fetch(`/api/post/${postId.value}?userId=${user.value?.id || ""}`).then(r => r.json())
        if (res.success && res.post) {
            post.value = res.post
            let images = res.post.imageUrls ? res.post.imageUrls.split("||") : []
            post.value.images = [...new Set(images)]
            fetchComments()
            if (post.value.likeCount > 0) fetchLikeUsers()
        } else {
            post.value = null
        }
    } catch (e) {
        console.error("加载帖子详情失败", e)
        post.value = null
    } finally {
        loading.value = false
    }
}

const fetchComments = async () => {
    try {
        const res = await fetch(`/api/comments/${postId.value}`).then(r => r.json())
        comments.value = res
    } catch (e) {
        comments.value = []
    }
}

const fetchLikeUsers = async () => {
    try {
        const res = await fetch(`/api/post/${postId.value}/likes/users`).then(r => r.json())
        likeUsers.value = res
    } catch (e) {
        likeUsers.value = []
    }
}

const toggleLike = async () => {
    if (!user.value) return
    try {
        const res = await fetch(`/api/post/${post.value.id}/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.value.id })
        }).then(r => r.json())
        if (res.success) {
            post.value.liked = res.liked
            post.value.likeCount += res.liked ? 1 : -1
            fetchLikeUsers()
        }
    } catch (e) {
        console.error("点赞操作失败", e)
    }
}

const publishComment = async () => {
    const c = commentInput.value.trim()
    if (!c || !user.value) return


    try {
        const res = await fetch("/api/comment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId: postId.value, userId: user.value.id, content: c })
        }).then(r => r.json())
        if (res.success) {
            commentInput.value = ""
            fetchComments()
        }
    } catch (e) {
        console.error("发布评论失败", e)
    }
}

const deletePost = async () => {
    if (!confirm("确定删除吗？")) return
    try {
        const res = await fetch(`/api/post/${postId.value}?userId=${user.value.id}`, { method: "DELETE" }).then(r => r.json())
        if (res.success) {
            router.push("/forum")
        }
    } catch (e) {
        console.error("删除帖子失败", e)
    }
}

const openLightbox = (i) => {
    if (!post.value?.images?.length) return
    lightboxImages.value = post.value.images
    lightboxIndex.value = i
    lightboxVisible.value = true

}

// 监听路由参数变化，切帖子时自动重新加载
watch(() => route.params.id, (n) => {
    postId.value = Number(n)
    fetchPostDetail()
})
onMounted(() => {
    fetchAllPosts()
    fetchPostDetail()

})

</script>

<style>
@import "../assets/styles/forum.css";
@import "../assets/styles/detail.css";
</style>
