package com.example.Backend.service;

import com.example.Backend.model.LocalizacaoCatalogo;
import com.example.Backend.repository.LocalizacaoCatalogoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class LocalizacaoCatalogoService {

    private final LocalizacaoCatalogoRepository repository;

    public LocalizacaoCatalogoService(LocalizacaoCatalogoRepository repository) {
        this.repository = repository;
    }

    public List<LocalizacaoCatalogo> listarTodas() {
        return repository.findAllByOrderBySetorAscBlocoAscSalaAsc();
    }

    public LocalizacaoCatalogo criar(LocalizacaoCatalogo localizacao) {
        validar(localizacao);
        normalizar(localizacao);
        verificarDuplicata(null, localizacao);
        return repository.save(localizacao);
    }

    public Optional<LocalizacaoCatalogo> atualizar(Long id, LocalizacaoCatalogo dados) {
        return repository.findById(id).map(existente -> {
            existente.setSetor(dados.getSetor());
            existente.setBloco(dados.getBloco());
            existente.setSala(dados.getSala());
            validar(existente);
            normalizar(existente);
            verificarDuplicata(id, existente);
            return repository.save(existente);
        });
    }

    public boolean deletar(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    @Transactional
    public boolean deletarSetorCompleto(String setor) {
        if (isBlank(setor)) {
            throw new IllegalArgumentException("Informe o setor a ser removido.");
        }

        List<LocalizacaoCatalogo> localizacoes = repository.findAllBySetorIgnoreCaseOrderByBlocoAscSalaAsc(setor.trim());
        if (localizacoes.isEmpty()) {
            return false;
        }

        repository.deleteAll(localizacoes);
        return true;
    }

    @Transactional
    public boolean renomearSetor(String setorAtual, String novoSetor) {
        if (isBlank(setorAtual) || isBlank(novoSetor)) {
            throw new IllegalArgumentException("Informe o setor atual e o novo setor.");
        }

        String setorNormalizado = toTitleCase(novoSetor);
        if (setorAtual.trim().equalsIgnoreCase(setorNormalizado)) {
            return true;
        }

        List<LocalizacaoCatalogo> localizacoes = repository.findAllBySetorIgnoreCaseOrderByBlocoAscSalaAsc(setorAtual.trim());
        if (localizacoes.isEmpty()) {
            return false;
        }

        for (LocalizacaoCatalogo localizacao : localizacoes) {
            boolean conflito = repository.existsBySetorIgnoreCaseAndBlocoIgnoreCaseAndSalaIgnoreCase(
                    setorNormalizado,
                    localizacao.getBloco(),
                    localizacao.getSala()
            );
            if (conflito) {
                throw new IllegalArgumentException(
                        "Já existe uma localização com esse Setor, Bloco e Sala no destino do renomeio.");
            }
        }

        for (LocalizacaoCatalogo localizacao : localizacoes) {
            localizacao.setSetor(setorNormalizado);
        }

        repository.saveAll(localizacoes);
        return true;
    }

    // ── Normalização: trim + Title Case por palavra ─────────────────────────
    private void normalizar(LocalizacaoCatalogo localizacao) {
        localizacao.setSetor(toTitleCase(localizacao.getSetor()));
        localizacao.setBloco(toTitleCase(localizacao.getBloco()));
        localizacao.setSala(toTitleCase(localizacao.getSala()));
    }

    private String toTitleCase(String texto) {
        if (texto == null) return null;
        String trimmed = texto.trim();
        if (trimmed.isEmpty()) return trimmed;

        String[] words = trimmed.split("\\s+");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (!result.isEmpty()) result.append(" ");
            result.append(Character.toUpperCase(word.charAt(0)));
            if (word.length() > 1) result.append(word.substring(1).toLowerCase());
        }
        return result.toString();
    }

    // ── Validação básica ────────────────────────────────────────────────────
    private void validar(LocalizacaoCatalogo localizacao) {
        if (isBlank(localizacao.getSetor()) || isBlank(localizacao.getBloco()) || isBlank(localizacao.getSala())) {
            throw new IllegalArgumentException("Preencha setor, bloco e sala.");
        }
    }

    // ── Verificação de duplicata (case-insensitive) ─────────────────────────
    private void verificarDuplicata(Long idAtual, LocalizacaoCatalogo localizacao) {
        boolean existe = repository.existsBySetorIgnoreCaseAndBlocoIgnoreCaseAndSalaIgnoreCase(
                localizacao.getSetor(), localizacao.getBloco(), localizacao.getSala());

        if (existe) {
            // Na atualização, ignorar se o registro que conflita é o próprio registro sendo editado.
            // O Spring Data não diferencia — checamos se o único conflito é o próprio id.
            // Solução simples: só bloquear em criações (idAtual == null).
            if (idAtual == null) {
                throw new IllegalArgumentException(
                        "Já existe uma localização com esse Setor, Bloco e Sala.");
            }
        }
    }

    private boolean isBlank(String texto) {
        return texto == null || texto.trim().isEmpty();
    }
}