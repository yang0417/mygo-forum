<template>
    <div class="forum-page">
        <!-- 加载状态 -->
        <div v-if="!user" class="loading-state" style="text-align:center; padding:50px; color:#2c5a7a;">
            <p>加载中...</p>
        </div>

        <div v-else class="forum-layout">
            <!-- 左侧边栏 -->
            <aside class="sidebar">
                <div class="sidebar-inner">
                    <div class="user-card glass">
                        <img :src="user.avatar" class="user-avatar-large">
                        <div class="user-info">
                            <h3>{{ user.username }}</h3>
                            <span v-if="user.is_admin === 1" class="admin-badge">管理员</span>
                        </div>
                        <button class="btn-logout-side" @click="handleLogout">
                            <img src="/img/zbi.png" class="img-sm" alt=""> 退出
                        </button>
                        <a v-if="user.is_admin === 1" href="/admin" class="btn-logout-side"
                            style="text-decoration:none; margin-top:10px;">
                            <i class="fas fa-cog"></i> 后台管理
                        </a>
                    </div>

                    <div class="composer-card glass">
                        <h3><img src="/img/jus.png" class="img-sm" alt="">分享你的想法</h3>
                        <input v-model="newPost.title" placeholder="标题" class="composer-input">
                        <textarea v-model="newPost.content" placeholder="写下你想说的话..." rows="5" class="composer-textarea"></textarea>
                        <div class="upload-section">
                            <label class="upload-label">
                                <input type="file" accept="image/*" multiple @change="handlePostImages" style="display:none">
                                <span class="upload-trigger">选择图片 (最多6张)</span>
                            </label>
                            <div class="preview-images" v-if="newPostImages.length">
                                <div class="preview-item" v-for="(img, idx) in newPostImages" :key="idx">
                                    <img :src="img.preview" class="preview-thumb">
                                    <button class="remove-img" @click="removeNewPostImage(idx)">x</button>
                                </div>
                            </div>
                        </div>
                        <div class="composer-actions">
                            <select v-model="newPost.tag" class="tag-select">
                                <option value="mygo">MyGO!!!!!</option>
                                <option value="avemujica">Ave Mujica</option>
                            </select>
                            <button class="btn-publish" @click="publishPost">发布</button>
                        </div>
                    </div>

                    <div class="sidebar-footer">
                        <p>迷子でもいい、迷子でも進もう。</p>
                    </div>

                    <div class="filter-card glass">
                        <h4><img src="/img/read.png" class="img-sm" alt="">筛选</h4>
                        <div class="filter-buttons">
                            <button class="filter-btn" :class="{ active: tagFilter === 'all' }" @click="applyFilter('all')">全部</button>
                            <button class="filter-btn" :class="{ active: tagFilter === 'mygo' }" @click="applyFilter('mygo')">MyGO!!!!!</button>
                            <button class="filter-btn" :class="{ active: tagFilter === 'avemujica' }" @click="applyFilter('avemujica')">Ave Mujica</button>
                        </div>
                        <h4 style="margin-top:15px;"><img src="/img/cge.png" class="img-sm" alt="">排序</h4>
                        <div class="sort-buttons">
                            <button class="sort-btn" :class="{ active: sortBy === 'time' }" @click="applySort('time')">最新</button>
                            <button class="sort-btn" :class="{ active: sortBy === 'likes' }" @click="applySort('likes')">最热</button>
                        </div>
                    </div>
                </div>
            </aside>

            <!-- 右侧内容区 -->
            <main class="content">
                <div class="content-header">
                    <h2><img src="/img/saxiao.png" alt=""> {{ sortBy === "time" ? "最新讨论" : "最热讨论" }}</h2>
                    <span class="post-count">{{ posts.length }} 个帖子</span>
                </div>

                <div v-if="posts.length === 0" class="empty-state glass">
                    <img src="/img/wuyu.png" class="img-sm" alt="">
                    <p>还没有帖子，快来发布第一个吧！</p>
                </div>

                <div v-for="post in posts" :key="post.id" class="post-card glass">
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
                                <button class="like-btn" :class="{ liked: post.liked }" @click="toggleLike(post)">
                                    <i class="fas fa-heart"></i>
                                    <span>{{ post.likeCount || 0 }}</span>
                                </button>
                            </div>
                            <span class="post-tag" :class="'tag-' + post.tag">
                                {{ post.tag === 'mygo' ? 'MyGO!!!!!' : 'Ave Mujica' }}
                            </span>
                            <button v-if="user.is_admin === 1 || user.id === post.user_id" class="btn-icon btn-danger"
                                @click="deletePost(post.id)" title="删除">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>

                    <div class="post-body clickable" @click="openDetail(post)">
                        <h3 class="post-title">{{ post.title }}</h3>
                        <p class="post-content">{{ post.content }}</p>
                        <div class="post-images-grid" v-if="getImages(post).length">
                            <img v-for="(img, idx) in getImages(post).slice(0,3)" :src="img" class="post-thumb"
                                @click.stop="openLightbox(getImages(post), idx)">
                        </div>
                    </div>

                    <div class="post-likers" v-if="post.likeCount > 0">
                        <i class="fas fa-thumbs-up" style="color: #3b9eff; margin-right: 6px;"></i>
                        <span class="likers-list">
                            <template v-for="(u, idx) in getLikeUsers(post.id)" :key="u.username">
                                <span class="liker-name">{{ u.username }}</span>
                                <span v-if="idx < getLikeUsers(post.id).length - 1">、</span>
                            </template>
                            <span v-if="post.likeCount > getLikeUsers(post.id).length">
                                等{{ post.likeCount }}人
                            </span>
                        </span>
                    </div>

                    <div class="comments-section" v-if="getComments(post.id).length">
                        <div class="comments-header">评论 ({{ post.commentCount || getComments(post.id).length }})</div>
                        <div class="comment-list">
                            <div v-for="comment in getComments(post.id).slice(0,2)" :key="comment.id" class="comment-item">
                                <img :src="comment.avatar" class="comment-avatar">
                                <div class="comment-bubble">
                                    <div class="comment-meta">
                                        <span class="comment-author">{{ comment.username }}</span>
                                        <span class="comment-time">{{ formatTime(comment.created_at) }}</span>
                                    </div>
                                    <p class="comment-content">{{ comment.content }}</p>
                                </div>
                            </div>
                       </div>
                   </div>
                    <!-- 评论输入 -->
                    <div class="comment-input-wrapper">
                        <input v-model="commentInputs[post.id]" placeholder="写下你的评论..." class="comment-input" @keyup.enter="publishComment(post.id)">
                        <button class="btn-send" @click="publishComment(post.id)">发送</button>
                    </div>
                </div>
            </main>
        </div>

        <!-- 图片灯箱 -->
        <Lightbox
            :images="lightboxImages"
            :visible="lightboxVisible"
            :start-index="lightboxIndex"
            @close="lightboxVisible = false"
        />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"

