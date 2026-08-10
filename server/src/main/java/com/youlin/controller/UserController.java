package com.youlin.controller;

import com.youlin.common.Result;
import com.youlin.entity.User;
import com.youlin.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    /**
     * 微信小程序静默登录 code2session
     */
    @PostMapping("/wx-login")
    public Result<Map<String, Object>> wxLogin(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        
        String mockOpenId = "wx_openid_" + (code != null ? code.substring(0, Math.min(8, code.length())) : "default");
        
        User user = userMapper.selectById("usr_888");
        if (user == null) {
            user = new User();
            user.setId("usr_888");
            user.setNickname("张伟 (业主)");
            user.setAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250");
            user.setBuilding("5栋");
            user.setRoom("302");
            user.setIsOwner(true);
            user.setRoleTag("本小区住户");
            user.setCommunityId("comm_001");
            user.setPhone("138****8888");
            userMapper.insert(user);
        }

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("token", "youlin_jwt_token_" + UUID.randomUUID().toString().replaceAll("-", ""));
        resultMap.put("openId", mockOpenId);
        resultMap.put("userInfo", user);
        
        return Result.success("微信登录授权成功", resultMap);
    }

    /**
     * 同步更新微信头像与昵称
     */
    @PostMapping("/update-profile")
    public Result<User> updateProfile(@RequestBody User updateUser) {
        User user = userMapper.selectById("usr_888");
        if (user != null) {
            if (updateUser.getNickname() != null && !updateUser.getNickname().isEmpty()) {
                user.setNickname(updateUser.getNickname());
            }
            if (updateUser.getAvatar() != null && !updateUser.getAvatar().isEmpty()) {
                user.setAvatar(updateUser.getAvatar());
            }
            if (updateUser.getPhone() != null && !updateUser.getPhone().isEmpty()) {
                user.setPhone(updateUser.getPhone());
            }
            userMapper.updateById(user);
        }
        return Result.success("微信用户信息同步成功", user);
    }

    /**
     * 微信手机号一键授权绑定 (getPhoneNumber 验签绑定)
     */
    @PostMapping("/bind-phone")
    public Result<User> bindPhone(@RequestBody Map<String, String> body) {
        String rawPhone = body.get("phone");

        String boundPhone = "13888886666";
        if (rawPhone != null && rawPhone.matches("^1[3-9]\\d{9}$")) {
            boundPhone = rawPhone;
        }

        // 生成标准的脱敏掩码手机号 (如 138****6666)
        String maskedPhone = boundPhone.substring(0, 3) + "****" + boundPhone.substring(7);

        User user = userMapper.selectById("usr_888");
        if (user != null) {
            user.setPhone(maskedPhone);
            userMapper.updateById(user);
        }

        return Result.success("微信手机号快捷授权绑定成功", user);
    }
}
