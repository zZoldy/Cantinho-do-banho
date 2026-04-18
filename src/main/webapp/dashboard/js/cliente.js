let clienteSendoEditado = null;
let listaClientes = [];

async function carregarClientesDoBanco() {
    try {
        const resposta = await fetch('../api/clientes/listar');
        if (!resposta.ok)
            throw new Error("Erro ao carregar clientes");

        listaClientes = await resposta.json();

        const resPacotes = await fetch('../api/pacotes/listar');
        if (resPacotes.ok) {
            window.pacotesCadastrados = await resPacotes.json();
        } else {
            window.pacotesCadastrados = [];
        }

        if (typeof renderClientes === 'function') {
            renderClientes();
        }
    } catch (erro) {
        console.error(erro);
    }
}

async function listarClientesBD() {
    try {
        const resClientes = await fetch('../api/clientes/listar');
        if (resClientes.ok) {
            listaClientes = await resClientes.json();
        }

        const resPacotes = await fetch('../api/pacotes/listar');
        if (resPacotes.ok) {
            window.pacotesCadastrados = await resPacotes.json();
        } else {
            window.pacotesCadastrados = [];
        }
    } catch (erro) {
        console.error("Falha ao buscar Clientes/Pacotes para a agenda:", erro);
    }
}

function renderClientes() {
    const busca = (document.getElementById('busca-clientes')?.value || '').toLowerCase();

    const lista = listaClientes.filter(c => {
        const textoPets = (c.pets && c.pets.length > 0) ? c.pets.map(p => p.nome).join(' ') : '';
        const telefoneBusca = c.telefone || '';
        return (c.nome + ' ' + textoPets + ' ' + telefoneBusca).toLowerCase().includes(busca);
    });

    const el = document.getElementById('lista-clientes');
    if (!el)
        return;

    if (!lista.length) {
        el.style.display = 'block';
        el.innerHTML = `<div class="empty-state" style="padding: 40px; text-align: center; color: #888; background: #fff; border-radius: 8px; border: 1px dashed #ccc;"><i class="fas fa-users" style="font-size: 2.5rem; color: #C9A96E; margin-bottom: 15px;"></i><p style="font-size: 1.1rem;">Nenhum cliente encontrado.</p></div>`;
        return;
    }

    el.style.display = 'grid';
    el.style.gridTemplateColumns = 'repeat(auto-fill, minmax(340px, 1fr))';
    el.style.gap = '20px';
    el.style.alignItems = 'stretch';

    const pacotesLocais = window.pacotesCadastrados || [];

    el.innerHTML = lista.map(c => {
        const pac = pacotesLocais.find(p => String(p.id) === String(c.pacoteId));

        const totalServ = pac ? (pac.sessoes || pac.quantidadeSessoes || pac.quantidade_sessoes || 0) : 0;
        const usadoServ = c.sessoesUsadas || 0;
        const pendServ = Math.max(0, totalServ - usadoServ);
        const pct = totalServ ? Math.round((usadoServ / totalServ) * 100) : 0;

        const badgeVinculo = c.temUsuario
                ? `<span class="badge" style="background-color: #e8f8e8; color: #28a745; border: 1px solid #28a745; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; font-weight: 600;"><i class="fas fa-check-circle"></i> Com Acesso</span>`
                : `<span class="badge" style="background-color: #fcebeb; color: #dc3545; border: 1px solid #dc3545; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; font-weight: 600;"><i class="fas fa-exclamation-circle"></i> Sem Acesso</span>`;

        const btnAcesso = !c.temUsuario
                ? `<button onclick="event.stopPropagation(); abrirModalCriarUsuario(${c.id}, '${c.nome}')" class="btn-primary" style="background: #17a2b8; border-color: #17a2b8; padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(23,162,184,0.2);"><i class="fas fa-key"></i> Criar Acesso</button>`
                : '';

        const btnVenderPacote = c.temUsuario
                ? `<button onclick="event.stopPropagation(); abrirModalVenderPacote(${c.id}, '${c.nome}')" class="btn-secundario" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'"><i class="fas fa-box-open"></i> Vender Pacote</button>`
                : `<button onclick="event.stopPropagation(); alert('🔒 Para vender um pacote, é obrigatório criar o Acesso do Cliente primeiro!');" class="btn-secundario" style="background: #2a2a2a; color: #666; border: 1px solid #333; padding: 8px 16px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 6px; cursor: not-allowed;" title="Requer acesso ativo ao App"><i class="fas fa-lock"></i> Pacote Bloqueado</button>`;

        const nomesDosPets = (c.pets && c.pets.length > 0)
                ? c.pets.map((p, index) => {
                    let htmlPet = `<span style="font-weight: 600; color: #2c3e50; font-size: 0.95rem;">${p.nome}</span> <span style="color:#888; font-size: 0.8rem;">(${p.tipo})</span>`;
                    if (p.obs && p.obs.trim() !== "") {
                        htmlPet += `<div style="font-size: 0.8rem; color: #666; margin-left: 5px; margin-top: 5px; border-left: 3px solid #C9A96E; padding-left: 8px; background: #fff; padding-top: 4px; padding-bottom: 4px; border-radius: 0 4px 4px 0;"><em><i class="fas fa-info-circle" style="color:#C9A96E; font-size: 0.75rem; margin-right: 4px;"></i>${p.obs}</em></div>`;
                    }
                    const isUltimo = index === c.pets.length - 1;
                    const borda = isUltimo ? '' : 'border-bottom: 1px dashed #ddd; padding-bottom: 8px; margin-bottom: 8px;';
                    return `<div style="${borda}">${htmlPet}</div>`;
                }).join('')
                : '<div style="color: #999; font-style: italic; font-size: 0.9rem;">Nenhum pet cadastrado.</div>';

        const telefoneFormatado = c.telefone || 'Sem telefone';
        const linkWhats = c.telefone
                ? `<a href="https://wa.me/55${cleanTel(c.telefone)}" target="_blank" onclick="event.stopPropagation()" style="color:#25d366; text-decoration: none; font-weight: 500; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'"><i class="fab fa-whatsapp" style="font-size: 1.1rem; margin-right: 4px;"></i> ${telefoneFormatado}</a>`
                : `<span style="color: #999;"><i class="fas fa-phone-slash"></i> Sem telefone</span>`;

        let pacoteHtml = `<div style="margin-bottom: 15px; font-size: 0.9rem; color: #777; padding: 10px; background: #fafafa; border: 1px dashed #ddd; border-radius: 6px;"><i class="fas fa-box" style="color:#ccc; margin-right: 5px;"></i> <strong>Pacote:</strong> Sem pacote ativo</div>`;

        if (c.pacotes && c.pacotes.length > 0) {
            // Mapeia todos os pacotes ativos do cliente e junta num único HTML
            pacoteHtml = c.pacotes.map(pac => {
                const pendServ = pac.sessoesRestantes || 0;
                const totalServ = pac.sessoesTotais || 0;
                const usadoServ = totalServ - pendServ;
                // A percentagem agora é o que JÁ FOI USADO para encher a barra
                const pct = totalServ > 0 ? Math.round((usadoServ / totalServ) * 100) : 0;

                return `
                <div style="background: #fff; border: 1px solid #eee; border-radius: 6px; padding: 12px; margin-bottom: 10px;">
                    <div style="font-size: 0.85rem; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 600; color: #444;"><i class="fas fa-box-open" style="color: #C9A96E; margin-right: 5px;"></i> ${pac.pacoteNome || pac.servicoNome}</span>
                        <span style="font-weight:bold; background: ${pendServ > 0 ? '#fff3cd' : '#d4edda'}; color: ${pendServ > 0 ? '#856404' : '#155724'}; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem;">
                            ${pendServ > 0 ? pendServ + ' restantes' : '<i class="fas fa-check"></i> Concluído'}
                        </span>
                    </div>
                    <div style="width: 100%; background-color: #e9ecef; border-radius: 10px; height: 8px; margin-bottom: 6px; overflow: hidden;">
                        <div style="width: ${pct}%; background-color: ${pct === 100 ? '#28a745' : '#C9A96E'}; height: 100%; border-radius: 10px; transition: width 0.5s ease;"></div>
                    </div>
                    <div style="font-size: 0.75rem; color: #888; display: flex; justify-content: space-between;">
                        <span>${usadoServ} de ${totalServ} utilizados</span>
                        ${pac.validade ? `<span style="color: #dc3545;"><i class="far fa-calendar-times"></i> Vence: ${fd(pac.validade)}</span>` : ''}
                    </div>
                </div>`;
            }).join('');
        }

        return `
        <div class="cliente-card cartao-expansivel" onclick="abrirModalCliente(${c.id})" style="border: none; border-left: 5px solid #C9A96E; padding: 20px; border-radius: 8px; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.06); cursor: pointer; transition: all 0.3s ease; position: relative; display: flex; flex-direction: column; height: 100%;">
            
            <div class="ac-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                <div>
                    <h3 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 1.25rem; font-weight: 700;">
                        <i class="fas fa-user-circle" style="color:#C9A96E; margin-right: 6px;"></i> ${c.nome}
                    </h3>
                    <div style="margin-top: 4px; font-size: 0.95rem;">
                        ${linkWhats}
                    </div>
                </div>
                <div style="text-align:right;">
                    ${badgeVinculo}
                </div>
            </div>

            <div style="background: #f8f9fa; border: 1px solid #e9ecef; padding: 12px 15px; border-radius: 6px; margin-bottom: 15px;">
                <div style="margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 0.95rem; display: inline-block;">
                    <i class="fas fa-paw" style="color:#C9A96E; margin-right: 5px;"></i> Pets do Cliente
                </div>
                <div class="scroll-interno" style="max-height: 90px; overflow-y: auto; padding-right: 5px;">
                    ${nomesDosPets}
                </div>
            </div>

            <div class="scroll-interno" style="max-height: 140px; overflow-y: auto; padding-right: 5px; margin-bottom: 10px;">
                ${pacoteHtml}
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: auto; border-top: 1px solid #f1f1f1; padding-top: 15px;">
                ${btnVenderPacote}
                ${btnAcesso}
            </div>
            
        </div>`;
    }).join('');
}

