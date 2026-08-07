# 02. 用户体系与多租户 SaaS 架构

## 一、 组织层级架构 (Hierarchy Model)

系统采用“平台 ➔ 社区 (街道) ➔ 小区”三级管理树，支持一个社区管辖多个小区：

```
                              [ 平台超级管理员 Platform Super Admin ]
                                                 │
                                                 ▼
                              [ 社区 / 街道层级 Sub-district / Community ] (管理者: 1)
                                                 │ 
                                                 ├───────────────────────────────┐ (一对多 N)
                                                 ▼                               ▼
                                     [ 小区 A Zone A ]               [ 小区 B Zone B ]
                                                 │                               │
                               ┌─────────────────┼─────────────────┐             ...
                               ▼                 ▼                 ▼
                         [ 业委会 A ]        [ 物业 A ]        [ 业主 / 商户 ]
                         (管理者 1:1)       (服务支持 1:1)
```

---

## 二、 5 大核心角色定义与权限 (Role Taxonomy)

根据权责属性，系统角色划分为 **2大管理侧、1大用户侧、2大服务侧**：

| 角色类别 | 角色名称 | 属性定位 | 核心权责 |
| :--- | :--- | :--- | :--- |
| **管理者** | **社区 (街道/居委会)** | 区域总控 (1对多小区) | 发布全社区政策通知、监管管辖区内所有小区、处理跨小区公共事务 |
| **管理者** | **业委会** | 小区监督 (1对1小区) | 监督本小区物业服务、发布业委会公告、发起业主议事/投票、管理公共收益 |
| **用户** | **业主 / 租户 / 家属** | 核心居民用户 | 邻里发帖、吐槽、求助、活动组团、闲置交易、房屋出租/找室友 |
| **服务支持**| **物业公司** | 现场服务提供者 | 处理业主报修、日常维护、推送物管通知、（后期开通门禁/缴费） |
| **服务支持**| **其他周边商户** | 商业服务提供者 | 提供 1-3 公里便民服务（开锁、家政、干洗、水电急修、特惠团购） |

---

## 三、 用户-社区-小区-房屋数据关联模型 (Database Relation)

为满足“一个社区包含多个小区，业主可在同一社区/不同小区拥有多套房产”的需求：

```sql
-- 1. 社区 (街道/居委会) 表
CREATE TABLE `sub_districts` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL COMMENT '社区/街道名称 (如: 翠竹社区)',
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '社区编码',
  `status` TINYINT DEFAULT 1
) ENGINE=InnoDB COMMENT='社区(街道)层级表';

-- 2. 小区表 (属于某个社区)
CREATE TABLE `communities` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `sub_district_id` BIGINT NOT NULL COMMENT '所属社区ID',
  `name` VARCHAR(100) NOT NULL COMMENT '小区名称 (如: 阳光花园)',
  `address` VARCHAR(255) COMMENT '小区地址',
  FOREIGN KEY (`sub_district_id`) REFERENCES `sub_districts`(`id`),
  INDEX `idx_sub_district` (`sub_district_id`)
) ENGINE=InnoDB COMMENT='小区表';

-- 3. 业主房产绑定关系表 (多对多关联)
CREATE TABLE `user_house_relations` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `sub_district_id` BIGINT NOT NULL COMMENT '社区ID',
  `community_id` BIGINT NOT NULL COMMENT '小区ID',
  `building` VARCHAR(50) NOT NULL COMMENT '楼栋',
  `room_number` VARCHAR(50) NOT NULL COMMENT '房号',
  `role_type` TINYINT NOT NULL COMMENT '1:业主 2:家属 3:租户',
  `audit_status` TINYINT DEFAULT 0 COMMENT '0:待审核 1:审核通过 2:拒绝',
  INDEX `idx_user_comm` (`user_id`, `community_id`)
) ENGINE=InnoDB COMMENT='业主房产绑定表';
```
