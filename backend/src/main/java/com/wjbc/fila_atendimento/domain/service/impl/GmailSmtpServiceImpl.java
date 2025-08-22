package com.wjbc.fila_atendimento.domain.service.impl;


import com.wjbc.fila_atendimento.domain.dto.EmailRequestDTO;
import com.wjbc.fila_atendimento.domain.service.EmailSenderService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service("gmailSmtpService")
public class GmailSmtpServiceImpl implements EmailSenderService {

    private final JavaMailSender mailSender;

    @Autowired
    public GmailSmtpServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public void sendEmail(EmailRequestDTO emailRequest) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(emailRequest.from());
            helper.setTo(emailRequest.to());
            helper.setSubject(emailRequest.subject());
            helper.setText(emailRequest.body(), true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erro ao enviar e-mail com Gmail SMTP", e);
        }
    }
}
