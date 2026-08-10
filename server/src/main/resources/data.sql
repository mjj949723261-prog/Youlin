-- 初始小区数据
DELETE FROM sys_community;
INSERT INTO sys_community (id, name, sub_district_id, sub_district_name) VALUES
('comm_001', '云彩之城', 'sub_101', '新塘街道彩虹社区'),
('comm_002', '云彩之城 2期', 'sub_101', '新塘街道彩虹社区');

-- 初始用户数据
DELETE FROM sys_user;
INSERT INTO sys_user (id, nickname, avatar, building, room, is_owner, role_tag, community_id) VALUES
('usr_888', '张先生', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250', '5栋', '302', TRUE, '本小区住户', 'comm_001');

-- 初始帖子数据
DELETE FROM forum_post;
INSERT INTO forum_post (id, author_name, author_avatar, building, role_tag, role_type, category_key, tag_name, tag_type, content, images, video_url, video_poster, publish_time, community_id) VALUES
(1, '王阿姨', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', '3栋 1202', '本小区住户', 'RESIDENT', 'HELP', '邻里求助', 'NORMAL', '谁家有电钻可以借用半小时？想要在客厅墙上装个挂衣置物架。由于家里只有我和小孙女，急需借用一会儿，用完立即归还，并且必有重谢！麻烦有电钻的邻居联系我呀~', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=600,https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600', '', '', '10分钟前', 'comm_001'),
(2, '小林', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', '8栋', '本小区住户', 'RESIDENT', 'HELP', '紧急求助', 'URGENT', '寻找橘猫团团，昨晚在南门附近走失，特征是脖子上有蓝色项圈，有看到的邻居请联系我，必有重谢！希望大家能帮忙留意一下，非常感谢！', '', '', '', '18分钟前', 'comm_001'),
(3, '陈阿姨', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', '5栋', '5号楼业主', 'RESIDENT', 'RENT', '房屋出租', 'RENT', '云彩之城 2期 3号楼精装两居室业主直租，免中介费！首次出租家电齐全，看房方便。', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=300', '', '', '40分钟前', 'comm_001');

-- 初始贴吧评论及子回复数据
DELETE FROM forum_comment;
INSERT INTO forum_comment (id, post_id, author_name, author_avatar, content, image, video, floor_num, parent_comment_id, reply_to_user, publish_time) VALUES
(1, 1, '张先生', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', '王阿姨，我家正好有一套冲击钻，放在 5栋 门卫室了，您可以随时去拿取使用~', '', '', 1, NULL, '', '8分钟前'),
(2, 1, '王阿姨', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', '太感谢张先生了！我这就叫我儿子去门卫室拿，谢谢好邻居！', '', '', 1, 1, '张先生', '6分钟前'),
(3, 1, '张先生', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', '不客气！用的时候注意安全哈~', '', '', 1, 1, '王阿姨', '5分钟前'),
(4, 1, '陈女士', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', '我也在 3栋 6楼，如果张先生的借不到，我家里也有把手电钻。', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=300', '', 2, NULL, '', '4分钟前');
