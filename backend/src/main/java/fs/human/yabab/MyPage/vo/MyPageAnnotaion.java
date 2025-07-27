package fs.human.yabab.MyPage.vo;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MyPageAnnotaion {
    private Long feedId;
    private String userId;
    private String feedContent;
    private String feedImagePath;
    private String feedImageName;
    private int feedDeletedFlag; // 0 for not deleted, 1 for deleted
    private Date createdDate;
    private String createdBy;
    private Date updatedDate;
    private String updatedBy;
    private Date deletedDate;
    private String deletedBy;
    private Long teamId;
    private int feedCategory; // 0 for general, 1 for review
    private String feedTitle;
    private int feedViews;
    private int feedLikes;
    private int feedCommentCount;
}
