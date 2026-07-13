package com.ufb.notification_service.repository;

import com.ufb.notification_service.model.UserReadModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserReadModelRepository extends JpaRepository<UserReadModel, Long> {

    Optional<UserReadModel> findByEmail(String email);

    List<UserReadModel> findByEnabledTrueAndUnsubscribedFalse();

    List<UserReadModel> findByEnabledTrueAndUnsubscribedFalseAndBusinessStage(String businessStage);

    List<UserReadModel> findByEnabledTrueAndUnsubscribedFalseAndBusinessCount(int businessCount);

    List<UserReadModel> findByEnabledTrueAndUnsubscribedFalseAndBusinessCountGreaterThan(int businessCount);
}
