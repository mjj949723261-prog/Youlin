package com.youlin.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.youlin.common.Result;
import com.youlin.entity.User;
import com.youlin.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {

    @Autowired
    private UserMapper userMapper;

    @Value("${wx.miniapp.appid:wxc3781b268c2b5fb8}")
    private String appId;

    @Value("${wx.miniapp.secret:17c35f7527d0b9a27fa341abce811a16}")
    private String appSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 微信小程序登录 (调用微信 jscode2session 换取真实 openid)
     */
    @PostMapping("/wx-login")
    public Result<Map<String, Object>> wxLogin(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String openId = "wx_openid_default";

        if (code != null && !code.isEmpty()) {
            try {
                String url = String.format(
                    "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                    appId, appSecret, code
                );
                String responseStr = restTemplate.getForObject(url, String.class);
                JsonNode jsonNode = objectMapper.readTree(responseStr);
                if (jsonNode.has("openid")) {
                    openId = jsonNode.get("openid").asText();
                    System.out.println("成功换取微信 OpenID: " + openId);
                } else {
                    System.err.println("换取 OpenID 返回: " + responseStr);
                }
            } catch (Exception e) {
                System.err.println("调用微信 jscode2session 异常: " + e.getMessage());
            }
        }

        User user = userMapper.selectById("usr_888");
        if (user == null) {
            user = new User();
            user.setId("usr_888");
            user.setNickname("微信用户");
            user.setAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250");
            user.setBuilding("5栋");
            user.setRoom("302");
            user.setIsOwner(true);
            user.setRoleTag("本小区住户");
            user.setCommunityId("comm_001");
            user.setPhone(null); // 未绑定时初始化为 null
            userMapper.insert(user);
        }

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("token", "youlin_jwt_token_" + UUID.randomUUID().toString().replaceAll("-", ""));
        resultMap.put("openId", openId);
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
     * 微信手机号真实授权解密 (通过微信官方 getuserphonenumber API 获取真实手机号)
     */
    @PostMapping("/bind-phone")
    public Result<User> bindPhone(@RequestBody Map<String, String> body) {
        String phoneCode = body.get("phoneCode");
        String rawPhone = body.get("phone");

        String realPhone = null;

        // 1. 如果前端直接传了合规手机号（调试/环境模拟）
        if (rawPhone != null && rawPhone.matches("^1[3-9]\\d{9}$")) {
            realPhone = rawPhone;
        }

        // 2. 如果前端传了微信 getPhoneNumber 返回的 phoneCode，调用微信 API 获取真实手机号
        if (realPhone == null && phoneCode != null && !phoneCode.isEmpty()) {
            try {
                // A. 获取 access_token
                String tokenUrl = String.format(
                    "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
                    appId, appSecret
                );
                String tokenRes = restTemplate.getForObject(tokenUrl, String.class);
                JsonNode tokenJson = objectMapper.readTree(tokenRes);

                if (tokenJson.has("access_token")) {
                    String accessToken = tokenJson.get("access_token").asText();

                    // B. 用 phoneCode 换取真实手机号
                    String phoneUrl = "https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=" + accessToken;
                    Map<String, String> reqBody = new HashMap<>();
                    reqBody.put("code", phoneCode);

                    String phoneRes = restTemplate.postForObject(phoneUrl, reqBody, String.class);
                    System.out.println("微信手机号 API 解密返回结果: " + phoneRes);

                    JsonNode phoneJson = objectMapper.readTree(phoneRes);
                    if (phoneJson.has("errcode") && phoneJson.get("errcode").asInt() == 0) {
                        JsonNode phoneInfo = phoneJson.get("phone_info");
                        if (phoneInfo != null && phoneInfo.has("phoneNumber")) {
                            realPhone = phoneInfo.get("phoneNumber").asText();
                            System.out.println("成功解密到用户微信真实绑定手机号: " + realPhone);
                        }
                    } else {
                        System.err.println("微信获取手机号接口返回错误: " + phoneRes);
                    }
                } else {
                    System.err.println("获取 access_token 失败: " + tokenRes);
                }
            } catch (Exception e) {
                System.err.println("调用微信手机号解密接口异常: " + e.getMessage());
            }
        }

        if (realPhone == null || realPhone.isEmpty()) {
            return Result.error(500, "未能获取到真实的微信绑定手机号，请在手机微信真机中体验");
        }

        // 格式化生成脱敏掩码手机号 (如 159****8888)
        String maskedPhone = realPhone.length() == 11
            ? realPhone.substring(0, 3) + "****" + realPhone.substring(7)
            : realPhone;

        User user = userMapper.selectById("usr_888");
        if (user != null) {
            user.setPhone(maskedPhone);
            userMapper.updateById(user);
        }

        return Result.success("微信手机号快捷授权绑定成功", user);
    }
}
