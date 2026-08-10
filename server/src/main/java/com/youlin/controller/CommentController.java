package com.youlin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.youlin.common.Result;
import com.youlin.entity.Comment;
import com.youlin.mapper.CommentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CommentController {

    @Autowired
    private CommentMapper commentMapper;

    @GetMapping("/posts/{postId}/comments")
    public Result<List<Comment>> getPostComments(@PathVariable Long postId) {
        // 1. 查询所有主楼层评论 (parentCommentId IS NULL)
        LambdaQueryWrapper<Comment> mainWrapper = new LambdaQueryWrapper<>();
        mainWrapper.eq(Comment::getPostId, postId)
                   .isNull(Comment::getParentCommentId)
                   .orderByAsc(Comment::getFloorNum);
        List<Comment> mainComments = commentMapper.selectList(mainWrapper);

        // 2. 为每个主楼层查询对应的 subReplies 嵌套子回复
        for (Comment mainComment : mainComments) {
            LambdaQueryWrapper<Comment> subWrapper = new LambdaQueryWrapper<>();
            subWrapper.eq(Comment::getPostId, postId)
                      .eq(Comment::getParentCommentId, mainComment.getId())
                      .orderByAsc(Comment::getId);
            List<Comment> subReplies = commentMapper.selectList(subWrapper);
            mainComment.setSubReplies(subReplies != null ? subReplies : new ArrayList<>());
        }

        return Result.success(mainComments);
    }

    @PostMapping("/comments")
    public Result<Comment> addComment(@RequestBody Comment comment) {
        if (comment.getPostId() == null) {
            return Result.error(400, "帖子ID不能为空");
        }
        if (!StringUtils.hasText(comment.getContent()) && !StringUtils.hasText(comment.getImage()) && !StringUtils.hasText(comment.getVideo())) {
            return Result.error(400, "回复内容或附件媒体不能为空");
        }

        if (!StringUtils.hasText(comment.getAuthorName())) {
            comment.setAuthorName("我 (李先生)");
        }
        if (!StringUtils.hasText(comment.getPublishTime())) {
            comment.setPublishTime("刚刚");
        }

        // 计算楼层数
        if (comment.getParentCommentId() == null) {
            LambdaQueryWrapper<Comment> countWrapper = new LambdaQueryWrapper<>();
            countWrapper.eq(Comment::getPostId, comment.getPostId()).isNull(Comment::getParentCommentId);
            Long count = commentMapper.selectCount(countWrapper);
            comment.setFloorNum(count.intValue() + 1);
        }

        commentMapper.insert(comment);
        return Result.success("回复成功！", comment);
    }

}
