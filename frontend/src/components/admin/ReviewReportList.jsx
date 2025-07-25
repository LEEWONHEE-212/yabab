// src/pages/Admin/ReviewReportList.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext'; // UserContext 경로를 프로젝트에 맞게 조정해주세요.
import ReportDetailModal from './ReportDetailModal'; // ReportDetailModal 컴포넌트 경로를 프로젝트에 맞게 조정해주세요.
import './Admin.css'; // AdminPage.css 경로로 변경 (이전 요청에 따라)

// 신고 사유 매핑을 위한 상수 배열 정의
const REPORT_REASONS = [
    { value: 'ABUSE', label: '욕설/비방' },
    { value: 'PORNOGRAPHY', label: '음란성/선정성' },
    { value: 'ADVERTISING', label: '광고/홍보' },
    { value: 'PERSONAL_INFO', label: '개인 정보 침해' },
    { value: 'IRRELEVANT', label: '리뷰와 무관한 내용' },
    { value: 'OTHER', label: '기타' },
];

const ReviewReportList = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('reviewContent'); // 검색 기준: reviewContent, reporterEmail, reportedUserEmail
    const [filterStatus, setFilterStatus] = useState(''); // 상태 필터: '', 0(대기), 1(수락), 2(거절)

    // 페이징 관련 상태
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 (0부터 시작)
    const [pageSize, setPageSize] = useState(10); // 한 페이지당 아이템 수 (UI에서 선택하지 않고 고정값으로 사용)
    const [totalPages, setTotalPages] = useState(0); // 총 페이지 수
    const [totalElements, setTotalElements] = useState(0); // 총 데이터 개수

    const [selectedReport, setSelectedReport] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { user: adminUser } = useContext(UserContext);

    // 신고 사유 값을 한글 라벨로 변환하는 헬퍼 함수
    const getReportReasonLabel = (reasonValue) => {
        const foundReason = REPORT_REASONS.find(reason => reason.value === reasonValue);
        return foundReason ? foundReason.label : reasonValue;
    };

    // 신고 상태 코드를 텍스트로 변환하는 헬퍼 함수
    const getReportStatusText = (statusCode) => {
        if (typeof statusCode === 'number') {
            switch (statusCode) {
                case 0: return '대기';
                case 1: return '처리 완료 (수락)';
                case 2: return '처리 완료 (거절)';
                default: return '알 수 없음';
            }
        } else { // 백엔드에서 문자열로 넘어올 경우
            switch (statusCode) {
                case 'PENDING': return '대기';
                case 'ACCEPTED': return '처리 완료 (수락)';
                case 'REJECTED': return '처리 완료 (거절)';
                default: return '알 수 없음';
            }
        }
    };

    // 리뷰 신고 목록을 비동기로 불러오는 함수
    const fetchReviewReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                // searchTerm이 있고, searchType이 유효할 때만 파라미터 추가
                ...(searchTerm && searchType && { [searchType]: searchTerm }),
                // filterStatus가 ''이 아닐 때만 파라미터 추가
                ...(filterStatus !== '' && { status: parseInt(filterStatus) }),
            };

            const response = await axios.get('http://localhost:18090/api/admin/reports/reviews', {
                params: params,
                // 백엔드에서 토큰 검증이 필요하다면 아래 주석을 해제하고 adminUser.token을 사용하세요.
                // headers: { Authorization: `Bearer ${adminUser?.token}` }
            });

            // 백엔드 응답이 { content: [...], totalPages: N, totalElements: M } 형태라고 가정합니다.
            setReports(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
            setTotalElements(response.data.totalElements || 0);
            console.log("Fetched review reports:", response.data);
        } catch (err) {
            console.error("Failed to fetch review reports:", err);
            setError("리뷰 신고 목록을 불러오는데 실패했습니다: " + (err.response?.data?.message || err.message || err.toString()));
            setReports([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, searchType, filterStatus, adminUser]);

    // 컴포넌트 마운트 및 필터/검색 조건, 페이지 변경 시 목록 다시 불러오기
    useEffect(() => {
        fetchReviewReports();
    }, [fetchReviewReports]);

    // 검색 버튼 클릭 또는 Enter 시
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(0); // 검색 시 항상 첫 페이지로 이동
        // fetchReviewReports는 currentPage가 변경되면 자동으로 호출됨
    };


    // 신고 상세 모달 열기
    const openReportDetailModal = (report) => {
        setSelectedReport(report);
        setIsDetailModalOpen(true);
    };

    // 신고 상세 모달 닫기
    const closeReportDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedReport(null);
        fetchReviewReports(); // 상세 처리 후 목록 새로고침
    };

     // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    // 페이징 버튼 렌더링 함수 (UserManagement.jsx와 동일하게 모든 페이지 버튼 표시)
    const renderPagination = () => {
        const pages = [];
        if (totalPages === 0) return null; 

        // 현재 페이지를 중심으로 5개 또는 7개 등 일정 범위의 페이징 버튼을 보여주는 로직 추가 가능
        // 여기서는 모든 페이지 버튼을 보여주는 간단한 버전 유지
        for (let i = 0; i < totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={currentPage === i ? 'active-page' : ''}
                >
                    {i + 1}
                </button>
            );
        }
        return (
            <div className="admin-page-pagination"> 
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0}>
                    이전
                </button>
                {pages}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1}>
                    다음
                </button>
            </div>
        );
    };

    if (loading) return <p className="loading-message">리뷰 신고 목록을 불러오는 중...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="admin-page-management-section">
            <h2 className="admin-page-section-title">리뷰 신고 목록</h2>

            {/* 검색 및 필터링 폼 */}
            <div className="search-filter-area">
                <form onSubmit={handleSearchSubmit} className="admin-page-search-filter-form">
                    <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="select-box admin-page-select-box">
                        <option value="reviewContent">리뷰 내용</option>
                        <option value="reporterEmail">신고자 이메일</option>
                        <option value="reportedUserEmail">대상 회원 이메일</option>
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select-box admin-page-select-box">
                        <option value="">모든 상태</option>
                        <option value="0">대기</option>
                        <option value="1">처리 완료 (수락)</option>
                        <option value="2">처리 완료 (거절)</option>
                    </select>
                    <input
                        type="text"
                        placeholder="검색어를 입력하세요."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input admin-page-search-input"
                    />
                    <button type="submit" className="admin-page-search-button">검색</button>
                </form>
            </div>


            {/* 리뷰 신고 목록 테이블 */}
            <div className="admin-page-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>신고 ID</th>
                            <th>리뷰 ID</th>
                            <th>신고자 ID</th>
                            <th>대상 회원 ID</th>
                            <th>신고 사유</th>
                            <th>상태</th>
                            <th>신고일</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="admin-page-no-data">조건에 맞는 신고된 리뷰가 없습니다.</td>
                            </tr>
                        ) : (
                            reports.map((r) => (
                                <tr key={r.reportId}>
                                    <td>{r.reportId}</td>
                                    <td>{r.reviewId}</td>
                                    <td>{r.reporterUserId}</td>
                                    <td>{r.reportedUserId}</td>
                                    <td>{getReportReasonLabel(r.reportReason)}</td>
                                    <td>{getReportStatusText(r.status)}</td>
                                    <td>{r.createdDate ? new Date(r.createdDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="admin-page-actions-cell">
                                        <button className="action-button detail-button" onClick={() => openReportDetailModal(r)}>상세</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이징 컨트롤 */}
            {totalPages > 0 && renderPagination()}
            <p className="admin-page-total-elements-info">총 신고 수: {totalElements}명</p>

            {/* 신고 상세 모달 */}
            {isDetailModalOpen && selectedReport && (
                <ReportDetailModal
                    report={selectedReport}
                    reportType="review"
                    onClose={closeReportDetailModal}
                    getReportStatusText={getReportStatusText}
                    fetchReports={fetchReviewReports}
                    adminUser={adminUser}
                />
            )}
        </div>
    );
};

export default ReviewReportList;