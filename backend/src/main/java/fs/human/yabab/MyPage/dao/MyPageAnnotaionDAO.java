package fs.human.yabab.MyPage.dao;

import fs.human.yabab.MyPage.vo.MyPageAnnotaion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MyPageAnnotaionDAO {
    // Select all posts by a specific user (excluding deleted ones)
    List<MyPageAnnotaion> selectFeedsByUserId(@Param("userId") String userId);

    // Soft delete a post by setting FEED_DELETED_FLAG to 1
    int softDeleteFeed(@Param("feedId") Long feedId, @Param("updatedBy") String updatedBy);

    // Optional: Select a single feed by ID
    MyPageAnnotaion selectFeedById(@Param("feedId") Long feedId);
}
