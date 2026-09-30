# Correção do carregamento do gráfico

O endereço chart.min.js da versão 4.4.1 entrega um módulo ES com imports. Era carregado como script clássico e não disponibilizava window.Chart, utilizado por js/grafico.js.

Foi substituído por chart.umd.min.js, compatível com essa integração. O script UMD é carregado sem defer antes do módulo de entrada executar: na build, Vite coloca o módulo no head, e o carregamento assíncrono do CDN podia permitir que a aplicação exibisse o fallback antes da biblioteca estar pronta.

Validação: build gerada; em Chromium, a resposta UMD obtida do CDN com verificação TLS foi fornecida por interceptação para isolar bloqueios externos. A instância Chart apresentou os seis valores esperados e o tema de alto contraste atualizou as barras para amarelo. Os 11 cenários existentes passaram, incluindo o fallback quando o CDN falha.

A biblioteca continua externa. Indisponibilidade de rede pode ainda exibir a mensagem alternativa. A publicação desta correção exige integração por PR e conclusão do deploy.
