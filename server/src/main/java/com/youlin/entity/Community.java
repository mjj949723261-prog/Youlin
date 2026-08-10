package com.youlin.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("sys_community")
public class Community {
    @TableId
    private String id;
    private String name;
    private String subDistrictId;
    private String subDistrictName;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSubDistrictId() { return subDistrictId; }
    public void setSubDistrictId(String subDistrictId) { this.subDistrictId = subDistrictId; }
    public String getSubDistrictName() { return subDistrictName; }
    public void setSubDistrictName(String subDistrictName) { this.subDistrictName = subDistrictName; }
}
