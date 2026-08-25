# MyGO & Ave Mujica Forum

一个基于 Vue 3 + Vite + Express 5 + MySQL 的轻量论坛项目，包含用户注册/登录、发帖、评论、点赞、图片上传和管理员后台。

## 技术栈

- 前端：Vue 3、Vue Router、Vite
- 后端：Express 5、mysql2/promise
- 数据库：MySQL 8，utf8mb4
- 登录：Node `crypto.scrypt` 密码哈希 + 数据库 session + HttpOnly Cookie

## 环境要求

- Node.js 18 或更高版本
- MySQL 8
- npm

## 初始化数据库

```bash
mysql -u root -p < init.sql
```

脚本会创建 `mygo_forum` 数据库、表结构和种子数据。后端启动时还会自动创建 `sessions` 表并补齐常用索引。

## 配置环境变量

```bash
copy .env.example .env
```

然后按本机 MySQL 配置修改 `.env`。默认管理员：

- 用户名：`admin`
- 密码：`admin123`

种子普通用户密码均为 `123456`。

## 开发模式

需要开两个终端：

```bash
npm install
npm run dev
```

```bash
npm start
```

前端地址：`http://localhost:5173`

后端地址：`http://localhost:3000`

Vite 会把 `/api` 请求代理到后端。

## 生产模式

```bash
npm run build
npm start
```

构建完成后，后端会直接托管 `dist`，访问 `http://localhost:3000`。

## 测试

```bash
npm test
```

当前测试覆盖密码哈希、登录态密码校验和核心输入校验。

## 主要 API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/register` | 注册 |
| POST | `/api/login` | 登录并写入 session cookie |
| GET | `/api/me` | 获取当前登录用户 |
| POST | `/api/logout` | 退出登录 |
| POST | `/api/upload` | 上传图片，需登录 |
| GET | `/api/posts?q=&page=&limit=` | 帖子列表，支持搜索标题/内容/用户名 |
| POST | `/api/post` | 发布帖子，需登录 |
| GET | `/api/post/:id` | 帖子详情 |
| DELETE | `/api/post/:id` | 删除帖子，作者或管理员 |
| POST | `/api/post/:id/like` | 点赞/取消点赞 |
| GET | `/api/users/:id` | 用户主页资料与统计 |
| GET | `/api/users/:id/posts` | 用户发布的帖子 |
| GET | `/api/users/:id/comments` | 用户发表的评论 |
| PUT | `/api/users/:id` | 修改自己的昵称和头像 |
| GET | `/api/comments/:postId` | 评论列表 |
| POST | `/api/comment` | 发表评论 |
| GET/POST/DELETE | `/api/admin/*` | 管理后台接口，仅管理员 |

## 安全说明

- 密码使用 `scrypt` 哈希，不再明文入库。
- 登录态由后端 session 管理，HttpOnly Cookie 不暴露给前端脚本。
- 管理员接口从 session 判断身份，不再信任前端传入的 `userId`。
- 上传图片限制 5MB，并在服务端校验 MIME 和文件头。
- 发帖/图片写入使用事务，删除帖子/用户时会同步清理上传文件。
- 登录和上传接口有简单内存限流。

## 性能说明

- 登录后页面先通过 `/api/me` 校验 session，避免依赖可篡改的 `localStorage`。
- 大背景图已压缩为 JPEG，并启用静态资源缓存。
- 详情页侧栏和帖子缩略图使用 `loading="lazy"` + `decoding="async"`。

## 目录结构

```text
src/
  components/       前端组件
  views/            页面
  assets/styles/    样式
  server/           Express 后端模块
    routes/         路由
    auth.js         密码与 session
    uploads.js      上传与文件清理
    validation.js   输入校验
public/img/         静态图片和运行期上传目录
init.sql            数据库初始化脚本
server.js           服务入口
```

## 运行图

登录页
<img width="2557" height="1509" alt="image" src="https://github.com/user-attachments/assets/4d8e67b2-1cfd-4759-946f-742795457bfa" />
首页
<img width="2558" height="1543" alt="image" src="https://github.com/user-attachments/assets/a344e015-7741-4df8-9368-5a791f21e1e5" />
详情页
<img width="2558" height="1425" alt="image" src="https://github.com/user-attachments/assets/2b05897c-fccd-4e20-b2b7-6d39c3714b1a" />
后台管理页
<img width="2559" height="1497" alt="image" src="https://github.com/user-attachments/assets/0da9f902-be27-4781-9d13-02162b97338c" />
个人页
<img width="2559" height="1451" alt="image" src="https://github.com/user-attachments/assets/c5c2bf36-942e-444f-849a-5ffb8408ce3c" />



