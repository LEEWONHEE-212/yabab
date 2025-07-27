// src/pages/Admin/PostReportList.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import PostReportModal from './PostReportModal'; // PostReportModal 컴포넌트 경로를 프로젝트에 맞게 조정해주세요.

// 신고 사유 매핑을 위한 상수 배열 정의 (다시 추가)
const REPORT_REASONS = [
    { value: 'ABUSE', label: '욕설/비방' },
    { value: 'PORNOGRAPHY', label: '음란성/선정성' },
    { value: 'ADVERTISING', label: '광고/홍보' },
    { value: 'PERSONAL_INFO', label: '개인 정보 침해' },
    { value: 'IRRELEVANT', label: '리뷰와 무관한 내용' },
    { value: 'OTHER', label: '기타' },
];

const PostReportList = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('feedTitle'); // 검색 기준: feedTitle, feedContent, reporterEmail, reportedUserEmail
    const [filterStatus, setFilterStatus] = useState(''); // 상태 필터: '', 'PENDING', 'ACCEPTED', 'REJECTED' (문자열)

    // Pagination states
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 (0부터 시작)
    const [pageSize, setPageSize] = useState(10);     // 한 페이지당 아이템 수 (UI에서 선택하지 않고 고정값으로 사용)
    const [totalPages, setTotalPages] = useState(0);  // 전체 페이지 수
    const [totalElements, setTotalElements] = useState(0); // 전체 항목 수
    const [isLastPage, setIsLastPage] = useState(false); // 마지막 페이지인지 여부
    const [isFirstPage, setIsFirstPage] = useState(true); // 첫 페이지인지 여부
    // sortBy, sortDirection은 이 컴포넌트에서 더 이상 사용하지 않습니다.

    const [selectedReport, setSelectedReport] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const { user: adminUser } = useContext(UserContext);

    // 신고 사유 값을 한글 라벨로 변환하는 헬퍼 함수 (다시 추가)
    const getReportReasonLabel = (reasonValue) => {
        const foundReason = REPORT_REASONS.find(reason => reason.value === reasonValue);
        return foundReason ? foundReason.label : reasonValue; // 찾지 못하면 원본 값 반환
    };

    // 신고 상태 코드를 텍스트로 변환하는 헬퍼 함수
    const getReportStatusText = (statusCode) => {
        switch (statusCode) {
            case 'PENDING': return '대기';
            case 'ACCEPTED': return '처리 완료 (수락)';
            case 'REJECTED': return '처리 완료 (거절)';
            case 0: return '대기'; // Fallback for number status if backend sends it
            case 1: return '처리 완료 (수락)';
            case 2: return '처리 완료 (거절)';
            default: return '알 수 없음';
        }
    };

    // 게시물 신고 목록을 비동기로 불러오는 함수
    const fetchPostReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                // 정렬 파라미터는 백엔드 컨트롤러의 @RequestParam defaultValue에 의해 처리되므로 여기서는 명시하지 않습니다.
            };

            if (searchTerm) {
                if (searchType === 'feedTitle') {
                    params.feedTitle = searchTerm;
                } else if (searchType === 'feedContent') {
                    params.feedContent = searchTerm;
                } else if (searchType === 'reporterEmail') {
                    params.reporterEmail = searchTerm;
                } else if (searchType === 'reportedUserEmail') {
                    params.reportedUserEmail = searchTerm;
                }
            }

            if (filterStatus !== '') {
                params.status = filterStatus;
            }

            const response = await axios.get('http://localhost:18090/api/admin/feed-reports', {
                params: params,
                // headers: { Authorization: `Bearer ${adminUser?.token}` }
            });

            // Update states based on AdminPageResponseDTO
            setReports(response.data.content || []);
            setCurrentPage(response.data.pageNumber || 0); // Use pageNumber from backend
            setTotalPages(response.data.totalPages || 0);
            setTotalElements(response.data.totalElements || 0);
            setIsLastPage(response.data.last || false);
            setIsFirstPage(response.data.first || true);

            console.log("Fetched paginated post reports:", response.data);
        } catch (err) {
            console.error("Failed to fetch post reports:", err);
            setError("게시물 신고 목록을 불러오는데 실패했습니다: " + (err.response?.data?.message || err.message || err.toString()));
            setReports([]);
            setCurrentPage(0);
            setTotalPages(0);
            setTotalElements(0);
            setIsLastPage(true);
            setIsFirstPage(true);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, searchType, filterStatus, adminUser]);

    useEffect(() => {
        fetchPostReports();
    }, [fetchPostReports]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(0); // Reset to first page on search
    };

    const openReportDetailModal = (report) => {
        setSelectedReport(report);
        setIsDetailModalOpen(true);
    };

    const closeReportDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedReport(null);
        fetchPostReports(); // Refresh list after detail processing
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    // handleSort 함수는 이 컴포넌트에서 제거되었습니다.

    const renderPagination = () => {
        const pages = [];
        if (totalPages === 0) return null;

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

    if (loading) return <p className="loading-message">게시물 신고 목록을 불러오는 중...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="admin-page-management-section">
            <h2 className="admin-page-section-title">게시물 신고 목록</h2>

            <div className="search-filter-area">
                <form onSubmit={handleSearchSubmit} className="admin-page-search-filter-form">
                    <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="select-box admin-page-select-box">
                        <option value="feedTitle">게시물 제목</option>
                        <option value="feedContent">게시물 내용</option>
                        <option value="reporterEmail">신고자 이메일</option>
                        <option value="reportedUserEmail">대상 회원 이메일</option>
                    </select>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select-box admin-page-select-box">
                        <option value="">모든 상태</option>
                        <option value="PENDING">대기</option>
                        <option value="ACCEPTED">처리 완료 (수락)</option>
                        <option value="REJECTED">처리 완료 (거절)</option>
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

            <div className="admin-page-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>신고 ID</th>
                            <th>게시물 ID</th>
                            <th>신고자 ID</th>
                            <th>대상 회원 ID</th>
                            <th>신고 사유</th> {/* 정렬 기능 제거 */}
                            <th>상태</th>
                            <th>신고일</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="admin-page-no-data">조건에 맞는 신고된 게시물이 없습니다.</td>
                            </tr>
                        ) : (
                            reports.map((r) => (
                                <tr key={r.feedReportId}>
                                    <td>{r.feedReportId}</td><td>{r.feedId}</td><td>{r.reporterUserId}</td><td>{r.reportedUserId}</td><td>{getReportReasonLabel(r.reportReason)}</td><td>{getReportStatusText(r.status)}</td><td>{r.createdDate ? new Date(r.createdDate).toLocaleDateString() : 'N/A'}</td><td className="admin-page-actions-cell">
                                        <button className="action-button detail-button" onClick={() => openReportDetailModal(r)}>상세</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 0 && renderPagination()}
            <p className="admin-page-total-elements-info">총 {totalElements}건</p>

            {isDetailModalOpen && selectedReport && (
                <PostReportModal
                    report={selectedReport}
                    reportType="post"
                    onClose={closeReportDetailModal}
                    getReportStatusText={getReportStatusText}
                    fetchReports={fetchPostReports}
                    adminUser={adminUser}
                />
            )}
            {/* Styles are assumed to be in an external CSS file or defined elsewhere */}
        </div>
    );
};

export default PostReportList;
