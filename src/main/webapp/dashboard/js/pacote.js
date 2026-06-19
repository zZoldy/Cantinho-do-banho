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
                        
                        <button onclick="editarPacote(${p.id})" title="Editar Pacote" style="background: transparent; border: none; color: #17a2b8; cursor: pointer; font-size: 1.1rem; transition: 0.2s; padding: 5px;" onmouseover="this.style.color='#117a8b'" onmouseout="this.style.color='#17a2b8'">
                                <i class="fas fa-edit"></i>
                            </button>
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
        exibirMensagem('Por favor, selecione a qual serviço este pacote pertence.', 'info');
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

            exibirMensagem('Pacote "' + nome + '" criado com sucesso!', 'sucess');
        } else {
            exibirMensagem('Erro ao criar pacote. O servidor retornou uma falha.', 'error');
        }
    } catch (erro) {
        console.error("Erro na requisição cadastrar pacote:", erro);
    } finally {
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
}

function editarPacote(id) {
    const pacotes = window.pacotesCadastrados || [];
    const pacote = pacotes.find(p => p.id === id);

    if (!pacote) {
        exibirMensagem('Erro: Pacote não encontrado.', 'error');
        return;
    }

    // 2. Preenche os campos de texto e números
    document.getElementById('edit-pacote-id').value = pacote.id;
    document.getElementById('edit-pacote-nome').value = pacote.nome;
    document.getElementById('edit-pacote-sessoes').value = pacote.sessoes || pacote.quantidadeSessoes || '';
    document.getElementById('edit-pacote-validade').value = pacote.validade || '';
    document.getElementById('edit-pacote-valor').value = pacote.valor || '';

    // 3. Clona as opções de serviços do Select de "Novo Pacote" para garantir os dados atualizados
    const selectNovo = document.getElementById('novo-pacote-servico');
    const selectEdit = document.getElementById('edit-pacote-servico');

    if (selectNovo && selectEdit) {
        selectEdit.innerHTML = selectNovo.innerHTML;

        // Marca o serviço atual do pacote como selecionado
        const servicoId = pacote.servico ? pacote.servico.id : '';
        if (servicoId) {
            selectEdit.value = servicoId;
        }
    }

    // 4. Exibe o modal
    const modal = document.getElementById('modal-editar-pacote');

if (!modal) {
    alert('Modal de editar pacote não encontrado.');
    return;
}

document.body.appendChild(modal);
modal.classList.remove('hidden');
}

function fecharModalEditarPacote() {
    const modal = document.getElementById('modal-editar-pacote');

    if (modal) {
        modal.classList.add('hidden');
    }

    const form = document.getElementById('form-editar-pacote');

    if (form) {
        form.reset();
    }
}
async function salvarEdicaoPacote(e) {
    e.preventDefault(); // Impede recarregamento da página

    const id = document.getElementById('edit-pacote-id').value;
    const nome = document.getElementById('edit-pacote-nome').value;
    const sessoes = document.getElementById('edit-pacote-sessoes').value;
    const validade = document.getElementById('edit-pacote-validade').value;
    const valor = document.getElementById('edit-pacote-valor').value;
    const servicoId = document.getElementById('edit-pacote-servico').value;

    const params = new URLSearchParams();
    params.append('id', id);
    params.append('nome', nome);
    params.append('sessoes', sessoes);
    params.append('validade', validade);
    params.append('valor', valor);
    params.append('servicoId', servicoId);

    const btnSubmit = document.querySelector('#form-editar-pacote button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
    btnSubmit.disabled = true;

    try {
        const res = await fetch('../api/pacotes/atualizar', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (res.ok) {
            exibirMensagem('Pacote atualizado com sucesso!', 'sucess');
            fecharModalEditarPacote();
            carregarPacotesAdmin(); // Atualiza a lista na tela
        } else {
            const msg = await res.text();
            console.error('Erro ao atualizar pacote:\n' + msg);
            exibirMensagem('Erro ao atualizar pacote.', 'error');
        }
    } catch (erro) {
        console.error("Erro ao atualizar pacote:", erro);
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
                exibirMensagem('Operação cancelada. O pacote e o saldo dos clientes estão seguros.', 'info');
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
            exibirMensagem('Pacote excluído com sucesso!', 'success');
            // 🟢 CORREÇÃO: Chama a função certa para atualizar a lista na tela
            carregarPacotesAdmin();
        } else {
            const erroMsg = await resposta.text();
            console.error(`❌ Erro no servidor:\n${erroMsg}`);
        }

    } catch (erro) {
        console.error("Erro na exclusão:", erro);
        exibirMensagem('Falha de comunicação ao tentar gerar o relatório.', 'error');
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
    // 🟢 Captura a forma de pagamento selecionada no modal
    const formaPagamento = document.getElementById('forma-pagamento-pacote')?.value;

    if (!pacoteId)
        return exibirMensagem('Por favor, selecione um pacote!', 'info');
    if (!formaPagamento)
        return exibirMensagem('Por favor, selecione a forma de pagamento!', 'info');

    const btn = document.querySelector('#modal-vender-pacote .btn-primary');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando Venda...';
    btn.disabled = true;

    const params = new URLSearchParams();
    params.append('clienteId', clienteId);
    params.append('pacoteId', pacoteId);
    params.append('formaPagamento', formaPagamento);

    try {
        const res = await fetch('../api/clientes/vincular-pacote', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (res.ok) {

            fecharModalVenderPacote();

            await listarClientesBD();
            renderClientes();

            exibirMensagem('Venda registrada e pacote vinculado com sucesso!', 'success');

        } else {
            const erro = await res.json();
            exibirMensagem('Erro: ' + (erro.erro || 'Erro ao vincular pacote.'), 'error');
        }
    } catch (e) {
        console.error(e);
        exibirMensagem('Falha na comunicação com o servidor.', 'error');
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}