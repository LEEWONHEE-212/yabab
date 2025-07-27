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

/**
 * 신고 상세 정보를 표시하고 처리하는 모달 컴포넌트
 * @param {object} props.report - 부모 컴포넌트에서 전달된 간략한 신고 정보 (feedReportId 또는 reportId 포함)
 * @param {'post'|'review'} props.reportType - 신고의 타입 ('post' 또는 'review')
 * @param {function} props.onClose - 모달을 닫는 함수
 * @param {function} props.getReportStatusText - 신고 상태 문자열을 한글 텍스트로 변환하는 함수
 * @param {function} props.fetchReports - 부모 컴포넌트의 신고 목록을 새로고침하는 함수
 */
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
                let endpoint = '';
                let reportIdToFetch = null; // Long 타입에 맞게 null로 초기화

                if (reportType === 'review') {
                    reportIdToFetch = report.reportId;
                    endpoint = `http://localhost:18090/api/admin/reports/reviews/${reportIdToFetch}`;
                } else if (reportType === 'post') {
                    reportIdToFetch = report.feedReportId;
                    endpoint = `http://localhost:18090/api/admin/feed-reports/${reportIdToFetch}`;
                } else {
                    throw new Error("알 수 없는 신고 타입입니다.");
                }

                if (reportIdToFetch === null || reportIdToFetch === undefined) {
                    throw new Error("신고 ID가 유효하지 않습니다.");
                }

                const response = await axios.get(endpoint, {
                    // headers: { Authorization: `Bearer ${adminUser.token}` } // 인증이 필요하다면 주석 해제
                });
                setDetailedReport(response.data);
                console.log(`Fetched detailed ${reportType} report:`, response.data);
            } catch (err) {
                console.error(`Failed to fetch ${reportType} report detail:`, err);
                setError(`${reportType === 'review' ? '리뷰' : '게시물'} 신고 상세 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.`);
            } finally {
                setLoading(false);
            }
        };

        if (report && (report.reportId || report.feedReportId)) {
            fetchReportDetail();
        }
    }, [report, reportType, adminUser]);

    // ** 신고 처리 (콘텐츠 삭제 및 신고 수락) 함수 **
    const handleAcceptReportAndDeleteContent = async () => {
        if (!detailedReport || detailedReport.status !== 'PENDING') {
            alert('이미 처리되었거나 유효하지 않은 신고입니다.');
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
                let endpoint = '';
                let reportIdToProcess = null;

                if (reportType === 'review') {
                    reportIdToProcess = detailedReport.reportId;
                    endpoint = `http://localhost:18090/api/admin/reports/reviews/${reportIdToProcess}/process`;
                } else if (reportType === 'post') {
                    reportIdToProcess = detailedReport.feedReportId;
                    endpoint = `http://localhost:18090/api/admin/feed-reports/${reportIdToProcess}/status`;
                } else {
                    throw new Error("알 수 없는 신고 타입입니다.");
                }

                // ⭐⭐⭐ 이 부분이 변경됩니다 ⭐⭐⭐
                await axios.patch(endpoint, {
                    action: 'ACCEPT', // 'status' 대신 'action' 사용
                    adminId: adminUser.userId, // 'processedBy' 대신 'adminId' 사용
                    memo: `관리자 판단에 따라 ${reportType === 'review' ? '리뷰' : '게시물'} 삭제 및 신고 수락 처리됨.`
                    // 'actionTaken' 필드는 DTO에 없으므로 여기서 보내지 않습니다.
                    // 백엔드 서비스에서 'action'에 따라 'actionTaken' 값을 결정합니다.
                }, {
                    // headers: { Authorization: `Bearer ${adminUser.token}` } // 인증이 필요하다면 주석 해제
                });
                // ⭐⭐⭐ 변경 끝 ⭐⭐⭐

                alert(`${reportType === 'review' ? '리뷰' : '게시물'}이 삭제되고 신고가 성공적으로 수락 처리되었습니다.`);
                fetchReports();
                onClose();
            } catch (err) {
                console.error(`Failed to process ${reportType} report for deletion:`, err);
                alert(`${reportType === 'review' ? '리뷰' : '게시물'} 삭제 및 신고 처리에 실패했습니다. ${err.response?.data?.message || err.message || err.toString()}`);
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

    const currentReportId = reportType === 'review' ? detailedReport.reportId : detailedReport.feedReportId;
    const originalContentId = reportType === 'review' ? detailedReport.reviewId : detailedReport.feedId;
    const originalContentBody = reportType === 'review' ? detailedReport.reviewContent : detailedReport.feedContent;
    const originalContentTitle = reportType === 'review' ? null : detailedReport.feedTitle;
    const originalContentLabel = reportType === 'review' ? "원본 리뷰 내용" : "원본 게시물 내용";

    return (
        <div className="modal-overlay">
            <div className="modal-content admin-detail-modal report-detail-modal">
                <div className="modal-header">
                    <h2>{reportType === 'review' ? '리뷰 신고' : '게시물 신고'} 상세 정보 (ID: {currentReportId})</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <p><strong>신고 ID:</strong> {currentReportId}</p>
                    <p><strong>대상 콘텐츠 ID:</strong> {originalContentId || 'N/A'}</p>
                    {reportType === 'post' && <p><strong>게시물 제목:</strong> {originalContentTitle || '제목 없음'}</p>}
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
                        <div className="detail-section delete-section">
                            <h3>신고 처리 (콘텐츠 삭제)</h3>
                            <p>주의: 콘텐츠를 삭제하면 해당 신고가 수락 처리되며 복구할 수 없습니다. 신중하게 진행해주세요.</p>
                            <button
                                className="action-button delete-button full-width-button"
                                onClick={handleAcceptReportAndDeleteContent}
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
