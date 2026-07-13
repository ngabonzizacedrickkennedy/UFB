package com.ufb.notification_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class TemplateRenderer {

    private final UnsubscribeTokens unsubscribeTokens;
    private final String publicBaseUrl;
    private final String frontendBaseUrl;

    public TemplateRenderer(
            UnsubscribeTokens unsubscribeTokens,
            @Value("${ufb.notification.public-base-url}") String publicBaseUrl,
            @Value("${ufb.frontend.base-url}") String frontendBaseUrl) {
        this.unsubscribeTokens = unsubscribeTokens;
        this.publicBaseUrl = publicBaseUrl;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public String applyVariables(String text, Map<String, String> variables) {
        String result = text;
        if (variables != null) {
            for (Map.Entry<String, String> e : variables.entrySet()) {
                result = result.replace("{{" + e.getKey() + "}}", e.getValue() == null ? "" : e.getValue());
            }
        }
        return result;
    }

    public String renderEmail(String recipientEmail, String innerHtml, Map<String, String> variables) {
        String body = applyVariables(innerHtml, variables);
        String unsubscribeUrl = publicBaseUrl + "/api/notifications/unsubscribe?email="
                + URLEncoder.encode(recipientEmail, StandardCharsets.UTF_8)
                + "&token=" + unsubscribeTokens.tokenFor(recipientEmail);

        return """
            <!doctype html>
            <html>
              <body style="margin:0;padding:0;background:#F4F0E4;font-family:Segoe UI,Arial,sans-serif;color:#223247;">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:#F4F0E4;padding:32px 0;">
                  <tr><td align="center">
                    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid rgba(201,166,90,0.28);border-radius:10px;overflow:hidden;">
                      <tr><td style="background:#03122E;padding:22px 32px;">
                        <span style="font-family:Georgia,serif;font-size:22px;letter-spacing:1px;color:#C9A65A;">UFB</span>
                        <span style="color:#8b97a8;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-left:8px;">Unified Finance Bridge</span>
                      </td></tr>
                      <tr><td style="padding:32px;font-size:15px;line-height:1.7;">
                        %s
                      </td></tr>
                      <tr><td style="background:#03122E;padding:20px 32px;">
                        <a href="%s" style="display:inline-block;background:#C9A65A;color:#03122E;text-decoration:none;font-weight:600;font-size:13px;padding:10px 20px;border-radius:4px;">Open your portal</a>
                      </td></tr>
                    </table>
                    <p style="max-width:560px;color:#5A6B82;font-size:11px;line-height:1.6;margin:16px auto 0;padding:0 8px;">
                      You are receiving this because you have a UFB account.
                      <a href="%s" style="color:#A07C2C;">Unsubscribe</a> to stop future emails.
                    </p>
                  </td></tr>
                </table>
              </body>
            </html>
            """.formatted(body, frontendBaseUrl, unsubscribeUrl);
    }
}
