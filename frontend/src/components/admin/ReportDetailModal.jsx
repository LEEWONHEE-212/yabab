// src/components/Admin/ReportDetailModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext'; // UserContext 경로를 프로젝트에 맞게 조정해주세요.
import './Modal.css'; // 모달 공통 스타일을 임포트합니다.

// 신고 사유 매핑을 위한 상수 배열 정의
const REPORT_REASONS = [
    { value: 'ABUSE', label: '욕설/비방' },
    { value: 'PORNOGRAPHY', label: '음란성/선정성' },
    { value: 'ADVERTISING', label: '광고/홍보' },
    { value: 'PERSONAL_INFO', label: '개인 정보 침해' },
    { value: 'IRRELEVANT', label: '리뷰와 무관한 내용' },
    { value: 'OTHER', label: '기타' },
];

const ReportDetailModal = ({ report, reportType, onClose, getReportStatusText, fetchReports }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detailedReport, setDetailedReport] = useState(null); // API에서 불러올 상세 신고 정보
    const { user: adminUser } = useContext(UserContext); // 현재 로그인한 관리자 정보 (userId 등)

    // 신고 사유 값을 한글 라벨로 변환하는 헬퍼 함수
    const getReportReasonLabel = (reasonValue) => {
        const foundReason = REPORT_REASONS.find(reason => reason.value === reasonValue);
        return foundReason ? foundReason.label : reasonValue; // 찾지 못하면 원본 값 반환
    };

    // 모달이 열릴 때 선택된 신고의 상세 정보를 비동기로 불러옵니다.
    useEffect(() => {
        const fetchReportDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const endpoint = reportType === 'review' ?
                    `http://localhost:18090/api/admin/reports/reviews/${report.reportId}` :
                    `http://localhost:18090/api/admin/reports/posts/${report.reportId}`;

                const response = await axios.get(endpoint, {
                    // headers: { Authorization: `Bearer ${adminUser?.token}` }
                });
                setDetailedReport(response.data);
                console.log("Fetched detailed report:", response.data);
            } catch (err) {
                console.error(`Failed to fetch ${reportType} report detail:`, err);
                setError(`${reportType === 'review' ? '리뷰' : '게시물'} 신고 상세 정보를 불러오는데 실패했습니다: ` + (err.response?.data?.message || err.message || err.toString()));
            } finally {
                setLoading(false);
            }
        };
        fetchReportDetail();
    }, [report.reportId, reportType, adminUser]);

    // 신고 처리 (수락 또는 거절) 함수
    const handleProcessReport = async (action) => {
        if (detailedReport && detailedReport.status !== 'PENDING') {
            alert('이미 처리된 신고입니다.');
            return;
        }

        const actionText = action === 'ACCEPT' ? '수락 (해당 콘텐츠 삭제)' : '거절 (해당 콘텐츠 유지)';
        const confirmMessage = reportType === 'review' ?
            `이 리뷰 신고를 ${actionText} 처리하시겠습니까?` :
            `이 게시물 신고를 ${actionText} 처리하시겠습니까?`;

        if (window.confirm(confirmMessage)) {
            try {
                const endpoint = reportType === 'review' ?
                    `http://localhost:18090/api/admin/reports/reviews/${detailedReport.reportId}/process` :
                    `http://localhost:18090/api/admin/reports/posts/${detailedReport.reportId}/process`;

                await axios.patch(endpoint, {
                    action: action, // 'ACCEPT' 또는 'REJECT'
                    adminId: adminUser?.userId
                }, {
                    // headers: { Authorization: `Bearer ${adminUser?.token}` }
                });
                alert(`신고가 성공적으로 ${actionText} 처리되었습니다.`);
                fetchReports();
                onClose();
            } catch (err) {
                console.error(`Failed to ${action} ${reportType} report:`, err);
                alert(`신고 ${actionText}에 실패했습니다: ` + (err.response?.data?.message || err.message || err.toString()));
            }
        }
    };

    if (loading) return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p>신고 상세 정보를 불러오는 중...</p>
            </div>
        </div>
    );
    if (error) return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p className="error-message">{error}</p>
                <button onClick={onClose} className="action-button close-button-in-modal">닫기</button>
            </div>
        </div>
    );
    if (!detailedReport) return null;

    const originalContentBody = detailedReport.originalReviewContent;
    const originalContentId = detailedReport.reviewId;
    const originalContentLabel = "원본 리뷰 내용";

    return (
        <div className="modal-overlay">
            <div className="modal-content admin-detail-modal report-detail-modal">
                <div className="modal-header">
                    <h2>{reportType === 'review' ? '리뷰 신고' : '게시물 신고'} 상세 정보 (ID: {detailedReport.reportId})</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <p><strong>신고 ID:</strong> {detailedReport.reportId}</p>
                    <p><strong>대상 콘텐츠 ID:</strong> {originalContentId}</p>
                    <p>
                        <strong>신고자:</strong> {detailedReport.reporterUserName || '알 수 없음'}
                        {detailedReport.reporterUserId ? ` (${detailedReport.reporterUserId})` : ''}
                        {detailedReport.reporterUserEmail ? ` - ${detailedReport.reporterUserEmail}` : ''}
                    </p>
                    <p>
                        <strong>대상 회원:</strong> {detailedReport.reportedUserName || '알 수 없음'}
                        {detailedReport.reportedUserId ? ` (${detailedReport.reportedUserId})` : ''}
                        {detailedReport.reportedUserEmail ? ` - ${detailedReport.reportedUserEmail}` : ''}
                    </p>
                    {/* 신고 사유를 한글 라벨로 표시 */}
                    <p><strong>신고 사유:</strong> {getReportReasonLabel(detailedReport.reportReason)}</p>
                    <p><strong>상세 사유:</strong> {detailedReport.reportDetails || '없음'}</p>
                    <p><strong>신고일:</strong> {detailedReport.createdDate ? new Date(detailedReport.createdDate).toLocaleString() : 'N/A'}</p>
                    <p><strong>현재 상태:</strong> <strong>{getReportStatusText(detailedReport.status)}</strong></p>
                    {detailedReport.status !== 'PENDING' && (
                        <>
                            <p><strong>처리 관리자 ID:</strong> {detailedReport.processedBy || 'N/A'}</p>
                            <p><strong>처리일:</strong> {detailedReport.processedDate ? new Date(detailedReport.processedDate).toLocaleString() : 'N/A'}</p>
                            <p><strong>취해진 조치:</strong> {detailedReport.actionTaken || '없음'}</p>
                            <p><strong>메모:</strong> {detailedReport.memo || '없음'}</p>
                        </>
                    )}

                    <div className="detail-section">
                        <h3>{originalContentLabel}</h3>
                        <p className="original-content-display">
                            {originalContentBody || "원본 내용이 없거나 불러올 수 없습니다."}
                        </p>
                    </div>

                    {detailedReport.status === 'PENDING' && (
                        <div className="detail-section process-actions">
                            <h3>신고 처리</h3>
                            <button className="action-button confirm-button" onClick={() => handleProcessReport('ACCEPT')}>
                                {reportType === 'review' ? '리뷰 삭제 및 신고 수락' : '게시물 삭제 및 신고 수락'}
                            </button>
                            <button className="action-button cancel-button" onClick={() => handleProcessReport('REJECT')}>
                                신고 거절
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportDetailModal;