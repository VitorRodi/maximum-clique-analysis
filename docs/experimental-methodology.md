# Metodologia experimental

O benchmark em `src/benchmarks/run.ts` executa de forma independente da interface. Use `npm ci` e `npm run benchmark` na raiz. Os arquivos originais permanecem disponíveis no histórico do repositório.

## Amostra e desenho

- Tamanhos n = 5, 10, 15, 20, 30, 50, 100 e 200.
- Probabilidades de aresta p = 0,20, 0,50 e 0,80.
- Sementes 11, 23, 37, 53 e 71. A geração G(n,p) testa cada par não ordenado com Mulberry32. p é a densidade nominal. A efetiva é 2m/[n(n−1)] para n ≥ 2.
- As 24 configurações produzem 120 grafos. Acrescenta-se o grafo do TPE como referência controlada.
- Cada algoritmo elegível recebe um aquecimento por instância, excluído dos dados. São registradas cinco repetições, com rotação da ordem dos algoritmos. Todos usam o mesmo objeto Graph.

## Medição e exclusões

`performance.now()` mede tempo em milissegundos com alta resolução. A geração é registrada separadamente. A janela do algoritmo inclui seus contadores e exclui a verificação final de validade, outras agregações, Worker e renderização. A versão de navegador grava os rastros didáticos em uma janela própria. Os dois ambientes têm custos de execução distintos.

A força bruta possui limite de 20 vértices e 5.000 ms. Repetições acima do limite de vértices ficam como `skipped`, com tempo em branco. Uma interrupção de tempo é `interrupted`, tem tempo individual e pode devolver uma incumbente. As estatísticas de tempo usam somente as execuções concluídas. A busca local usa n rodadas como limite padrão.

## Métricas e arquivos

- `benchmark.json` guarda metadados, amostras e linhas por instância.
- `benchmark-samples.csv` contém cada repetição, estado, dados do grafo, tempo, clique, validade, operações e ótimo, quando certificado.
- `benchmark-instances.csv` agrega por instância e algoritmo. Calcula média aritmética, mediana e desvio padrão populacional das repetições acabadas.
- `benchmark-summary.json` e `benchmark-summary.csv` agregam por combinação (n,p,algoritmo). A mediana e demais estatísticas são sobre os tempos individuais concluídos. Para tamanho, média, melhor cardinalidade e percentuais são agregados por instância, sem multiplicar seu peso pelo número de repetições. O JSON também guarda o quadro do TPE.

A qualidade e o desvio dividem por ω(G) somente quando ω(G) é certificado e positivo. As células correspondentes ficam ausentes nos CSVs e nulas nos JSONs se o ótimo for desconhecido ou zero. Medir tempos permite descrever a amostra e levantar hipóteses sobre custo. As cotas assintóticas vêm da análise do algoritmo.
