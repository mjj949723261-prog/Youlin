package com.youlin.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("sys_user")
public class User {
    @TableId
    private String id;
    private String nickname;
    private String avatar;
    private String building;
    private String room;
    private Boolean isOwner;
    private String roleTag;
    private String communityId;
    private String phone;
    private String city;
    private String province;
    private Integer gender;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }
    public String getRoom() { return room; }
    public void setRoom(String room) { this.room = room; }
    public Boolean getIsOwner() { return isOwner; }
    public void setIsOwner(Boolean isOwner) { this.isOwner = isOwner; }
    public String getRoleTag() { return roleTag; }
    public void setRoleTag(String roleTag) { this.roleTag = roleTag; }
    public String getCommunityId() { return communityId; }
    public void setCommunityId(String communityId) { this.communityId = communityId; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }
    public Integer getGender() { return gender; }
    public void setGender(Integer gender) { this.gender = gender; }
}
