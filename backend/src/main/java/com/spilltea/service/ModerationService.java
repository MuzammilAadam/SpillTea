package com.spilltea.service;

import com.spilltea.dto.moderation.ModerationActionRequest;
import com.spilltea.dto.moderation.ReportRequest;
import com.spilltea.dto.moderation.ReportResponse;
import com.spilltea.entity.*;
import com.spilltea.entity.enums.AccountStatus;
import com.spilltea.entity.enums.CommentStatus;
import com.spilltea.entity.enums.PublicationStatus;
import com.spilltea.entity.enums.ReportStatus;
import com.spilltea.exception.BadRequestException;
import com.spilltea.exception.ResourceNotFoundException;
import com.spilltea.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ModerationService {

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("MMMM d, yyyy HH:mm", Locale.ENGLISH);

    private final ReportRepository reportRepository;
    private final BlockedUserRepository blockedUserRepository;
    private final UserRepository userRepository;
    private final StoryRepository storyRepository;
    private final CommentRepository commentRepository;

    public ModerationService(ReportRepository reportRepository,
                             BlockedUserRepository blockedUserRepository,
                             UserRepository userRepository,
                             StoryRepository storyRepository,
                             CommentRepository commentRepository) {
        this.reportRepository = reportRepository;
        this.blockedUserRepository = blockedUserRepository;
        this.userRepository = userRepository;
        this.storyRepository = storyRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional
    public ReportResponse submitReport(ReportRequest request, Long reporterId) {
        if (request.getStoryId() == null && request.getCommentId() == null && request.getReportedUserId() == null) {
            throw new BadRequestException("At least one target (story, comment, or user) must be specified.");
        }

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found"));

        Report report = new Report();
        report.setReporter(reporter);
        report.setReason(request.getReason());

        if (request.getStoryId() != null) {
            Story story = storyRepository.findById(request.getStoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Story not found"));
            report.setStory(story);
            report.setReportedUser(story.getAuthor());
        }

        if (request.getCommentId() != null) {
            Comment comment = commentRepository.findById(request.getCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));
            report.setComment(comment);
            report.setReportedUser(comment.getAuthor());
        }

        if (request.getReportedUserId() != null && report.getReportedUser() == null) {
            report.setReportedUser(userRepository.findById(request.getReportedUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reported user not found")));
        }

        return toReportResponse(reportRepository.save(report));
    }

    @Transactional
    public void blockUser(Long blockerId, Long blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new BadRequestException("You cannot block yourself.");
        }

        if (!blockedUserRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            User blocker = userRepository.findById(blockerId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            User blocked = userRepository.findById(blockedId)
                    .orElseThrow(() -> new ResourceNotFoundException("User to block not found"));

            blockedUserRepository.save(new BlockedUser(blocker, blocked));
        }
    }

    @Transactional
    public void unblockUser(Long blockerId, Long blockedId) {
        blockedUserRepository.deleteByBlockerIdAndBlockedId(blockerId, blockedId);
    }

    public List<Long> getBlockedUserIds(Long userId) {
        return blockedUserRepository.findByBlockerId(userId).stream()
                .map(b -> b.getBlocked().getId())
                .collect(Collectors.toList());
    }

    public Page<ReportResponse> getReports(String statusFilter, Pageable pageable) {
        if (statusFilter != null && !statusFilter.isBlank()) {
            ReportStatus status = ReportStatus.valueOf(statusFilter.toUpperCase());
            return reportRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
                    .map(this::toReportResponse);
        }
        return reportRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toReportResponse);
    }

    @Transactional
    public ReportResponse resolveReport(Long reportId, ModerationActionRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        switch (request.getAction().toUpperCase()) {
            case "RESOLVE" -> report.setStatus(ReportStatus.RESOLVED);
            case "REJECT" -> report.setStatus(ReportStatus.REJECTED);
            case "ESCALATE" -> report.setStatus(ReportStatus.ESCALATED);
            case "HIDE_CONTENT" -> {
                report.setStatus(ReportStatus.RESOLVED);
                if (report.getStory() != null) {
                    report.getStory().setStatus(PublicationStatus.REMOVED);
                    storyRepository.save(report.getStory());
                }
                if (report.getComment() != null) {
                    report.getComment().setStatus(CommentStatus.REMOVED);
                    commentRepository.save(report.getComment());
                }
            }
            case "SUSPEND_USER" -> {
                report.setStatus(ReportStatus.RESOLVED);
                if (report.getReportedUser() != null) {
                    report.getReportedUser().setStatus(AccountStatus.SUSPENDED);
                    userRepository.save(report.getReportedUser());
                }
            }
            default -> throw new BadRequestException("Unknown moderation action: " + request.getAction());
        }

        if (request.getModeratorNotes() != null) {
            report.setModeratorNotes(request.getModeratorNotes());
        }

        return toReportResponse(reportRepository.save(report));
    }

    private ReportResponse toReportResponse(Report report) {
        ReportResponse dto = new ReportResponse();
        dto.setId(report.getId());
        if (report.getReporter() != null) dto.setReporterPseudonym(report.getReporter().getPseudonym());
        if (report.getReportedUser() != null) dto.setReportedPseudonym(report.getReportedUser().getPseudonym());
        if (report.getStory() != null) {
            dto.setStoryId(report.getStory().getId());
            dto.setStoryTitle(report.getStory().getTitle());
        }
        if (report.getComment() != null) {
            dto.setCommentId(report.getComment().getId());
            String body = report.getComment().getBody();
            dto.setCommentSnippet(body != null && body.length() > 100 ? body.substring(0, 100) + "..." : body);
        }
        dto.setReason(report.getReason());
        dto.setStatus(report.getStatus().name());
        dto.setModeratorNotes(report.getModeratorNotes());
        dto.setCreatedAt(report.getCreatedAt().format(DATE_FORMATTER));
        return dto;
    }
}
