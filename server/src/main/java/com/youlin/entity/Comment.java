package com.youlin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.List;

@Data
@TableName("forum_comment")
public class Comment {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String siteId; // 多站点隔离核心字段 site_id
    private Long postId;
    private String authorId;
    private String authorName;
    private String authorAvatar;
    private String content;
    private String image;
    private String video;
    private Integer floorNum;
    private Long parentCommentId;
    private String replyToUser;
    private String publishTime;

    @TableLogic
    private Integer deleted;

    @TableField(exist = false)
    private List<Comment> subReplies;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSiteId() { return siteId; }
    public void setSiteId(String siteId) { this.siteId = siteId; }
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getVideo() { return video; }
    public void setVideo(String video) { this.video = video; }
    public Integer getFloorNum() { return floorNum; }
    public void setFloorNum(Integer floorNum) { this.floorNum = floorNum; }
    public Long getParentCommentId() { return parentCommentId; }
    public void setParentCommentId(Long parentCommentId) { this.parentCommentId = parentCommentId; }
    public String getReplyToUser() { return replyToUser; }
    public void setReplyToUser(String replyToUser) { this.replyToUser = replyToUser; }
    public String getPublishTime() { return publishTime; }
    public void setPublishTime(String publishTime) { this.publishTime = publishTime; }
    public Integer getDeleted() { return deleted; }
    public void setDeleted(Integer deleted) { this.deleted = deleted; }
    public List<Comment> getSubReplies() { return subReplies; }
    public void setSubReplies(List<Comment> subReplies) { this.subReplies = subReplies; }
}
