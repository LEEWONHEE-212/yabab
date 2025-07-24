import React, { useEffect, useState } from "react";
import axios from "axios";

const FeedTable = ({ teamId, sortOption, category }) => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:18090/api/feed/${teamId}`, 
                    {
                        params: {
                            sort: sortOption,
                            category: category  // 'cheer' or 'food'
                        }
                    }
                );
                setPosts(response.data);
            } catch (error) {
                console.error("게시글 불러오기 실패:", error);
            }
        };

        fetchPosts();
    }, [teamId, sortOption, category]);

    return (
        <table className="feed-table">
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
                            <td>{post.feedCategory === "cheer" ? "응원글" : "먹거리"}</td>
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
                            <td>{post.userId}</td>
                            <td>{post.feedCreatedDate?.substring(5, 10)}</td>
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
