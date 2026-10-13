package com.example.Backend.service;

/**
 * ChamadoService — Serviço de negócio para chamados (tickets).
 */
import com.example.Backend.model.Chamado;
import com.example.Backend.model.RoundRobinEstadoSetor;
import com.example.Backend.repository.ChamadoRepository;
import com.example.Backend.repository.RoundRobinEstadoSetorRepository;
import com.example.Backend.repository.UsuarioRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
public class ChamadoService {

    private static final Path UPLOAD_DIR = Paths.get(System.getProperty("user.dir"), "uploads", "chamados");

    private static final List<RegraTriagem> REGRAS_TRIAGEM = List.of(
        new RegraTriagem(
            "Infraestrutura",
            "Infraestrutura",
            "alta",
            4,
            12,
            List.of("servidor", "internet", "rede", "switch", "roteador", "vpn", "wifi")
        ),
        new RegraTriagem(
            "Acesso",
            "Identidade e Acessos",
            "média",
            8,
            9,
            List.of("senha", "login", "acesso", "bloqueado", "permissao", "perfil")
        ),
        new RegraTriagem(
            "Performance",
            "Sistemas",
            "média",
            8,
            8,
            List.of("lento", "lentidao", "travando", "performance", "demora", "instavel")
        ),
        new RegraTriagem(
            "Técnico",
            "Suporte Técnico",
            "média",
            8,
            7,
            List.of("impressora", "mouse", "teclado", "monitor", "notebook", "hardware")
        ),
        new RegraTriagem(
            "Solicitação",
            "Service Desk",
            "baixa",
            24,
            6,
            List.of("solicito", "solicitacao", "cadastro", "instalacao", "instalar", "novo")
        )
    );

    private static final List<String> TERMOS_CRITICOS = List.of(
        "parado", "indisponivel", "fora do ar", "nao liga", "urgente", "critico",
        "impossivel", "sem acesso", "todos sem", "empresa parada"
    );

    private final ChamadoRepository chamadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final RoundRobinEstadoSetorRepository roundRobinEstadoSetorRepository;

    public ChamadoService(
            ChamadoRepository chamadoRepository,
            UsuarioRepository usuarioRepository,
            RoundRobinEstadoSetorRepository roundRobinEstadoSetorRepository
    ) {
        this.chamadoRepository = chamadoRepository;
        this.usuarioRepository = usuarioRepository;
        this.roundRobinEstadoSetorRepository = roundRobinEstadoSetorRepository;
    }

    public List<Chamado> listarTodos() {
        return chamadoRepository.findAllByIsDeletedFalseOrderByCreatedAtDesc();
    }

    public Page<Chamado> listarTodosPaginado(Pageable pageable) {
        return chamadoRepository.findAllByIsDeletedFalse(pageable);
    }

    public List<Chamado> listarPorEmail(String email) {
        return chamadoRepository.findByEmailIgnoreCaseAndIsDeletedFalse(email);
    }

    // Lista os chamados que estão na lixeira
    public List<Chamado> listarLixo() {
        return chamadoRepository.findAllByIsDeletedTrueOrderByDeletedAtDesc();
    }

    public Page<Chamado> listarLixoPaginado(Pageable pageable) {
        return chamadoRepository.findAllByIsDeletedTrue(pageable);
    }

    // Move um chamado para a lixeira (soft-delete)
    @Transactional
    public boolean moverParaLixo(Long id, String deletedBy) {
        return chamadoRepository.findById(id)
                .map(chamado -> {
                    chamado.setDeleted(true);
                    chamado.setDeletedAt(LocalDateTime.now());
                    chamado.setDeletedBy(deletedBy);
                    chamadoRepository.save(chamado);
                    return true;
                })
                .orElse(false);
    }

