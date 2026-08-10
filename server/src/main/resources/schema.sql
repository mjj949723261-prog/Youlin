-- 1. 小区/社区信息表
CREATE TABLE IF NOT EXISTS sys_community (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    sub_district_id VARCHAR(32),
    sub_district_name VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 用户表
CREATE TABLE IF NOT EXISTS sys_user (
    id VARCHAR(32) PRIMARY KEY,
    nickname VARCHAR(64) NOT NULL,
    avatar VARCHAR(512),
    building VARCHAR(32),
    room VARCHAR(32),
    is_owner BOOLEAN DEFAULT TRUE,
    role_tag VARCHAR(32) DEFAULT '本小区住户',
    community_id VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 帖子动态表
CREATE TABLE IF NOT EXISTS forum_post (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    author_name VARCHAR(64) NOT NULL,
    author_avatar VARCHAR(512),
    building VARCHAR(32),
    role_tag VARCHAR(32),
    role_type VARCHAR(32) DEFAULT 'RESIDENT',
    category_key VARCHAR(32) NOT NULL,
    tag_name VARCHAR(32),
    tag_type VARCHAR(32) DEFAULT 'NORMAL',
    content TEXT NOT NULL,
    images TEXT,
    video_url VARCHAR(512),
    video_poster VARCHAR(512),
    publish_time VARCHAR(32),
    community_id VARCHAR(32) DEFAULT 'comm_001',
    deleted INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 贴吧楼层评论与嵌套回复表
CREATE TABLE IF NOT EXISTS forum_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    author_name VARCHAR(64) NOT NULL,
    author_avatar VARCHAR(512),
    content TEXT NOT NULL,
    image VARCHAR(512),
    video VARCHAR(512),
    floor_num INT,
    parent_comment_id BIGINT DEFAULT NULL,
    reply_to_user VARCHAR(64),
    publish_time VARCHAR(32),
    deleted INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
