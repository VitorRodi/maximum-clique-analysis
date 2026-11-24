# MaxClique — Análise de Algoritmos

Universidade Comunitária da Região de Chapecó (UNOCHAPECÓ) · Ciência da Computação · Análise e Complexidade de Algoritmos

- **Professor** Gabriel Henrique Moro
- **Integrantes** Bruno Antunes, Edson Leandro Soares, Pedro Toigo e Vitor Rodi
- **Apresentação** 26 de novembro de 2026

## Contexto e objetivo

O projeto reúne o TPE teórico, três implementações didáticas, um laboratório de grafos e uma avaliação experimental reproduzível. O objetivo é comparar validade, maximalidade, garantia de ótimo, custo e qualidade das estratégias em instâncias idênticas. [Relatório integrado em PDF](docs/academic/Relatorio_Integrado_Clique_Maxima.pdf)

Dado um grafo simples e não direcionado G = (V, E), uma clique é um conjunto C ⊆ V cujos vértices distintos são adjacentes dois a dois. Uma clique **maximal** não pode receber outro vértice. Uma clique **máxima** tem a maior cardinalidade ω(G) e é sempre maximal. CLIQUE, a pergunta se ω(G) ≥ k, é NP-completa pela verificação do certificado e pela redução de 3-SAT. Encontrar a clique máxima é NP-difícil.

## Execução local

Use uma versão compatível do Node.js (22.13 ou superior na linha 22, linha 24, ou linha 26 em diante) com npm. A medição original utilizou Node.js 22.22.2 e npm 11.4.1.

```bash
npm ci
npm run dev
```

Abra o endereço local exibido pelo Vite. No laboratório, a instância inicial é o **Exemplo do TPE**. Clique em **Executar todos** junto ao grafo, selecione **Busca local** na comparação de tamanhos e abra **Ver etapas** para acompanhar a troca. Após instalar as dependências, os recursos funcionam via loopback sem conexão externa.

```bash
npm run test
npm run lint
npm run typecheck
npm run format:check
npm run build
npm run preview
npm run benchmark
```

`npm run preview` serve o build local. `npm run benchmark` atualiza as medições e os agregados em `results/`. Preserve uma cópia dos dados anteriores se quiser comparar rodadas.

## Tecnologias e arquitetura

React, TypeScript e Vite compõem a interface. Tailwind CSS e estilos locais definem o layout. Cytoscape.js desenha os grafos e Recharts apresenta as medições de Node.js. Vitest, ESLint e Prettier verificam o código. Git e GitHub registram as etapas e GitHub Actions executa a integração contínua.

| Caminho                        | Responsabilidade                                                     |
| ------------------------------ | -------------------------------------------------------------------- |
| `src/graphs`                   | Matriz de adjacência, validação, geração e grafos predefinidos       |
| `src/algorithms`               | Implementações puras em relação à interface, resultados e contadores |
| `src/workers` e `src/hooks`    | Execução em Worker, isolamento e cancelamento                        |
| `src/pages` e `src/components` | Laboratório, comparação experimental e fundamentação                 |
| `src/benchmarks`               | Medição independente em Node.js e exportação                         |
| `tests`                        | Vitest, casos limite, famílias e oráculo independente                |
| `docs` e `results`             | Documentação acadêmica e dados observados                            |

A matriz ocupa Θ(n²) posições e fornece consulta de adjacência em O(1). O modelo também calcula grau, densidade, validade e maximalidade. A interface importa e exporta JSON com `vertices` em ordem estável e `edges` como pares de nomes.

```json
{ "vertices": ["A", "B"], "edges": [["A", "B"]] }
```

## Algoritmos e pseudocódigo

### Força bruta

```text
melhor ← ∅
para cada subconjunto S de V, por inclusão e exclusão:
    se todos os pares de S são adjacentes e |S| > |melhor|:
        melhor ← cópia(S)
devolver melhor
```

A enumeração completa visita 2ⁿ subconjuntos. A verificação examina até O(n²) pares por subconjunto. Pior caso Θ(n² · 2ⁿ), espaço auxiliar O(n), sem rastro. O primeiro par ausente permite rejeitar o subconjunto cedo. Limites padrão de 20 vértices e 5 s. Só a enumeração completa certifica o ótimo.

### Guloso construtivo

```text
C ← ∅; P ← V
enquanto P ≠ ∅:
    v ← primeiro vértice de maior grau no subgrafo induzido por P
    C ← C ∪ {v}
    P ← P ∩ N(v)
devolver C
```

P preserva os candidatos adjacentes à clique inteira. Ao esgotar P, C é maximal. O custo é O(n³) no pior caso e O(n) de espaço auxiliar, sem rastro. O desempate segue a ordem dos vértices de entrada. No TPE, a escolha inicial de X exclui C e D.

### Busca local

```text
C ← guloso(G)
enquanto houver rodadas disponíveis:
    para cada u em C e v fora de C:
        T ← (C − {u}) ∪ {v}
        se T for clique:
            T ← expansão gulosa de T
            se |T| > |C|:
                C ← T
                inicie a próxima rodada
    pare se a rodada não encontrar melhora
devolver C
```

