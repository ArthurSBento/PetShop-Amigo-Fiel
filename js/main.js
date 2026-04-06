/*
  Script principal do site.
  Responsavel por: mensagem inicial, busca, carrinho e animacoes.
*/

// Chave unica para armazenar o carrinho no navegador
const CHAVE_CARRINHO = 'petshop_carrinho';

// Mostra uma mensagem simples com a data do dia
function exibirMensagemInicial() {
  const dataHoje = new Date();
  const alvo = document.querySelector('[data-mensagem]');

  if (!alvo) {
    return;
  }

  const dia = String(dataHoje.getDate()).padStart(2, '0');
  const mes = String(dataHoje.getMonth() + 1).padStart(2, '0');
  const ano = dataHoje.getFullYear();

  alvo.textContent = `Bem-vindo! Hoje é ${dia}/${mes}/${ano}.`;
}

// Inicializacao geral da pagina
document.addEventListener('DOMContentLoaded', () => {
  exibirMensagemInicial();
  configurarPesquisa();
  configurarCarrinho();
  atualizarContadorCarrinho();
  configurarAnimacoes();
});

// Aplica animacoes de entrada em blocos importantes
function configurarAnimacoes() {
  const alvos = document.querySelectorAll(
    'header, footer, .hero, .secao-cabecalho, main section, .card, .form-bloco, .carrinho, .tabela, .hero-beneficios'
  );

  alvos.forEach((elemento) => {
    elemento.classList.add('animar-reveal');
  });

  if (!('IntersectionObserver' in window)) {
    alvos.forEach((elemento) => elemento.classList.add('animar-ativo'));
    return;
  }

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('animar-ativo');
        observer.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12 });

  alvos.forEach((elemento) => observer.observe(elemento));
}

// Base para ajustar caminhos em paginas internas
const basePath = document.body?.dataset.basePath ?? '';

// Itens usados no autocompletar da busca
const itensBusca = [
  { nome: 'Cama Pet Conforto Premium', url: `${basePath}pages/produtos.html#cama-pet` },
  { nome: 'Brinquedo Mordedor Resistente', url: `${basePath}pages/produtos.html#brinquedo-mordedor` },
  { nome: 'Ração Golden Fórmula Adulto 10kg', url: `${basePath}pages/produtos.html#racao-golden` },
  { nome: 'Ração Pedigree Filhotes 2,5kg', url: `${basePath}pages/produtos.html#racao-pedigree` },
  { nome: 'Tapete Higiênico 30 unidades', url: `${basePath}pages/produtos.html#tapete-higienico` },
  { nome: 'Shampoo Pet Neutro 500ml', url: `${basePath}pages/produtos.html#shampoo-neutro` },
  { nome: 'Banho', url: `${basePath}pages/servicos.html#banho` },
  { nome: 'Tosa', url: `${basePath}pages/servicos.html#tosa` },
  { nome: 'Banho e Tosa', url: `${basePath}pages/servicos.html#banho-tosa` },
  { nome: 'Banho e Tosa com Tele-busca', url: `${basePath}pages/servicos.html#banho-tosa-telebusca` }
];

// Imagens usadas no carrinho
const imagensProdutos = {
  'Cama Pet Conforto Premium': `${basePath}assets/images/acessorios/cama-pet.png`,
  'Brinquedo Mordedor Resistente': `${basePath}assets/images/acessorios/brinquedo-mordedor.png`,
  'Ração Golden Fórmula Adulto 10kg': `${basePath}assets/images/racoes/racao-golden.png`,
  'Ração Pedigree Filhotes 2,5kg': `${basePath}assets/images/racoes/racao-pedigree.png`,
  'Tapete Higiênico 30 unidades': `${basePath}assets/images/higiene/tapete-higienico.png`,
  'Shampoo Pet Neutro 500ml': `${basePath}assets/images/higiene/shampoo.png`
};

