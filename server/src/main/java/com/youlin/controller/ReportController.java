package com.youlin.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.youlin.common.Result;
import com.youlin.entity.Post;
import com.youlin.entity.Report;
import com.youlin.mapper.PostMapper;
import com.youlin.mapper.ReportMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {

    @Autowired
    private ReportMapper reportMapper;

    @Autowired
    private PostMapper postMapper;

    /**
     * 提交内容违规举报
     */
    @PostMapping
    public Result<String> createReport(@RequestBody Report report) {
        if (report.getPostId() == null && report.getCommentId() == null) {
            return Result.error(400, "举报对象不能为空");
        }

        if (report.getPostId() != null) {
            Post post = postMapper.selectById(report.getPostId());
            if (post != null && StringUtils.hasText(post.getSiteId())) {
                report.setSiteId(post.getSiteId());
            }
        }

        if (!StringUtils.hasText(report.getSiteId())) {
            report.setSiteId("site_comm_001");
        }

        if (!StringUtils.hasText(report.getReason())) {
            report.setReason("涉嫌违规内容");
        }
        if (!StringUtils.hasText(report.getReportTime())) {
            report.setReportTime("刚刚");
        }

        report.setStatus(0);
        reportMapper.insert(report);

        System.out.println("🚨 [收到社区违规举报] SiteID: " + report.getSiteId() + " | 帖子ID: " + report.getPostId() + " | 原因: " + report.getReason());
        return Result.success("感谢您的监督，社区管理员已收到举报并优先处理！", "OK");
    }

    /**
     * 管理员获取待审核处置的违规举报列表 (带 siteId 数据隔离)
     */
    @GetMapping("/pending")
    public Result<List<Report>> getPendingReports(@RequestParam(required = false) String siteId) {
        LambdaQueryWrapper<Report> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Report::getStatus, 0);
        if (StringUtils.hasText(siteId) && !"ALL".equalsIgnoreCase(siteId)) {
            wrapper.eq(Report::getSiteId, siteId);
        }
        wrapper.orderByDesc(Report::getId);
        List<Report> list = reportMapper.selectList(wrapper);
        return Result.success(list);
    }

    /**
     * 管理员处理违规工单 (一键封禁删帖或误报撤销)
     */
    @PostMapping("/{id}/resolve")
    public Result<String> resolveReport(@PathVariable Long id, @RequestParam(defaultValue = "DELETE_POST") String action) {
        Report report = reportMapper.selectById(id);
        if (report == null) {
            return Result.error(404, "举报记录不存在");
        }

        report.setStatus(1);
        reportMapper.updateById(report);

        if ("DELETE_POST".equalsIgnoreCase(action) && report.getPostId() != null) {
            postMapper.deleteById(report.getPostId());
            System.out.println("🛡️ [管理员执行违规处分] 一键下架删除违规帖子 ID: " + report.getPostId());
        }

        return Result.success("举报处理完毕，违规内容已处分下架！", "OK");
    }
}
