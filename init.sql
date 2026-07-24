CREATE DATABASE IF NOT EXISTS mygo_forum CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE mygo_forum;

SET FOREIGN_KEY_CHECKS = 0;


CREATE TABLE IF NOT EXISTS users (
    id INT(11) NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    avatar VARCHAR(255) DEFAULT '/img/icon/1.png',
    is_admin INT(11) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS posts (
    id INT(11) NOT NULL AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    user_id INT(11) NOT NULL,
    tag VARCHAR(50) DEFAULT 'mygo',
    main_image VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comments (
    id INT(11) NOT NULL AUTO_INCREMENT,
    post_id INT(11) NOT NULL,
    user_id INT(11) NOT NULL,
    content TEXT NOT NULL,
    image VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS post_likes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    post_id INT(11) NOT NULL,
    user_id INT(11) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS images (
    id INT(11) NOT NULL AUTO_INCREMENT,
    post_id INT(11) DEFAULT NULL,
    comment_id INT(11) DEFAULT NULL,
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_image (post_id, url), 
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT IGNORE INTO users (id, username, password, avatar, is_admin) VALUES
(1, '高松灯', '123456', '/img/icon/10.png', 0),
(2, '千早爱音', '123456', '/img/icon/3.png', 0),
(3, '要乐奈', '123456', '/img/icon/8.png', 0),
(4, '长崎素世', '123456', '/img/icon/7.png', 0),
(5, '椎名立希', '123456', '/img/icon/6.png', 0),
(6, '丰川祥子', '123456', '/img/icon/4.png', 0),
(7, '若叶睦', '123456', '/img/icon/11.png', 0),
(8, '三角初华', '123456', '/img/icon/9.png', 0),
(9, '八幡海铃', '123456', '/img/icon/12.png', 0),
(10, '祐天寺若麦', '123456', '/img/icon/2.png', 0),
(11, 'admin', 'admin123', '/img/icon/5.png', 1);

INSERT IGNORE INTO posts (id, title, content, user_id, tag) VALUES
(1, '春日影', '在这阳光普照的世界 骄傲绽放的重要之人 \n知晓何谓温暖的春天 \n因为你我，而留下泪水\n为什么你的手是如此地温暖 \n请你从此再也不要放手 \n永远 永远 再也不要放手 \n\n小祥，你幸福吗？', 1, 'mygo'),
(2, '其实我已经不想再逃避了', '一开始只是觉得"组乐队好像挺有趣的"，\n但看到灯写的歌词、立希拼命打鼓的样子，还有素世温柔的关心……\n我好像第一次找到了属于自己的地方。\n下一次 Live，我一定会准时到排练室的！', 2, 'mygo'),
(3, '抹茶芭菲', '好吃。', 3, 'mygo'),
(4, '我大概一辈子也忘不掉crychic了', '每次看到灯的歌词，都会想起那个时候。\n小祥，你为什么要离开？\n为什么要演奏春日影？\n我搞不懂……', 4, 'mygo'),
(5, '《迷星叫》的鼓点思路', '这次灯的歌词和旋律都特别好，我在副歌段加了双踩，希望大家能跟上。\n灯的文字就像在拉着我们往前跑，这种感觉……真不赖。', 5, 'mygo'),
(6, '祝你幸福', '灯，当时许愿不要放手的你，现在，不会放开任何人的手。\n虽然我做不到像你这样，但我也会以我自己的方式，守护我自己的乐队。\n谢谢你，愿你今后的人生，幸福常伴。', 6, 'avemujica'),
(7, '我从来没觉得玩乐队开心过', '祥，对不起。\n即使是这样，我还是会站在你身边。\nAve Mujica 是人偶的归宿，我会守护它。', 7, 'avemujica'),
(8, '在 Ave Mujica 的舞台下准备中~', '大家眼中的我，是闪闪发光的偶像？还是那个只为某人歌唱的初华？\n偷偷说一句：其实无论是哪一面，都是我全心全意的表现哦！', 8, 'avemujica'),
(9, '今天的贝斯练习', '新曲的贝斯 line 太棒了！祥子的编曲总是那么不讲理。\n喵梦说她想加一段 solo，我觉得完全可行，有人一起合奏吗？', 9, 'avemujica'),
(10, '大家好喵姆喵姆～这里是喵梦亲！', '如果 Mujica 解散的话，我怎么样都无所谓。', 10, 'avemujica'),
(11, '【公告】论坛守则 & 分区说明', '欢迎来到 MyGO & Ave Mujica 交流论坛！\n\n本论坛分为两个专区：\n MyGO!!!!! 专区：讨论 MyGO 相关音乐、剧情、同人创作。\n Ave Mujica 专区：讨论 Ave Mujica 世界观、舞台剧、成员动向。\n\n请保持友善交流，禁止人身攻击。', 11, 'mygo');

INSERT IGNORE INTO comments (id, post_id, user_id, content) VALUES
(1, 1, 6, '灯的歌词是心灵的呐喊，是我们自己的歌。'),
(2, 1, 5, '果然灯写的词是最有力量的。'),
(4, 2, 3, '爱音，有趣。'),
(5, 3, 5, '又去吃芭菲了？下次叫上我。'),
(6, 3, 4, '乐奈真是自由呢。'),
(7, 4, 1, '素世，对不起……但我也不想忘记。'),
(9, 5, 1, '立希的鼓，每次都让我很安心。'),
(10, 5, 2, '立希好厉害！新曲的鼓点超帅！'),
(11, 6, 1, '小祥，欢迎回来。'),
(12, 6, 4, '我大概一辈子也忘不掉crychic了。'),
(13, 6, 7, '祥，移动。'),
(14, 7, 6, '谢谢你，睦。有你在身边，我很安心。'),
(15, 7, 8, '睦说的不对，我们一起让 Ave Mujica 变得有趣吧。'),
(16, 8, 6, '……谢谢你，初华。我会努力的。'),
(17, 8, 9, '初华总是那么温柔呢。'),
(18, 9, 8, '海铃，欢迎来到 Ave Mujica。'),
(20, 10, 6, '不要再说解散的话了，祐天寺。'),
(21, 10, 9, '你其实也不想解散吧。'),
(22, 11, 1, '我会好好遵守的。'),
(23, 11, 2, '了解！'),
(24, 11, 4, '收到。');

INSERT IGNORE INTO post_likes (post_id, user_id) VALUES
(1,6),(1,2),(1,3),(1,4),(1,5),(1,7),
(2,1),(2,3),(2,4),(2,5),(2,6),
(3,5),(3,4),
(4,1),(4,2),(4,3),(4,5),(4,6),(4,7),
(5,1),(5,2),(5,4),
(6,1),(6,2),(6,3),(6,4),(6,5),(6,7),(6,8),(6,9),
(7,6),(7,8),(7,9),(7,10),(7,1),
(8,6),(8,7),(8,9),(8,10),(8,1),(8,2),
(9,6),(9,7),(9,8),(9,10),
(10,6);

INSERT IGNORE INTO images (post_id, url) VALUES
(1, '/img/posting/tomori/tomori1.jpg'),
(1, '/img/posting/tomori/tomori2.jpg'),
(1, '/img/posting/tomori/tomori3.jpg'),
(1, '/img/posting/tomori/tomori4.jpg'),
(1, '/img/posting/tomori/tomori5.jpg');

INSERT IGNORE INTO images (post_id, url) VALUES
(2, '/img/posting/anon/anon1.jpg'),
(2, '/img/posting/anon/anon2.jpg'),
(2, '/img/posting/anon/anon3.jpg');

INSERT IGNORE INTO images (post_id, url) VALUES
(3, '/img/posting/lalai/lalai1.jpg'),
(3, '/img/posting/lalai/lalai2.jpg'),
(3, '/img/posting/lalai/lalai3.jpg');

INSERT IGNORE INTO images (post_id, url) VALUES
(4, '/img/posting/soyo/soyo1.jpg'),
(4, '/img/posting/soyo/soyo2.jpg'),
(4, '/img/posting/soyo/soyo3.jpg'),
(4, '/img/posting/soyo/soyo4.jpg');

INSERT IGNORE INTO images (post_id, url) VALUES
(5, '/img/posting/taki/taki1.jpg'),
(5, '/img/posting/taki/taki2.jpg'),
(5, '/img/posting/taki/taki3.jpg'),
(5, '/img/posting/taki/taki4.jpg');

INSERT IGNORE INTO images (post_id, url) VALUES
(6, '/img/posting/saki/saki1.jpg'),
(6, '/img/posting/saki/saki2.jpg'),
(6, '/img/posting/saki/saki3.jpg'),
(6, '/img/posting/saki/saki4.jpg'),
(6, '/img/posting/saki/saki5.jpg'),
(6, '/img/posting/saki/saki6.jpg');

INSERT IGNORE INTO images (post_id, url) VALUES
(7, '/img/posting/musumi/musumi1.jpg'),
(7, '/img/posting/musumi/musumi2.jpg'),
(7, '/img/posting/musumi/musumi3.jpg'),
(7, '/img/posting/musumi/musumi4.jpg'),
(7, '/img/posting/musumi/musumi5.jpg');

INSERT IGNORE INTO images (post_id, url) VALUES
(8, '/img/posting/unka/unka1.jpg'),
(8, '/img/posting/unka/unka2.jpg'),
(8, '/img/posting/unka/unka3.jpg');

INSERT IGNORE INTO images (post_id, url) VALUES
(9, '/img/posting/wumiri/wumiri1.jpg'),
(9, '/img/posting/wumiri/wumiri2.jpg');

INSERT IGNORE INTO images (post_id, url) VALUES
(10, '/img/posting/miaomu/miaomu1.jpg'),
(10, '/img/posting/miaomu/miaomu2.jpg'),
(10, '/img/posting/miaomu/miaomu3.jpg'),
(10, '/img/posting/miaomu/miaomu4.jpg');

INSERT IGNORE INTO images (post_id, url) VALUES
(11, '/img/posting/admin/admin1.jpg'),
(11, '/img/posting/admin/admin2.jpg'),
(11, '/img/posting/admin/admin3.jpg');

SET FOREIGN_KEY_CHECKS = 1;