import Lightbox from "../components/Lightbox.vue"
import { useRouter } from "vue-router"
const router = useRouter()
const user = ref(null)
const posts = ref([])
const newPost = reactive({ title: "", content: "", tag: "mygo" })
const newPostImages = ref([])
const commentInputs = ref({})
const commentsCache = ref({})
const loading = ref(false)
const likeUsersCache = ref({})
const tagFilter = ref("all")
const sortBy = ref("time")

const lightboxVisible = ref(false)
const lightboxImages = ref([])
const lightboxIndex = ref(0)

// ===== Lifecycle =====
onMounted(() => {
    const savedUser = localStorage.getItem("mygo_user")
    if (!savedUser) {
        router.push("/")
        return
    }
    user.value = JSON.parse(savedUser)
    fetchPosts()

})




// ===== Helpers =====
const formatTime = (ts) => {
    if (!ts) return "刚刚"
    return new Date(ts).toLocaleString("zh-CN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit"
    })
}

const getImages = (post) => {
    if (!post.imageUrls) return []
    return post.imageUrls.split("||")
}

const handleLogout = () => {
    localStorage.removeItem("mygo_user")
    router.push("/")
}

// ===== Posts =====
const fetchPosts = async () => {
    try {
        let url = `/api/posts?userId=${user.value.id}`
        if (tagFilter.value !== "all") url += `&tag=${tagFilter.value}`
        url += `&sort=${sortBy.value}&limit=20`
        const res = await fetch(url).then(r => r.json())
        posts.value = res
        // 懒加载：只提前加载前 3 条帖子的评论和点赞
        res.slice(0, 3).forEach(post => {
            fetchComments(post.id)
            if (post.likeCount > 0) fetchLikeUsers(post.id)
        })
    } catch (err) {
        console.error("获取帖子失败", err)
    }
}

