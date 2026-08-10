package com.youlin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.youlin.common.Result;
import com.youlin.entity.Community;
import com.youlin.entity.User;
import com.youlin.mapper.CommunityMapper;
import com.youlin.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/community")
public class CommunityController {

    @Autowired
    private CommunityMapper communityMapper;

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/current")
    public Result<Map<String, Object>> getCurrentCommunityInfo() {
        Community community = communityMapper.selectById("comm_001");
        User user = userMapper.selectById("usr_888");
        List<Community> allCommunities = communityMapper.selectList(new LambdaQueryWrapper<Community>());

        Map<String, Object> map = new HashMap<>();
        map.put("currentCommunity", community);
        map.put("currentUser", user);
        map.put("myCommunities", allCommunities);
        return Result.success("获取当前社区及用户身份信息成功", map);
    }

}
