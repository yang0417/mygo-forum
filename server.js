const http = require('http')
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

//  连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'mygo_forum',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

// Promise 查询助手，消除回调嵌套
const query = (sql, params) => pool.query(sql, params).then(([rows]) => rows)

// 允许的排序字段（防注入）
const ALLOWED_SORTS = {
    time: 'p.id DESC',
    likes: 'likeCount DESC, p.id DESC'
}

// 允许的标签
const ALLOWED_TAGS = ['mygo', 'avemujica']

// MIME 类型映射
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.mp4': 'video/mp4'
}

    // 数据库连接检查 
    ; (async () => {
        try {
            const conn = await pool.getConnection()
            conn.release()
            console.log('成功连接到 mygo_forum 数据库')
            startHttpServer()
        } catch (err) {
            console.error('无法连接到 mygo_forum 数据库')
            console.error('提示：请确保你的 MySQL 服务已经启动，并且已经使用 SQL 脚本创建了 mygo_forum 数据库！')
            process.exit(1)
        }
    })()

// 工具函数 
function parseJsonBody(req) {
    return new Promise((resolve) => {
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
            try { resolve(JSON.parse(body)) }
            catch { resolve(null) }
        })
    })
}
// 从 URL 安全提取路径部分
function cleanPath(url) {
    const idx = url.indexOf('?')
    return idx === -1 ? url : url.slice(0, idx)
}

