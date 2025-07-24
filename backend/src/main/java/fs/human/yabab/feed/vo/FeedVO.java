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
    private int feedCategory;           // 0: 응원글, 1: 먹거리
    private int feedViews;
    private int feedLikes;
    private int feedCommentCount;
    private String feedImagePath;
    private String feedImageName;
    private int feedDeletedFlag;    //  0: 정상, 1: 삭제
    private Date deletedDate;
    private String deletedBy;
}
