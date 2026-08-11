-- 1. 行政社区表 (上级管辖层)
CREATE TABLE IF NOT EXISTS sys_sub_district (
    id VARCHAR(64) PRIMARY KEY,      -- 社区ID (如: sub_001)
    name VARCHAR(100) NOT NULL,      -- 社区名称 (如: "翠竹街道行政社区")
    city VARCHAR(50),                -- 所在城市
    province VARCHAR(50)             -- 所在省份
);

-- 2. 站点/小区表 (核心多租户站点)
CREATE TABLE IF NOT EXISTS sys_community (
    site_id VARCHAR(64) PRIMARY KEY, -- 站点ID / 小区ID (如: site_comm_001)
    name VARCHAR(100) NOT NULL,      -- 站点/小区名称 (如: "金翠园小区")
    sub_district_id VARCHAR(64) NOT NULL, -- 归属行政社区ID
    address VARCHAR(200),             -- 详细地址
    status INT DEFAULT 1              -- 站点状态: 1-启用 0-禁用
);

-- 3. 站点专属机构/团体表 (1 对 1 绑定物业/业委会/商户)
CREATE TABLE IF NOT EXISTS sys_organization (
    id VARCHAR(64) PRIMARY KEY,
    site_id VARCHAR(64) NOT NULL,     -- 站点ID
    type VARCHAR(30) NOT NULL,        -- 类型: 'PROPERTY'(物业), 'COMMITTEE'(业委会), 'MERCHANT'(商户)
    name VARCHAR(100) NOT NULL,       -- 机构名称
    contact_phone VARCHAR(20),
    UNIQUE (site_id, type)            -- 约束：一个站点每种服务机构只有 1 个
);

-- 4. 用户与站点绑定表
CREATE TABLE IF NOT EXISTS sys_user (
    id VARCHAR(64) PRIMARY KEY,       -- 用户 OpenID
    nickname VARCHAR(100),
    avatar VARCHAR(500),
    phone VARCHAR(20),
    role_code VARCHAR(50) DEFAULT 'OWNER', -- 角色: COMMUNITY_ADMIN, COMMITTEE_ADMIN, PROPERTY_STAFF, MERCHANT, OWNER
    sub_district_id VARCHAR(64),      -- 行政社区管理员的辖区ID
    site_id VARCHAR(64),              -- 用户归属站点ID
    building VARCHAR(50),             -- 楼栋
    room VARCHAR(50),                 -- 门牌房间
    city VARCHAR(50),
    province VARCHAR(50),
    gender INT DEFAULT 0
);

-- 5. 动态帖子表 (包含 site_id 站点隔离)
CREATE TABLE IF NOT EXISTS forum_post (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    site_id VARCHAR(64) NOT NULL,     -- 站点ID (用于多站点过滤与水平扩展)
    author_id VARCHAR(64),
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
    deleted INT DEFAULT 0
);

-- 6. 评论楼层表 (包含 site_id 站点隔离)
CREATE TABLE IF NOT EXISTS forum_comment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    site_id VARCHAR(64) NOT NULL,     -- 站点ID
    post_id BIGINT NOT NULL,
    author_id VARCHAR(64),
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

-- 7. 内容违规举报表
CREATE TABLE IF NOT EXISTS forum_report (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    site_id VARCHAR(64),              -- 站点ID
    post_id BIGINT,
    comment_id BIGINT,
    reporter_id VARCHAR(64),
    reason VARCHAR(255),
    report_time VARCHAR(50),
    status INT DEFAULT 0
);
