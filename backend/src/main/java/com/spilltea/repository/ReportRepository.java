package com.spilltea.repository;

import com.spilltea.entity.Report;
import com.spilltea.entity.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Page<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);
    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);
    Page<Report> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
