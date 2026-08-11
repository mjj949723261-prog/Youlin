package com.youlin.controller;

import com.youlin.common.Result;
import com.youlin.entity.Report;
import com.youlin.mapper.ReportMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    @Autowired
    private ReportMapper reportMapper;

    @PostMapping
    public Result<String> createReport(@RequestBody Report report) {
        if (report.getPostId() == null && report.getCommentId() == null) {
            return Result.error(400, "举报对象不能为空");
        }
        if (!StringUtils.hasText(report.getReason())) {
            report.setReason("涉嫌违规内容");
        }
        if (!StringUtils.hasText(report.getReportTime())) {
            report.setReportTime("刚刚");
        }

        report.setStatus(0);
        reportMapper.insert(report);

        System.out.println("🚨 [收到社区内容违规举报] 帖子ID: " + report.getPostId() + " | 评论ID: " + report.getCommentId() + " | 原因: " + report.getReason());
        return Result.success("感谢您的监督，社区管理员已收到举报并优先处理！", "OK");
    }
}
