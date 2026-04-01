// ==========================================
// GESTÃO DE PACOTES (ADMIN)
// ==========================================

async function carregarPacotesAdmin() {
    const container = document.getElementById('lista-pacotes-admin');
    if (!container)
        return;

    container.innerHTML = '<span style="color: #888; font-size: 0.9rem;"><i class="fas fa-spinner fa-spin"></i> Carregando pacotes...</span>';

    try {
        const res = await fetch('../api/pacotes/listar');

        if (res.ok) {
            const pacotes = await res.json();

            if (pacotes.length === 0) {
                container.innerHTML = "<span style='color: #888; font-size: 0.9rem;'>Nenhum pacote cadastrado.</span>";
                return;
            }

            // 🟢 CORREÇÃO: Adicionado o nome do serviço e o Botão de Excluir no HTML
            container.innerHTML = pacotes.map(p => {
                let nomeServico = p.nomeServico || (p.servico && p.servico.nome) || '';

                if (nomeServico === '') {
                    nomeServico = 'Qualquer Serviço';
                }
                const sessoes = p.sessoes || p.quantidadeSessoes || 0;

                return `
                <div style="background: #1a1a1a; padding: 12px 15px; border-radius: 6px; border-left: 4px solid #C9A96E; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <strong style="color: #fff; font-size: 0.95rem;">${p.nome}</strong><br>
                        <span style="color: #aaa; font-size: 0.8rem;">
                            <i class="fas fa-shower" style="margin-right: 4px;"></i> ${sessoes} sessões | 
                            <i class="far fa-calendar-alt" style="margin-right: 4px; margin-left: 6px;"></i> Válido por ${p.validade} dias |
                            <i class="fas fa-cut" style="margin-right: 4px; margin-left: 6px; color: #C9A96E;"></i> ${nomeServico}
                        </span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px; text-align: right;">
                        <strong style="color: #28a745; font-size: 1.05rem;">R$ ${p.valor.toFixed(2)}</strong>
                        
                        <button onclick="excluirPacote(${p.id}, '${p.nome}', ${sessoes})" title="Excluir Pacote" style="background: transparent; border: none; color: #dc3545; cursor: pointer; font-size: 1.1rem; transition: 0.2s; padding: 5px;" onmouseover="this.style.color='#a71d2a'" onmouseout="this.style.color='#dc3545'">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                `;
            }).join('');

            window.pacotesCadastrados = pacotes;
        } else {
            container.innerHTML = "<span style='color: #dc3545; font-size: 0.9rem;'>Erro ao carregar pacotes da base de dados.</span>";
        }
    } catch (e) {
        console.error("Erro na requisição listar pacotes:", e);
        container.innerHTML = "<span style='color: #dc3545; font-size: 0.9rem;'>Falha na conexão com o servidor.</span>";
    }
}

