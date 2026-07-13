package com.ufb.notification_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String EXCHANGE = "ufb.events";

    public static final String EVENTS_QUEUE = "notification.events";
    public static final String WORK_QUEUE = "notification.work";

    public static final String DLX = "notification.dlx";
    public static final String DEAD_QUEUE = "notification.dead";
    public static final String DEAD_ROUTING_KEY = "dead";

    @Bean
    public TopicExchange eventsExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue eventsQueue() {
        return QueueBuilder.durable(EVENTS_QUEUE).build();
    }

    @Bean
    public Binding userEventsBinding() {
        return BindingBuilder.bind(eventsQueue()).to(eventsExchange()).with("user.#");
    }

    @Bean
    public Binding businessEventsBinding() {
        return BindingBuilder.bind(eventsQueue()).to(eventsExchange()).with("business.#");
    }

    @Bean
    public Binding consultationEventsBinding() {
        return BindingBuilder.bind(eventsQueue()).to(eventsExchange()).with("consultation.#");
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLX, true, false);
    }

    @Bean
    public Queue deadQueue() {
        return QueueBuilder.durable(DEAD_QUEUE).build();
    }

    @Bean
    public Binding deadBinding() {
        return BindingBuilder.bind(deadQueue()).to(deadLetterExchange()).with(DEAD_ROUTING_KEY);
    }

    @Bean
    public Queue workQueue() {
        return QueueBuilder.durable(WORK_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", DEAD_ROUTING_KEY)
                .build();
    }
}
