# RH Connect

Protótipo funcional de uma plataforma de RH inspirada em soluções como Factorial, com:

- autenticação e cadastro de usuários;
- perfis com níveis de acesso (`colaborador`, `gestor`, `rh`);
- avaliações de desempenho;
- feedback contínuo;
- tarefas enviadas pelo RH/gestor;
- agenda/calendário;
- aniversariantes do mês e de empresa no dashboard;
- mini rede social interna (perfil, bio, mini currículo, humor e elogios enviados);
- chat interno;
- organograma básico.

## Executar

Como é uma aplicação estática:

```bash
python3 -m http.server 4173
```

Abra `http://localhost:4173`.

## Usuários iniciais

- RH: `aline@empresa.com` / `1234`
- Gestor: `carlos@empresa.com` / `1234`
- Colaborador: `juliana@empresa.com` / `1234`
- Colaborador: `pedro@empresa.com` / `1234`

## Observação sobre PDF

O ambiente atual não contém o PDF citado para extração de contatos reais e organograma oficial; por isso os dados iniciais são demonstrativos e editáveis.
