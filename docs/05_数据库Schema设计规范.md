# 05. 数据库 Schema 设计规范

## 一、 小区与租户配置表

```sql
-- 1. 小区主表
CREATE TABLE `communities` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '小区名称',
  `address` VARCHAR(255) COMMENT '详细地址',
  `latitude` DECIMAL(10, 6) COMMENT '纬度',
  `longitude` DECIMAL(10, 6) COMMENT '经度',
  `status` TINYINT DEFAULT 1 COMMENT '1:运营中 0:已关停'
) ENGINE=InnoDB COMMENT='小区主表';

-- 2. 功能开通与套餐授权表
CREATE TABLE `community_subscriptions` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `community_id` BIGINT NOT NULL UNIQUE,
  `authorized_features` JSON NOT NULL COMMENT '当前小区开通功能Key数组 ["PROPERTY_FEE", "DOOR_ACCESS"]',
  `expire_time` DATETIME NOT NULL COMMENT '到期时间'
) ENGINE=InnoDB COMMENT='小区订阅授权表';
```

---

## 二、 用户与房产关联表

```sql
-- 3. 房产表
CREATE TABLE `houses` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `community_id` BIGINT NOT NULL COMMENT '所属小区',
  `building` VARCHAR(50) NOT NULL COMMENT '楼栋',
  `unit` VARCHAR(50) COMMENT '单元',
  `room_number` VARCHAR(50) NOT NULL COMMENT '房号 (如 501)',
  INDEX `idx_community` (`community_id`)
) ENGINE=InnoDB COMMENT='房屋表';

-- 4. 人房关联表
CREATE TABLE `user_house_relations` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `community_id` BIGINT NOT NULL,
  `house_id` BIGINT NOT NULL,
  `role_type` TINYINT NOT NULL COMMENT '1:业主 2:家属 3:租户',
  `audit_status` TINYINT DEFAULT 0 COMMENT '0:待审核 1:审核通过 2:拒绝',
  INDEX `idx_user_community` (`user_id`, `community_id`)
) ENGINE=InnoDB COMMENT='用户房产绑定表';
```

---

## 三、 物业工单与邻里圈表

```sql
-- 5. 物业报修表
CREATE TABLE `repair_orders` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `community_id` BIGINT NOT NULL COMMENT '小区隔离Key',
  `house_id` BIGINT NOT NULL,
  `applicant_id` BIGINT NOT NULL,
  `category` VARCHAR(50) NOT NULL COMMENT '报修类别',
  `content` TEXT NOT NULL,
  `images` JSON COMMENT '图片列表',
  `status` TINYINT DEFAULT 1 COMMENT '1:待派单 2:处理中 3:已完成',
  INDEX `idx_community_status` (`community_id`, `status`)
) ENGINE=InnoDB COMMENT='物业报修工单表';

-- 6. 邻里圈发帖表
CREATE TABLE `posts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `community_id` BIGINT NOT NULL COMMENT '小区隔离Key',
  `user_id` BIGINT NOT NULL,
  `type` VARCHAR(30) DEFAULT 'NORMAL' COMMENT 'NORMAL:动态, NEED:求助, IDLE:闲置',
  `title` VARCHAR(100),
  `content` TEXT NOT NULL,
  `images` JSON,
  `audit_status` TINYINT DEFAULT 1 COMMENT '1:已安全审核 0:审核中',
  INDEX `idx_community_type` (`community_id`, `type`)
) ENGINE=InnoDB COMMENT='邻里圈动态表';
```
