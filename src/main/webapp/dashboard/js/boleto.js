// =====================================================================
// MÓDULO DE VENDAS MANUAIS E NOTAS FISCAIS
// =====================================================================

async function emitirNotaFiscal(vendaId, btn) {
    if (!confirm("Deseja transmitir os dados desta venda para a SEFAZ?"))
        return;

    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Transmitindo...';
    btn.disabled = true;

    try {
        const params = new URLSearchParams();
        params.append('vendaId', vendaId);

        // Chamada real para o Backend Java
        const resposta = await fetch('../api/vendas/emitir-nf', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            btn.outerHTML = `<span style="font-size: 0.75rem; color: #28a745; font-weight: bold;"><i class="fas fa-check-circle"></i> Emitida</span>`;
            // Recarrega o estado limpo
            if (typeof navigateTo === 'function')
                navigateTo('vendas');
        } else {
            throw new Error("Falha na comunicação com a SEFAZ ou com o Servidor.");
        }
    } catch (e) {
        console.error(e);
        alert(e.message);
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

function renderVendasManuais(listaVendas) {
    window.vendasAtual = listaVendas || [];
    const container = document.getElementById('lista-vendas-nf');
    if (!container)
        return;

    let vendasFiltradas = [...window.vendasAtual];
    const busca = (document.getElementById('busca-vendas-nf')?.value || '').toLowerCase();
    const filtroNf = document.getElementById('filtro-nf-venda')?.value;

    if (busca) {
        vendasFiltradas = vendasFiltradas.filter(v =>
            (v.descricao || '').toLowerCase().includes(busca) ||
                    (v.cliente || v.clienteNome || '').toLowerCase().includes(busca)
        );
    }

    if (filtroNf) {
        const boolStatus = filtroNf === 'true';
        vendasFiltradas = vendasFiltradas.filter(v => v.nfEmitida === boolStatus);
    }

    if (vendasFiltradas.length === 0) {
        container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px; color:#888;">Nenhuma venda encontrada.</td></tr>`;
        return;
    }

    container.innerHTML = vendasFiltradas.sort((a, b) => (b.data || '').localeCompare(a.data || '')).map(v => {
        let dt = v.data || v.dataVenda || '';
        if (dt.includes('T'))
            dt = dt.split('T')[0];
        const dataStr = dt ? dt.split('-').reverse().join('/') : '--/--/----';

        let valorFloat = parseFloat(String(v.valor || v.valorTotal || 0).replace(',', '.'));
        const valorFmt = parseFloat(valorFloat).toFixed(2).replace('.', ',');

        const clienteNome = v.cliente || v.clienteNome || 'Consumidor Final';
        const descricao = v.descricao || (v.itens ? v.itens.map(i => i.nome).join(', ') : 'Venda de Produtos');

        // Botão de emissão inteligente
        const nfBadge = v.nfEmitida
                ? `<span style="font-size: 0.75rem; color: #28a745; font-weight: bold;"><i class="fas fa-file-invoice-dollar"></i> Emitida</span>`
                : `<button onclick="emitirNotaFiscal(${v.id}, this)" class="btn-primary" style="background: #6f42c1; border: none; padding: 4px 10px; font-size: 0.7rem;"><i class="fas fa-file-export"></i> Emitir NF</button>`;

        // BOTÃO DO PDF DE RECIBO
        const btnPdf = `
            <button onclick="gerarComprovanteVenda(${v.id}); event.stopPropagation();" title="Imprimir Recibo da Venda" style="background: none; border: 1px solid rgb(51, 51, 51); color: rgb(136, 136, 136); border-radius: 6px; padding: 5px 10px; font-size: 0.72rem; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 4px;" onmouseover="this.style.borderColor = '#C9A96E';this.style.color = '#C9A96E'" onmouseout="this.style.borderColor = '#333';this.style.color = '#888'">
                <i class="fas fa-file-pdf"></i> PDF
            </button>
        `;

        return `
        <tr style="border-bottom: 1px solid #222;">
            <td style="color: #aaa;">${dataStr}</td>
            <td><strong>${clienteNome}</strong></td>
            <td>${descricao}</td>
            <td style="color:#28a745; font-weight:bold;">R$ ${valorFmt}</td>
            <td>${nfBadge}</td>
            <td style="text-align: right;">${btnPdf}</td>
        </tr>`;
    }).join('');
}

function gerarComprovanteVenda(idVenda) {
    const vendasManuais = typeof window.vendasAtual !== 'undefined' ? window.vendasAtual : [];
    const venda = vendasManuais.find(v => String(v.id) === String(idVenda));

    if (!venda) {
        alert("Venda não encontrada para gerar o PDF.");
        return;
    }

    let dataLimpa = venda.data || venda.dataVenda || '';
    if (dataLimpa.includes('T'))
        dataLimpa = dataLimpa.split('T')[0];
    const dataFmt = typeof fd === 'function' ? fd(dataLimpa) : dataLimpa.split('-').reverse().join('/');

    let valorFloat = parseFloat(String(venda.valor || venda.valorTotal || 0).replace(',', '.'));

    const clienteNome = venda.cliente || venda.clienteNome || 'Consumidor Final';
    const formaPag = (venda.formaPagamento || venda.formaPag || 'Não informada').replace('_', ' ');
    const statusNF = venda.nfEmitida ? 'Emitida' : 'Pendente';

    // Monta as linhas da tabela de itens (caso seja carrinho com vários produtos)
    let itensHtml = '';
    if (venda.itens && venda.itens.length > 0) {
        venda.itens.forEach(item => {
            const precoUni = parseFloat(item.preco || item.valorUnitario || 0);
            const qtd = parseInt(item.quantidade || 1);
            const subtotal = parseFloat(item.subtotal || (precoUni * qtd) || 0);

            itensHtml += `
                <tr>
                    <td style="padding: 8px 8px; border-bottom: 1px solid #eee;">${qtd}x</td>
                    <td style="padding: 8px 8px; border-bottom: 1px solid #eee;"><strong>${item.nome || item.nomeProduto}</strong></td>
                    <td style="padding: 8px 8px; border-bottom: 1px solid #eee; text-align: right;">R$ ${precoUni.toFixed(2).replace('.', ',')}</td>
                    <td style="padding: 8px 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
                </tr>
            `;
        });
    } else {
        // Fallback caso a venda seja simples e não possua o array "itens"
        itensHtml = `
            <tr>
                <td style="padding: 8px 8px; border-bottom: 1px solid #eee;">1x</td>
                <td style="padding: 8px 8px; border-bottom: 1px solid #eee;"><strong>${venda.descricao || 'Produtos da Loja'}</strong></td>
                <td style="padding: 8px 8px; border-bottom: 1px solid #eee; text-align: right;">R$ ${valorFloat.toFixed(2).replace('.', ',')}</td>
                <td style="padding: 8px 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">R$ ${valorFloat.toFixed(2).replace('.', ',')}</td>
            </tr>
        `;
    }

    let body = `
        <div class="ph">
            <div class="pt">🐾 Cantinho do Banho</div>
            <div class="ps">Recibo de Venda Balcão · #${venda.id || 'S/N'}</div>
        </div>
        
        <div style="background:#f8f6f2; border-radius:7px; padding:16px; margin-bottom:20px; border:1px solid #e8e0d0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                    <td style="padding: 6px 0; border-bottom: 1px dashed #ddd; width: 50%;">
                        <strong style="color: #555;">Cliente / Consumidor:</strong> <br>
                        <span style="font-size: 15px; color: #111; font-weight: bold;"><i class="fas fa-user" style="color: #C9A96E; font-size: 13px;"></i> ${clienteNome}</span>
                    </td>
                    <td style="padding: 6px 0; border-bottom: 1px dashed #ddd; width: 50%;">
                        <strong style="color: #555;">Data da Compra:</strong> <br>
                        <span style="font-size: 14px; color: #333;">${dataFmt}</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 0 0 0; width: 50%;">
                        <strong style="color: #555;">Situação da Nota Fiscal:</strong> <br>
                        <span class="${venda.nfEmitida ? 'bv' : 'ba'}" style="font-size: 11px; display: inline-block; margin-top: 4px; text-transform: uppercase;">${statusNF}</span>
                    </td>
                    <td style="padding: 10px 0 0 0; width: 50%;">
                        <strong style="color: #555;">Vendedor/Caixa:</strong> <br>
                        <span style="color: #333;">${venda.vendedor || venda.funcionario || 'Administração'}</span>
                    </td>
                </tr>
            </table>
        </div>

        <div class="sec">Itens Adquiridos</div>
        
        <table style="margin-bottom: 25px; width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
                <tr style="background: #f1f1f1;">
                    <th style="padding: 10px 8px; text-align: left; border-radius: 4px 0 0 4px;">Qtd</th>
                    <th style="padding: 10px 8px; text-align: left;">Produto / Descrição</th>
                    <th style="padding: 10px 8px; text-align: right;">V. Unit.</th>
                    <th style="padding: 10px 8px; text-align: right; border-radius: 0 4px 4px 0;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${itensHtml}
            </tbody>
        </table>

        <div style="background: #fafaf8; padding: 15px; border-radius: 6px; border: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
                <span style="display: block; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Forma de Pagamento</span>
                <strong style="color: #333; font-size: 13px;">${formaPag}</strong>
            </div>
            <div style="text-align: right;">
                <span style="display: block; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Total da Compra</span>
                <strong style="color: #28a745; font-size: 18px;">R$ ${valorFloat.toFixed(2).replace('.', ',')}</strong>
            </div>
        </div>
        
        <div style="margin-top: 40px; text-align: center; color: #888; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px;">
            Documento gerado em ${new Date().toLocaleString('pt-BR')} <br>
            <strong>🐾 Cantinho do Banho</strong> - Volte sempre!
        </div>
    `;

    if (typeof pdfWin === 'function') {
        pdfWin('Recibo_Venda_' + idVenda, body);
    } else {
        alert("Função de PDF não encontrada no sistema.");
    }
}

// =====================================================================
// LÓGICA DO MODAL DE VENDAS MANUAIS (COMBOBOX DE PRODUTOS)
// =====================================================================

function carregarProdutosParaVenda() {
    const datalist = document.getElementById('lista-produtos-venda');
    if (!datalist)
        return;

    const produtos = typeof listaEstoque !== 'undefined' ? listaEstoque : [];

    datalist.innerHTML = produtos.map(p => {
        if (!p.produto)
            return '';

        const preco = parseFloat(p.produto.precoVenda || 0).toFixed(2);
        const nomeProduto = p.produto.nome || 'Produto sem nome';
        const estoqueAtual = p.quantidadeAtual || 0;

        return `<option value="${nomeProduto}" data-preco="${preco}">Estoque: ${estoqueAtual}</option>`;
    }).join('');
}

async function abrirModalVenda() {
    if (typeof listarEstoque === 'function') {
        await listarEstoque(); // Busca o estoque fresco do banco
    }

    document.getElementById('modal-venda').classList.remove('hidden');
    document.getElementById('form-venda').reset();

    // Garante que o dropdown comece escondido ao abrir o modal
    const dropdown = document.getElementById('dropdown-produtos-venda');
    if (dropdown) {
        dropdown.classList.add('hidden');
    }
}

function filtrarProdutosDropdown() {
    const input = document.getElementById('venda-produto');
    const inputId = document.getElementById('venda-produto-id');
    const dropdown = document.getElementById('dropdown-produtos-venda');

    if (!input || !dropdown)
        return;

    // TRAVA: Limpa o ID se o usuário voltar a digitar. Obriga a clicar na lista.
    if (inputId)
        inputId.value = '';

    const filtro = input.value.toLowerCase();
    const produtosAtuais = typeof listaEstoque !== 'undefined' ? listaEstoque : [];

    // Filtra garantindo que o objeto 'produto' existe dentro do array
    const filtrados = produtosAtuais.filter(p => {
        if (!p.produto)
            return false;
        return p.produto.nome.toLowerCase().includes(filtro);
    });

    if (filtrados.length === 0) {
        dropdown.classList.add('hidden');
        return;
    }

    // Desenha as <li> passando o ID do banco na função selecionarProdutoDropdown
    dropdown.innerHTML = filtrados.map(p => {
        const id = p.produto.id; // Pegando o ID do banco!
        const nome = p.produto.nome || 'Sem nome';
        const precoFloat = parseFloat(p.produto.precoVenda || 0);
        const precoExibicao = precoFloat.toFixed(2).replace('.', ',');
        const estoque = p.quantidadeAtual || 0;

        return `
            <li onclick="selecionarProdutoDropdown(${id}, '${nome}', ${precoFloat})" style="padding: 10px 15px; color: #eee; cursor: pointer; border-bottom: 1px solid #222; transition: 0.2s; font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center;" onmouseover="this.style.background='#333'; this.style.color='#C9A96E';" onmouseout="this.style.background='transparent'; this.style.color='#eee';">
                <span><i class="fas fa-box" style="color:#C9A96E; margin-right: 8px;"></i> ${nome}</span>
                <span style="display:flex; gap:12px; align-items:center; color: #eee;">
                    <span style="background: #111; border: 1px solid #333; padding: 3px 6px; border-radius: 4px; font-size: 0.7rem; color: #888;">Estoque: ${estoque}</span>
                    <span style="color:#28a745; font-weight:bold; min-width: 70px; text-align:right;">R$ ${precoExibicao}</span>
                </span>
            </li>
        `;
    }).join('');

    dropdown.classList.remove('hidden');
}

function selecionarProdutoDropdown(id, nome, preco) {
    const inputId = document.getElementById('venda-produto-id');
    const inputNome = document.getElementById('venda-produto');
    const inputUnitario = document.getElementById('venda-valor-unit');
    const dropdown = document.getElementById('dropdown-produtos-venda');

    // Preenche os campos
    if (inputId)
        inputId.value = id;
    if (inputNome)
        inputNome.value = nome;
    if (inputUnitario)
        inputUnitario.value = preco.toFixed(2);

    // Atualiza o total
    calcularTotalVenda();

    // Esconde o dropdown
    if (dropdown)
        dropdown.classList.add('hidden');
}

function calcularTotalVenda() {
    const qtd = parseFloat(document.getElementById('venda-qtd')?.value || 0);
    const unitario = parseFloat(document.getElementById('venda-valor-unit')?.value || 0);
    const totalInput = document.getElementById('venda-total');

    if (totalInput) {
        const total = qtd * unitario;
        totalInput.value = total.toFixed(2);
    }
}

document.addEventListener('click', function (e) {
    const input = document.getElementById('venda-produto');
    const dropdown = document.getElementById('dropdown-produtos-venda');
    if (input && dropdown && e.target !== input && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

async function salvarVenda(event) {
    event.preventDefault();

    const produtoId = document.getElementById('venda-produto-id')?.value;

    if (!produtoId || produtoId === '') {
        alert("⚠️ Operação bloqueada: Você deve selecionar um produto válido na lista suspensa.");
        return;
    }

    const clienteNome = document.getElementById('venda-cliente')?.value.trim() || 'Consumidor Final';
    const quantidade = parseInt(document.getElementById('venda-qtd')?.value) || 1;
    const valorTotal = parseFloat(document.getElementById('venda-total')?.value) || 0;
    const formaPagamento = document.getElementById('venda-forma-pag')?.value || 'DINHEIRO';

    if (typeof listaEstoque !== 'undefined') {
        const produtoNoEstoque = listaEstoque.find(p => p.produto && p.produto.id === parseInt(produtoId));
        if (produtoNoEstoque && quantidade > produtoNoEstoque.quantidadeAtual) {
            alert(`⚠️ Operação bloqueada: Estoque insuficiente!\n\nVocê está tentando vender ${quantidade} unidades, mas só existem ${produtoNoEstoque.quantidadeAtual} disponíveis no estoque.`);
            return; 
        }
    }

    const payload = {
        produto: {
            id: parseInt(produtoId)
        },
        quantidade: quantidade,
        valorTotal: valorTotal,
        clienteNome: clienteNome,
        formaPagamento: formaPagamento,
        dataVenda: new Date().toISOString()
    };

    try {
        const response = await fetch('../api/vendas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("✅ Venda registrada com sucesso!");

            fecharModalVenda();

            try {
                const response = await fetch('../api/vendas-manuais/listar');
                const vendasDoBanco = await response.json();
                renderVendasManuais(vendasDoBanco);
            } catch (error) {
                console.error("Erro ao carregar vendas", error);
                renderVendasManuais([]);
            }

        } else {
            const errorMsg = await response.text();
            alert("Erro ao registrar venda: " + errorMsg);
        }
    } catch (e) {
        console.error("Erro de conexão:", e);
        alert("Erro ao tentar conectar com o servidor. Verifique se o backend está rodando.");
    }
}

// =====================================================================
// MÓDULO DE BOLETOS E LEMBRETES
// =====================================================================

function renderBoletos(listaBoletos) {
    window.boletosAtual = listaBoletos || [];
    const container = document.getElementById('lista-boletos-cards');
    if (!container)
        return;

    const hojeObj = new Date();
    hojeObj.setHours(0, 0, 0, 0);

    let boletosProcessados = window.boletosAtual.map(b => {
        let dt = b.dataVencimento || '';
        if (dt.includes('T'))
            dt = dt.split('T')[0];

        let statusReal = (b.status || 'Pendente').charAt(0).toUpperCase() + (b.status || 'Pendente').slice(1).toLowerCase();

        if (dt) {
            const partes = dt.split('-');
            const vencObj = new Date(partes[0], partes[1] - 1, partes[2]);
            vencObj.setHours(0, 0, 0, 0);
            b.vencObj = vencObj;

            // Inteligência de Vencimento
            if (statusReal !== 'Pago' && statusReal !== 'Concluido') {
                if (vencObj < hojeObj)
                    statusReal = 'Atrasado';
                else if (vencObj.getTime() === hojeObj.getTime())
                    statusReal = 'Vence Hoje';
            }
        }

        b.statusCalculado = statusReal;
        b.dataLimpa = dt;
        return b;
    });

    const filtroStatus = document.getElementById('filtro-status-boleto')?.value;
    const filtroMes = document.getElementById('filtro-mes-boleto')?.value;

    if (filtroStatus)
        boletosProcessados = boletosProcessados.filter(b => b.statusCalculado === filtroStatus);
    if (filtroMes)
        boletosProcessados = boletosProcessados.filter(b => b.dataLimpa.startsWith(filtroMes));

    // Ordenação: Atrasados e próximos primeiro, Pagos por último
    boletosProcessados.sort((a, b) => {
        if (a.statusCalculado === 'Pago' && b.statusCalculado !== 'Pago')
            return 1;
        if (a.statusCalculado !== 'Pago' && b.statusCalculado === 'Pago')
            return -1;
        if (a.vencObj && b.vencObj)
            return a.vencObj - b.vencObj;
        return 0;
    });

    if (boletosProcessados.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-barcode" style="font-size: 2.5rem; color: #555; margin-bottom: 15px;"></i><p style="color: #aaa;">Nenhum boleto encontrado.</p></div>`;
        return;
    }

    container.innerHTML = boletosProcessados.map(b => {
        let cor = '#17a2b8';
        let bg = 'rgba(23, 162, 184, 0.15)';
        if (b.statusCalculado === 'Pago') {
            cor = '#28a745';
            bg = 'rgba(40, 167, 69, 0.15)';
        } else if (b.statusCalculado === 'Atrasado') {
            cor = '#dc3545';
            bg = 'rgba(220, 53, 69, 0.15)';
        } else if (b.statusCalculado === 'Vence Hoje') {
            cor = '#ffc107';
            bg = 'rgba(255, 193, 7, 0.15)';
        }

        let valorFloat = parseFloat(String(b.valor || 0).replace(',', '.'));
        const valorFmt = parseFloat(valorFloat).toFixed(2).replace('.', ',');
        const dataStr = b.dataLimpa ? b.dataLimpa.split('-').reverse().join('/') : '--/--/----';

        return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #161616; border: 1px solid #252525; border-left: 4px solid ${cor}; border-radius: 8px; margin-bottom: 12px; transition: transform 0.2s;">
            <div style="display: flex; flex-direction: column; gap: 6px; flex: 1;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: #eee; font-weight: bold; font-size: 1.05rem;"><i class="fas fa-file-invoice" style="color: ${cor};"></i> ${b.descricao || 'Boleto/Conta'}</span>
                    <span style="font-size: 0.70rem; background: ${bg}; color: ${cor}; border: 1px solid ${cor}; padding: 2px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">${b.statusCalculado}</span>
                </div>
                <div style="color: #888; font-size: 0.85rem; display: flex; gap: 15px; align-items: center; margin-top: 4px;">
                    <span style="${b.statusCalculado === 'Atrasado' ? 'color: #dc3545; font-weight: bold;' : ''}"><i class="far fa-calendar-times"></i> Vencimento: ${dataStr}</span>
                    ${b.linhaDigitavel ? `<span style="font-family: monospace; letter-spacing: 1px;"><i class="fas fa-barcode"></i> ${b.linhaDigitavel}</span>` : ''}
                </div>
            </div>
            <div style="text-align: right; min-width: 120px;">
                <span style="color: #eee; font-weight: 800; font-size: 1.2rem; display: block; margin-bottom: 8px;">R$ ${valorFmt}</span>
                ${b.statusCalculado !== 'Pago' ? `<button onclick="baixarBoleto(${b.id}, this)" class="btn-primary" style="background: #28a745; border: none; padding: 6px 12px; font-size: 0.8rem;"><i class="fas fa-check"></i> Dar Baixa</button>` : ''}
            </div>
        </div>`;
    }).join('');
}

function abrirModalBoleto() {
    document.getElementById('form-boleto').reset();
    document.getElementById('modal-boleto').classList.remove('hidden');
}

function fecharModalBoleto() {
    document.getElementById('modal-boleto').classList.add('hidden');
}

async function salvarBoleto(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-salvar-boleto');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    btn.disabled = true;

    try {
        const formData = new FormData(document.getElementById('form-boleto'));
        const params = new URLSearchParams(formData);

        // Formata o valor removendo pontos e ajustando a vírgula para o Java
        let valorBruto = params.get('valor') || '0';
        valorBruto = valorBruto.replace(/\./g, '').replace(',', '.');
        params.set('valor', valorBruto);

        const resposta = await fetch('../api/boletos/cadastrar', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            fecharModalBoleto();
            if (typeof navigateTo === 'function')
                navigateTo('boletos'); // Atualiza a tela
        } else {
            throw new Error("Erro ao salvar o boleto.");
        }
    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

async function baixarBoleto(id, btn) {
    if (!confirm("Confirmar o pagamento deste boleto?"))
        return;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    btn.disabled = true;

    try {
        const params = new URLSearchParams();
        params.append('id', id);
        params.append('status', 'Pago');

        const resposta = await fetch('../api/boletos/atualizar', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            btn.parentElement.parentElement.style.borderLeftColor = '#28a745';
            btn.outerHTML = `<span style="color:#28a745; font-size:0.8rem; font-weight:bold;"><i class="fas fa-check-double"></i> PAGO</span>`;
            if (typeof navigateTo === 'function')
                setTimeout(() => navigateTo('boletos'), 1000);
        } else {
            throw new Error("Erro ao dar baixa no servidor.");
        }
    } catch (e) {
        console.error(e);
        alert(e.message);
        btn.innerHTML = '<i class="fas fa-check"></i> Dar Baixa';
        btn.disabled = false;
    }
}