Parte do guloso e aceita a primeira troca válida que permita crescimento após a expansão. Cada solução aceita é maior. Há O(n²) trocas por rodada, O(n³) por expansão e O(n) rodadas, com limite conservador O(n⁶). O espaço auxiliar é O(n), sem rastro. A busca termina em ótimo da vizinhança explorada ou no limite de rodadas. As estratégias são adaptações didáticas descritas no TPE.

[Provas e complexidade detalhadas](docs/complexity-analysis.md) · [Passos no exemplo](docs/algorithms/example.md)

## Metodologia

Foram usados oito tamanhos de 5 a 200 vértices, três densidades nominais (20%, 50% e 80%) e cinco sementes por combinação. Para cada instância, houve um aquecimento e cinco medições das abordagens executáveis. A mesma matriz foi reutilizada e a ordem das medições foi alternada. A geração foi cronometrada em separado. O benchmark usa `performance.now()` com a interface fora do processo.

O tempo no laboratório inclui instrumentação e gravação das etapas dentro do Worker, com geração e renderização fora da medição. O benchmark desliga a gravação das etapas. [Protocolo detalhado](docs/experimental-methodology.md)

## Resultados medidos

| Método      | Clique no TPE | Cardinalidade | Mediana Node.js (ms) | Qualidade | Desvio |
| ----------- | ------------- | ------------: | -------------------: | --------: | -----: |
| Força bruta | A, B, C, D    |             4 |               0,0214 |      100% |     0% |
| Guloso      | X, A, B       |             3 |               0,0024 |       75% |    25% |
| Busca local | A, B, C, D    |             4 |               0,0043 |      100% |     0% |

Foram registradas **1.515 execuções completas**, **300 não executadas** pelo limite de tamanho e **zero interrompidas** no benchmark. A força bruta certificou os 60 grafos aleatórios com até 20 vértices e o TPE. Nos 60 casos aleatórios certificados, cada heurística atingiu 57 ótimos e 98,83% de qualidade média. A busca local aumentou a cardinalidade em 3 de 120 grafos aleatórios, todos de 100 vértices.

Em n = 20 e p = 50%, a mediana observada foi de 33,14 ms na força bruta, 0,0220 ms no guloso e 0,0225 ms na busca local. Em n = 200 e p = 80%, ambas as heurísticas tiveram cardinalidade média 23,2 e melhor resultado observado 25. O ótimo desses grafos grandes ficou indeterminado no experimento.

Qualidade = 100 × |C| / ω(G). Desvio = 100 × (ω(G) − |C|) / ω(G). Os percentuais exigem ótimo certificado positivo. O grafo vazio é identificado separadamente.

[Resultados e discussão](docs/experimental-results.md) · [Dados JSON](results/benchmark.json) · [CSV por execução](results/benchmark-samples.csv) · [CSV por instância](results/benchmark-instances.csv) · [CSV agregado](results/benchmark-summary.csv)

## Testes e limitações

A suíte Vitest cobre grafos vazios, unitários, completos, sem arestas, desconectados, bipartidos, estrelas, caminhos, ciclos e o TPE. Um oráculo de Bron–Kerbosch independente, restrito aos testes, verifica os 1.100 grafos rotulados de zero a cinco vértices. Há também casos aleatórios, entradas inválidas, desempate, limite de tempo, maximalidade e propriedade de não regressão da busca local.

Os tempos dependem do hardware, das sementes e do estado de execução do JavaScript. A amostra tem cinco sementes por combinação e usa uma única família aleatória. A busca local aceita somente melhoras estritas de uma vizinhança específica. A força bruta cresce exponencialmente. O limite operacional da interface para grafos é de 200 vértices.

## Conclusão

O exemplo do TPE mostrou que a estratégia gulosa pode estabilizar em uma clique maximal menor que a máxima e que uma troca pode habilitar uma inserção. O benchmark mediu a diferença de custo e mostrou casos em que essa vizinhança melhora o guloso. O resultado exato é necessário para quantificar o desvio em cada instância.

[TPE teórico original](docs/academic/TPE.pdf) · [Roteiro de apresentação](docs/presentation-guide.md) · [Autorrevisão](docs/code-review.md)

## Referências

- CAVIQUE, Luís; REGO, César; THEMIDO, Isabel. Estruturas de vizinhança e procura local no problema da clique máxima. _Investigação Operacional_, v. 22, p. 1–18, 2002.
- GIBBONS, Luana E. et al. Continuous characterizations of the maximum clique problem. _DIMACS Technical Report 96-09_, 1996.
- KARP, Richard M. Reducibility among combinatorial problems. In: MILLER, R. E.; THATCHER, J. W. (ed.). _Complexity of computer computations_. New York: Plenum Press, 1972. p. 85–103. DOI: 10.1007/978-1-4684-2001-2_9.
- UNIVERSITY OF MICHIGAN. Introduction to complexity. _EECS 376: Foundations of Computer Science_, [s.d.]. Acesso em 24 nov. 2026. [Notas da disciplina](https://eecs376.github.io/notes/complexity.html).
- WU, Qinghua; HAO, Jin-Kao. A review on algorithms for maximum clique problems. _European Journal of Operational Research_, v. 242, n. 3, p. 693–709, 2015. DOI: 10.1016/j.ejor.2014.09.064.
