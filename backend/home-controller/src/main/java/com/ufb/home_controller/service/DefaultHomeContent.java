package com.ufb.home_controller.service;

public final class DefaultHomeContent {

    private DefaultHomeContent() {}

    public static final String JSON = """
        {
          "hero": {
            "kicker": "Unified Finance Bridge · Consulting",
            "titleHtml": "Bridging finance to <em>growth</em> for Africa\\u2019s ambitious businesses.",
            "lead": "A tech-native financial advisory firm helping growth-stage businesses turn numbers into clarity, foresight, and access to capital.",
            "primaryLabel": "Start a Conversation",
            "primaryHref": "#contact",
            "secondaryLabel": "Explore Services",
            "secondaryHref": "#services"
          },
          "stats": [
            { "target": 50, "prefix": "", "suffix": "+", "label": "Businesses supported" },
            { "target": 12, "prefix": "$", "suffix": "M+", "label": "Capital facilitated" },
            { "target": 3, "prefix": "", "suffix": "", "label": "Service pillars" },
            { "target": 100, "prefix": "", "suffix": "%", "label": "Founder-focused" }
          ],
          "slides": [
            { "heading": "Advisory in action", "text": "Sitting alongside founders to turn raw numbers into a clear plan.", "imageUrl": null, "bg": "linear-gradient(135deg,#03122E,#0a2350)" },
            { "heading": "Capital, unlocked", "text": "Preparing women-led SMEs to meet investors with confidence.", "imageUrl": null, "bg": "linear-gradient(135deg,#0a2350,#A07C2C)" },
            { "heading": "The Academy", "text": "Workshops that build lasting financial capability across teams.", "imageUrl": null, "bg": "linear-gradient(135deg,#A07C2C,#C9A65A)" },
            { "heading": "Across Africa", "text": "Bridging expertise and ambition, one business at a time.", "imageUrl": null, "bg": "linear-gradient(135deg,#223247,#03122E)" }
          ],
          "posts": [
            {
              "meta": "Funding · 5 min read",
              "title": "What investors really look for in African SMEs",
              "excerpt": "Beyond the pitch deck \\u2014 the financial signals that move a maybe to a yes.",
              "imageUrl": null,
              "thumb": "linear-gradient(135deg,#03122E,#0a2350)",
              "body": [
                "Investors rarely decide on vision alone. Behind every funded business is a set of numbers that tells a credible, consistent story.",
                "Clean books, a defensible model, and a clear view of unit economics do more to build confidence than any single slide ever could."
              ]
            },
            {
              "meta": "Strategy · 4 min read",
              "title": "From messy books to a live financial picture",
              "excerpt": "How disciplined bookkeeping quietly becomes a decision-making engine.",
              "imageUrl": null,
              "thumb": "linear-gradient(135deg,#0a2350,#A07C2C)",
              "body": [
                "Most founders treat bookkeeping as compliance. The ones who grow fastest treat it as instrumentation.",
                "When your numbers are current and trusted, every decision \\u2014 pricing, hiring, spending \\u2014 gets sharper."
              ]
            },
            {
              "meta": "Growth · 6 min read",
              "title": "Building an investment-ready data room",
              "excerpt": "The documents and models that earn investor confidence fast.",
              "imageUrl": null,
              "thumb": "linear-gradient(135deg,#A07C2C,#C9A65A)",
              "body": [
                "A data room is where momentum is won or lost. Disorganisation reads as risk.",
                "Prepare it before you need it: financials, model, cap table, and the narrative that ties them together."
              ]
            }
          ],
          "contact": {
            "email": "info@ufbconsulting.com",
            "phone": "+250 781 141 576",
            "location": "Kigali, Rwanda",
            "web": "www.ufbconsulting.com"
          },
          "socials": []
        }
        """;
}
