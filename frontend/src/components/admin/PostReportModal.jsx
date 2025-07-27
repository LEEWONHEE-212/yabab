// src/components/Admin/PostReportModal.jsx
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
 * 게시물 신고 상세 정보를 표시하고 처리하는 모달 컴포넌트
 * 이 모달은 'post' 타입의 신고만 처리합니다.
 * @param {object} props.report - 부모 컴포넌트에서 전달된 간략한 게시물 신고 정보 (feedReportId 포함)
 * @param {function} props.onClose - 모달을 닫는 함수
 * @param {function} props.getReportStatusText - 신고 상태 문자열을 한글 텍스트로 변환하는 함수
 * @param {function} props.fetchReports - 부모 컴포넌트의 게시물 신고 목록을 새로고침하는 함수
 * @param {object} props.adminUser - 현재 로그인한 관리자 정보
 */
const PostReportModal = ({ report, onClose, getReportStatusText, fetchReports, adminUser }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [detailedReport, setDetailedReport] = useState(null); // API에서 불러올 상세 신고 정보

    // 신고 사유 값을 한글 라벨로 변환하는 헬퍼 함수
    const getReportReasonLabel = (reasonValue) => {
        const foundReason = REPORT_REASONS.find(reason => reason.value === reasonValue);
        return foundReason ? foundReason.label : reasonValue; // 찾지 못하면 원본 값 반환
    };

    // 모달이 열릴 때 선택된 게시물 신고의 상세 정보를 비동기로 불러옵니다.
    useEffect(() => {
        const fetchReportDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const reportIdToFetch = report.feedReportId; // 게시물 신고는 feedReportId 사용
                const endpoint = `http://localhost:18090/api/admin/feed-reports/${reportIdToFetch}`; // 게시물 신고 상세 API

                if (reportIdToFetch === null || reportIdToFetch === undefined) {
                    throw new Error("게시물 신고 ID가 유효하지 않습니다.");
                }

                const response = await axios.get(endpoint, {
                    // headers: { Authorization: `Bearer ${adminUser?.token}` } // 인증이 필요하다면 주석 해제
                });
                setDetailedReport(response.data);
                console.log('Fetched detailed post report: ', response.data);
            } catch (err) {
                console.error('Failed to fetch post report detail: ', err);
                setError('게시물 신고 상세 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
            } finally {
                setLoading(false);
            }
        };

        // report 객체와 feedReportId가 있을 때만 fetch
        if (report && report.feedReportId) {
            fetchReportDetail();
        }
    }, [report, adminUser]); // adminUser를 의존성 배열에 추가 (인증 토큰 사용 시)

    // ** 신고 처리 (콘텐츠 삭제 및 신고 수락) 함수 **
    const handleAcceptReportAndDeleteContent = async () => {
        // detailedReport가 로딩되지 않았거나, 이미 처리된 신고인 경우
        if (!detailedReport || detailedReport.status !== 'PENDING') {
            alert('이미 처리되었거나 유효하지 않은 신고입니다.');
            return;
        }

        if (!adminUser?.userId) {
            alert('로그인한 관리자 정보를 찾을 수 없습니다. 다시 로그인 해주세요.');
            return;
        }

        const confirmMessage = `이 게시물을 삭제하고 신고를 수락 처리하시겠습니까? (삭제된 콘텐츠는 복구할 수 없습니다.)`;

        if (window.confirm(confirmMessage)) {
            try {
                const reportIdToProcess = detailedReport.feedReportId;
                const endpoint = `http://localhost:18090/api/admin/feed-reports/${reportIdToProcess}/status`; // 게시물 신고 처리 API

                // 백엔드에서 'status'와 'processedBy'를 기대하므로, 이에 맞춰 payload 구성
                await axios.put(endpoint, {
                    status: 'ACCEPTED', // 신고 수락을 의미
                    processedBy: adminUser.userId,
                    actionTaken: '게시물 삭제', // 취해진 조치
                    memo: '관리자 판단에 따라 콘텐츠 삭제 및 신고 수락 처리됨.' // 기본 메모
                }, {
                    // headers: { Authorization: `Bearer ${adminUser?.token}` } // 인증이 필요하다면 주석 해제
                });

                alert('게시물이 삭제되고 신고가 성공적으로 수락 처리되었습니다.');
                fetchReports(); // 부모 컴포넌트의 목록 새로고침
                onClose(); // 모달 닫기
            } catch (err) {
                console.error('Failed to process post report for deletion:', err);
                alert(`게시물 삭제 및 신고 처리에 실패했습니다. ${err.response?.data?.message || err.message || err.toString()}`);
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

    // 게시물 신고 관련 변수 설정
    const currentReportId = detailedReport.feedReportId;
    const originalContentId = detailedReport.feedId;
    const originalContentBody = detailedReport.feedContent;
    const originalContentTitle = detailedReport.feedTitle;
    const originalContentLabel = "원본 게시물 내용";

    return (
        <div className="modal-overlay">
            <div className="modal-content admin-detail-modal report-detail-modal">
                <div className="modal-header">
                    <h2>게시물 신고 상세 정보 (ID: {currentReportId})</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <p><strong>신고 ID:</strong> {currentReportId}</p>
                    <p><strong>대상 게시물 ID:</strong> {originalContentId || 'N/A'}</p>
                    <p><strong>게시물 제목:</strong> {originalContentTitle || '제목 없음'}</p>
                    <p>
                        {/* ⭐ Display email and userId ⭐ */}
                        <strong>신고자:</strong>
                        {detailedReport.reporterUserId ? ` (${detailedReport.reporterUserId})` : ''}
                        {detailedReport.reporterEmail || '알 수 없음'}
                    </p>
                    <p>
                        {/* ⭐ Display email and userId ⭐ */}
                        <strong>대상 회원:</strong> 
                        {detailedReport.reportedUserId ? ` (${detailedReport.reportedUserId})` : ''}
                        {detailedReport.reportedUserEmail || '알 수 없음'}
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
                            <h3>신고 처리 (게시물 삭제)</h3>
                            <p>주의: 게시물을 삭제하면 해당 신고가 수락 처리되며 복구할 수 없습니다. 신중하게 진행해주세요.</p>
                            <button
                                className="action-button delete-button full-width-button"
                                onClick={handleAcceptReportAndDeleteContent}
                            >
                                게시물 삭제 및 신고 처리
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostReportModal;