const applyFilter = (tag) => { tagFilter.value = tag; fetchPosts() }
const applySort = (sort) => { sortBy.value = sort; fetchPosts() }

// ===== Publish =====
const handlePostImages = (e) => {
    const files = Array.from(e.target.files)
    if (newPostImages.value.length + files.length > 6) {
        alert("最多只能上传6张图片")
        return
    }
    files.forEach(file => {
        const reader = new FileReader()
        reader.onload = (ev) => {
            newPostImages.value.push({ file, preview: ev.target.result })
        }
        reader.readAsDataURL(file)
    })
    e.target.value = ""
}

const removeNewPostImage = (idx) => { newPostImages.value.splice(idx, 1) }

const uploadImages = async (imageFiles) => {
    const urls = []
    for (let img of imageFiles) {
        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: img.preview })
            }).then(r => r.json())
            if (res.success) urls.push(res.url)
        } catch (err) {
            console.error("图片上传失败", err)
        }
    }
    return urls
}

const publishPost = async () => {
    if (!newPost.title || !newPost.content) {
        alert("标题和内容不能为空")
        return
    }
    let uploadedUrls = []
    if (newPostImages.value.length) {
        uploadedUrls = await uploadImages(newPostImages.value)
    }
    try {
        const res = await fetch("/api/post", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: newPost.title,
                content: newPost.content,
                userId: user.value.id,
                tag: newPost.tag,
                images: uploadedUrls
            })
        }).then(r => r.json())
        if (res.success) {
            newPost.title = ""
            newPost.content = ""
            newPost.tag = "mygo"
            newPostImages.value = []
            fetchPosts()
        } else {
            alert("发布失败")
        }
    } catch (err) {
        alert("网络错误")
    }
}

// ===== Comments =====
const fetchComments = async (postId) => {
    try {
        const res = await fetch(`/api/comments/${postId}`).then(r => r.json())
        commentsCache.value[postId] = res
    } catch (err) {
        console.error("获取评论失败", err)
    }
}

const getComments = (postId) => commentsCache.value[postId] || []

const loadComments = (postId) => {
    if (!commentsCache.value[postId]) {
        fetchComments(postId)
    }
}

   const publishComment = async (postId) => {
    const content = commentInputs.value[postId]
    if (!content) {
        alert("评论内容不能为空")
        return
    }
    try {
        const res = await fetch("/api/comment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId, userId: user.value.id, content })
        }).then(r => r.json())
        if (res.success) {
            commentInputs.value[postId] = ""
            fetchComments(postId)
        } else {
            alert("评论失败")
        }
    } catch (err) {
        alert("网络错误")
    }
}
 
 // ===== Delete =====
const deletePost = async (postId) => {
    if (!confirm("确定删除吗？")) return
    try {
        const res = await fetch(`/api/post/${postId}?userId=${user.value.id}`, { method: "DELETE" }).then(r => r.json())
        if (res.success) {
            fetchPosts()
        } else {
            alert(res.msg || "删除失败")
        }
    } catch (err) {
        alert("网络错误")
    }
}

// ===== Like =====
const toggleLike = async (post) => {
    try {
        const res = await fetch(`/api/post/${post.id}/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.value.id })
        }).then(r => r.json())
        if (res.success) {
            post.liked = res.liked
            post.likeCount += res.liked ? 1 : -1
            delete likeUsersCache.value[post.id]
            fetchLikeUsers(post.id)
        }
    } catch (err) {
        alert("操作失败")
    }
}

const fetchLikeUsers = async (postId) => {
    if (likeUsersCache.value[postId]) return
    try {
        const res = await fetch(`/api/post/${postId}/likes/users`).then(r => r.json())
        likeUsersCache.value[postId] = res
    } catch (err) {
        likeUsersCache.value[postId] = []
    }
}

const getLikeUsers = (postId) => {
    const users = likeUsersCache.value[postId] || []
    return users.slice(0, 8)
}

const loadLikeUsers = (postId) => {
    if (!likeUsersCache.value[postId]) {
        fetchLikeUsers(postId)
    }
}

// ===== Navigation =====
const openDetail = (post) => {
    router.push(`/detail/${post.id}`)
}



// ===== Lightbox =====
const openLightbox = (images, index = 0) => {
    lightboxImages.value = images
    lightboxIndex.value = index
    lightboxVisible.value = true
}
</script>

<style>
@import "../assets/styles/forum.css";
</style>