// Configura busca com sugestoes e redirecionamento
function configurarPesquisa() {
  const formularios = document.querySelectorAll('[data-search-form]');

  formularios.forEach((formulario) => {
    const campo = formulario.querySelector('input[type="search"]');
    const lista = formulario.querySelector('[data-sugestoes]');

    formulario.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!campo) {
        return;
      }
      const termo = campo.value.trim();
      if (!termo) {
        return;
      }
      const destino = encontrarPrimeiraCorrespondencia(termo);
      if (destino) {
        window.location.href = destino;
      }
    });

    if (campo && lista) {
      campo.addEventListener('input', () => {
        atualizarSugestoes(campo.value, lista);
      });

      campo.addEventListener('focus', () => {
        atualizarSugestoes(campo.value, lista);
      });
    }
  });
}

// Normaliza texto para comparar sem acentos
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function encontrarPrimeiraCorrespondencia(termo) {
  const filtro = normalizarTexto(termo);
  const item = itensBusca.find((opcao) => normalizarTexto(opcao.nome).includes(filtro));
  return item ? item.url : null;
}

function atualizarSugestoes(valor, container) {
  const filtro = normalizarTexto(valor.trim());
  container.innerHTML = '';

  if (!filtro) {
    container.style.display = 'none';
    return;
  }

  const correspondencias = itensBusca.filter((opcao) => normalizarTexto(opcao.nome).includes(filtro));

  if (correspondencias.length === 0) {
    container.style.display = 'none';
    return;
  }

  correspondencias.forEach((opcao) => {
    const link = document.createElement('a');
    link.href = opcao.url;
    link.textContent = opcao.nome;
    container.appendChild(link);
  });

  container.style.display = 'block';
}

// Configura botoes de adicionar ao carrinho
function configurarCarrinho() {
  const botoes = document.querySelectorAll('[data-add-carrinho]');
  const lista = document.querySelector('[data-carrinho-lista]');
  const totalEl = document.querySelector('[data-carrinho-total]');

  if (botoes.length > 0) {
    botoes.forEach((botao) => {
      botao.addEventListener('click', () => {
        const nome = botao.dataset.nome;
        const preco = Number(botao.dataset.preco);

        if (!nome || Number.isNaN(preco)) {
          return;
        }

        const carrinho = obterCarrinho();
        carrinho.push({ nome, preco });
        salvarCarrinho(carrinho);
        atualizarContadorCarrinho();
      });
    });
  }

  if (lista && totalEl) {
    renderizarCarrinho(lista, totalEl);
  }
}

// Le o carrinho salvo no navegador
function obterCarrinho() {
  const conteudo = localStorage.getItem(CHAVE_CARRINHO);
  if (!conteudo) {
    return [];
  }
  try {
    const dados = JSON.parse(conteudo);
    return Array.isArray(dados) ? dados : [];
  } catch (erro) {
    return [];
  }
}

// Salva o carrinho no navegador
function salvarCarrinho(itens) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
}

// Atualiza o contador visual do carrinho
function atualizarContadorCarrinho() {
  const contador = document.querySelector('[data-carrinho-contador]');
  if (!contador) {
    return;
  }
  const carrinho = obterCarrinho();
  contador.textContent = carrinho.length;
}

// Desenha a lista de itens do carrinho
function renderizarCarrinho(lista, totalEl) {
  const carrinho = obterCarrinho();
  lista.innerHTML = '';
  let total = 0;

  carrinho.forEach((item, indice) => {
    total += item.preco;
    const li = document.createElement('li');
    const imagem = imagensProdutos[item.nome];
    const imgTag = imagem ? `<img src="${imagem}" alt="${item.nome}">` : '';
    li.innerHTML = `${imgTag}<span>${item.nome}</span><span>R$ ${item.preco.toFixed(2)}</span>`;
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'botao botao-remover';
    botao.textContent = 'Remover';
    botao.addEventListener('click', () => {
      removerItemCarrinho(indice, lista, totalEl);
    });
    li.appendChild(botao);
    lista.appendChild(li);
  });

  totalEl.textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Remove um item especifico do carrinho
function removerItemCarrinho(indice, lista, totalEl) {
  const carrinho = obterCarrinho();
  carrinho.splice(indice, 1);
  salvarCarrinho(carrinho);
  atualizarContadorCarrinho();
  renderizarCarrinho(lista, totalEl);
}
