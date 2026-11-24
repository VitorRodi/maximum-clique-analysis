# Autorrevisão técnica

Revisão das alterações do MaxClique realizada durante as etapas de desenvolvimento e finalizada em 24 de novembro de 2026. As evidências são resultados de execução e inspeção do próprio trabalho.

## Achados e correções

| Severidade | Achado e evidência                                                                                                                                                         | Correção e nova verificação                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Média      | Para n = 2, a consulta de matriz com índice 0,5 podia usar um deslocamento inteiro e indicar uma aresta. O teste de regressão retornou `true` onde devia retornar `false`. | Validar índices inteiros antes da leitura. O teste de regressão passou com a suíte completa e antes de medir o benchmark.                                           |
| Baixa      | O build com Cytoscape no módulo inicial produziu um arquivo de 693,88 kB e aviso de tamanho.                                                                               | Separar a visualização do grafo em um módulo assíncrono. O build posterior terminou sem aviso e carregou os módulos via loopback.                                   |
| Baixa      | O pseudocódigo da busca local tinha barras invertidas interpretadas pelo template TypeScript. O ESLint sinalizou os dois escapes.                                          | Usar a notação de diferença de conjuntos com “−”. ESLint passou e o pseudocódigo foi conferido no navegador.                                                        |
| Baixa      | Uma captura de página inteira exibia o link de salto fora do controle de foco, sobre o laboratório.                                                                        | Recortar o elemento enquanto não recebe foco e apontá-lo ao conteúdo com foco programático. A nova captura não exibe o link sobre o grafo.                          |
| Baixa      | Um JSON sintaticamente inválido retornava a mensagem de erro do motor JavaScript. O teste de navegador não encontrou o texto esperado em português.                        | Traduzir o erro de sintaxe, preservando as mensagens de validação estrutural. A importação inválida e a posterior importação válida foram verificadas em navegador. |
| Baixa      | O estilo interno de título do Word aplicava uma linha azul e fontes temáticas ao relatório. O primeiro PDF renderizado mostrou a linha na capa e na folha de rosto.        | Limpar a borda e aplicar Times New Roman às fontes dos estilos. O PDF final foi reexportado e conferido nas nove páginas.                                           |

## Verificações realizadas

- Corretude. Inspecionados a enumeração completa, o invariante dos candidatos, a maximalidade e a aceitação estrita. Os 46 testes Vitest verificaram os casos limite e o oráculo independente para 1.100 grafos.
- Execução. Verificados em Edge o exemplo 4/3/4, a troca X por C, a expansão com D, a edição, a geração, o JSON, o cancelamento, a interrupção por tempo, o limite de vértices e o comparador. O teste permitiu somente solicitações da origem de loopback. Foram inspecionados 1440 px e 390 px.
- Fluxo e tipos. A matriz e os algoritmos são importáveis sem React. A interface entrega uma cópia do grafo ao Worker e ignora mensagens de tarefas substituídas. A consulta de um vértice selecionado fica vinculada à instância em que ele foi selecionado.
- Dados. Cruzados tamanho da amostra, estados, validades, indicador de ótimo e contagens nas exportações. Os tempos foram medidos com o runner Node.js e validados em seu ambiente. Os resultados do navegador aparecem em área própria.
- Repositório. Verificados dependências travadas, links locais dos documentos, revisão das alterações e passos de Actions para instalação, tipos, lint, testes e build. A etapa de testes tornou-se incondicional após a inicialização da suíte.
- Documentos. Conferidos a igualdade SHA-256 da cópia do TPE, o conteúdo do sumário, a figura derivada do benchmark, a numeração e o formato do relatório complementar.

## Limites da revisão

O navegador testado foi Edge Chromium. A análise de tempos cobre a máquina e as instâncias registradas. O limite da força bruta é operacional. As heurísticas continuam aptas a encontrar cliques válidas em instâncias sem certificado de ótimo.
