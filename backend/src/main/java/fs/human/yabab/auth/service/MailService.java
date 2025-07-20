package fs.human.yabab.auth.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String authCode) {
        String subject = "[YABAB] 이메일 인증 코드";
        String content = "다음 인증 코드를 입력해주세요\n\n" +
                         "인증 코드: " + authCode + "\n\n" +
                         "유효 시간: 5분";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(content);

        mailSender.send(message);
    }
}