// 解析 page/limit 参数
function parsePagination(urlObj) {
    const page = Math.max(1, parseInt(urlObj.searchParams.get('page')) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(urlObj.searchParams.get('limit')) || 20))
    return { page, limit, offset: (page - 1) * limit }
}
// 静态文件处理
function handleStaticFile(req, res) {
    const urlObj = new URL(req.url, `http://\${req.headers.host}`)
    let filePath = urlObj.pathname === '/' ? '/login.html' : urlObj.pathname
    filePath = path.join(__dirname, filePath)

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
            res.end('文件不存在')
            return
        }
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
                res.end('服务器错误')
                return
            }
            const mimeType = MIME_TYPES[path.extname(filePath)] || 'text/plain; charset=utf-8'
            res.writeHead(200, { 'Content-Type': mimeType })
            res.end(content)
        })
    })
}
//  API 路由处理器 
async function handleApiRequest(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        res.writeHead(204)
        res.end()
        return
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    // 路由解析：提取 path 和 query params
    const urlObj = new URL(req.url, `http://\${req.headers.host}`)
    const pathname = cleanPath(req.url)
    const method = req.method

    try {
        // 1. 图片上传
        if (pathname === '/api/upload' && method === 'POST') {
            const data = await parseJsonBody(req)
            if (!data || !data.image) {
                res.writeHead(400)
                res.end(JSON.stringify({ success: false, msg: '缺少图片数据' }))
                return
            }
            const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '')
            const ext = data.image.startsWith('data:image/png') ? 'png' : 'jpg'
            const fileName = 'upload_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + ext
            const uploadDir = path.join(__dirname, 'img', 'uploads')
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true })
            }
            const filePath = path.join(uploadDir, fileName)

            await fs.promises.writeFile(filePath, base64Data, 'base64')
            const url = '/img/uploads/' + fileName
            res.end(JSON.stringify({ success: true, url }))
            return
        }
        // 2. 注册
        if (pathname === '/api/register' && method === 'POST') {
            const userData = await parseJsonBody(req)
            if (!userData || !userData.username || !userData.password) {
                res.writeHead(400)
                res.end(JSON.stringify({ success: false, msg: '用户名密码不能为空' }))
                return
            }
            try {
                await query(
                    'INSERT INTO users (username, password, avatar) VALUES (?,?,?)',
                    [userData.username, userData.password, userData.avatar || '/img/icon/1.png']
                )
                res.end(JSON.stringify({ success: true }))
            } catch (err) {
                res.end(JSON.stringify({ success: false, msg: '用户名已存在' }))
            }
            return
        }
        // 3. 登录
        if (pathname === '/api/login' && method === 'POST') {
            const loginData = await parseJsonBody(req)
            if (!loginData || !loginData.username || !loginData.password) {
                res.writeHead(400)
                res.end(JSON.stringify({ success: false, msg: '请输入账号密码' }))
                return
            }
            const result = await query(
                'SELECT * FROM users WHERE username=? AND password=?',
                [loginData.username, loginData.password]
            )
            if (result.length === 0) {
                res.end(JSON.stringify({ success: false, msg: '账号密码错误' }))
            } else {
                res.end(JSON.stringify({ success: true, user: result[0] }))
            }
            return
        }
        // 4. 发布帖子
        if (pathname === '/api/post' && method === 'POST') {
            const postData = await parseJsonBody(req)
            if (!postData || !postData.title || !postData.content) {
                res.writeHead(400)
                res.end(JSON.stringify({ success: false, msg: '标题/内容不能为空' }))
                return
            }
            const result = await query(
                'INSERT INTO posts (title, content, user_id, tag, main_image) VALUES (?,?,?,?,?)',
                [postData.title, postData.content, postData.userId, postData.tag || 'mygo', postData.mainImage || null]
            )
            const postId = result.insertId

            if (postData.images && Array.isArray(postData.images) && postData.images.length > 0) {
                const imageValues = postData.images.slice(0, 6).map(url => [postId, url])
                await query('INSERT INTO images (post_id, url) VALUES ?', [imageValues])
            }
            res.end(JSON.stringify({ success: true }))
            return
        }
        // 5. 获取帖子列表
        if (pathname === '/api/posts' && method === 'GET') {
            const tag = urlObj.searchParams.get('tag')
            const sort = urlObj.searchParams.get('sort') || 'time'
            const userId = urlObj.searchParams.get('userId')
            const { page, limit, offset } = parsePagination(urlObj)

            const orderBy = ALLOWED_SORTS[sort] || ALLOWED_SORTS.time
            const tagWhere = tag && ALLOWED_TAGS.includes(tag)

            const params = []

            let sql = 'SELECT p.*, u.username, u.avatar,'
            sql += ' (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likeCount,'
            sql += ' (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS commentCount,'
            sql += " (SELECT GROUP_CONCAT(url ORDER BY id SEPARATOR '||') FROM images WHERE post_id = p.id) AS imageUrls"

            if (userId) {
                sql += ', (SELECT COUNT(*) > 0 FROM post_likes WHERE post_id = p.id AND user_id = ?) AS liked'
                params.push(parseInt(userId))
            }
            sql += ' FROM posts p JOIN users u ON p.user_id = u.id'

            if (tagWhere) {
                sql += ' WHERE p.tag = ?'
                params.push(tag)
            }
            // 总条数（用于分页）
            let countSql = 'SELECT COUNT(*) AS total FROM posts p'
            const countParams = []
            if (tagWhere) {
                countSql += ' WHERE p.tag = ?'
                countParams.push(tag)
            }
            const countResult = await query(countSql, countParams)

            sql += ' ORDER BY ' + orderBy + ' LIMIT ? OFFSET ?'
            params.push(limit, offset)

            const posts = await query(sql, params)

            const formatted = posts.map(p => ({
                ...p,
                liked: userId ? (p.liked === 1 || p.liked === true) : false,
                likeCount: p.likeCount || 0,
                commentCount: p.commentCount || 0
            }))

            res.setHeader('X-Total-Count', countResult[0].total)
            res.setHeader('X-Page', page)
            res.setHeader('X-Limit', limit)
            res.end(JSON.stringify(formatted))
            return
        }
        // 6. 发布评论
        if (pathname === '/api/comment' && method === 'POST') {
            const commentData = await parseJsonBody(req)
            if (!commentData || !commentData.content) {
                res.writeHead(400)
                res.end(JSON.stringify({ success: false, msg: '评论内容不能为空' }))
                return
            }
            await query(
                'INSERT INTO comments (post_id, user_id, content, image) VALUES (?,?,?,?)',
                [commentData.postId, commentData.userId, commentData.content, commentData.image || null]
            )
            res.end(JSON.stringify({ success: true }))
            return
        }
        // 7. 获取评论
        const commentsMatch = pathname.match(/^\/api\/comments\/(\d+)$/)
        if (commentsMatch && method === 'GET') {
            const postId = commentsMatch[1]
            const result = await query(
                'SELECT comments.*, users.username, users.avatar FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ?',
                [postId]
            )
            res.end(JSON.stringify(result))
            return
        }
        // 8. 删除帖子
        const deleteMatch = pathname.match(/^\/api\/post\/(\d+)$/)
        if (deleteMatch && method === 'DELETE') {
            const postId = deleteMatch[1]
            const userId = urlObj.searchParams.get('userId')

            if (!userId) {
                res.end(JSON.stringify({ success: false, msg: '缺少用户ID' }))
                return
            }

            const postRows = await query('SELECT user_id FROM posts WHERE id = ?', [postId])
            if (postRows.length === 0) {
                res.end(JSON.stringify({ success: false, msg: '帖子不存在' }))
                return
            }

            const userRows = await query('SELECT is_admin FROM users WHERE id = ?', [userId])
            const isAdmin = userRows.length > 0 && userRows[0].is_admin === 1

            if (Number(postRows[0].user_id) !== Number(userId) && !isAdmin) {
                res.end(JSON.stringify({ success: false, msg: '无权限删除' }))
                return
            }

            await query('DELETE FROM post_likes WHERE post_id = ?', [postId])
            await query('DELETE FROM comments WHERE post_id = ?', [postId])
            await query('DELETE FROM posts WHERE id = ?', [postId])
            res.end(JSON.stringify({ success: true }))
            return
        }
        // 9. 点赞/取消点赞
        const likeToggleMatch = pathname.match(/^\/api\/post\/(\d+)\/like$/)
        if (likeToggleMatch && method === 'POST') {
            const postId = likeToggleMatch[1]
            const likeData = await parseJsonBody(req)
            const userId = likeData?.userId

            if (!userId) {
                res.writeHead(400)
                res.end(JSON.stringify({ success: false, msg: '缺少用户ID' }))
                return
            }

            const existing = await query(
                'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
                [postId, userId]
            )

            if (existing.length > 0) {
                await query('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId])
                res.end(JSON.stringify({ success: true, liked: false }))
            } else {
                await query('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', [postId, userId])
                res.end(JSON.stringify({ success: true, liked: true }))
            }
            return
        }
        // 10. 获取点赞状态
        const likesStatusMatch = pathname.match(/^\/api\/post\/(\d+)\/likes$/)
        if (likesStatusMatch && method === 'GET') {
            const postId = likesStatusMatch[1]
            const userId = urlObj.searchParams.get('userId')

            const countResult = await query('SELECT COUNT(*) AS likeCount FROM post_likes WHERE post_id = ?', [postId])
            const likeCount = countResult[0].likeCount

            if (userId) {
                const userLike = await query('SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?', [postId, userId])
                res.end(JSON.stringify({ success: true, likeCount, liked: userLike.length > 0 }))
            } else {
                res.end(JSON.stringify({ success: true, likeCount, liked: false }))
            }
            return
        }
        // 11. 获取点赞用户列表
        const likesUsersMatch = pathname.match(/^\/api\/post\/(\d+)\/likes\/users$/)
        if (likesUsersMatch && method === 'GET') {
            const postId = likesUsersMatch[1]
            const result = await query(
                'SELECT u.username, u.avatar FROM post_likes pl JOIN users u ON pl.user_id = u.id WHERE pl.post_id = ? ORDER BY pl.created_at DESC LIMIT 10',
                [postId]
            )
            res.end(JSON.stringify(result))
            return
        }
        // 12. 获取单个帖子详情
        const detailMatch = pathname.match(/^\/api\/post\/(\d+)$/)
        if (detailMatch && method === 'GET') {
            const postId = detailMatch[1]
            const userId = urlObj.searchParams.get('userId')
            let sql = 'SELECT p.*, u.username, u.avatar,'
            sql += ' (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS likeCount,'
            sql += " (SELECT GROUP_CONCAT(url ORDER BY id SEPARATOR '||') FROM images WHERE post_id = p.id) AS imageUrls"

            const params = []
            if (userId) {
                sql += ', (SELECT COUNT(*) > 0 FROM post_likes WHERE post_id = p.id AND user_id = ?) AS liked'
                params.push(parseInt(userId))
            }
            sql += ' FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?'
            params.push(parseInt(postId))

            const result = await query(sql, params)
            if (result.length === 0) {
                res.end(JSON.stringify({ success: false }))
                return
            }
            res.end(JSON.stringify({ success: true, post: result[0] }))
            return
        }

        // 13. 管理后台统计
        if (pathname === '/api/admin/stats' && method === 'GET') {
            const userId = urlObj.searchParams.get('userId')
            const userRows = await query('SELECT is_admin FROM users WHERE id = ?', [userId])
            if (userRows.length === 0 || userRows[0].is_admin !== 1) {
                res.end(JSON.stringify({ success: false, msg: '无权限' }))
                return
            }

            const [postsRes, usersRes, commentsRes] = await Promise.all([
                query('SELECT COUNT(*) AS count FROM posts'),
                query('SELECT COUNT(*) AS count FROM users'),
                query('SELECT COUNT(*) AS count FROM comments')
            ])

            res.end(JSON.stringify({
                success: true,
                posts: postsRes[0].count,
                users: usersRes[0].count,
                comments: commentsRes[0].count
            }))
            return
        }
        // 14. 管理后台-帖子列表
        if (pathname === '/api/admin/posts' && method === 'GET') {
            const userId = urlObj.searchParams.get('userId')
            const userRows = await query('SELECT is_admin FROM users WHERE id = ?', [userId])
            if (userRows.length === 0 || userRows[0].is_admin !== 1) {
                res.end(JSON.stringify({ success: false, msg: '无权限' }))
                return
            }

            const posts = await query(
                'SELECT p.id, p.title, p.created_at, u.username, u.avatar, ' +
                '(SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS commentCount ' +
                'FROM posts p JOIN users u ON p.user_id = u.id ' +
                'ORDER BY p.created_at DESC'
            )
            res.end(JSON.stringify(posts))
            return
        }
        // 15. 管理后台-用户列表
        if (pathname === '/api/admin/users' && method === 'GET') {
            const userId = urlObj.searchParams.get('userId')
            const userRows = await query('SELECT is_admin FROM users WHERE id = ?', [userId])
            if (userRows.length === 0 || userRows[0].is_admin !== 1) {
                res.end(JSON.stringify({ success: false, msg: '无权限' }))
                return
            }
            const users = await query(
                'SELECT u.id, u.username, u.avatar, u.is_admin, u.created_at, ' +
                '(SELECT COUNT(*) FROM posts WHERE user_id = u.id) AS postCount, ' +
                '(SELECT COUNT(*) FROM comments WHERE user_id = u.id) AS commentCount ' +
                'FROM users u ORDER BY u.created_at DESC'
            )
           res.end(JSON.stringify(users))
           return
       }
        // 管理后台-评论列表
        if (pathname === '/api/admin/comments' && method === 'GET') {
            const userId = urlObj.searchParams.get('userId')
            const userRows = await query('SELECT is_admin FROM users WHERE id = ?', [userId])
            if (userRows.length === 0 || userRows[0].is_admin !== 1) {
                res.end(JSON.stringify({ success: false, msg: '无权限' }))
                return
            }
            const comments = await query(
                "SELECT c.id, c.content, c.created_at," +
                " u.username AS author, u.avatar AS author_avatar," +
                " p.id AS post_id, p.title AS post_title" +
                " FROM comments c" +
                " JOIN users u ON c.user_id = u.id" +
                " JOIN posts p ON c.post_id = p.id" +
                " ORDER BY c.created_at DESC"
            )
            res.end(JSON.stringify(comments))
            return
        }
        // 管理后台-删除评论
        const adminCommentDel = pathname.match(/^\/api\/admin\/comment\/(\d+)$/)
        if (adminCommentDel && method === 'DELETE') {
            const commentId = adminCommentDel[1]
            const userId = urlObj.searchParams.get('userId')
            const userRows = await query('SELECT is_admin FROM users WHERE id = ?', [userId])
            if (userRows.length === 0 || userRows[0].is_admin !== 1) {
                res.end(JSON.stringify({ success: false, msg: '无权限' }))
                return
            }
            await query('DELETE FROM comments WHERE id = ?', [commentId])
            res.end(JSON.stringify({ success: true }))
           return
       }
        // 管理后台-删除用户
        const adminUserDel = pathname.match(/^\/api\/admin\/user\/(\d+)$/)
        if (adminUserDel && method === 'DELETE') {
            const delUserId = adminUserDel[1]
            const userId = urlObj.searchParams.get('userId')
            const userRows = await query('SELECT is_admin FROM users WHERE id = ?', [userId])
            if (userRows.length === 0 || userRows[0].is_admin !== 1) {
                res.end(JSON.stringify({ success: false, msg: '无权限' }))
                return
            }
            await query('DELETE FROM users WHERE id = ?', [delUserId])
            res.end(JSON.stringify({ success: true }))
            return
        }
        // 未知 API
        res.writeHead(404)
        res.end(JSON.stringify({ success: false, msg: '接口不存在' }))

    } catch (err) {
        console.error('API 错误:', err)
        res.writeHead(500)
        res.end(JSON.stringify({ success: false, msg: '服务器内部错误' }))
    }
}
//  启动 HTTP 服务 
function startHttpServer() {
    const server = http.createServer(async (req, res) => {
        if (req.url.startsWith('/api/')) {
            await handleApiRequest(req, res)
        } else {
            handleStaticFile(req, res)
        }
    })
    server.listen(3000, () => {
        console.log('> 论坛运行在 http://localhost:3000')
    })
}
