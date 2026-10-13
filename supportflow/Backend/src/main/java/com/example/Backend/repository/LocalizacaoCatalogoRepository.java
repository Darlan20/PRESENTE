package com.example.Backend.repository;

import com.example.Backend.model.LocalizacaoCatalogo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LocalizacaoCatalogoRepository extends JpaRepository<LocalizacaoCatalogo, Long> {
    List<LocalizacaoCatalogo> findAllByOrderBySetorAscBlocoAscSalaAsc();

    List<LocalizacaoCatalogo> findAllBySetorIgnoreCaseOrderByBlocoAscSalaAsc(String setor);

    boolean existsBySetorIgnoreCaseAndBlocoIgnoreCaseAndSalaIgnoreCase(String setor, String bloco, String sala);
}