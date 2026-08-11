package com.youlin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.youlin.common.Result;
import com.youlin.entity.Post;
import com.youlin.entity.User;
import com.youlin.mapper.PostMapper;
import com.youlin.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    @Autowired
    private PostMapper postMapper;

    @Autowired
    private UserMapper userMapper;

    /**
     * 根据站点 ID (siteId/communityId) 动态过滤该小区的论坛列表
     */
    @GetMapping
    public Result<List<Post>> getPostList(
            @RequestParam(required = false, defaultValue = "ALL") String categoryKey,
            @RequestParam(required = false) String siteId) {
        
        LambdaQueryWrapper<Post> wrapper = new LambdaQueryWrapper<>();
        
        // 多站点隔离：如果传入了特定站点 siteId，精准过滤
        if (StringUtils.hasText(siteId)) {
            wrapper.eq(Post::getSiteId, siteId);
        }
        
        if (StringUtils.hasText(categoryKey) && !"ALL".equalsIgnoreCase(categoryKey)) {
            wrapper.eq(Post::getCategoryKey, categoryKey);
        }
        
        wrapper.orderByDesc(Post::getId);
        List<Post> list = postMapper.selectList(wrapper);
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<Map<String, Object>> getPostDetail(@PathVariable Long id) {
        Post post = postMapper.selectById(id);
        if (post == null) {
            return Result.error(404, "该帖子已被删除或不存在");
        }

        Map<String, Object> map = new HashMap<>();
        map.put("post", post);
        if (StringUtils.hasText(post.getImages())) {
            map.put("imageList", Arrays.asList(post.getImages().split(",")));
        } else {
            map.put("imageList", Arrays.asList());
        }
        return Result.success(map);
    }

    @PostMapping
    public Result<Post> createPost(@RequestBody Post post) {
        if (!StringUtils.hasText(post.getContent())) {
            return Result.error(400, "发布内容不能为空");
        }

        // 如果未指定 siteId，兜底为默认站点 site_comm_001
        if (!StringUtils.hasText(post.getSiteId())) {
            post.setSiteId("site_comm_001");
        }

        if (StringUtils.hasText(post.getAuthorId())) {
            User user = userMapper.selectById(post.getAuthorId());
            if (user != null) {
                if (!StringUtils.hasText(post.getAuthorName())) {
                    post.setAuthorName(user.getNickname());
                }
                if (!StringUtils.hasText(post.getAuthorAvatar())) {
                    post.setAuthorAvatar(user.getAvatar());
                }
            }
        }

        if (!StringUtils.hasText(post.getAuthorName())) {
            post.setAuthorName("社区居民");
        }
        if (!StringUtils.hasText(post.getAuthorAvatar())) {
            post.setAuthorAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250");
        }
        if (!StringUtils.hasText(post.getBuilding())) {
            post.setBuilding("5栋 302");
        }
        if (!StringUtils.hasText(post.getPublishTime())) {
            post.setPublishTime("刚刚");
        }

        postMapper.insert(post);
        System.out.println("📝 [多站点数据库成功写入新动态] SiteID: " + post.getSiteId() + " | ID: " + post.getId() + " | 作者: " + post.getAuthorName());
        return Result.success("动态发布成功！", post);
    }

    @DeleteMapping("/{id}")
    public Result<String> deletePost(@PathVariable Long id, @RequestParam(required = false) String openId) {
        Post post = postMapper.selectById(id);
        if (post == null) {
            return Result.error(404, "该动态已被删除或不存在");
        }

        if (StringUtils.hasText(openId) && StringUtils.hasText(post.getAuthorId())) {
            if (!openId.equals(post.getAuthorId())) {
                return Result.error(403, "只能删除您本人发布的邻里动态");
            }
        }

        postMapper.deleteById(id);
        System.out.println("🗑️ [数据库成功删除动态] Post ID: " + id);
        return Result.success("动态已成功删除！", "OK");
    }
}
