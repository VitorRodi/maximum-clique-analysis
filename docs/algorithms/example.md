# Execução no grafo do TPE

A instância está em `src/graphs/predefinedGraphs.ts`. A, B, C e D formam K₄. X tem seis vizinhos, A, B, E, F, G e H. E, F, G e H são folhas. A e B têm grau quatro. C e D têm grau três. A configuração dispõe os vértices como na Figura 1 do [TPE](../academic/TPE.pdf).

| Método      | Trajetória observável                        | Resultado                            |
| ----------- | -------------------------------------------- | ------------------------------------ |
| Força bruta | Enumera 512 subconjuntos e visita A, B, C, D | 4, ótimo certificado                 |
| Guloso      | X → A → B                                    | 3, clique maximal                    |
| Busca local | {X, A, B} → {A, B, C} → {A, B, C, D}         | 4, coincide com o ótimo da instância |

No guloso, o primeiro conjunto de candidatos contém todos os vértices e X tem o maior grau. Após escolher X, A e B empatam com um vizinho no conjunto restante e A aparece antes na entrada. Escolher A deixa apenas B. Depois de escolher B, nenhum candidato pode ser incluído.

Na busca local, remover X e inserir C preserva a adjacência entre todos em {A, B, C}. D é o candidato adjacente a esses três vértices. A inserção completa a primeira melhoria estrita. A clique de quatro é máxima por enumeração e também por inspeção: qualquer clique contendo X tem até três membros, qualquer clique com folha tem até dois e só A, B, C e D sobram.

Os métodos, o pseudocódigo e seus invariantes estão no [README](../../README.md) e na [análise de complexidade](../complexity-analysis.md).
