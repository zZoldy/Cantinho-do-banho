function mascaraTelefone(input) {
    // Remove tudo o que não for número (letras, espaços, símbolos)
    let valor = input.value.replace(/\D/g, '');

    // Limita o tamanho máximo a 11 dígitos (DDD + 9 dígitos)
    if (valor.length > 11) {
        valor = valor.substring(0, 11);
    }

    // Aplica a formatação dinamicamente
    if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d)/g, '($1) $2'); // Coloca o (XX) 
    }
    if (valor.length > 7) {
        valor = valor.replace(/(\d{5})(\d)/, '$1-$2'); // Coloca o hífen no meio (XXXXX-XXXX)
    }

    // Atualiza o valor no input
    input.value = valor;
}

let isEnviandoAgendamento = false;

function enviarAgendamento(e) {
    e.preventDefault();

    if (isEnviandoAgendamento) {
        console.log("Aguarde, já estamos processando o seu pedido...");
        return;
    }

    const nome = document.getElementById('nome').value.trim();
    const tel = document.getElementById('tel').value.trim();
    const pet = document.getElementById('pet').value.trim();
    const tipoPet = document.getElementById('tipo-pet').value;
    const racaPet = document.getElementById('racaPet').value;
    const portePet = document.getElementById('portePet').value;
    const servico = document.getElementById('servico').value;
    const data = document.getElementById('data').value; // Formato: YYYY-MM-DD
    const hora = document.getElementById('hora').value; // Formato: HH:MM

    if (!nome || !pet || !racaPet || !portePet || !tel || !tipoPet || !servico || !data || !hora) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    isEnviandoAgendamento = true;
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    let textoOriginal = "Enviar";

    if (btnSubmit) {
        textoOriginal = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
        btnSubmit.disabled = true;
        btnSubmit.style.opacity = '0.7';
    }

    const formData = new URLSearchParams();
    formData.append('nomeDono', nome);
    formData.append('telefone', tel);
    formData.append('nomePet', pet);
    formData.append('racaPet', racaPet);
    formData.append('portePet', portePet);
    formData.append('tipo', tipoPet);
    formData.append('servico', servico);
    formData.append('data', data);
    formData.append('hora', hora);

    fetch('/Cantinho_banho-1.0-SNAPSHOT/api/agendar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: formData
    })
    .then(response => {
        if (response.ok) {
            return response.text();
        } else {
            return response.text().then(text => {
                throw new Error(text);
            });
        }
    })
    .then(resultado => {
        console.log("Sucesso do Java:", resultado);

        document.getElementById('form-agendamento').style.display = 'none';
        document.getElementById('agendamento-sucesso').style.display = 'block';

        document.getElementById('form-agendamento').querySelector('form').reset();
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        alert("Falha ao salvar no MySQL: " + error.message);
    })
    .finally(() => {
        isEnviandoAgendamento = false;
        
        if(btnSubmit){
            btnSubmit.innerHTML = textoOriginal;
            btnSubmit.disabled = false;
            btnSubmit.style.opacity = '1';
        }

    });
}

function novoAgendamento() {
    document.getElementById('form-agendamento').style.display = 'block';
    document.getElementById('agendamento-sucesso').style.display = 'none';
    document.getElementById('form-agendamento').querySelector('form').reset();
}

document.addEventListener("DOMContentLoaded", function () {
    carregarServicosNoSelect();
});

async function carregarServicosNoSelect() {
    const selectServico = document.getElementById('servico');
    if (!selectServico)
        return;

    try {
        const resposta = await fetch('/Cantinho_banho-1.0-SNAPSHOT/api/servicos/listar');
        if (resposta.ok) {
            const servicos = await resposta.json();

            selectServico.innerHTML = '<option value="" disabled selected>Escolha o serviço...</option>';

            servicos.forEach(s => {
                const option = document.createElement('option');
                option.value = s.id;
                option.textContent = s.nome;
                selectServico.appendChild(option);
            });
        }
    } catch (erro) {
        console.error("Erro ao carregar serviços no site:", erro);
    }
}