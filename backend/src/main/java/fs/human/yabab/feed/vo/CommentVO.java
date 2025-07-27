package fs.human.yabab.feed.vo;

import fs.human.yabab.common.BaseVO;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class CommentVO extends BaseVO {
    private int commentId;
    private int feedId;
    private String userId;
    private String userNickname;
    private String commentContent;

    private int commentLikes;
    private boolean commentLiked;   //  현재 사용자가 이 댓글을 추천했는지 여부
    private boolean commentBest;
}
