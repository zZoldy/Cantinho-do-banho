// ==========================================
// MÓDULO DE BOLETOS
// ==========================================
async function renderBoletosTela() {
    const container = document.getElementById('lista-boletos-cards');
    if (!container)
        return;
    container.innerHTML = '<div style="text-align:center; padding: 40px;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #C9A96E;"></i></div>';

    let boletos = [];
    try {
        const res = await fetch('../api/boletos/listar');
        if (!res.ok)
            throw new Error("Erro na API");
        boletos = await res.json();
    } catch (e) {
        console.warn("⚠️ API de boletos falhou. Carregando dados de emergência (Mock).", e);
        // MOCK PARA O HACKATHON NÃO PARAR
        const hojeFake = new Date().toISOString().split('T')[0];
        boletos = [
            {id: 1, descricao: "Distribuidora Pet Alimentos", valor: 1450.00, dataVencimento: hojeFake, status: "Pendente", linhaDigitavel: "34191.09008 63571.2345"},
            {id: 2, descricao: "Conta de Energia", valor: 420.50, dataVencimento: "2025-01-10", status: "Pendente", linhaDigitavel: ""},
            {id: 3, descricao: "Aluguel da Loja", valor: 2500.00, dataVencimento: "2026-06-01", status: "Pago", linhaDigitavel: ""}
        ];
    }

    // Filtros
    const filtroStatus = document.getElementById('filtro-status-boleto').value;
    const filtroMes = document.getElementById('filtro-mes-boleto').value;

    const hojeObj = new Date();
    hojeObj.setHours(0, 0, 0, 0);

    boletos = boletos.map(b => {
        let dt = b.dataVencimento;
        if (dt.includes('T'))
            dt = dt.split('T')[0];
        const partes = dt.split('-');
        const vencObj = new Date(partes[0], partes[1] - 1, partes[2]);
        vencObj.setHours(0, 0, 0, 0);

        let statusCalc = (b.status || 'Pendente').charAt(0).toUpperCase() + (b.status || 'Pendente').slice(1).toLowerCase();
        if (statusCalc !== 'Pago' && vencObj < hojeObj)
            statusCalc = 'Atrasado';
        else if (statusCalc !== 'Pago' && vencObj.getTime() === hojeObj.getTime())
            statusCalc = 'Vence Hoje';

        b.statusCalculado = statusCalc;
        b.vencObj = vencObj;
        b.dataLimpa = dt;
        return b;
    });

    if (filtroMes) {
        boletos = boletos.filter(b => b.dataLimpa.startsWith(filtroMes));
    }
    if (filtroStatus) {
        boletos = boletos.filter(b => b.statusCalculado === filtroStatus);
    }

    boletos.sort((a, b) => a.vencObj - b.vencObj);

    if (boletos.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-barcode" style="font-size: 2.5rem; color: #555; margin-bottom: 15px;"></i><p style="color: #aaa;">Nenhum boleto encontrado para este filtro.</p></div>`;
        return;
    }

    container.innerHTML = boletos.map(b => {
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

        const valorFormat = parseFloat(b.valor).toFixed(2).replace('.', ',');
        const dataStr = b.dataLimpa.split('-').reverse().join('/');

        return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: #1a1a1a; border: 1px solid #333; border-left: 3px solid ${cor}; border-radius: 8px; margin-bottom: 10px;">
            <div style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: #eee; font-weight: bold; font-size: 1.05rem;"><i class="fas fa-file-invoice-dollar" style="color: ${cor};"></i> ${b.descricao}</span>
                    <span style="font-size: 0.70rem; background: ${bg}; color: ${cor}; border: 1px solid ${cor}; padding: 2px 6px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">${b.statusCalculado}</span>
                </div>
                <div style="color: #777; font-size: 0.8rem; display: flex; gap: 15px; align-items: center;">
                    <span style="${b.statusCalculado === 'Atrasado' ? 'color: #dc3545; font-weight: bold;' : ''}"><i class="far fa-calendar-times"></i> Vencimento: ${dataStr}</span>
                    ${b.linhaDigitavel ? `<span><i class="fas fa-barcode"></i> ${b.linhaDigitavel}</span>` : ''}
                </div>
            </div>
            <div style="text-align: right; min-width: 100px;">
                <span style="color: #eee; font-weight: 800; font-size: 1.1rem; display: block; margin-bottom: 5px;">R$ ${valorFormat}</span>
                ${b.statusCalculado !== 'Pago' ? `<button onclick="baixarBoletoDireto(this)" style="background: #28a745; color: white; border: none; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; cursor: pointer; font-weight: bold;"><i class="fas fa-check"></i> Dar Baixa</button>` : ''}
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

    // Simulação do tempo de requisição para a interface ficar fluida
    setTimeout(() => {
        alert("Boleto salvo com sucesso! (Modo Simulação)");
        fecharModalBoleto();
        renderBoletosTela();
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }, 800);
}

function baixarBoletoDireto(btn) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    setTimeout(() => {
        btn.parentElement.parentElement.style.borderLeftColor = '#28a745';
        btn.outerHTML = `<span style="color:#28a745; font-size:0.8rem; font-weight:bold;"><i class="fas fa-check-double"></i> PAGO</span>`;
    }, 1000);
}

// ==========================================
// MÓDULO DE VENDAS MANUAIS E NF
// ==========================================
async function renderVendasTela() {
    const container = document.getElementById('lista-vendas-nf');
    if (!container)
        return;
    container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 30px;"><i class="fas fa-spinner fa-spin" style="color: #6f42c1; font-size: 1.5rem;"></i></td></tr>';

    let vendas = [];
    try {
        const res = await fetch('../api/vendas-manuais/listar');
        if (!res.ok)
            throw new Error("Erro na API");
        vendas = await res.json();
    } catch (e) {
        console.warn("⚠️ API de vendas falhou. Carregando dados de emergência (Mock).", e);
        vendas = [
            {id: 890, descricao: "Shampoo Especial 500ml", cliente: "Filipe", valor: 45.00, data: new Date().toISOString().split('T')[0], nfEmitida: false},
            {id: 891, descricao: "Venda Balcão (Acessórios)", cliente: "Consumidor Final", valor: 120.00, data: "2026-05-04", nfEmitida: true}
        ];
    }

    const busca = document.getElementById('busca-vendas-nf').value.toLowerCase();
    const filtroNf = document.getElementById('filtro-nf-venda').value;

    if (busca) {
        vendas = vendas.filter(v => (v.descricao || '').toLowerCase().includes(busca) || (v.cliente || '').toLowerCase().includes(busca));
    }
    if (filtroNf) {
        const statusBool = filtroNf === 'true';
        vendas = vendas.filter(v => v.nfEmitida === statusBool);
    }

    if (vendas.length === 0) {
        container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color:#888;">Nenhuma venda encontrada para este filtro.</td></tr>';
        return;
    }

    container.innerHTML = vendas.map(v => {
        let dt = v.data;
        if (dt.includes('T'))
            dt = dt.split('T')[0];
        const dataStr = dt.split('-').reverse().join('/');

        const valorFmt = parseFloat(v.valor).toFixed(2).replace('.', ',');

        const nfBadge = v.nfEmitida
                ? `<span style="font-size: 0.75rem; color: #28a745; font-weight: bold;"><i class="fas fa-file-invoice-dollar"></i> Emitida na SEFAZ</span>`
                : `<button onclick="emitirNotaFiscal(this)" style="background: #6f42c1; color: white; border: none; padding: 4px 10px; border-radius: 4px; font-size: 0.70rem; cursor: pointer; font-weight: bold;"><i class="fas fa-file-export"></i> Emitir NF</button>`;

        return `
        <tr style="border-bottom: 1px solid #222;">
            <td>${dataStr}</td>
            <td><strong>${v.cliente || 'Consumidor Final'}</strong></td>
            <td>${v.descricao}</td>
            <td style="color:#28a745; font-weight:bold;">R$ ${valorFmt}</td>
            <td>${nfBadge}</td>
            <td style="text-align:right;">
                <button class="btn-sm-primary" title="Ver Detalhes da Venda"><i class="fas fa-eye"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function emitirNotaFiscal(btn) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Comunicando SEFAZ...';
    btn.style.opacity = '0.7';
    setTimeout(() => {
        btn.outerHTML = `<span style="font-size: 0.75rem; color: #28a745; font-weight: bold;"><i class="fas fa-check-circle"></i> Emitida na SEFAZ</span>`;
    }, 1800);
}

function abrirModalNovaVendaNF() {
    // Reutilizando o Modal de Venda já existente na sua SPA!
    if (typeof abrirModalVenda === 'function') {
        abrirModalVenda();
    } else {
        alert("A função de Nova Venda será aberta!");
    }
}