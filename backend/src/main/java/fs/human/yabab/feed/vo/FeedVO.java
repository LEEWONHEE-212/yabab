package fs.human.yabab.feed.vo;

import fs.human.yabab.common.BaseVO;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class FeedVO extends BaseVO {
    private int feedId;
    private String userId;
    private String feedTitle;
    private String feedContent;
    private int teamId;
    private int feedCategory;           // "cheer", "food"
    private int feedViews;
    private int feedLikes;
    private int feedCommentCount;
    private String feedImagePath;
    private String feedImageName;
    private int feedDeletedFlag;
    private Date deletedDate;
    private String deletedBy;

    //  TB_USER랑 조인
    private String userNickname;
}