async function salvarPacoteAdmin(e) {
    e.preventDefault();

    const nome = document.getElementById('pacote-nome').value;
    const sessoes = document.getElementById('pacote-sessoes').value;
    const validade = document.getElementById('pacote-validade').value;
    const valor = document.getElementById('pacote-valor').value;
    const servicoId = document.getElementById('novo-pacote-servico').value;

    if (!servicoId) {
        alert("⚠️ Por favor, selecione a qual serviço este pacote pertence.");
        return;
    }

    const params = new URLSearchParams();
    params.append('nome', nome);
    params.append('sessoes', sessoes);
    params.append('validade', validade);
    params.append('valor', valor);
    params.append('servicoId', servicoId);

    const btnSubmit = document.querySelector('#form-novo-pacote button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    btnSubmit.disabled = true;

    try {
        const res = await fetch('../api/pacotes/cadastrar', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (res.ok) {
            document.getElementById('form-novo-pacote').reset();
            carregarPacotesAdmin();

            alert('Pacote "' + nome + '" criado com sucesso!');
        } else {
            alert('Erro ao criar pacote. O servidor retornou uma falha.');
        }
    } catch (erro) {
        console.error("Erro na requisição cadastrar pacote:", erro);
        alert('Falha na comunicação com o servidor.');
    } finally {
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
}

async function excluirPacote(id, nome, totalSessoes) {
    try {
        const resClientes = await fetch('../api/clientes/listar');
        const clientes = await resClientes.json();

        const clientesEmUso = clientes.filter(c => String(c.pacoteId) === String(id));

        if (clientesEmUso.length > 0) {

            let relatorio = `⚠️ RELATÓRIO DE USO: O pacote "${nome}" está ativo para ${clientesEmUso.length} cliente(s).\n\n`;

            clientesEmUso.forEach(c => {
                const usadas = c.sessoesUsadas || 0;
                const faltam = Math.max(0, totalSessoes - usadas);
                relatorio += `👤 Cliente: ${c.nome} | Faltam: ${faltam} sessão(ões)\n`;
            });

            relatorio += `\n🚨 DUPLA VERIFICAÇÃO: Excluir este pacote vai CANCELAR os planos destes clientes e eles perderão os banhos que faltam!`;
            relatorio += `\n\nPara FORÇAR a exclusão e cancelar os planos, digite a palavra: EXCLUIR`;

            const palavraSeguranca = prompt(relatorio);

            if (palavraSeguranca !== 'EXCLUIR') {
                alert('❌ Operação cancelada. O pacote e o saldo dos clientes estão seguros.');
                return;
            }

        } else {
            if (!confirm(`O pacote "${nome}" não está em uso por ninguém.\nDeseja excluí-lo definitivamente?`)) {
                return;
            }
        }

        const params = new URLSearchParams();
        params.append('id', id);

        const resposta = await fetch('../api/pacotes/excluir', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            alert('✅ Pacote excluído com sucesso!');
            // 🟢 CORREÇÃO: Chama a função certa para atualizar a lista na tela
            carregarPacotesAdmin();
        } else {
            const erroMsg = await resposta.text();
            alert(`❌ Erro no servidor:\n${erroMsg}`);
        }

    } catch (erro) {
        console.error("Erro na exclusão:", erro);
        alert('Falha de comunicação ao tentar gerar o relatório.');
    }
}

// ================= FLUXO DE VENDER PACOTE =================

function abrirModalVenderPacote(clienteId, clienteNome) {
    if (typeof fecharFocoCliente === 'function')
        fecharFocoCliente();

    // Assegura que o modal (criado no HTML) recebe os dados do cliente
    document.getElementById('id-cliente-pacote').value = clienteId;
    document.getElementById('nome-cliente-pacote').textContent = clienteNome;

    // Preenche o select com os pacotes que vieram do Banco de Dados
    const select = document.getElementById('select-pacote-venda');
    const pacotes = window.pacotesCadastrados || [];

    if (pacotes.length === 0) {
        select.innerHTML = '<option value="">Nenhum pacote cadastrado no sistema</option>';
    } else {
        select.innerHTML = '<option value="">-- Escolha um Pacote --</option>' +
                pacotes.map(p => `<option value="${p.id}">${p.nome} - R$ ${p.valor.toFixed(2)}</option>`).join('');
    }

    document.getElementById('modal-vender-pacote').classList.remove('hidden');
}

function fecharModalVenderPacote() {
    document.getElementById('modal-vender-pacote').classList.add('hidden');
}

async function confirmarVendaPacote() {
    const clienteId = document.getElementById('id-cliente-pacote').value;
    const pacoteId = document.getElementById('select-pacote-venda').value;

    if (!pacoteId)
        return alert("Por favor, selecione um pacote!");

    // Efeito visual de carregamento no botão
    const btn = document.querySelector('#modal-vender-pacote .btn-primary');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Vinculando...';
    btn.disabled = true;

    // Monta os dados para a sua VincularPacoteServlet
    const params = new URLSearchParams();
    params.append('clienteId', clienteId);
    params.append('pacoteId', pacoteId);

    try {
        const res = await fetch('../api/clientes/vincular-pacote', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (res.ok) {
            fecharModalVenderPacote();
            alert('Pacote vendido e vinculado com sucesso!');
            carregarClientesDoBanco(); // Atualiza a tela instantaneamente com a barra de progresso!
        } else {
            alert('Erro ao vincular pacote. Verifique a conexão.');
        }
    } catch (e) {
        console.error(e);
        alert('Falha na comunicação com o servidor.');
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}