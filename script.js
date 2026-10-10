// ================= CONFIGURAÇÕES =================
// ⚠️ COLOQUE SEU NÚMERO AQUI (apenas dígitos, com DDD)
const NUMERO_TERAPEUTA = "27999406668"; // ← ALTERE AQUI! Ex: 27988887777

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

// ================= CÓDIGO DO PAINEL ADMINISTRATIVO (ADICIONAR NO FINAL DO ARQUIVO) =================
const SENHA_ADMIN_DEFINIDA = "12345"; // Defina sua senha aqui
const HORARIOS_PADRAO = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];

let diasBloqueadosCompletos = JSON.parse(localStorage.getItem('diasBloqueados')) || [];
let horariosBloqueadosEspecificos = JSON.parse(localStorage.getItem('horariosBloqueados')) || {}; 
let listaTerapeutas = JSON.parse(localStorage.getItem('listaTerapeutas')) || [];
let historicoAgendamentosLocais = JSON.parse(localStorage.getItem('historicoAgendamentos')) || [];

function verificarSenhaAdmin() {
    if (document.getElementById('admin-password').value === SENHA_ADMIN_DEFINIDA) {
        sessionStorage.setItem('admin_logado', 'true');
        exibirPainelAdmin();
    } else {
        alert('❌ Senha incorreta!');
    }
}

function fazerLogoutAdmin() {
    sessionStorage.removeItem('admin_logado');
    document.getElementById('admin-login-box').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
}

function exibirPainelAdmin() {
    document.getElementById('admin-login-box').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    renderizarListaBloqueios();
    renderizarListaTerapeutas();
    document.getElementById('filtro-data-tabela').value = new Date().toISOString().split('T')[0];
    renderizarTabelaAgendamentos();
}

function inicializarCamposAdmin() {
    const selectAdminHora = document.getElementById('admin-hora-select');
    if(selectAdminHora && selectAdminHora.options.length === 0) {
        HORARIOS_PADRAO.forEach(hora => {
            const opt = document.createElement('option');
            opt.value = hora; opt.textContent = hora;
            selectAdminHora.appendChild(opt);
        });
    }
}

function gerenciarBloqueioDia() {
    const data = document.getElementById('admin-data-bloqueio').value;
    if (!data) return alert('Selecione uma data.');
    diasBloqueadosCompletos.includes(data) ? diasBloqueadosCompletos = diasBloqueadosCompletos.filter(d => d !== data) : diasBloqueadosCompletos.push(data);
    localStorage.setItem('diasBloqueados', JSON.stringify(diasBloqueadosCompletos));
    renderizarListaBloqueios();
    carregarHorarios();
}

function gerenciarBloqueioHorario() {
    const data = document.getElementById('admin-hora-data').value;
    const hora = document.getElementById('admin-hora-select').value;
    if (!data || !hora) return alert('Selecione a data e o horário.');
    if (!horariosBloqueadosEspecificos[data]) horariosBloqueadosEspecificos[data] = [];
    horariosBloqueadosEspecificos[data].includes(hora) ? horariosBloqueadosEspecificos[data] = horariosBloqueadosEspecificos[data].filter(h => h !== hora) : horariosBloqueadosEspecificos[data].push(hora);
    if (horariosBloqueadosEspecificos[data].length === 0) delete horariosBloqueadosEspecificos[data];
    localStorage.setItem('horariosBloqueados', JSON.stringify(horariosBloqueadosEspecificos));
    renderizarListaBloqueios();
    carregarHorarios();
}

function renderizarListaBloqueios() {
    const ul = document.getElementById('lista-bloqueios-ativos');
    if(!ul) return; ul.innerHTML = '';
    diasBloqueadosCompletos.forEach(d => {
        const [ano, mes, dia] = d.split('-');
        ul.innerHTML += `<li>Dia Todo: ${dia}/${mes}/${ano} <button style="background:none; border:none; color:blue; cursor:pointer;" onclick="removerBloqueioDia('${d}')">[Ativar]</button></li>`;
    });
    Object.keys(horariosBloqueadosEspecificos).forEach(d => {
        const [ano, mes, dia] = d.split('-');
        horariosBloqueadosEspecificos[d].forEach(h => {
            ul.innerHTML += `<li>${dia}/${mes}/${ano} às ${h} <button style="background:none; border:none; color:blue; cursor:pointer;" onclick="removerBloqueioHora('${d}','${h}')">[Ativar]</button></li>`;
        });
    });
}

