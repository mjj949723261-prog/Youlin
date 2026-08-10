-- 1. 社区表
CREATE TABLE IF NOT EXISTS sys_community (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sub_district_id VARCHAR(64),
    sub_district_name VARCHAR(100)
);

-- 2. 用户表 (包含手机号 phone 及 getUserProfile 扩展地区与性别字段)
CREATE TABLE IF NOT EXISTS sys_user (
    id VARCHAR(64) PRIMARY KEY,
    nickname VARCHAR(100),
    avatar VARCHAR(500),
    building VARCHAR(100),
    room VARCHAR(50),
    is_owner INT DEFAULT 1,
    role_tag VARCHAR(50),
    community_id VARCHAR(64),
    phone VARCHAR(20),
    city VARCHAR(50),
    province VARCHAR(50),
    gender INT DEFAULT 0
);

-- 3. 帖子表
CREATE TABLE IF NOT EXISTS forum_post (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    author_name VARCHAR(100),
    author_avatar VARCHAR(500),
    building VARCHAR(100),
    role_tag VARCHAR(50),
    role_type VARCHAR(20),
    category_key VARCHAR(50),
    tag_name VARCHAR(50),
    tag_type VARCHAR(20),
    content TEXT,
    images TEXT,
    video_url VARCHAR(500),
    video_poster VARCHAR(500),
    publish_time VARCHAR(50),
    community_id VARCHAR(64),
    deleted INT DEFAULT 0
);

-- 4. 评论跟帖楼层表
CREATE TABLE IF NOT EXISTS forum_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    author_name VARCHAR(100),
    author_avatar VARCHAR(500),
    content TEXT,
    image VARCHAR(500),
    video VARCHAR(500),
    floor_num INT,
    parent_comment_id BIGINT,
    reply_to_user VARCHAR(100),
    publish_time VARCHAR(50),
    deleted INT DEFAULT 0
);
