package com.youlin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.youlin.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommentMapper extends BaseMapper<Comment> {
}