    // Recupera (restaura) um chamado da lixeira
    @Transactional
    public boolean recuperarDeLixo(Long id) {
        return chamadoRepository.findById(id)
                .map(chamado -> {
                    chamado.setDeleted(false);
                    chamado.setDeletedAt(null);
                    chamado.setDeletedBy(null);
                    chamadoRepository.save(chamado);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public Chamado criar(Chamado chamado, String attachmentBase64, String attachmentName, String attachmentContentType) {
        TriagemResultado triagem = classificarChamado(chamado);
        chamado.setCategoria(triagem.categoria());
        chamado.setPrioridade(triagem.prioridade());
        chamado.setSetorAtendimento(triagem.setorAtendimento());
        chamado.setSlaHoras(triagem.slaHoras());
        chamado.setTriagemJustificativa(triagem.justificativa());
        chamado.setStatus("aberto");

        atribuirTecnicoRoundRobin(chamado);

        Path savedAttachment = null;
        try {
            if (attachmentBase64 != null && !attachmentBase64.isBlank()) {
                savedAttachment = salvarAnexoBase64(chamado, attachmentBase64, attachmentName, attachmentContentType);
            }

            return chamadoRepository.save(chamado);
        } catch (RuntimeException ex) {
            if (savedAttachment != null) {
                removerArquivo(savedAttachment);
            }
            throw ex;
        }
    }

    private void atribuirTecnicoRoundRobin(Chamado chamado) {
        String setorAtendimento = chamado.getSetorAtendimento();
        List<com.example.Backend.model.Usuario> tecnicos = usuarioRepository.findByTipoIgnoreCase("TECNICO");
        if (tecnicos == null || tecnicos.isEmpty()) {
            return;
        }

        List<com.example.Backend.model.Usuario> tecnicosOrdenados = tecnicos.stream()
                .sorted(Comparator.comparing(com.example.Backend.model.Usuario::getId))
                .toList();

        List<com.example.Backend.model.Usuario> elegiveis = filtrarTecnicosPorSetor(tecnicosOrdenados, setorAtendimento);
        if (elegiveis.isEmpty()) {
            elegiveis = tecnicosOrdenados;
        }

        com.example.Backend.model.Usuario escolhido = escolherProximoTecnico(setorAtendimento, elegiveis);
        if (escolhido == null) {
            return;
        }

        chamado.setTecnicoResponsavelId(escolhido.getId());
        chamado.setTecnicoResponsavelNome(escolhido.getNome());
    }

    private List<com.example.Backend.model.Usuario> filtrarTecnicosPorSetor(List<com.example.Backend.model.Usuario> tecnicos, String setorAtendimento) {
        if (setorAtendimento == null || setorAtendimento.isBlank()) {
            return tecnicos;
        }

        List<com.example.Backend.model.Usuario> match = new ArrayList<>();
        for (com.example.Backend.model.Usuario tecnico : tecnicos) {
            String setorTecnico = tecnico.getSetorAtendimento();
            if (setorTecnico != null && !setorTecnico.isBlank() && setorTecnico.equalsIgnoreCase(setorAtendimento)) {
                match.add(tecnico);
            }
        }

        // Se não há nenhum técnico explicitamente configurado para este setor, não bloqueia atribuição.
        return match;
    }

    private com.example.Backend.model.Usuario escolherProximoTecnico(String setorAtendimento, List<com.example.Backend.model.Usuario> elegiveisOrdenados) {
        if (elegiveisOrdenados == null || elegiveisOrdenados.isEmpty()) {
            return null;
        }

        RoundRobinEstadoSetor estado = obterOuCriarEstadoRoundRobin(setorAtendimento);
        Long ultimoId = estado.getUltimoTecnicoId();

        int indexEscolhido = 0;
        if (ultimoId != null) {
            for (int i = 0; i < elegiveisOrdenados.size(); i++) {
                if (ultimoId.equals(elegiveisOrdenados.get(i).getId())) {
                    indexEscolhido = (i + 1) % elegiveisOrdenados.size();
                    break;
                }
            }
        }

        com.example.Backend.model.Usuario escolhido = elegiveisOrdenados.get(indexEscolhido);
        estado.setUltimoTecnicoId(escolhido.getId());
        roundRobinEstadoSetorRepository.save(estado);
        return escolhido;
    }

    private RoundRobinEstadoSetor obterOuCriarEstadoRoundRobin(String setorAtendimento) {
        String key = (setorAtendimento == null || setorAtendimento.isBlank()) ? "Service Desk" : setorAtendimento;

        Optional<RoundRobinEstadoSetor> existente = roundRobinEstadoSetorRepository.findBySetorAtendimentoIgnoreCase(key);
        if (existente.isPresent()) {
            return existente.get();
        }

        RoundRobinEstadoSetor novo = new RoundRobinEstadoSetor();
        novo.setSetorAtendimento(key);

        try {
            return roundRobinEstadoSetorRepository.saveAndFlush(novo);
        } catch (DataIntegrityViolationException ignored) {
            // corrida: outro request criou; buscar de novo com lock
            return roundRobinEstadoSetorRepository.findBySetorAtendimentoIgnoreCase(key)
                    .orElseThrow(() -> new RuntimeException("Não foi possível inicializar estado de round-robin"));
        }
    }

    public Optional<Chamado> atualizar(Long id, Chamado dadosAtualizados) {
        return chamadoRepository.findById(id).map(chamado -> {
            boolean resolvidoAgora = dadosAtualizados.getStatus() != null
                    && "resolvido".equalsIgnoreCase(dadosAtualizados.getStatus())
                    && !"resolvido".equalsIgnoreCase(chamado.getStatus());

            if (dadosAtualizados.getTitulo() != null) chamado.setTitulo(dadosAtualizados.getTitulo());
            if (dadosAtualizados.getDescricao() != null) chamado.setDescricao(dadosAtualizados.getDescricao());
            if (dadosAtualizados.getCategoria() != null) chamado.setCategoria(dadosAtualizados.getCategoria());
            if (dadosAtualizados.getPrioridade() != null) chamado.setPrioridade(dadosAtualizados.getPrioridade());
            if (dadosAtualizados.getStatus() != null) chamado.setStatus(dadosAtualizados.getStatus());
            if (dadosAtualizados.getSetor() != null) chamado.setSetor(dadosAtualizados.getSetor());
            if (dadosAtualizados.getSala() != null) chamado.setSala(dadosAtualizados.getSala());
            if (dadosAtualizados.getAndar() != null) chamado.setAndar(dadosAtualizados.getAndar());
            if (dadosAtualizados.getUnidade() != null) chamado.setUnidade(dadosAtualizados.getUnidade());
            if (dadosAtualizados.getSetorAtendimento() != null) chamado.setSetorAtendimento(dadosAtualizados.getSetorAtendimento());
            if (dadosAtualizados.getSlaHoras() != null) chamado.setSlaHoras(dadosAtualizados.getSlaHoras());
            if (dadosAtualizados.getTriagemJustificativa() != null) chamado.setTriagemJustificativa(dadosAtualizados.getTriagemJustificativa());

            if (resolvidoAgora) {
                removerAnexo(chamado);
            }

            return chamadoRepository.save(chamado);
        });
    }

    public Optional<AnexoChamado> obterAnexo(Long id) {
        return chamadoRepository.findById(id)
                .filter(chamado -> chamado.getAttachmentPath() != null && !chamado.getAttachmentPath().isBlank())
                .flatMap(chamado -> {
                    Path filePath = Paths.get(chamado.getAttachmentPath());
                    if (!Files.exists(filePath)) {
                        return Optional.empty();
                    }

                    Resource resource = new FileSystemResource(filePath.toFile());
                    return Optional.of(new AnexoChamado(
                            resource,
                            chamado.getAttachmentName(),
                            chamado.getAttachmentContentType()
                    ));
                });
    }

    public boolean deletar(Long id) {
        return chamadoRepository.findById(id)
                .map(chamado -> {
                    removerAnexo(chamado);
                    chamadoRepository.delete(chamado);
                    return true;
                })
                .orElse(false);
    }

    private Path salvarAnexoBase64(Chamado chamado, String attachmentBase64, String attachmentName, String attachmentContentType) {
        try {
            Files.createDirectories(UPLOAD_DIR);

            String originalName = attachmentName;
            String safeName = StringUtils.hasText(originalName)
                    ? StringUtils.cleanPath(originalName)
                    : "anexo";

            if (safeName.contains("..")) {
                throw new IllegalArgumentException("Nome de arquivo inválido");
            }

            String extension = "";
            int dotIndex = safeName.lastIndexOf('.');
            if (dotIndex >= 0) {
                extension = safeName.substring(dotIndex);
            }

            String storedName = UUID.randomUUID() + extension;
            Path targetPath = UPLOAD_DIR.resolve(storedName);

            String rawBase64 = attachmentBase64.contains(",") ? attachmentBase64.substring(attachmentBase64.indexOf(',') + 1) : attachmentBase64;
            byte[] bytes = Base64.getDecoder().decode(rawBase64);
            Files.write(targetPath, bytes);

            chamado.setAttachmentName(safeName);
            chamado.setAttachmentPath(targetPath.toString());
            chamado.setAttachmentContentType(attachmentContentType);

            return targetPath;
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar anexo", e);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Anexo inválido", e);
        }
    }

    private void removerAnexo(Chamado chamado) {
        if (chamado.getAttachmentPath() != null && !chamado.getAttachmentPath().isBlank()) {
            removerArquivo(Paths.get(chamado.getAttachmentPath()));
        }

        chamado.setAttachmentName(null);
        chamado.setAttachmentPath(null);
        chamado.setAttachmentContentType(null);
    }

    private void removerArquivo(Path path) {
        try {
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao remover anexo", e);
        }
    }

    private TriagemResultado classificarChamado(Chamado chamado) {
        // Se veio de um template, usar essa informação como base confiável
        if (chamado.getTemplateId() != null && !chamado.getTemplateId().isBlank()) {
            String categoria = obterCategoriaDoTemplate(chamado.getTemplateId());
            String prioridade = "média";
            String setorAtendimento = obterSetorDoTemplate(chamado.getTemplateId());
            int slaHoras = 8;

            // Texto para análise adicional (em busca de termos críticos)
            String texto = normalize((chamado.getTitulo() == null ? "" : chamado.getTitulo()) + " " +
                    (chamado.getDescricao() == null ? "" : chamado.getDescricao()));

            // Buscar prioridade base da regra correspondente ao template
            RegraTriagem regra = encontrarRegraDoTemplate(chamado.getTemplateId());
            if (regra != null) {
                prioridade = regra.prioridadeBase();
                slaHoras = regra.slaBaseHoras();
            }

            // Verificar termos críticos para elevar prioridade
            List<String> termosCriticosDetectados = termosEncontrados(texto, TERMOS_CRITICOS);
            String motivo = "Template '" + categoria + "' selecionado pelo usuário.";

            if (!termosCriticosDetectados.isEmpty()) {
                prioridade = elevarPrioridade(prioridade);
                slaHoras = Math.min(slaHoras, 4);
                motivo += " Termos críticos detectados: " + String.join(", ", termosCriticosDetectados) + ".";

                if (termosCriticosDetectados.size() >= 2) {
                    prioridade = "urgente";
                    slaHoras = 2;
                }
            }

            return new TriagemResultado(categoria, prioridade, setorAtendimento, slaHoras, motivo);
        }

        // Fallback: análise por palavras-chave (classificação original)
        String texto = normalize((chamado.getTitulo() == null ? "" : chamado.getTitulo()) + " " +
                (chamado.getDescricao() == null ? "" : chamado.getDescricao()));

        RegraTriagem melhorRegra = null;
        int melhorPontuacao = 0;
        List<String> termosRegraDetectados = new ArrayList<>();

        for (RegraTriagem regra : REGRAS_TRIAGEM) {
            List<String> termosDetectados = termosEncontrados(texto, regra.termos());
            int pontuacao = (termosDetectados.size() * 5) + regra.pesoBase();
            if (termosDetectados.isEmpty()) {
                pontuacao = 0;
            }

            if (pontuacao > melhorPontuacao) {
                melhorPontuacao = pontuacao;
                melhorRegra = regra;
                termosRegraDetectados = termosDetectados;
            }
        }

        String categoria = "Outros";
        String prioridade = "média";
        String setorAtendimento = "Service Desk";
        int slaHoras = 8;
        String motivo = "Classificação padrão aplicada por ausência de palavras-chave específicas.";

        if (melhorRegra != null) {
            categoria = melhorRegra.categoria();
            prioridade = melhorRegra.prioridadeBase();
            setorAtendimento = melhorRegra.setorAtendimento();
            slaHoras = melhorRegra.slaBaseHoras();
            motivo = "Detectadas palavras-chave de " + categoria + ": " + String.join(", ", termosRegraDetectados) + ".";
        }

        List<String> termosCriticosDetectados = termosEncontrados(texto, TERMOS_CRITICOS);
        if (!termosCriticosDetectados.isEmpty()) {
            prioridade = elevarPrioridade(prioridade);
            slaHoras = Math.min(slaHoras, 4);
            if (termosCriticosDetectados.size() >= 2) {
                prioridade = "urgente";
                slaHoras = 2;
            }
            motivo = motivo + " Termos críticos: " + String.join(", ", termosCriticosDetectados) + ".";
        }

        return new TriagemResultado(categoria, prioridade, setorAtendimento, slaHoras, motivo);
    }

    /**
     * Mapeia templateId para categoria oficial
     */
    private String obterCategoriaDoTemplate(String templateId) {
        return switch (templateId) {
            case "infraestrutura" -> "Infraestrutura";
            case "acesso" -> "Acesso";
            case "hardware" -> "Técnico";
            case "software" -> "Performance";
            case "solicitacao" -> "Solicitação";
            default -> "Outros";
        };
    }

    /**
     * Mapeia templateId para setor de atendimento
     */
    private String obterSetorDoTemplate(String templateId) {
        return switch (templateId) {
            case "infraestrutura" -> "Infraestrutura";
            case "acesso" -> "Identidade e Acessos";
            case "hardware", "software" -> "Suporte Técnico";
            case "solicitacao" -> "Service Desk";
            default -> "Service Desk";
        };
    }

    /**
     * Encontra a regra correspondente ao template para obter configurações de prioridade/SLA
     */
    private RegraTriagem encontrarRegraDoTemplate(String templateId) {
        String categoria = obterCategoriaDoTemplate(templateId);
        return REGRAS_TRIAGEM.stream()
                .filter(regra -> regra.categoria().equals(categoria))
                .findFirst()
                .orElse(null);
    }

    private List<String> termosEncontrados(String text, List<String> terms) {
        List<String> encontrados = new ArrayList<>();
        for (String term : terms) {
            if (text.contains(term)) {
                encontrados.add(term);
            }
        }
        return encontrados;
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        String semAcento = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return semAcento.trim().toLowerCase();
    }

    private String elevarPrioridade(String atual) {
        return switch (atual) {
            case "baixa" -> "média";
            case "média" -> "alta";
            case "alta", "urgente" -> "urgente";
            default -> "alta";
        };
    }

    private record TriagemResultado(
            String categoria,
            String prioridade,
            String setorAtendimento,
            int slaHoras,
            String justificativa
    ) {}

    public record AnexoChamado(Resource resource, String fileName, String contentType) {}

    private record RegraTriagem(
            String categoria,
            String setorAtendimento,
            String prioridadeBase,
            int slaBaseHoras,
            int pesoBase,
            List<String> termos
    ) {}
}
