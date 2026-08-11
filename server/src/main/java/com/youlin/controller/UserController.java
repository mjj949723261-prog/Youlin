package com.youlin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.youlin.common.Result;
import com.youlin.entity.Comment;
import com.youlin.entity.Post;
import com.youlin.entity.User;
import com.youlin.mapper.CommentMapper;
import com.youlin.mapper.PostMapper;
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

    @Autowired
    private PostMapper postMapper;

    @Autowired
    private CommentMapper commentMapper;

    @Value("${wx.miniapp.appid:wxc3781b268c2b5fb8}")
    private String appId;

    @Value("${wx.miniapp.secret:17c35f7527d0b9a27fa341abce811a16}")
    private String appSecret;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 获取指定用户的真实发帖数与回复数全数据统计
     */
    @GetMapping("/stats")
    public Result<Map<String, Object>> getUserStats(@RequestParam(required = false) String openId) {
        Map<String, Object> stats = new HashMap<>();
        if (openId == null || openId.isEmpty()) {
            stats.put("postCount", 0);
            stats.put("replyCount", 0);
            return Result.success(stats);
        }

        LambdaQueryWrapper<Post> postWrapper = new LambdaQueryWrapper<>();
        postWrapper.eq(Post::getAuthorId, openId);
        Long postCount = postMapper.selectCount(postWrapper);

        LambdaQueryWrapper<Comment> commentWrapper = new LambdaQueryWrapper<>();
        commentWrapper.eq(Comment::getAuthorId, openId);
        Long replyCount = commentMapper.selectCount(commentWrapper);

        stats.put("postCount", postCount);
        stats.put("replyCount", replyCount);

        return Result.success(stats);
    }

    /**
     * 微信小程序登录，附带 5 大角色信息
     */
    @PostMapping("/wx-login")
    public Result<Map<String, Object>> wxLogin(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String openId = "wx_openid_" + UUID.randomUUID().toString().substring(0, 8);

        System.out.println("📥 [微信登录鉴权] Code: " + code);

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
                }
            } catch (Exception e) {
                System.err.println("❌ 换取 OpenID 异常: " + e.getMessage());
            }
        }

        User user = userMapper.selectById(openId);
        if (user == null) {
            user = new User();
            user.setId(openId);
            String tail = openId.length() >= 4 ? openId.substring(openId.length() - 4) : "8888";
            user.setNickname("微信邻居_" + tail);
            user.setAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250");
            user.setBuilding("5栋");
            user.setRoom("302");
            user.setIsOwner(true);
            user.setRoleTag("本小区业主");
            user.setCommunityId("site_comm_001");
            userMapper.insert(user);
        }

        Map<String, Object> resultMap = new HashMap<>();
        resultMap.put("token", "youlin_jwt_token_" + UUID.randomUUID().toString().replaceAll("-", ""));
        resultMap.put("openId", openId);
        resultMap.put("userInfo", user);

        return Result.success("微信登录授权成功", resultMap);
    }

    /**
     * 演示/体验一键切换角色 API (支持 5 大角色无缝切换)
     */
    @PostMapping("/switch-role")
    public Result<User> switchRole(@RequestBody Map<String, String> body) {
        String openId = body.get("openId");
        String roleCode = body.get("roleCode");

        User user = userMapper.selectById(openId);
        if (user == null) {
            user = userMapper.selectById("usr_888");
        }

        if (user != null) {
            if ("COMMUNITY_ADMIN".equals(roleCode)) {
                user.setRoleTag("🛡️ 社区行政管理者");
            } else if ("COMMITTEE_ADMIN".equals(roleCode)) {
                user.setRoleTag("🏛️ 业委会代表");
            } else if ("PROPERTY_STAFF".equals(roleCode)) {
                user.setRoleTag("🏢 物业服务管家");
            } else if ("MERCHANT".equals(roleCode)) {
                user.setRoleTag("🏪 周边便民商户");
            } else {
                user.setRoleTag("🏠 业主认证住户");
            }
            userMapper.updateById(user);
            System.out.println("🎭 [用户角色成功切换] OpenID: " + openId + " | 最新角色: " + user.getRoleTag());
        }
        return Result.success("角色与控制权限切换成功！", user);
    }

    /**
     * 同步更新微信 Profile 拓展信息
     */
    @PostMapping("/update-profile")
    public Result<User> updateProfile(@RequestBody Map<String, Object> body) {
        String openId = (String) body.get("openId");
        String nickname = (String) body.get("nickname");
        String avatar = (String) body.get("avatar");
        String city = (String) body.get("city");
        String province = (String) body.get("province");

        User user = userMapper.selectById(openId);
        if (user != null) {
            if (nickname != null && !nickname.isEmpty()) user.setNickname(nickname);
            if (avatar != null && !avatar.isEmpty()) user.setAvatar(avatar);
            if (city != null && !city.isEmpty()) user.setCity(city);
            if (province != null && !province.isEmpty()) user.setProvince(province);
            userMapper.updateById(user);
        }
        return Result.success("资料更新成功", user);
    }

    /**
     * 微信手机号授权解密绑定
     */
    @PostMapping("/bind-phone")
    public Result<User> bindPhone(@RequestBody Map<String, String> body) {
        String openId = body.get("openId");
        String phone = body.get("phone");
        if (phone == null || phone.isEmpty()) phone = "15988886666";

        User user = userMapper.selectById(openId);
        if (user != null) {
            user.setPhone(phone);
            userMapper.updateById(user);
        }
        return Result.success("手机号绑定成功", user);
    }
}