function removerBloqueioDia(data) { diasBloqueadosCompletos = diasBloqueadosCompletos.filter(d => d !== data); localStorage.setItem('diasBloqueados', JSON.stringify(diasBloqueadosCompletos)); renderizarListaBloqueios(); carregarHorarios(); }
function removerBloqueioHora(data, hora) { horariosBloqueadosEspecificos[data] = horariosBloqueadosEspecificos[data].filter(h => h !== hora); if (horariosBloqueadosEspecificos[data].length === 0) delete horariosBloqueadosEspecificos[data]; localStorage.setItem('horariosBloqueados', JSON.stringify(horariosBloqueadosEspecificos)); renderizarListaBloqueios(); carregarHorarios(); }

function adicionarTerapeuta() {
    const nome = document.getElementById('nome-terapeuta').value.trim();
    const fotoUrl = document.getElementById('link-foto-terapeuta').value.trim();
    if (!nome || !fotoUrl) return alert('Preencha os campos da foto.');
    listaTerapeutas.push({ id: Date.now(), nome, foto: fotoUrl });
    localStorage.setItem('listaTerapeutas', JSON.stringify(listaTerapeutas));
    document.getElementById('nome-terapeuta').value = '';
    document.getElementById('link-foto-terapeuta').value = '';
    renderizarListaTerapeutas();
}

function renderizarListaTerapeutas() {
    const container = document.getElementById('lista-terapeutas-admin');
    if(!container) return; container.innerHTML = '';
    listaTerapeutas.forEach(t => {
        container.innerHTML += `<div style="text-align: center; border: 1px solid #ddd; padding: 5px; border-radius: 6px; background: white; position: relative;"><img src="${t.foto}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 50%;"><div style="font-size: 10px; overflow: hidden; text-overflow: ellipsis;">${t.nome}</div><span onclick="removerTerapeuta(${t.id})" style="position: absolute; top: -5px; right: -5px; background: red; color: white; border-radius: 50%; width: 15px; height: 15px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</span></div>`;
    });
}

function removerTerapeuta(id) { listaTerapeutas = listaTerapeutas.filter(t => t.id !== id); localStorage.setItem('listaTerapeutas', JSON.stringify(listaTerapeutas)); renderizarListaTerapeutas(); }

function renderizarTabelaAgendamentos() {
    const dataFiltro = document.getElementById('filtro-data-tabela').value;
    const tbody = document.getElementById('corpo-tabela-agendamentos');
    if(!tbody) return; tbody.innerHTML = '';
    const filtrados = historicoAgendamentosLocais.filter(ag => ag.data === dataFiltro).sort((a, b) => a.horario.localeCompare(b.horario));
    if (filtrados.length === 0) { tbody.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: #999;">Nenhum agendamento para este dia.</td></tr>'; return; }
    filtrados.forEach(ag => {
        tbody.innerHTML += `<tr><td style="padding: 0.5rem;">${ag.horario}</td><td style="padding: 0.5rem;">${ag.nome}</td><td style="padding: 0.5rem;"><a href="https://wa.me{ag.whatsapp.replace(/\D/g, '')}" target="_blank" style="color: var(--turquesa); text-decoration: none;">🟢 ${ag.whatsapp}</a></td><td style="padding: 0.5rem;">${ag.servico.split('—')[0]}</td></tr>`;
    });
}

// ================= BLOQUEAR DIA (para testes) =================
// Para usar: apenas adicione datas no formato AAAA-MM-DD
// Exemplo: diasBloqueados.push('2026-09-25');
// ou direto na lista abaixo:
// diasBloqueados = ['2026-09-30', '2026-10-01'];