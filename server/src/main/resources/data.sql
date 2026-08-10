-- 1. 社区初始化表数据
DELETE FROM sys_community;
INSERT INTO sys_community (id, name, sub_district_id, sub_district_name) VALUES
('comm_001', '这儿有邻社区 1期', 'sub_101', '宜居社区服务中心');

-- 2. 清空用户表数据 (等待用户亲自注册/登录)
DELETE FROM sys_user;

-- 3. 清空所有测试帖子动态数据 (等待用户亲自发布第一条邻里故事)
DELETE FROM forum_post;

-- 4. 清空所有跟帖评论楼层数据
DELETE FROM forum_comment;
