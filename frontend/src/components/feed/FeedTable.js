import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FeedTable.css"

const FeedTable = ({ teamId, sortOption, category }) => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                console.log("요청 URL:", `http://localhost:18090/feed/team/${teamId}`);
                console.log("파라미터:", { sort: sortOption, category });
                const response = await axios.get(
                    `http://localhost:18090/feed/team/${teamId}`, 
                    {
                        params: {
                            sort: sortOption,
                            category: category
                        }
                    }
                );
                console.log("응답 데이터:", response.data);
                setPosts(response.data);
            } catch (error) {
                console.error("게시글 불러오기 실패:", error);
            }
        };

        fetchPosts();
    }, [teamId, sortOption, category]);

    return (
        <table className="feed-table">
            <colgroup>
                <col style={{ width: "10%" }} /> 
                <col style={{ width: "55%" }} />  
                <col style={{ width: "10%" }} />  
                <col style={{ width: "20%" }} /> 
                <col style={{ width: "5%" }} />   
                <col style={{ width: "5%" }} />   
            </colgroup>
            
            <thead>
                <tr>
                    <th>카테고리</th>
                    <th>제목</th>
                    <th>작성자</th>
                    <th>작성일</th>
                    <th>조회</th>
                    <th>추천</th>
                </tr>
            </thead>

            <tbody>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <tr key={post.feedId}>
                            <td>{post.feedCategory === 0 ? "응원글" : "먹거리"}</td>
                            <td>
                                <a
                                href={`/feed/${teamId}/view/${post.feedId}`}
                                className="title-link"
                                >
                                {post.feedTitle}
                                <span className="comment-count">
                                    ({post.feedCommentCount})
                                </span>
                                </a>
                            </td>
                            <td>{post.userNickname}</td>
                            <td>{post.createdDate?.substring(0, 19).replace('T',' ')}</td>
                            <td>{post.feedViews}</td>
                            <td>{post.feedLikes}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6">게시글이 없습니다.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default FeedTable;
