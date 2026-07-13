package com.ufb.notification_service.config;

import com.ufb.notification_service.model.Audience;
import com.ufb.notification_service.model.NotificationRule;
import com.ufb.notification_service.model.NotificationTemplate;
import com.ufb.notification_service.model.TriggerType;
import com.ufb.notification_service.repository.NotificationRuleRepository;
import com.ufb.notification_service.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final NotificationTemplateRepository templates;
    private final NotificationRuleRepository rules;

    @Override
    public void run(String... args) {
        seedTemplate("WELCOME", "Welcome to UFB, {{name}}",
                "<h2 style=\"font-family:Georgia,serif;color:#03122E;margin:0 0 12px;\">Welcome aboard, {{name}}.</h2>"
                        + "<p>Your UFB account is ready. Describe your business and our advisors will start a consultation with you.</p>"
                        + "<p style=\"color:#5A6B82;\">We're glad to have you.</p>");

        seedTemplate("BUSINESS_RECEIVED", "We received {{business}}",
                "<h2 style=\"font-family:Georgia,serif;color:#03122E;margin:0 0 12px;\">Thanks, {{name}} — we've got it.</h2>"
                        + "<p>Your business <strong>{{business}}</strong> has been received. It now appears on your dashboard and an advisor will review it shortly.</p>");

        seedTemplate("CONSULTATION_READY", "Your consultation is ready",
                "<h2 style=\"font-family:Georgia,serif;color:#03122E;margin:0 0 12px;\">Good news, {{name}}.</h2>"
                        + "<p>Your consultation has been completed and advice is waiting for you in your portal.</p>");

        seedTemplate("COMPLETE_PROFILE", "Finish setting up your UFB profile",
                "<h2 style=\"font-family:Georgia,serif;color:#03122E;margin:0 0 12px;\">Hi {{name}}, one step left.</h2>"
                        + "<p>You haven't described a business yet. Tell us about it so we can start advising you.</p>");

        seedTemplate("CONSULTATION_REQUESTED", "We received your consultation request",
                "<h2 style=\"font-family:Georgia,serif;color:#03122E;margin:0 0 12px;\">Request received, {{name}}.</h2>"
                        + "<p>Your consultation request is in. An advisor will pick it up and reach out through your portal.</p>");

        seedTemplate("STAGE_CHANGED", "Your business stage was updated",
                "<h2 style=\"font-family:Georgia,serif;color:#03122E;margin:0 0 12px;\">A quick update, {{name}}.</h2>"
                        + "<p>Your business is now marked as <strong>{{stage}}</strong>. We'll tailor our guidance to match.</p>");

        seedTemplate("WEEKLY_TIPS_STARTUP", "This week's tips for your startup",
                "<h2 style=\"font-family:Georgia,serif;color:#03122E;margin:0 0 12px;\">Startup insights for you, {{name}}.</h2>"
                        + "<p>Fresh guidance for {{stage}}-stage businesses: focus on cash runway, validate demand early, and keep your numbers tight.</p>");

        seedTemplate("WEEKLY_TIPS_ONGOING", "This week's tips for your business",
                "<h2 style=\"font-family:Georgia,serif;color:#03122E;margin:0 0 12px;\">Momentum tips for you, {{name}}.</h2>"
                        + "<p>For {{stage}}-stage businesses: tighten your margins, deepen your best channels, and formalise your reporting.</p>");

        seedTemplate("WEEKLY_TIPS_SCALING", "This week's tips for scaling",
                "<h2 style=\"font-family:Georgia,serif;color:#03122E;margin:0 0 12px;\">Scaling insights for you, {{name}}.</h2>"
                        + "<p>For {{stage}}-stage businesses: invest in systems, protect cash while you grow, and hire ahead of the curve carefully.</p>");

        seedTemplate("REENGAGEMENT", "We'd love to help you move forward",
                "<h2 style=\"font-family:Georgia,serif;color:#03122E;margin:0 0 12px;\">Still here for you, {{name}}.</h2>"
                        + "<p>It's been a while. Describe your business whenever you're ready and our advisors will jump straight in.</p>");

        seedTemplate("ANNOUNCEMENT", "News from UFB",
                "<h2 style=\"font-family:Georgia,serif;color:#03122E;margin:0 0 12px;\">Hello {{name}},</h2>"
                        + "<p>We've been improving your UFB experience. Sign in to see what's new.</p>");

        if (rules.count() == 0) {
            rules.save(eventRule("Welcome on signup", "WELCOME", "user.registered"));
            rules.save(eventRule("Business received confirmation", "BUSINESS_RECEIVED", "business.described"));
            rules.save(eventRule("Consultation requested acknowledgement", "CONSULTATION_REQUESTED", "consultation.requested"));
            rules.save(eventRule("Consultation ready", "CONSULTATION_READY", "consultation.completed"));
            rules.save(eventRule("Business stage changed", "STAGE_CHANGED", "business.stage.changed"));

            rules.save(scheduleRule("Complete-profile nudge", "COMPLETE_PROFILE",
                    Audience.NO_BUSINESS, null, "0 0 9 * * MON"));
            rules.save(scheduleRule("Weekly startup tips", "WEEKLY_TIPS_STARTUP",
                    Audience.BY_STAGE, "STARTUP", "0 0 8 * * MON"));
            rules.save(scheduleRule("Weekly ongoing tips", "WEEKLY_TIPS_ONGOING",
                    Audience.BY_STAGE, "ONGOING", "0 0 8 * * MON"));
            rules.save(scheduleRule("Weekly scaling tips", "WEEKLY_TIPS_SCALING",
                    Audience.BY_STAGE, "SCALING", "0 0 8 * * MON"));
            rules.save(scheduleRule("Re-engagement / win-back", "REENGAGEMENT",
                    Audience.NO_BUSINESS, null, "0 0 10 1 * *"));

            NotificationRule announcement = scheduleRule("Product announcement", "ANNOUNCEMENT",
                    Audience.ALL, null, "0 0 12 1 1 *");
            announcement.setEnabled(false);
            rules.save(announcement);
        }
    }

    private void seedTemplate(String code, String subject, String html) {
        if (!templates.existsByCode(code)) {
            templates.save(NotificationTemplate.builder()
                    .code(code)
                    .subject(subject)
                    .htmlBody(html)
                    .build());
        }
    }

    private NotificationRule eventRule(String name, String templateCode, String eventType) {
        return NotificationRule.builder()
                .name(name)
                .templateCode(templateCode)
                .audience(Audience.ALL)
                .triggerType(TriggerType.EVENT)
                .eventType(eventType)
                .enabled(true)
                .build();
    }

    private NotificationRule scheduleRule(String name, String templateCode, Audience audience, String stage, String cron) {
        return NotificationRule.builder()
                .name(name)
                .templateCode(templateCode)
                .audience(audience)
                .audienceStage(stage)
                .triggerType(TriggerType.SCHEDULE)
                .cron(cron)
                .enabled(true)
                .build();
    }
}
