// Configura o formulario de agendamento (sem armazenamento local)
function configurarFormularioAgendamento() {
  const formulario = document.querySelector('[data-agendamento-form]');
  const mensagem = document.querySelector('[data-agendamento-mensagem]');

  if (!formulario) {
    return;
  }

  // Trata o envio do formulario
  formulario.addEventListener('submit', (event) => {
    event.preventDefault();

    const dados = new FormData(formulario);
    const servico = dados.get('servico');
    const metodo = dados.get('metodo');
    const data = dados.get('data');
    const hora = dados.get('hora');

    // Validacao simples de campos obrigatorios
    if (!servico || !metodo || !data || !hora) {
      if (mensagem) {
        mensagem.textContent = 'Preencha todos os campos obrigatorios.';
      }
      return;
    }

    formulario.reset();
    if (mensagem) {
      mensagem.textContent = 'Agendamento enviado! Nossa equipe entrara em contato.';
    }
  });
}

// Inicializa ao carregar a pagina
document.addEventListener('DOMContentLoaded', () => {
  configurarFormularioAgendamento();
});
