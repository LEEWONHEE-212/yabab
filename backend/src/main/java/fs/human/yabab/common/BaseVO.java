package fs.human.yabab.common;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BaseVO {
    private Date createdDate;
    private String createdBy;
    private Date updatedDate;
    private String updatedBy;
}
