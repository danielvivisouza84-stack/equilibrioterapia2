// ================= CONFIGURAÇÕES =================
// ⚠️ COLOQUE SEU NÚMERO AQUI (apenas dígitos, com DDD)
const NUMERO_TERAPEUTA = "27999999999"; // ← ALTERE AQUI! Ex: 27988887777

// Horários disponíveis: 08h às 22h, de hora em hora
const HORARIOS = [];
for (let h = 8; h <= 22; h++) {
    HORARIOS.push(`${h.toString().padStart(2, '0')}:00`);
}

// Dias bloqueados pelo terapeuta
let diasBloqueados = [];

// ================= INICIALIZAÇÃO =================
document.addEventListener('DOMContentLoaded', () => {
    const inputData = document.getElementById('data');
    const hoje = new Date().toISOString().split('T')[0];
    inputData.setAttribute('min', hoje);

    inputData.addEventListener('change', carregarHorarios);
    document.getElementById('bookingForm').addEventListener('submit', enviarAgendamento);
});

// ================= CARREGAR HORÁRIOS =================
function carregarHorarios() {
    const dataEscolhida = document.getElementById('data').value;
    const selectHorario = document.getElementById('horario');
    selectHorario.innerHTML = '';

    if (!dataEscolhida) {
        selectHorario.innerHTML = '<option value="">Escolha primeiro a data</option>';
        return;
    }

    const data = new Date(dataEscolhida + 'T00:00:00');
    const diaSemana = data.getDay(); // 0 = Domingo, 6 = Sábado

    // Verifica se é fim de semana
    if (diaSemana === 0 || diaSemana === 6) {
        selectHorario.innerHTML = '<option value="">❌ Fechado — Segunda a Sexta apenas</option>';
        return;
    }

    // Verifica se dia está bloqueado
    if (diasBloqueados.includes(dataEscolhida)) {
        selectHorario.innerHTML = '<option value="">🚫 Dia bloqueado pelo terapeuta</option>';
        return;
    }

    // Adiciona horários disponíveis
    selectHorario.innerHTML = '<option value="">Selecione um horário...</option>';
    HORARIOS.forEach(hora => {
        const option = document.createElement('option');
        option.value = hora;
        option.textContent = hora;
        selectHorario.appendChild(option);
    });
}

// ================= ENVIAR AGENDAMENTO =================
function enviarAgendamento(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const servico = document.getElementById('servico').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const observacoes = document.getElementById('observacoes').value.trim();
    const mensagemDiv = document.getElementById('mensagem');

    // Validações
    if (!nome || !whatsapp || !servico || !data || !horario) {
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios!', 'error');
        return;
    }

    if (horario.includes('❌') || horario.includes('🚫')) {
        mostrarMensagem('Escolha uma data e horário válidos.', 'error');
        return;
    }

    // Formatar data para exibição
    const [ano, mes, dia] = data.split('-');
    const dataFormatada = `${dia}/${mes}/${ano}`;

    // Montar mensagem
    let texto = `✨ *NOVO AGENDAMENTO — Equilíbrio Terapias* ✨\n\n`;
    texto += `👤 *Cliente:* ${nome}\n`;
    texto += `📱 *WhatsApp:* ${whatsapp}\n`;
    texto += `📅 *Data:* ${dataFormatada}\n`;
    texto += `⏰ *Horário:* ${horario}\n`;
    texto += `💆 *Serviço:* ${servico}\n`;
    if (observacoes) texto += `📝 *Observações:* ${observacoes}\n`;
    texto += `\n====================\n`;
    texto += `✅ *Por favor, confirme o agendamento!*`;

    // Codificar para URL
    const textoCodificado = encodeURIComponent(texto);
    
    // 1️⃣ Enviar para o TERAPEUTA
    const linkTerapeuta = `https://wa.me/${NUMERO_TERAPEUTA}?text=${textoCodificado}`;
    
    // 2️⃣ Mensagem de confirmação para o CLIENTE
    let textoCliente = `Olá ${nome}! 😊\n`;
    textoCliente += `Recebemos seu agendamento com a *Equilíbrio Terapias* ✨\n\n`;
    textoCliente += `📅 Data: ${dataFormatada}\n`;
    textoCliente += `⏰ Horário: ${horario}\n`;
    textoCliente += `💆 Serviço: ${servico}\n\n`;
    textoCliente += `Aguarde nossa confirmação. Obrigado pela preferência! 🙏`;
    
    const textoClienteCodificado = encodeURIComponent(textoCliente);
    const linkCliente = `https://wa.me/${limparNumero(whatsapp)}?text=${textoClienteCodificado}`;

    // Mostrar sucesso e abrir links
    mostrarMensagem(`✅ Agendamento enviado com sucesso! Abrindo WhatsApp...`, 'success');
    
    // Abrir para terapeuta primeiro
    setTimeout(() => window.open(linkTerapeuta, '_blank'), 300);
    // Depois mensagem para cliente
    setTimeout(() => window.open(linkCliente, '_blank'), 800);

    // Resetar formulário
    e.target.reset();
    document.getElementById('horario').innerHTML = '<option value="">Escolha primeiro a data</option>';
}

// ================= FUNÇÕES AUXILIARES =================
function mostrarMensagem(texto, tipo) {
    const div = document.getElementById('mensagem');
    div.style.display = 'block';
    div.className = `message ${tipo}`;
    div.textContent = texto;
    
    setTimeout(() => {
        div.style.display = 'none';
    }, 8000);
}

function limparNumero(numero) {
    // Remove tudo que não for número
    return numero.replace(/\D/g, '');
}

// ================= BLOQUEAR DIA (para testes) =================
// Para usar: apenas adicione datas no formato AAAA-MM-DD
// Exemplo: diasBloqueados.push('2026-09-25');
// ou direto na lista abaixo:
// diasBloqueados = ['2026-09-30', '2026-10-01'];