// ================= FLUXO DE CRIAR ACESSO (CLIENTE) =================

function abrirModalCriarUsuario(id, nome) {
    if (typeof fecharFocoCliente === 'function')
        fecharFocoCliente();

    const cliente = listaClientes.find(c => c.id == id);

    document.getElementById('id-cliente-acesso').value = id;
    document.getElementById('nome-cliente-acesso').textContent = nome;
    document.getElementById('email-acesso').value = '';
    document.getElementById('cpf-acesso').value = '';

    // 🟢 Preenchimento ou Limpeza dos campos padronizados
    document.getElementById('cep-acesso').value = cliente?.endereco?.cep || '';
    document.getElementById('numero-acesso').value = cliente?.endereco?.numero || '';
    document.getElementById('logradouro-acesso').value = cliente?.endereco?.logradouro || '';
    document.getElementById('bairro-acesso').value = cliente?.endereco?.bairro || '';
    document.getElementById('cidade-acesso').value = cliente?.endereco?.cidade || '';
    document.getElementById('uf-acesso').value = cliente?.endereco?.uf || '';

    document.getElementById('modal-acesso').classList.remove('hidden');
}

function fecharModalAcesso() {
    document.getElementById('modal-acesso').classList.add('hidden');
}

function mascaraCPF(input) {
    let v = input.value.replace(/\D/g, "");
    if (v.length > 11)
        v = v.substring(0, 11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    input.value = v;
}

async function salvarAcessoCliente(e) {
    e.preventDefault();

    const btn = document.getElementById('btn-gerar-acesso');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A gerar...';
    btn.disabled = true;

    const id = document.getElementById('id-cliente-acesso').value;
    const email = document.getElementById('email-acesso').value;
    const cpf = document.getElementById('cpf-acesso').value;

    const params = new URLSearchParams();
    params.append('clienteId', id);
    params.append('email', email);
    params.append('cpf', cpf);

    params.append('cep', document.getElementById('cep-acesso').value);
    params.append('logradouro', document.getElementById('logradouro-acesso').value);
    params.append('numero', document.getElementById('numero-acesso').value);
    params.append('bairro', document.getElementById('bairro-acesso').value);
    params.append('cidade', document.getElementById('cidade-acesso').value);
    params.append('uf', document.getElementById('uf-acesso').value);

    try {
        const resposta = await fetch('../api/clientes/criar-acesso', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (!resposta.ok) {
            const erroTexto = await resposta.text();
            throw new Error(erroTexto);
        }

        const dados = await resposta.json();

        fecharModalAcesso();
        carregarClientesDoBanco();

        const mensagem = `🐾 *Cantinho do Banho*\n\nOlá! O seu acesso ao nosso aplicativo foi criado com sucesso! 🎉\n\n*Seu Login:* ${email}\n*Senha temporária:* ${dados.senha}\n\nRecomendamos que altere a senha no seu primeiro acesso.\n\nBem-vindo(a) à família!`;

        if (typeof openWA === 'function') {
            openWA(dados.telefone, mensagem);
        } else {
            alert(`Acesso criado! Senha gerada: ${dados.senha}`);
        }

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao criar o acesso. Verifique se o Email ou CPF já existem no sistema.");
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// ================= FLUXO DE NOVO CLIENTE =================
function abrirModalNovoCliente() {
    if (typeof fecharFocoCliente === 'function') {
        fecharFocoCliente();
    }

    document.getElementById('nome-novo-cliente').value = '';
    document.getElementById('telefone-novo-cliente').value = '';
    document.getElementById('email-novo-cliente').value = '';
    document.getElementById('cpf-novo-cliente').value = '';

    document.getElementById('cep-novo-cliente').value = '';
    document.getElementById('logradouro-novo-cliente').value = '';
    document.getElementById('numero-novo-cliente').value = '';
    document.getElementById('bairro-novo-cliente').value = '';
    document.getElementById('cidade-novo-cliente').value = '';
    document.getElementById('uf-novo-cliente').value = '';

    document.getElementById('modal-novo-cliente').classList.remove('hidden');
}

function fecharModalNovoCliente() {
    document.getElementById('modal-novo-cliente').classList.add('hidden');
}

async function salvarNovoCliente(e) {
    e.preventDefault();

    const btn = document.getElementById('btn-salvar-cliente');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A guardar...';
    btn.disabled = true;

    const nome = document.getElementById('nome-novo-cliente').value;
    const telefone = document.getElementById('telefone-novo-cliente').value;
    const email = document.getElementById('email-novo-cliente').value;
    const cpf = document.getElementById('cpf-novo-cliente').value;

    const params = new URLSearchParams();
    params.append('nome', nome);
    params.append('telefone', telefone);
    params.append('email', email);
    params.append('cpf', cpf);

    params.append('cep', document.getElementById('cep-novo-cliente').value);
    params.append('logradouro', document.getElementById('logradouro-novo-cliente').value);
    params.append('numero', document.getElementById('numero-novo-cliente').value);
    params.append('bairro', document.getElementById('bairro-novo-cliente').value);
    params.append('cidade', document.getElementById('cidade-novo-cliente').value);
    params.append('uf', document.getElementById('uf-novo-cliente').value);

    try {
        const resposta = await fetch('../api/clientes/cadastrar', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            const dados = await resposta.json();

            fecharModalNovoCliente();
            await carregarClientesDoBanco();

            if (dados.senha) {
                const msg = `🐾 *Cantinho do Banho*\n\nOlá ${nome}! O seu cadastro foi realizado com sucesso! 🎉\n\n*Seu Login:* ${email}\n*Senha temporária:* ${dados.senha}\n\nRecomendamos que altere a senha no seu primeiro acesso.\n\nBem-vindo(a) à família!`;

                if (typeof openWA === 'function') {
                    openWA(telefone, msg);
                } else {
                    alert(`Cliente cadastrado! Senha do App gerada: ${dados.senha}`);
                }
            } else {
                alert("Cliente cadastrado com sucesso (Sem acesso ao App).");
            }

        } else {
            const erroTexto = await resposta.text();
            throw new Error(erroTexto || 'Erro desconhecido ao salvar.');
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao cadastrar cliente: " + erro.message);
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

async function salvarEdicaoCliente() {
    const btn = document.getElementById('btn-confirmar-edicao');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gravando...';

    const params = new URLSearchParams();
    params.append('id', clienteSendoEditado.id);
    params.append('nome', document.getElementById('nome-edit').value);
    params.append('telefone', document.getElementById('telefone-edit').value);
    params.append('cep', document.getElementById('cep-edit').value);
    params.append('logradouro', document.getElementById('logradouro-edit').value);
    params.append('numero', document.getElementById('numero-edit').value);
    params.append('bairro', document.getElementById('bairro-edit').value);
    params.append('cidade', document.getElementById('cidade-edit').value);
    params.append('uf', document.getElementById('uf-edit').value);

    try {
        const response = await fetch('../api/clientes/atualizar', {
            method: 'POST',
            body: params
        });

        if (response.ok) {
            alert("✅ Cliente atualizado!");
            fecharModalCliente();
            await carregarClientesDoBanco();
        } else {
            alert("Erro ao salvar alterações.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

function abrirModalCliente(id) {
    clienteSendoEditado = listaClientes.find(c => c.id === id);

    if (!clienteSendoEditado) {
        console.error("Cliente não encontrado na listaClientes!");
        return;
    }

    const container = document.getElementById('conteudo-modal-cliente');
    const btnEdicao = document.getElementById('btn-modo-edicao');
    const footer = document.getElementById('footer-edicao-cliente');

    if (footer)
        footer.classList.add('hidden');
    if (btnEdicao)
        btnEdicao.classList.remove('hidden');

    let htmlPets = '';
    if (clienteSendoEditado.pets && clienteSendoEditado.pets.length > 0) {
        htmlPets = clienteSendoEditado.pets.map(p => `
            <div style="background: #1e1e1e; border: 1px solid #333; padding: 15px; border-radius: 8px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="color: #C9A96E; font-size: 1.1rem;"><i class="fas fa-paw"></i> ${p.nome}</strong>
                    <span class="badge" style="background: #333; color: #ccc;">${p.tipo}</span>
                </div>
                <div style="margin-bottom: 10px;">
                    <textarea id="obs-pet-${p.id}" rows="2" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #444; background: #111; color: #eee;">${p.obs || ''}</textarea>
                </div>
                <div style="text-align: right;">
                    <button onclick="salvarObsPet(${p.id}, this)" class="btn-primary" style="background: #17a2b8; font-size: 0.85rem;">
                        <i class="fas fa-save"></i> Salvar Obs
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        htmlPets = '<div style="padding: 15px; text-align: center; color: #888;">Nenhum pet cadastrado.</div>';
    }

    container.innerHTML = `
        <div id="view-mode">
            <div style="margin-bottom: 20px;">
                <h4 style="color: #eee; margin: 0 0 5px 0; font-size: 1.3rem;">${clienteSendoEditado.nome}</h4>
                <div style="color: #aaa; font-size: 0.95rem;"><i class="fab fa-whatsapp" style="color: #25d366;"></i> ${clienteSendoEditado.telefone}</div>
                ${clienteSendoEditado.temUsuario ? `<span class="badge" style="background-color: rgba(40, 167, 69, 0.15); color: #28a745; margin-top: 8px; display: inline-block;"><i class="fas fa-check-circle"></i> Possui Login no App</span>` : ''}
            </div>

            <h5 style="color: #C9A96E; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 10px;">
                <i class="fas fa-map-marker-alt"></i> Endereço
            </h5>
            <div style="color: #ccc; font-size: 0.9rem; margin-bottom: 20px;">
                ${clienteSendoEditado.endereco ? `
                    <p style="margin: 3px 0;">${clienteSendoEditado.endereco.logradouro}, ${clienteSendoEditado.endereco.numero}</p>
                    <p style="margin: 3px 0;">${clienteSendoEditado.endereco.bairro} - ${clienteSendoEditado.endereco.cidade}</p>
                ` : '<p style="color: #666; font-style: italic;">Endereço não cadastrado.</p>'}
            </div>
            
            <h5 style="color: #eee; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 15px;"><i class="fas fa-dog"></i> Pets do Cliente</h5>
            ${htmlPets}
        </div>
    `;

    btnEdicao.onclick = () => alternarParaEdicao();

    document.getElementById('modal-detalhes-cliente').classList.remove('hidden');
}

function alternarParaEdicao() {
    if (!clienteSendoEditado)
        return;

    const container = document.getElementById('conteudo-modal-cliente');
    const btnEdicao = document.getElementById('btn-modo-edicao');
    const footer = document.getElementById('footer-edicao-cliente');

    if (btnEdicao)
        btnEdicao.classList.add('hidden');
    if (footer)
        footer.classList.remove('hidden');

    container.innerHTML = `
        <div id="edit-mode">
            <div class="field" style="margin-bottom: 12px;">
                <label class="form-label">Nome Completo</label>
                <input type="text" id="nome-edit" class="form-ctrl" value="${clienteSendoEditado.nome}">
            </div>
            <div class="field" style="margin-bottom: 15px;">
                <label class="form-label">WhatsApp</label>
                <input type="text" id="telefone-edit" class="form-ctrl" value="${clienteSendoEditado.telefone}" oninput="mascaraTelefone(this)">
            </div>

            <div style="background: #111; padding: 15px; border-radius: 8px; border: 1px solid #333;">
                <h4 style="color: #C9A96E; margin-top: 0; margin-bottom: 12px; font-size: 0.9rem;">Editar Endereço</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <div class="field">
                        <label class="form-label">CEP</label>
                        <input type="text" id="cep-edit" class="form-ctrl" value="${clienteSendoEditado.endereco?.cep || ''}" onblur="buscarCEP(this.value, 'edit')">
                    </div>
                    <div class="field">
                        <label class="form-label">Número</label>
                        <input type="text" id="numero-edit" class="form-ctrl" value="${clienteSendoEditado.endereco?.numero || ''}">
                    </div>
                </div>

                <div class="field" style="margin-bottom: 10px;">
                    <label class="form-label">Rua / Logradouro</label>
                    <input type="text" id="logradouro-edit" class="form-ctrl" value="${clienteSendoEditado.endereco?.logradouro || ''}">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div class="field">
                        <label class="form-label">Bairro</label>
                        <input type="text" id="bairro-edit" class="form-ctrl" value="${clienteSendoEditado.endereco?.bairro || ''}">
                    </div>
                    <div class="field">
                        <label class="form-label">Cidade</label>
                        <div style="display: flex; gap: 4px;">
                            <input type="text" id="cidade-edit" class="form-ctrl" value="${clienteSendoEditado.endereco?.cidade || ''}">
                            <input type="text" id="uf-edit" class="form-ctrl" style="width: 45px;" value="${clienteSendoEditado.endereco?.uf || ''}">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function cancelarEdicao() {
    if (clienteSendoEditado) {
        abrirModalCliente(clienteSendoEditado.id);
    }
}

function fecharModalCliente() {
    document.getElementById('modal-detalhes-cliente').classList.add('hidden');
}

async function salvarObsPet(petId, btn) {
    const obs = document.getElementById(`obs-pet-${petId}`).value;
    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    btn.disabled = true;

    const params = new URLSearchParams();
    params.append('id', petId);
    params.append('obs', obs);

    try {
        const resposta = await fetch('../api/pets/atualizar-obs', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            btn.innerHTML = '<i class="fas fa-check"></i> Salvo!';
            btn.style.background = '#28a745';

            // Volta o botão ao normal após 2 segundos
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '#17a2b8';
                btn.disabled = false;
            }, 2000);
        } else {
            throw new Error('Falha no servidor');
        }
    } catch (erro) {
        alert('Erro ao salvar a observação do pet.');
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

function fecharFocoCliente() {
    // 1. Fecha o modal de detalhes do cliente (se estiver aberto)
    const modalDetalhes = document.getElementById('modal-detalhes-cliente');
    if (modalDetalhes && !modalDetalhes.classList.contains('hidden')) {
        modalDetalhes.classList.add('hidden');
    }

    // 2. Remove qualquer classe de "foco" ou "expansão" dos cartões HTML (caso tenha CSS para isso)
    document.querySelectorAll('.cliente-card').forEach(card => {
        card.classList.remove('focado');
        card.classList.remove('expandido');
    });
}

function mascaraTelefone(input) {
    let v = input.value.replace(/\D/g, ""); // Remove tudo que não é dígito
    if (v.length > 11)
        v = v.substring(0, 11);
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    input.value = v;
}

async function buscarCEP(cep, prefixo) {
    cep = cep.replace(/\D/g, '');
    if (cep.length !== 8)
        return;

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (!data.erro) {
            // Buscamos os elementos pelos IDs padronizados
            const elRua = document.getElementById(`logradouro-${prefixo}`);
            const elBairro = document.getElementById(`bairro-${prefixo}`);
            const elCidade = document.getElementById(`cidade-${prefixo}`);
            const elUf = document.getElementById(`uf-${prefixo}`);
            const elNum = document.getElementById(`numero-${prefixo}`);

            // Só preenche se o elemento existir na tela
            if (elRua)
                elRua.value = data.logradouro || '';
            if (elBairro)
                elBairro.value = data.bairro || '';
            if (elCidade)
                elCidade.value = data.localidade || '';
            if (elUf)
                elUf.value = data.uf || '';
            if (elNum)
                elNum.focus();
        }
    } catch (e) {
        console.error("Erro ao buscar CEP:", e);
    }
}


function abrirModalNovoPetParaCliente() {
    if (!clienteSendoEditado)
        return;

    document.getElementById('form-pet').reset();
    document.getElementById('pet-cliente-id').value = clienteSendoEditado.id;
    document.getElementById('modal-pet').classList.remove('hidden');
}

function fecharModalPet() {
    document.getElementById('modal-pet').classList.add('hidden');
}

async function salvarPet(event) {
    event.preventDefault();

    const petData = {
        nome: document.getElementById('pet-nome').value,
        tipo: document.getElementById('pet-tipo').value,
        raca: document.getElementById('pet-raca').value,
        porte: document.getElementById('pet-porte').value,
        obs: document.getElementById('pet-obs').value,
        clienteId: document.getElementById('pet-cliente-id').value
    };

    try {
        const response = await fetch('../api/pets/salvar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(petData)
        });

        if (response.ok) {
            alert("🐾 Pet cadastrado com sucesso!");
            fecharModalPet();
            fecharModalCliente();
        } else {
            alert("Erro ao salvar pet.");
        }
    } catch (e) {
        console.error(e);
    }
}