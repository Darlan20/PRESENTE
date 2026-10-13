package com.example.Backend.repository;

import com.example.Backend.model.RoundRobinEstadoSetor;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface RoundRobinEstadoSetorRepository extends JpaRepository<RoundRobinEstadoSetor, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<RoundRobinEstadoSetor> findBySetorAtendimentoIgnoreCase(String setorAtendimento);
}
