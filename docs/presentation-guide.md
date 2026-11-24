# Roteiro de apresentação

- **Data** 26 de novembro de 2026
- **Disciplina** Análise e Complexidade de Algoritmos
- **Professor** Gabriel Henrique Moro

Prepare o computador com `npm ci`. Antes de apresentar, rode `npm run build` e `npm run preview`. Abra o endereço de loopback do terminal. O laboratório inicia no exemplo do TPE e usa os dados já coletados em `results/`. Deixe aberto também o [relatório integrado](academic/Relatorio_Integrado_Clique_Maxima.pdf).

## Sequência sugerida · 12 minutos

| Integrante           | Tempo | Conteúdo e transição                                                                                                                                                                                  |
| -------------------- | ----: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bruno Antunes        | 3 min | Apresentar o problema e a distinção entre maximal e máxima. Explicar a redução de 3-SAT, a matriz e o custo O(1) de consultar uma aresta. Abrir o grafo ilustrativo e mostrar os nove vértices.       |
| Edson Leandro Soares | 3 min | Explicar a enumeração por inclusão e exclusão e a checagem dos pares. Executar todos os métodos. Mostrar os 512 subconjuntos, o certificado 4 e o limite O(n²·2ⁿ).                                    |
| Pedro Toigo          | 3 min | Mostrar X → A → B e justificar o desempate e a atualização de P. Explicar a maximalidade, o recálculo O(n³) e a troca X → C seguida da inserção D na busca local.                                     |
| Vitor Rodi           | 3 min | Mostrar a influência de tamanho e densidade no comparador. Explicar cinco sementes, repetições e ausência de certificado além de 20 vértices. Fechar com O(n⁶), ótimo local, resultados e limitações. |

## Demonstração

1. Confirme a instância **Exemplo do TPE**, com nove vértices e doze arestas.
2. Clique em **Executar todos** junto ao grafo e observe as cardinalidades 4, 3 e 4. O ótimo certificado é 4.
3. Selecione **Guloso** na comparação abaixo do grafo. Use **Ver etapas** para inspecionar X, A e B. Na tabela detalhada, mostre a qualidade de 75%.
4. Selecione **Busca local** na comparação, abra o rastro e avance duas vezes. A etapa intermediária troca X por C. A terceira insere D e destaca K₄.
5. Abra **Comparação experimental**, mantenha p = 50% e n = 20, e compare medianas em escala logarítmica. Ajuste n para 200 e explique por que a coluna de qualidade fica sem valor.
6. Se houver tempo, gere um grafo completo aleatório de 24 vértices com densidade de 100%. Em **Limites de execução**, eleve o máximo de vértices da força bruta para 24. Inicie e cancele. Observe o estado e volte ao TPE pelo seletor.

## Perguntas e respostas

**Por que CLIQUE está em NP?** Uma solução afirmativa pode ser verificada com k identificadores distintos e O(k²) consultas de pares na matriz.

**Por que a redução cria uma aresta só entre cláusulas diferentes?** Isso impede escolher dois literais de uma cláusula. Uma clique de tamanho m precisa conter um vetor de escolhas com exatamente um literal compatível por cláusula.

**Por que toda clique máxima é maximal?** Se houvesse uma inserção válida, obteríamos uma clique maior, contrariando a cardinalidade máxima.

**Por que o guloso perde no TPE?** X tem o maior grau inicial, mas C e D não são seus vizinhos. A primeira interseção remove os dois candidatos que completariam K₄.

**Como a busca local evita piorar?** Constrói e valida uma clique de teste e só substitui a incumbente quando a expansão gera uma cardinalidade maior. O limite pode antecipar a parada, mantendo a garantia de tamanho ao menos igual ao guloso.

**Quando se pode afirmar 100%?** Quando a cardinalidade iguala um ótimo positivo certificado para aquela instância. No TPE, o certificado vem da força bruta. Nos grafos grandes, descrevemos o tamanho e o melhor observado.

**Uma execução cancelada pode certificar o ótimo?** Apenas os resultados concluídos antes do cancelamento mantêm seus estados. A tarefa cancelada perde o certificado porque a enumeração pode estar incompleta.

**A medição comprova as complexidades?** A amostra mostra tendências. As cotas vêm da contagem de subconjuntos, etapas e trocas, independentemente do relógio e da máquina.
