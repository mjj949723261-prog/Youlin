-- 1. 社区初始化表数据
DELETE FROM sys_community;
INSERT INTO sys_community (id, name, sub_district_id, sub_district_name) VALUES
('comm_001', '这儿有邻社区 1期', 'sub_101', '宜居社区服务中心');

-- 2. 彻底清空用户表数据 (重置用户数据库)
DELETE FROM sys_user;

-- 3. 清空所有测试帖子动态数据
DELETE FROM forum_post;

-- 4. 清空所有跟帖评论楼层数据
DELETE FROM forum_comment;

-- 5. 清空违规举报数据
DELETE FROM forum_report;
