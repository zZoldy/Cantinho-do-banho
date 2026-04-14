// ==========================================
// LÓGICA DO ESTOQUE
// ==========================================
let listaEstoque = [];
let listaFornecedoresLocal = []; // Guarda a lista na memória para podermos editar depois

async function carregarEstoque() {
    try {
        const response = await fetch('../api/estoque/listar');
        if (response.ok) {
            listaEstoque = await response.json();
            renderEstoque();
        }
    } catch (e) {
        console.error("Erro ao carregar estoque:", e);
    }
}

async function listarEstoque() {
    try {
        const response = await fetch('../api/estoque/listar');
        if (response.ok) {
            listaEstoque = await response.json();
        }
    } catch (e) {
        console.error("Erro ao carregar estoque:", e);
    }
}

function renderEstoque() {
    const el = document.getElementById('lista-estoque');
    if (!el)
        return;

    if (listaEstoque.length === 0) {
        el.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:#888;">Nenhum produto em estoque.</td></tr>`;
        return;
    }

    el.innerHTML = listaEstoque.map(item => {
        const isEstoqueBaixo = item.quantidadeAtual <= item.quantidadeMinima;

        const bgLinha = isEstoqueBaixo ? 'rgba(220,53,69,0.03)' : 'transparent';
        const corQtd = isEstoqueBaixo ? '#dc3545' : '#333';

        const badgeStatus = isEstoqueBaixo
                ? `<span style="background-color: rgba(220,53,69,0.15); color: #dc3545; border: 1px solid #dc3545; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; font-weight: 600;"><i class="fas fa-exclamation-triangle"></i> Faltando</span>`
                : `<span style="background-color: rgba(40,167,69,0.15); color: #28a745; border: 1px solid #c3e6cb; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; font-weight: 600;"><i class="fas fa-check"></i> Normal</span>`;

        return `
            <tr style="border-bottom: 1px solid #eee; background: ${bgLinha};">
                <td style="padding: 15px 10px;">
                    <div style="font-weight: 600; font-size: 1.05rem;">${item.produto.nome}</div>
                    <div style="font-size: 0.85rem; color: #888; margin-top: 3px;">R$ ${(item.produto.precoVenda || 0).toFixed(2)}</div>
                </td>
                <td style="padding: 15px 10px; color: #555; font-size: 0.9rem;">
                    ${item.produto.fornecedor ? item.produto.fornecedor.nome : '--'}
                </td>
                <td style="padding: 15px 10px; text-align: center; font-size: 1.3rem; font-weight: 700; color: ${corQtd};">
                    ${item.quantidadeAtual}
                </td>
                <td style="padding: 15px 10px; text-align: center;">
                    ${badgeStatus}
                    <div style="font-size: 0.75rem; color: #888; margin-top: 4px;">Min: ${item.quantidadeMinima}</div>
                </td>
                <td style="padding: 15px 10px; text-align: right;">
                    <div style="display: flex; gap: 8px; justify-content: flex-end;">
                        <button onclick="movimentarEstoque(${item.produto.id}, 'SAIDA')" style="background: transparent; color: #dc3545; border: 1px solid #dc3545; padding: 6px 12px; border-radius: 6px; cursor: pointer; transition: 0.2s;" title="Registrar Consumo">
                            <i class="fas fa-minus"></i>
                        </button>
                        <button onclick="movimentarEstoque(${item.produto.id}, 'ENTRADA')" style="background: #007bff; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer;" title="Registrar Compra">
                            <i class="fas fa-plus"></i> Entrada
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function abrirModalProduto() {
    const modal = document.getElementById('modal-produto');
    if (modal)
        modal.classList.remove('hidden');
}

function fecharModalProduto() {
    const modal = document.getElementById('modal-produto');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('form-produto').reset();
    }
}

async function movimentarEstoque(produtoId, tipo) {
    const acao = tipo === 'ENTRADA' ? 'adicionar (Entrada)' : 'retirar (Consumo)';
    const qtd = prompt(`Quantas unidades deseja ${acao}?`);

    if (!qtd || isNaN(qtd) || parseInt(qtd) <= 0)
        return;

    try {
        const res = await fetch('../api/estoque/movimentar', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `produtoId=${produtoId}&tipo=${tipo}&quantidade=${parseInt(qtd)}`
        });

        if (res.ok) {
            carregarEstoque(); // Atualiza a tela após sucesso
        } else {
            alert("Erro: " + await res.text());
        }
    } catch (e) {
        console.error(e);
    }
}

async function carregarFornecedoresParaModal() {
    try {
        const response = await fetch('../api/fornecedores/listar');
        if (response.ok) {
            listaFornecedoresLocal = await response.json();
            const select = document.getElementById('prod-fornecedor');
            if (select) {
                // Preenche o campo select com as opções vindas do banco
                select.innerHTML = '<option value="">Sem Fornecedor / Fabricação Própria</option>' +
                        listaFornecedoresLocal.map(f => `<option value="${f.id}">${f.nome}</option>`).join('');
            }
        }
    } catch (e) {
        console.error("Erro ao carregar fornecedores:", e);
    }
}

async function salvarProduto(e) {
    e.preventDefault();

    const dados = new URLSearchParams();
    dados.append('nome', document.getElementById('prod-nome').value);
    dados.append('precoVenda', document.getElementById('prod-preco').value || '0');
    dados.append('fornecedorId', document.getElementById('prod-fornecedor').value || '');
    dados.append('qtdInicial', document.getElementById('prod-qtd').value || '0');
    dados.append('qtdMinima', document.getElementById('prod-minimo').value || '5');

    try {
        const response = await fetch('../api/produto/cadastrar', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: dados
        });

        if (response.ok) {
            fecharModalProduto();      // Fecha a janelinha
            await carregarEstoque();   // Recarrega a tabela com o novo produto
            alert("Produto cadastrado com sucesso!");
        } else {
            const err = await response.text();
            alert("Erro ao salvar produto: " + err);
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}














// ==========================================
// LÓGICA DE FORNECEDORES (CONFIGURAÇÕES)
// ==========================================

async function listarFornecedores() {
    try {
        const response = await fetch('../api/fornecedores/listar');
        if (response.ok) {
            listaFornecedoresLocal = await response.json();
        }
    } catch (e) {
        console.error("Erro ao carregar estoque:", e);
    }
}


async function carregarFornecedoresConfig() {
    const el = document.getElementById('tbody-fornecedores-config');
    if (!el)
        return;

    try {
        const response = await fetch('../api/fornecedores/listar');
        if (response.ok) {
            listaFornecedoresLocal = await response.json();

            if (listaFornecedoresLocal.length === 0) {
                el.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:30px; color:#888;">Nenhum fornecedor cadastrado.</td></tr>`;
                return;
            }

            // Agora desenhamos linhas de Tabela (<tr>) em vez de divs
            el.innerHTML = listaFornecedoresLocal.map(f => `
                <tr style="border-bottom: 1px solid #2a2a2a;">
                    <td style="padding: 12px;">
                        <div style="font-weight: 600; color: #eee;">${f.nome}</div>
                        <div style="font-size: 0.75rem; color: #888;">${f.email || 'Sem e-mail'}</div>
                    </td>
                    <td style="padding: 12px; color: #888; font-size: 0.85rem;">${f.cnpj || '--'}</td>
                    <td style="padding: 12px; color: #888; font-size: 0.85rem;">${f.telefone || '--'}</td>
                    <td style="padding: 12px; text-align: right;">
                        <button onclick="editarFornecedor(${f.id})" style="background: transparent; border: none; color: #007bff; cursor: pointer; font-size: 1.1rem; padding: 5px;" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) {
        console.error("Erro ao carregar fornecedores:", e);
        el.innerHTML = `<tr><td colspan="4" style="color:#dc3545; text-align:center;">Erro ao carregar lista.</td></tr>`;
    }
}

function abrirModalFornecedor() {
    const modal = document.getElementById('modal-fornecedor');
    if (modal)
        modal.classList.remove('hidden');
}

function fecharModalFornecedor() {
    const modal = document.getElementById('modal-fornecedor');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('form-fornecedor').reset();

        // Limpa o ID escondido para não afetar futuros cadastros
        const idField = document.getElementById('forn-id');
        if (idField)
            idField.value = '';
    }
}

function prepararNovoFornecedor() {
    fecharModalFornecedor();
    document.querySelector('#modal-fornecedor h3').innerHTML = '<i class="fas fa-truck" style="color:#C9A96E; margin-right: 8px;"></i> Novo Fornecedor';
    abrirModalFornecedor();
}

function editarFornecedor(id) {
    const forn = listaFornecedoresLocal.find(f => f.id === id);
    if (!forn)
        return;

    // Preenche os inputs com os dados que vieram do Java
    const idField = document.getElementById('forn-id');
    if (idField)
        idField.value = forn.id;

    document.getElementById('forn-nome').value = forn.nome;
    document.getElementById('forn-cnpj').value = forn.cnpj || '';
    document.getElementById('forn-tel').value = forn.telefone || '';
    document.getElementById('forn-email').value = forn.email || '';
    document.getElementById('forn-end').value = forn.endereco || '';

    // Muda o título do Modal
    document.querySelector('#modal-fornecedor h3').innerHTML = '<i class="fas fa-edit" style="color:#007bff; margin-right: 8px;"></i> Editar Fornecedor';
    abrirModalFornecedor();
}

async function salvarFornecedor(e) {
    e.preventDefault();

    // Vê se existe um ID preenchido. Se sim = Atualizar. Se não = Cadastrar.
    const idField = document.getElementById('forn-id');
    const id = idField ? idField.value : '';
    const rota = id ? 'atualizar' : 'cadastrar';

    const dados = new URLSearchParams();
    if (id)
        dados.append('id', id);
    dados.append('nome', document.getElementById('forn-nome').value);
    dados.append('cnpj', document.getElementById('forn-cnpj').value);
    dados.append('telefone', document.getElementById('forn-tel').value);
    dados.append('email', document.getElementById('forn-email').value);
    dados.append('endereco', document.getElementById('forn-end').value);

    try {
        const response = await fetch(`../api/fornecedor/${rota}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: dados
        });

        if (response.ok) {
            fecharModalFornecedor();
            alert(id ? "Dados atualizados com sucesso!" : "Fornecedor guardado com sucesso!");

            await carregarFornecedoresConfig();

            if (typeof carregarFornecedoresParaModal === 'function') {
                carregarFornecedoresParaModal();
            }
        } else {
            alert("Erro: " + await response.text());
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}