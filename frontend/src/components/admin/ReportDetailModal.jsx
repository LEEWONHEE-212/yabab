// src/components/Admin/ReportDetailModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext'; // UserContext 경로를 프로젝트에 맞게 조정해주세요.
import './Modal.css'; // 모달 공통 스타일을 임포트합니다.

const ReportDetailModal = ({ report, reportType, onClose, getReportStatusText, fetchReports }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detailedReport, setDetailedReport] = useState(null); // API에서 불러올 상세 신고 정보
    const { user: adminUser } = useContext(UserContext); // 현재 로그인한 관리자 정보

    // 모달이 열릴 때 선택된 신고의 상세 정보를 비동기로 불러옵니다.
    useEffect(() => {
        const fetchReportDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                // reportType에 따라 API 엔드포인트 변경
                const endpoint = reportType === 'review' ?
                    `http://localhost:18090/api/admin/reports/reviews/${report.reportId}` :
                    `http://localhost:18090/api/admin/reports/posts/${report.reportId}`;

                const response = await axios.get(endpoint, {
                    // headers: { Authorization: `Bearer ${adminUser.token}` }
                });
                setDetailedReport(response.data);
                console.log("Fetched detailed report:", response.data); // 디버깅용 로그
            } catch (err) {
                console.error(`Failed to fetch ${reportType} report detail:`, err);
                setError(`${reportType === 'review' ? '리뷰' : '게시물'} 신고 상세 정보를 불러오는데 실패했습니다: ` + (err.response?.data?.message || err.message || err.toString()));
            } finally {
                setLoading(false);
            }
        };
        fetchReportDetail();
    }, [report.reportId, reportType, adminUser]); // report.reportId, reportType, adminUser 변경 시 재실행

    // 신고 처리 (수락 또는 거절) 함수
    const handleProcessReport = async (action) => {
        const actionText = action === 'ACCEPT' ? '수락 (해당 콘텐츠 삭제)' : '거절 (해당 콘텐츠 유지)';
        const confirmMessage = reportType === 'review' ?
            `이 리뷰 신고를 ${actionText} 처리하시겠습니까?` :
            `이 게시물 신고를 ${actionText} 처리하시겠습니까?`;

        if (window.confirm(confirmMessage)) {
            try {
                // reportType에 따라 API 엔드포인트 변경
                const endpoint = reportType === 'review' ?
                    `http://localhost:18090/api/admin/reports/reviews/${detailedReport.reportId}/process` :
                    `http://localhost:18090/api/admin/reports/posts/${detailedReport.reportId}/process`;

                await axios.patch(endpoint, {
                    action: action, // 'ACCEPT' 또는 'REJECT'
                    adminId: adminUser?.userId // 처리한 관리자 ID (백엔드에서 저장할 수 있도록)
                }, {
                    // headers: { Authorization: `Bearer ${adminUser.token}` }
                });
                alert(`신고가 성공적으로 ${actionText} 처리되었습니다.`);
                fetchReports(); // 부모 컴포넌트의 목록 새로고침
                onClose(); // 모달 닫기
            } catch (err) {
                console.error(`Failed to ${action} ${reportType} report:`, err);
                alert(`신고 ${actionText}에 실패했습니다: ` + (err.response?.data?.message || err.message || err.toString()));
            }
        }
    };

    // 로딩 또는 에러 상태 UI
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
    // detailedReport가 아직 로드되지 않았거나 null일 경우 아무것도 렌더링하지 않음
    if (!detailedReport) return null;

    // 신고 유형에 따라 원본 콘텐츠의 제목/내용 필드 결정
    const originalContentTitleField = reportType === 'post' ? detailedReport.originalPost?.title : null;
    const originalContentBody = reportType === 'review' ? detailedReport.originalReview?.content : detailedReport.originalPost?.content;
    const originalContentId = reportType === 'review' ? detailedReport.originalReview?.reviewId : detailedReport.originalPost?.postId;
    const originalContentLabel = reportType === 'review' ? "원본 리뷰 내용" : "원본 게시물";

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
                        <strong>신고자:</strong> {detailedReport.reporterInfo?.userName || '알 수 없음'}
                        {detailedReport.reporterInfo?.userId ? ` (${detailedReport.reporterInfo.userId})` : ''}
                        {detailedReport.reporterInfo?.userEmail ? ` - ${detailedReport.reporterInfo.userEmail}` : ''}
                    </p>
                    <p>
                        <strong>대상 회원:</strong> {detailedReport.reportedUserInfo?.userName || '알 수 없음'}
                        {detailedReport.reportedUserInfo?.userId ? ` (${detailedReport.reportedUserInfo.userId})` : ''}
                        {detailedReport.reportedUserInfo?.userEmail ? ` - ${detailedReport.reportedUserInfo.userEmail}` : ''}
                    </p>
                    <p><strong>신고 사유:</strong> {detailedReport.reportReason}</p>
                    <p><strong>신고일:</strong> {detailedReport.reportDate ? new Date(detailedReport.reportDate).toLocaleString() : 'N/A'}</p>
                    <p><strong>현재 상태:</strong> <strong>{getReportStatusText(detailedReport.status)}</strong></p>
                    {detailedReport.status !== 0 && ( // 처리 완료된 경우 처리 관리자 및 처리일 표시
                        <>
                            <p><strong>처리 관리자 ID:</strong> {detailedReport.processedBy || 'N/A'}</p>
                            <p><strong>처리일:</strong> {detailedReport.processedDate ? new Date(detailedReport.processedDate).toLocaleString() : 'N/A'}</p>
                        </>
                    )}

                    <div className="detail-section">
                        <h3>{originalContentLabel}</h3>
                        {originalContentTitleField && <p><strong>제목:</strong> {originalContentTitleField}</p>}
                        <p className="original-content-display">
                            {originalContentBody || "원본 내용이 없거나 불러올 수 없습니다."}
                        </p>
                    </div>

                    {detailedReport.status === 0 && ( // 상태가 '대기'일 때만 처리 버튼 표시
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