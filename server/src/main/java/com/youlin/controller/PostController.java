package com.youlin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.youlin.common.Result;
import com.youlin.entity.Post;
import com.youlin.mapper.PostMapper;
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

    @GetMapping
    public Result<List<Post>> getPostList(@RequestParam(required = false, defaultValue = "ALL") String categoryKey) {
        LambdaQueryWrapper<Post> wrapper = new LambdaQueryWrapper<>();
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
        if (!StringUtils.hasText(post.getAuthorName())) {
            post.setAuthorName("李先生");
        }
        if (!StringUtils.hasText(post.getBuilding())) {
            post.setBuilding("5栋 302");
        }
        if (!StringUtils.hasText(post.getPublishTime())) {
            post.setPublishTime("刚刚");
        }
        if (!StringUtils.hasText(post.getCommunityId())) {
            post.setCommunityId("comm_001");
        }

        postMapper.insert(post);
        return Result.success("动态发布成功！", post);
    }

}
