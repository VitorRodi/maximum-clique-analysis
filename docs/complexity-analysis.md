# Análise de complexidade computacional

Considere n = |V|, m = |E| e k = |C|. A matriz linearizada guarda n² células de um byte e possui diagonal nula. Verifica uma adjacência em O(1), um grau em Θ(n) e a exposição dos pares do grafo em Θ(n²). Mantidos n e m, a densidade custa O(1). O modelo valida o nome de cada vértice e cada aresta antes de construir a matriz simétrica. A verificação de uma clique usa até k(k−1)/2 consultas. A verificação de maximalidade procura um vértice externo adjacente a todos, em O(nk) após verificar C.

## Força bruta

Na recursão, a profundidade i determina se o vértice i entra no subconjunto. Cada caminho raiz–folha representa uma decisão distinta para cada vértice. Assim, cada subconjunto é visitado uma vez. O teste interrompe a verificação do subconjunto ao encontrar um par sem aresta. Nos subconjuntos válidos, a maior cardinalidade observada é monotônica.

No grafo completo, todo par é testado. Para n ≥ 2, cada par aparece em 2ⁿ⁻² subconjuntos, totalizando C(n,2) · 2ⁿ⁻² consultas. Logo o pior caso é Θ(n² · 2ⁿ), compatível com a cota do TPE. A pilha, o subconjunto corrente e a incumbente ocupam O(n) além da matriz. A enumeração não materializa a potência de V.

A execução padrão aceita até 20 vértices. Após verificar o tempo inicial, o algoritmo consulta o relógio a cada 1.024 subconjuntos. Uma interrupção devolve uma incumbente válida, porém sem certificado. O cancelamento no navegador encerra o Worker, preserva resultados completos já recebidos e marca as tarefas pendentes como canceladas.

## Guloso construtivo

Em cada iteração, P contém somente vértices externos adjacentes a toda a clique. Ao adicionar v ∈ P, a interseção P ∩ N(v) preserva o invariante e remove v pela diagonal zero. Se P se esgota, nenhum vértice externo pode estender C. A ordem de V resolve empates e é preservada pelos filtros.

Em uma etapa com p candidatos, o recálculo usa Θ(p²) consultas e o filtro mais O(p). Até n etapas dão O(n³). Em Kₙ, p percorre n, n−1, …, 1 e a soma é Θ(n³). Espaço auxiliar O(n) além da matriz. A maximalidade assegura inviabilidade de uma inserção direta. O maior grau em P pode bloquear uma clique de cardinalidade superior.

## Busca local

A solução inicial é o guloso. Uma troca faz remoção de u e inserção de v, testando a adjacência de v aos membros mantidos. A expansão usa como candidatos somente vértices adjacentes a toda a clique após a troca. O mesmo guloso garante que a solução expandida seja maximal. Uma rodada aceita a primeira clique estritamente maior. O processo para quando nenhuma troca gera melhora ou quando acaba o limite de rodadas. Com limite zero, devolve a solução inicial.

Para uma clique de tamanho k, há k(n−k) trocas possíveis. A validação da troca custa O(n), a construção do conjunto inicial da expansão custa O(n²) e a expansão custa O(n³). São no máximo n−k melhoras e até uma rodada final sem melhora. Incluindo a solução inicial, a cota é O(n³ + (r+1)n⁵), em que r é o número de melhoras aceitas. Assim, O(n⁶) é um limite superior conservador. A implementação testa uma troca por vez e usa O(n) de espaço auxiliar. A vizinhança pode esconder melhorias que exijam mais de uma troca ou aceitação temporária de solução do mesmo tamanho.

## Instrumentação e interface

Os limites auxiliares acima excluem o grafo O(n²) e a gravação didática. As três implementações armazenam, quando habilitado, O(n) retratos com até O(n) vértices cada, ou O(n²) no pior caso. No benchmark os rastros ficam desabilitados. Os contadores medem consultas instrumentadas, subconjuntos examinados e rodadas/trocas. A validação final do resultado consulta o grafo após gravar o tempo e fica fora desses contadores.
