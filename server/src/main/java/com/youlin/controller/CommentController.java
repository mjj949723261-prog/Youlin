package com.youlin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.youlin.common.Result;
import com.youlin.entity.Comment;
import com.youlin.entity.User;
import com.youlin.mapper.CommentMapper;
import com.youlin.mapper.UserMapper;
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

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/posts/{postId}/comments")
    public Result<List<Comment>> getPostComments(@PathVariable Long postId) {
        LambdaQueryWrapper<Comment> mainWrapper = new LambdaQueryWrapper<>();
        mainWrapper.eq(Comment::getPostId, postId)
                   .isNull(Comment::getParentCommentId)
                   .orderByAsc(Comment::getFloorNum);
        List<Comment> mainComments = commentMapper.selectList(mainWrapper);

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

        if (StringUtils.hasText(comment.getAuthorId())) {
            User user = userMapper.selectById(comment.getAuthorId());
            if (user != null) {
                if (!StringUtils.hasText(comment.getAuthorName())) {
                    comment.setAuthorName(user.getNickname());
                }
                if (!StringUtils.hasText(comment.getAuthorAvatar())) {
                    comment.setAuthorAvatar(user.getAvatar());
                }
            }
        }

        if (!StringUtils.hasText(comment.getAuthorName())) {
            comment.setAuthorName("社区居民");
        }
        if (!StringUtils.hasText(comment.getAuthorAvatar())) {
            comment.setAuthorAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250");
        }
        if (!StringUtils.hasText(comment.getPublishTime())) {
            comment.setPublishTime("刚刚");
        }

        if (comment.getParentCommentId() == null) {
            LambdaQueryWrapper<Comment> countWrapper = new LambdaQueryWrapper<>();
            countWrapper.eq(Comment::getPostId, comment.getPostId()).isNull(Comment::getParentCommentId);
            Long count = commentMapper.selectCount(countWrapper);
            comment.setFloorNum(count.intValue() + 1);
        }

        commentMapper.insert(comment);
        System.out.println("💬 [数据库成功写入评论回复] 帖子ID: " + comment.getPostId() + " | 回复人: " + comment.getAuthorName() + " | 内容: " + comment.getContent());
        return Result.success("回复成功！", comment);
    }

    /**
     * 删除我的评论楼层
     */
    @DeleteMapping("/comments/{id}")
    public Result<String> deleteComment(@PathVariable Long id, @RequestParam(required = false) String openId) {
        Comment comment = commentMapper.selectById(id);
        if (comment == null) {
            return Result.error(404, "该回复已被删除");
        }

        if (StringUtils.hasText(openId) && StringUtils.hasText(comment.getAuthorId())) {
            if (!openId.equals(comment.getAuthorId())) {
                return Result.error(403, "只能删除您本人发表的回复");
            }
        }

        commentMapper.deleteById(id);
        System.out.println("🗑️ [数据库成功删除评论] Comment ID: " + id);
        return Result.success("评论回复已删除！", "OK");
    }
}
