package com.ufb.notification_service.web;

import com.ufb.notification_service.service.ReadModelService;
import com.ufb.notification_service.service.UnsubscribeTokens;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class UnsubscribeController {

    private final UnsubscribeTokens tokens;
    private final ReadModelService readModel;

    @GetMapping(value = "/unsubscribe", produces = MediaType.TEXT_HTML_VALUE)
    public String unsubscribe(@RequestParam String email, @RequestParam String token) {
        if (!tokens.isValid(email, token)) {
            return page("This unsubscribe link is invalid or has expired.");
        }
        readModel.unsubscribe(email);
        return page("You have been unsubscribed. You will no longer receive UFB notification emails.");
    }

    private String page(String message) {
        return """
            <!doctype html>
            <html><head><meta charset="utf-8"><title>UFB</title></head>
            <body style="margin:0;font-family:Segoe UI,Arial,sans-serif;background:#F4F0E4;color:#223247;">
              <div style="max-width:520px;margin:80px auto;background:#fff;border:1px solid rgba(201,166,90,0.28);border-radius:10px;padding:40px;text-align:center;">
                <div style="font-family:Georgia,serif;font-size:24px;color:#C9A65A;">UFB</div>
                <p style="margin-top:20px;font-size:15px;line-height:1.7;">%s</p>
              </div>
            </body></html>
            """.formatted(message);
    }
}
