// src/components/Admin/ReportDetailModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
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
                const baseUrl = `http://localhost:18090/api/admin/reports`;
                const endpoint = reportType === 'review' ?
                    `${baseUrl}/reviews/${report.reportId}` :
                    `${baseUrl}/posts/${report.reportId}`;

                const response = await axios.get(endpoint, {});
                setDetailedReport(response.data);
                console.log("Fetched detailed report:", response.data);
            } catch (err) {
                console.error(`Failed to fetch ${reportType} report detail:`, err);
                setError(`${reportType === 'review' ? '리뷰' : '게시물'} 신고 상세 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.`);
            } finally {
                setLoading(false);
            }
        };
        if (report?.reportId) { 
            fetchReportDetail();
        }
    }, [report?.reportId, reportType, adminUser]);

    // ** 신고 처리 (콘텐츠 삭제 및 신고 수락) 함수 **
    const handleAcceptReportAndDeleteContent = async () => { // 함수명 변경
        if (detailedReport && detailedReport.status !== 'PENDING') {
            alert('이미 처리된 신고입니다.');
            return;
        }

        if (!adminUser?.userId) {
            alert('로그인한 관리자 정보를 찾을 수 없습니다. 다시 로그인 해주세요.');
            return;
        }

        const confirmMessage = reportType === 'review' ?
            `이 리뷰를 삭제하고 신고를 수락 처리하시겠습니까? (삭제된 콘텐츠는 복구할 수 없습니다.)` :
            `이 게시물을 삭제하고 신고를 수락 처리하시겠습니까? (삭제된 콘텐츠는 복구할 수 없습니다.)`;

        if (window.confirm(confirmMessage)) {
            try {
                const baseUrl = `http://localhost:18090/api/admin/reports`;
                const endpoint = reportType === 'review' ?
                    `${baseUrl}/reviews/${detailedReport.reportId}/process` :
                    `${baseUrl}/posts/${detailedReport.reportId}/process`;

                // 항상 'ACCEPT' 액션으로 호출
                await axios.patch(endpoint, {
                    action: 'ACCEPT', // 삭제는 곧 신고 수락을 의미
                    adminId: adminUser.userId
                }, {});
                alert(`${reportType === 'review' ? '리뷰' : '게시물'}이 삭제되고 신고가 성공적으로 수락 처리되었습니다.`);
                fetchReports(); // 부모 컴포넌트의 목록 새로고침
                onClose(); // 모달 닫기
            } catch (err) {
                console.error(`Failed to process ${reportType} report for deletion:`, err);
                alert(`${reportType === 'review' ? '리뷰' : '게시물'} 삭제 및 신고 처리에 실패했습니다. 다시 시도해주세요.`);
            }
        }
    };

    // 로딩, 에러, 데이터 없음 상태 처리
    if (loading) return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p className="loading-message">신고 상세 정보를 불러오는 중...</p>
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

    // 원본 콘텐츠 관련 변수 설정 (리뷰/게시물 타입에 따라 동적 할당)
    const originalContentBody = reportType === 'review' ? detailedReport.originalReviewContent : detailedReport.originalPostContent;
    const originalContentId = reportType === 'review' ? detailedReport.reviewId : detailedReport.postId;
    const originalContentLabel = reportType === 'review' ? "원본 리뷰 내용" : "원본 게시물 내용";

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
                        <div className="detail-section delete-section"> {/* delete-section 클래스 추가 */}
                            <h3>신고 처리 (콘텐츠 삭제)</h3> {/* 제목 변경 */}
                            <p>주의: 콘텐츠를 삭제하면 해당 신고가 수락 처리되며 복구할 수 없습니다. 신중하게 진행해주세요.</p> {/* 주의 문구 추가 */}
                            <button
                                className="action-button delete-button full-width-button" // 스타일 클래스 적용
                                onClick={handleAcceptReportAndDeleteContent} // 변경된 함수 연결
                            >
                                {reportType === 'review' ? '리뷰 삭제 및 신고 처리' : '게시물 삭제 및 신고 처리'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportDetailModal;