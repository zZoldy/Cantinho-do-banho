let clienteSendoEditado = null;
let petIdEdicao = null;
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

    const cadastrados = lista.filter(c => c.temUsuario === true);
    const naoCadastrados = lista.filter(c => c.temUsuario === false);

    const elCad = document.getElementById('lista-clientes-cadastrados');
    const elNao = document.getElementById('lista-clientes-nao-cadastrados');

    // Se nenhum dos dois containers da nova estrutura existir, aí sim saímos
    if (!elCad && !elNao)
        return;

    const aplicarEstiloGrid = (el) => {
        el.style.display = 'grid';
        el.style.gridTemplateColumns = 'repeat(auto-fill, minmax(340px, 1fr))';
        el.style.gap = '20px';
        el.style.alignItems = 'stretch';
    };

    const pacotesLocais = window.pacotesCadastrados || [];

    const gerarCard = (c) => {
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
                : '';

        const nomesDosPets = (c.pets && c.pets.length > 0)
                ? c.pets.map((p, index) => {
                    let htmlPet = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <span style="font-weight: 600; color: #2c3e50; font-size: 0.95rem;">${p.nome}</span> 
                    <span style="color:#888; font-size: 0.8rem;">(${p.tipo})</span>
                </div>
                <button onclick="event.stopPropagation(); preencherModalPet(${c.id}, ${p.id})" 
                        style="background: none; border: none; color: #17a2b8; cursor: pointer; padding: 2px 5px; font-size: 0.8rem;" title="Editar Pet">
                    <i class="fas fa-edit"></i>
                </button>
            </div>`;
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

        let blocoDestaqueHtml = '';

        if (c.temUsuario) {
            blocoDestaqueHtml = `<div style="margin-bottom: 15px; font-size: 0.9rem; color: #777; padding: 10px; background: #fafafa; border: 1px dashed #ddd; border-radius: 6px;"><i class="fas fa-box" style="color:#ccc; margin-right: 5px;"></i> <strong>Pacote:</strong> Sem pacote ativo</div>`;

            if (c.pacotes && c.pacotes.length > 0) {
                blocoDestaqueHtml = c.pacotes.map(pac => {
                    const pendServ = pac.sessoesRestantes || 0;
                    const totalServ = pac.sessoesTotais || 0;
                    const usadoServ = totalServ - pendServ;
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
        } else {
            blocoDestaqueHtml = `
            <div style="background: #fffbf0; border: 1px solid #f0e0b8; border-radius: 6px; padding: 12px; margin-bottom: 10px; display: flex; align-items: center; gap: 15px;">
                <div style="background: #e0a800; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 4px rgba(224,168,0,0.3);">
                    <i class="fas fa-exclamation-triangle" style="color: #fff; font-size: 1.1rem;"></i>
                </div>
                <div>
                    <div style="font-size: 0.7rem; color: #888; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Atenção</div>
                    <div style="font-size: 0.85rem; font-weight: 600; color: #444; margin-top: 2px; line-height: 1.3;">
                        Cliente temporário. Crie o acesso para habilitar pacotes e unificar o histórico.
                    </div>
                </div>
            </div>`;
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
                ${blocoDestaqueHtml}
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: auto; border-top: 1px solid #f1f1f1; padding-top: 15px;">
                ${btnVenderPacote}
                ${btnAcesso}
            </div>
            
        </div>`;
    };

    // Renderiza a aba de Cadastrados
    if (elCad) {
        if (!cadastrados.length) {
            elCad.style.display = 'block';
            elCad.innerHTML = `<div class="empty-state" style="padding: 40px; text-align: center; color: #888; background: #fff; border-radius: 8px; border: 1px dashed #ccc;"><i class="fas fa-user-check" style="font-size: 2.5rem; color: #C9A96E; margin-bottom: 15px;"></i><p style="font-size: 1.1rem;">Nenhum cliente cadastrado.</p></div>`;
        } else {
            aplicarEstiloGrid(elCad);
            elCad.innerHTML = cadastrados.map(gerarCard).join('');
        }
    }

    // Renderiza a aba de Não Cadastrados
    if (elNao) {
        if (!naoCadastrados.length) {
            elNao.style.display = 'block';
            elNao.innerHTML = `<div class="empty-state" style="padding: 40px; text-align: center; color: #888; background: #fff; border-radius: 8px; border: 1px dashed #ccc;"><i class="fas fa-user-slash" style="font-size: 2.5rem; color: #C9A96E; margin-bottom: 15px;"></i><p style="font-size: 1.1rem;">Nenhum cliente pendente de cadastro.</p></div>`;
        } else {
            aplicarEstiloGrid(elNao);
            elNao.innerHTML = naoCadastrados.map(gerarCard).join('');
        }
    }
}

function renderPetsHistorico() {
    const busca = (document.getElementById('busca-pets-hist')?.value || '').toLowerCase();
    const el = document.getElementById('lista-pets-historico');

    if (!el)
        return;

    // Busca as listas globais
    const listaHistorico = typeof historico !== 'undefined' ? historico : [];
    const listaAgenda = typeof agenda !== 'undefined' ? agenda : [];
    const vendasPacotes = typeof listaVendasPacotes !== 'undefined' ? listaVendasPacotes : (typeof window.listaVendasPacotes !== 'undefined' ? window.listaVendasPacotes : []);

    function getQtdSessoes(compra) {
        const pacotesBD = typeof pacotesCadastrados !== 'undefined' ? pacotesCadastrados : (typeof pacotes !== 'undefined' ? pacotes : []);
        const pctBase = pacotesBD.find(p => p.nome === compra.pacoteNome || p.id === compra.pacoteId);
        if (pctBase && pctBase.sessoes)
            return parseInt(pctBase.sessoes);

        const match = (compra.pacoteNome || compra.descricao || '').match(/\d+/);
        if (match)
            return parseInt(match[0]);
        return 4; // Padrão
    }

    const petsMap = {};

    // 1. Agrupar Agendamentos e Histórico
    [...listaHistorico, ...listaAgenda].forEach(a => {
        const nomePet = a.pet || 'Sem nome';
        const nomeDono = a.dono || 'Sem dono';
        const key = `${nomePet}-${nomeDono}`;

        if (!petsMap[key]) {
            petsMap[key] = {pet: nomePet, dono: nomeDono, agendamentos: []};
        }

        let valorFloat = parseFloat(String(a.valor || a.preco || a.total || 0).replace(',', '.'));
        const statusReal = (a.statusPag || a.status_pagamento || a.status || '').toUpperCase();

        const isPacote = a.vendaPacote || a.pacoteNome || a.pacoteId || a.pacote ||
                (a.formaPagamento && String(a.formaPagamento).toLowerCase().includes('pacote')) ||
                (a.formaPag && String(a.formaPag).toLowerCase().includes('pacote')) ||
                (valorFloat === 0 && (statusReal === 'PAGO' || statusReal === 'CONCLUÍDO' || statusReal === 'CONCLUIDO'));

        petsMap[key].agendamentos.push({
            dataRaw: a.data || a.concluidoEm || '',
            hora: a.hora || '',
            servico: a.servico || 'Serviço',
            valor: isPacote ? 0 : valorFloat,
            isPacote: isPacote,
            sessao: a.sessaoUtilizada || a.sessao || '?',
            pacoteNome: a.pacoteNome || 'Pacote Vinculado',
            // CAPTURA A DATA DE COMPRA DO PACOTE SALVA NO AGENDAMENTO!
            dataCompraPacote: a.dataVenda || a.dataCompra || a.dataVendaPacote || ''
        });
    });

    const listaPets = Object.values(petsMap).filter(p => p.pet.toLowerCase().includes(busca) || p.dono.toLowerCase().includes(busca));

    if (!listaPets.length) {
        el.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; padding: 40px; text-align: center; border: 1px dashed #333; border-radius: 8px;">
                <i class="fas fa-paw" style="font-size: 2.5rem; color: #555; margin-bottom: 15px;"></i>
                <p style="color: #aaa;">Nenhum histórico de pet encontrado.</p>
            </div>`;
        return;
    }

    el.innerHTML = listaPets.map(p => {
        const nomeDono = p.dono.toLowerCase();
        const nomePet = p.pet.toLowerCase();

        // A. Pega as compras de pacotes RECENTES/ATIVOS associadas a este pet
        const comprasPet = vendasPacotes.filter(v => {
            const donoVenda = (v.clienteNome || v.cliente || v.dono || '').toLowerCase();
            const petVenda = (v.pet || v.nomePet || v.petNome || '').toLowerCase();
            const valorReal = parseFloat(String(v.valor || v.valorTotal || v.preco || 0).replace(',', '.'));
            return donoVenda === nomeDono && (petVenda === '' || petVenda === nomePet) && valorReal > 0;
        }).sort((a, b) => {
            const dtA = a.data || a.dataVenda || a.dataCompra || '';
            const dtB = b.data || b.dataVenda || b.dataCompra || '';
            return dtA.localeCompare(dtB);
        });

        // B. Pega as sessões usadas por este pet
        const sessoesUsadasPet = p.agendamentos.filter(a => a.isPacote).sort((a, b) => {
            const dtA = (a.dataRaw || '') + (a.hora || '');
            const dtB = (b.dataRaw || '') + (b.hora || '');
            return dtA.localeCompare(dtB);
        });

        let sessoesRestantes = [...sessoesUsadasPet];

        // C. Monta os Cards de PACOTES RECENTES (Com sessões disponíveis e usadas)
        let pacotesHtml = comprasPet.map((compra, index) => {
            let dataCompra = compra.data || compra.dataVenda || compra.dataCompra || '';
            if (dataCompra.includes('T'))
                dataCompra = dataCompra.split('T')[0];
            let dataFmt = typeof fd === 'function' ? fd(dataCompra) : dataCompra.split('-').reverse().join('/');

            let nomePacote = compra.pacoteNome || compra.descricao || 'Pacote Promocional';
            let valorReal = parseFloat(String(compra.valor || compra.valorTotal || compra.preco || 0).replace(',', '.'));
            let valorFmt = valorReal.toFixed(2).replace('.', ',');
            let qtdSessoes = getQtdSessoes(compra);

            let sessoesDestePacote = sessoesRestantes.splice(0, qtdSessoes);

            let sessoesHtml = '';
            for (let i = 0; i < qtdSessoes; i++) {
                if (sessoesDestePacote[i]) {
                    let s = sessoesDestePacote[i];
                    let dtUso = s.dataRaw || '';
                    if (dtUso.includes('T'))
                        dtUso = dtUso.split('T')[0];
                    let dtUsoFmt = typeof fd === 'function' ? fd(dtUso) : dtUso.split('-').reverse().join('/');
                    let hrUso = s.hora ? s.hora.substring(0, 5) : '';

                    sessoesHtml += `
                        <div style="font-size: 0.85rem; color: #ddd; margin-bottom:6px; display:flex; align-items:center; gap:8px; background: rgba(23, 162, 184, 0.1); padding: 8px 12px; border-radius: 4px; border-left: 2px solid #17a2b8;">
                            <i class="fas fa-check-circle" style="color:#17a2b8; font-size:1rem;"></i> 
                            <span><strong>Sessão ${s.sessao} utilizada:</strong> ${s.servico} em ${dtUsoFmt} ${hrUso ? 'às ' + hrUso : ''}</span>
                        </div>`;
                } else {
                    sessoesHtml += `
                        <div style="font-size: 0.85rem; color: #666; margin-bottom:6px; display:flex; align-items:center; gap:8px; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 4px; border: 1px dashed #333;">
                            <i class="far fa-circle" style="font-size:1rem;"></i> 
                            <span><strong>Sessão ${i + 1}:</strong> Disponível para uso</span>
                        </div>`;
                }
            }

            return `
                <div style="background: #111; border: 1px solid #2a2a2a; border-left: 4px solid #28a745; border-radius: 8px; padding: 14px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
                        <div>
                            <span style="color:#28a745; font-weight:800; font-size:1.05rem; display:block; margin-bottom:2px;"><i class="fas fa-box-open"></i> ${nomePacote}</span>
                            <span style="color:#666; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">Compra Ativa / Recente</span>
                        </div>
                        <div style="text-align:right;">
                            <span style="color:#888; font-size:0.8rem; display:block;"><i class="far fa-calendar-alt"></i> Comprado em <strong style="color:#ddd;">${dataFmt}</strong></span>
                            <span style="color:#28a745; font-size:0.95rem; font-weight:bold;">R$ ${valorFmt}</span>
                        </div>
                    </div>
                    <div style="border-top: 1px dashed #333; padding-top: 12px;">
                        ${sessoesHtml}
                    </div>
                </div>
            `;
        }).join('');

        // --- LÓGICA NOVA: AGRUPANDO OS PACOTES ANTERIORES E CONCLUÍDOS ---
        if (sessoesRestantes.length > 0) {

            // Agrupa as sessões restantes pela Chave: "Nome do Pacote + Data de Compra"
            const pacotesAntigosObj = {};

            sessoesRestantes.forEach(s => {
                const pNome = (s.pacoteNome && s.pacoteNome !== 'Pacote Vinculado') ? s.pacoteNome : 'Pacote Anterior (Legado)';
                const pData = s.dataCompraPacote || 'indisponivel';
                const chaveAgrupamento = `${pNome}|${pData}`;

                if (!pacotesAntigosObj[chaveAgrupamento]) {
                    pacotesAntigosObj[chaveAgrupamento] = {
                        nome: pNome,
                        dataCompraOriginal: s.dataCompraPacote,
                        sessoes: []
                    };
                }
                pacotesAntigosObj[chaveAgrupamento].sessoes.push(s);
            });

            // Ordena os pacotes antigos pela data de compra
            const pacotesAntigosArray = Object.values(pacotesAntigosObj).sort((a, b) => {
                const dA = a.dataCompraOriginal || '';
                const dB = b.dataCompraOriginal || '';
                return dA.localeCompare(dB);
            });

            // Cria os sub-cards estruturados para cada pacote antigo
            let sessoesAvulsasHtml = pacotesAntigosArray.map(pacote => {

                let dataFmt = 'Data não registrada';
                if (pacote.dataCompraOriginal && pacote.dataCompraOriginal !== 'indisponivel') {
                    let d = pacote.dataCompraOriginal;
                    if (d.includes('T'))
                        d = d.split('T')[0];
                    else if (d.includes(' '))
                        d = d.split(' ')[0];
                    dataFmt = typeof fd === 'function' ? fd(d) : d.split('-').reverse().join('/');
                }

                // Cria as linhas de sessão utilizadas para este pacote específico
                const htmlSessoesDestePacote = pacote.sessoes.map(s => {
                    let dtUso = s.dataRaw || '';
                    if (dtUso.includes('T'))
                        dtUso = dtUso.split('T')[0];
                    let dtUsoFmt = typeof fd === 'function' ? fd(dtUso) : dtUso.split('-').reverse().join('/');
                    let hrUso = s.hora ? s.hora.substring(0, 5) : '';

                    return `
                        <div style="font-size: 0.85rem; color: #ddd; margin-bottom:6px; display:flex; align-items:center; gap:8px; background: rgba(23, 162, 184, 0.1); padding: 8px 12px; border-radius: 4px; border-left: 2px solid #17a2b8;">
                            <i class="fas fa-check-circle" style="color:#17a2b8; font-size:1rem;"></i> 
                            <span><strong>Sessão ${s.sessao}:</strong> ${s.servico} em ${dtUsoFmt} ${hrUso ? 'às ' + hrUso : ''}</span>
                        </div>`;
                }).join('');

                // Desenha a caixa do Pacote Antigo
                return `
                    <div style="background: rgba(0,0,0,0.2); border: 1px solid #333; border-left: 3px solid #17a2b8; border-radius: 6px; padding: 12px; margin-bottom: 12px;">
                        <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-start;">
                            <span style="color:#17a2b8; font-weight:700; font-size:0.95rem; display:flex; align-items:center; gap:6px;">
                                <i class="fas fa-box"></i> ${pacote.nome}
                            </span>
                            <span style="color:#666; font-size:0.75rem; text-align:right;">
                                <i class="far fa-calendar-alt"></i> Aquisição: <strong style="color:#888;">${dataFmt}</strong>
                            </span>
                        </div>
                        <div style="border-top: 1px dashed #333; padding-top: 10px;">
                            ${htmlSessoesDestePacote}
                        </div>
                    </div>
                `;
            }).join('');

            // Adiciona a seção ao bloco de Pacotes HTML Global
            pacotesHtml += `
                <div style="background: #111; border: 1px solid #2a2a2a; border-left: 4px solid #17a2b8; border-radius: 8px; padding: 14px; margin-bottom: 12px;">
                    <div style="margin-bottom: 12px;">
                        <span style="color:#17a2b8; font-weight:800; font-size:1.05rem; display:block; margin-bottom:2px;"><i class="fas fa-history"></i> Histórico de Serviços com Pacote</span>
                        <span style="color:#666; font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">Pacotes anteriores ou já concluídos</span>
                    </div>
                    <div style="padding-top: 6px;">
                        ${sessoesAvulsasHtml}
                    </div>
                </div>
            `;
        }

        if (!pacotesHtml)
            pacotesHtml = '<div style="padding:15px; background:#111; border:1px solid #222; border-radius:8px; text-align:center; color:#666; font-size:0.85rem;"><i class="fas fa-info-circle"></i> Nenhum pacote adquirido por este tutor.</div>';

        // --- FIM DA LÓGICA DE PACOTES ---

        // Pega os serviços AVULSOS e inverte a ordem (exibe do mais novo pro antigo)
        let avulsosPet = p.agendamentos.filter(a => !a.isPacote).sort((a, b) => {
            const dhA = (a.dataRaw || '') + (a.hora || '');
            const dhB = (b.dataRaw || '') + (b.hora || '');
            return dhB.localeCompare(dhA);
        });

        let avulsosHtml = avulsosPet.map(a => {
            let dataLimpa = a.dataRaw || '';
            if (dataLimpa.includes('T'))
                dataLimpa = dataLimpa.split('T')[0];
            const dataExibicao = typeof fd === 'function' ? fd(dataLimpa) : dataLimpa.split('-').reverse().join('/');
            const horaExibicao = a.hora ? a.hora.substring(0, 5) : '';
            const valorFmt = parseFloat(a.valor || 0).toFixed(2).replace('.', ',');

            return `
                <div style="margin-bottom: 12px; position: relative; padding-left: 20px; border-left: 2px solid #444;">
                    <div style="position: absolute; left: -9px; top: 0; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #1a1a1a; background: #444;"></div>
                    <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 10px 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <span style="color: #aaa; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">Serviço Avulso</span>
                            <span style="color: #C9A96E; font-weight: 800; font-size: 0.95rem;">R$ ${valorFmt}</span>
                        </div>
                        <div style="color: #eee; font-weight: 600; font-size: 1rem;">${a.servico}</div>
                        <div style="font-size: 0.8rem; color: #888; margin-top: 4px;">
                            <i class="far fa-calendar-alt"></i> Realizado em: ${dataExibicao} ${horaExibicao ? `às ${horaExibicao}` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (!avulsosHtml)
            avulsosHtml = '<div style="padding:15px; background:#111; border:1px solid #222; border-radius:8px; text-align:center; color:#666; font-size:0.85rem;"><i class="fas fa-info-circle"></i> Nenhum serviço avulso registrado para este pet.</div>';

        const btnPdf = `
            <button onclick="gerarRelatorioPet('${p.pet}', '${p.dono}'); event.stopPropagation();" title="Gerar Prontuário em PDF do Pet" style="background: none; border: 1px solid rgb(51, 51, 51); color: rgb(136, 136, 136); border-radius: 6px; padding: 5px 10px; font-size: 0.72rem; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 4px;" onmouseover="this.style.borderColor = '#C9A96E';this.style.color = '#C9A96E'" onmouseout="this.style.borderColor = '#333';this.style.color = '#888'">
                <i class="fas fa-file-pdf"></i> PDF
            </button>
        `;

        return `
            <div class="agenda-card" style="border-top: 4px solid #C9A96E; background: #161616; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 15px;">
                    <div style="display: flex; align-items: center;">
                        <div style="background: rgba(201, 169, 110, 0.1); width: 55px; height: 55px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; border: 1px solid rgba(201, 169, 110, 0.3);">
                            <i class="fas fa-paw" style="color: #C9A96E; font-size: 1.8rem;"></i>
                        </div>
                        <div>
                            <h3 style="margin: 0; color: #eee; font-size: 1.3rem;">${p.pet}</h3>
                            <div style="color: #888; font-size: 0.95rem; margin-top: 4px;"><i class="fas fa-user" style="color:#C9A96E;"></i> Tutor: <strong style="color:#ccc;">${p.dono}</strong></div>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                        ${btnPdf}
                    </div>
                </div>
                
                <div style="max-height: 500px; overflow-y: auto; padding-right: 10px;" class="custom-scroll">
                    <h4 style="color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-boxes" style="color: #28a745;"></i> Gestão de Pacotes
                    </h4>
                    ${pacotesHtml}

                    <h4 style="color: #888; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 25px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-history" style="color: #C9A96E;"></i> Histórico de Serviços Avulsos
                    </h4>
                    ${avulsosHtml}
                </div>
            </div>
        `;
    }).join('');
}
// =====================================================================
// MÓDULO DE RELATÓRIOS EM PDF: PRONTUÁRIO DO PET
// =====================================================================

function gerarRelatorioPet(nomePet, nomeDono) {
    // 1. Achar dados do Pet na lista de clientes
    let petInfo = {tipo: 'Não informado', raca: 'Não informada', porte: 'Não informado', obs: ''};
    let telefoneDono = 'Sem contato';

    if (typeof listaClientes !== 'undefined') {
        const cliente = listaClientes.find(c => c.nome.toLowerCase() === nomeDono.toLowerCase());
        if (cliente) {
            telefoneDono = cliente.telefone || 'Sem contato';
            if (cliente.pets) {
                const p = cliente.pets.find(x => x.nome.toLowerCase() === nomePet.toLowerCase());
                if (p) {
                    petInfo.tipo = p.tipo || 'Não informado';
                    petInfo.raca = p.raca || 'Não informada';
                    petInfo.porte = p.porte || 'Não informado';
                    petInfo.obs = p.obs || '';
                }
            }
        }
    }

    // 2. Filtrar Histórico EXCLUSIVO deste Pet
    const todosServicos = (typeof historico !== 'undefined' && typeof agenda !== 'undefined') ? [...historico, ...agenda] : [];

    const historicoPet = todosServicos.filter(a =>
        (a.pet || '').toLowerCase() === nomePet.toLowerCase() &&
                (a.dono || '').toLowerCase() === nomeDono.toLowerCase()
    ).sort((a, b) => {
        const dhA = (a.data || '') + (a.hora || '');
        const dhB = (b.data || '') + (b.hora || '');
        return dhB.localeCompare(dhA); // Mais recente primeiro
    });

    // 3. Totais (Calcula apenas serviços avulsos pagos - Corrigido o bug do Case Sensitive)
    const totalGasto = historicoPet.filter(a => {
        const statusReal = (a.statusPag || a.status_pagamento || a.status || '').toUpperCase();
        return statusReal === 'PAGO' || statusReal === 'CONCLUÍDO' || statusReal === 'CONCLUIDO';
    }).reduce((sum, a) => {
        let valorFloat = parseFloat(String(a.valor || a.preco || a.total || 0).replace(',', '.'));

        const isPacote = a.vendaPacote || a.pacoteNome || a.pacoteId || a.pacote ||
                (a.formaPagamento && String(a.formaPagamento).toLowerCase().includes('pacote')) ||
                (a.formaPag && String(a.formaPag).toLowerCase().includes('pacote')) ||
                (valorFloat === 0 && (a.statusPag || '').toUpperCase() === 'PAGO');

        return sum + (isPacote ? 0 : valorFloat);
    }, 0);

    // 4. Construir o HTML do PDF
    let body = `<div class="ph"><div class="pt">🐾 Cantinho do Banho</div><div class="ps">Prontuário de Serviços do Pet · Emitido em ${new Date().toLocaleDateString('pt-BR')}</div></div>`;

    // Bloco: Identificação
    body += `<div style="background:#f8f6f2;border-radius:7px;padding:12px 16px;margin-bottom:14px;display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:12.5px; border:1px solid #e8e0d0;">
                <div>
                    <strong style="display:block;margin-bottom:2px; font-size:16px; color:#C9A96E;">🐾 ${nomePet}</strong>
                    <span style="color:#555"><strong>Espécie/Tipo:</strong> ${petInfo.tipo}</span><br>
                    <span style="color:#555"><strong>Raça:</strong> ${petInfo.raca}</span><br>
                    <span style="color:#555"><strong>Porte:</strong> ${petInfo.porte}</span>
                </div>
                <div>
                    <strong style="display:block;margin-bottom:2px; font-size:14px; color:#333;">👤 Tutor: ${nomeDono}</strong>
                    <span style="color:#555">📱 ${telefoneDono}</span><br><br>
                    <span style="color:#555"><strong>Total Gasto (Serviços Avulsos):</strong> <br><span style="color:#1a6a2a; font-size:14px; font-weight:bold;">R$ ${totalGasto.toFixed(2).replace('.', ',')}</span></span>
                </div>
             </div>`;

    if (petInfo.obs) {
        body += `<div style="background:#fff8e6;border-radius:6px;padding:9px 13px;font-size:12px;color:#7a5a00;margin-bottom:15px; border:1px solid #ffeeba;"><strong>⚠️ Observações Médicas / Comportamentais:</strong><br> ${petInfo.obs}</div>`;
    }

    // Bloco: Histórico
    body += `<div class="sec">Histórico de Serviços (${historicoPet.length} registros)</div>`;

    if (historicoPet.length > 0) {
        body += `<table>
                    <thead>
                        <tr>
                            <th style="width: 80px;">Data</th>
                            <th>Serviço Executado</th>
                            <th>Profissional</th>
                            <th style="text-align: right;">Valor / Origem</th>
                        </tr>
                    </thead>
                    <tbody>`;

        historicoPet.forEach(a => {
            let dataLimpa = a.data || '';
            if (dataLimpa.includes('T'))
                dataLimpa = dataLimpa.split('T')[0];

            let dataFormatada = typeof fd === 'function' ? fd(dataLimpa) : dataLimpa.split('-').reverse().join('/');
            const horaFormatada = a.hora ? a.hora.substring(0, 5) : '';

            let valorFloat = parseFloat(String(a.valor || 0).replace(',', '.'));

            const isPacote = a.vendaPacote || a.pacoteNome || a.pacoteId || a.pacote ||
                    (a.formaPag && String(a.formaPag).toLowerCase().includes('pacote')) ||
                    (a.formaPagamento && String(a.formaPagamento).toLowerCase().includes('pacote')) ||
                    (valorFloat === 0 && (a.statusPag || '').toUpperCase() === 'PAGO');

            let valorFmt = '';

            if (isPacote) {
                // ILUSTRA O PACOTE E A SESSÃO AQUI!
                const nomeDoPacote = a.pacoteNome || 'Pacote';
                const sessaoUsada = a.sessaoUtilizada || a.sessao || '?';
                valorFmt = `<span class="bb">USO DE PACOTE</span><br><span style="font-size:9px; color:#555; display:block; margin-top:4px;">${nomeDoPacote} (Sessão ${sessaoUsada})</span>`;
            } else {
                valorFmt = `<strong>R$ ${valorFloat.toFixed(2).replace('.', ',')}</strong>`;
            }

            const func = a.funcionario && a.funcionario !== 'null' ? a.funcionario : '—';

            body += `<tr>
                        <td>${dataFormatada}<br><span style="color:#888; font-size:10px;">${horaFormatada}</span></td>
                        <td><strong>${a.servico}</strong></td>
                        <td>${func}</td>
                        <td style="text-align: right;">${valorFmt}</td>
                     </tr>`;
        });
        body += `</tbody></table>`;
    } else {
        body += `<p style="color:#aaa;font-size:12px; text-align:center; padding: 20px 0;">Nenhum serviço registrado no histórico deste pet.</p>`;
    }

    if (typeof pdfWin === 'function')
        pdfWin('Prontuário — ' + nomePet, body);
}

// ================= FLUXO DE CRIAR ACESSO (CLIENTE) =================

function abrirModalCriarUsuario(id, nome) {
    if (typeof fecharFocoCliente === 'function')
        fecharFocoCliente();

    const cliente = listaClientes.find(c => c.id === id);

    document.getElementById('id-cliente-acesso').value = id;
    document.getElementById('nome-cliente-acesso').textContent = nome;
    document.getElementById('email-acesso').value = '';
    document.getElementById('cpf-acesso').value = '';

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
            exibirMensagem(`Acesso criado! Senha gerada: ${dados.senha}`, 'success');
        }

    } catch (erro) {
        console.error("Erro: ", erro);
        exibirMensagem('Erro ao criar o acesso. Verifique se o Email ou CPF já existem no sistema.', 'error');
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

function mudarSubAbaClientes(aba) {
    document.getElementById('btn-sub-cadastrados').classList.remove('active');
    document.getElementById('btn-sub-nao-cadastrados').classList.remove('active');
    document.getElementById('btn-sub-pets').classList.remove('active');

    document.getElementById('container-clientes-cadastrados').classList.add('hidden');
    document.getElementById('container-clientes-nao-cadastrados').classList.add('hidden');
    document.getElementById('container-pets-historico').classList.add('hidden');

    if (aba === 'cadastrados') {
        document.getElementById('btn-sub-cadastrados').classList.add('active');
        document.getElementById('container-clientes-cadastrados').classList.remove('hidden');
    } else if (aba === 'nao-cadastrados') {
        document.getElementById('btn-sub-nao-cadastrados').classList.add('active');
        document.getElementById('container-clientes-nao-cadastrados').classList.remove('hidden');
    } else if (aba === 'pets') {
        document.getElementById('btn-sub-pets').classList.add('active');
        document.getElementById('container-pets-historico').classList.remove('hidden');
        renderPetsHistorico();
    }
}

// ================= FLUXO DE NOVO CLIENTE =================
async function carregarPacotesNoNovoCliente() {
    const select = document.getElementById('pacote-novo-cliente');
    if (!select) return;

    select.innerHTML = '<option value="">Carregando pacotes...</option>';

    try {
        const resposta = await fetch('../api/pacotes/listar');

        if (!resposta.ok) {
            throw new Error('Erro ao buscar pacotes');
        }

        const pacotes = await resposta.json();

        select.innerHTML = '<option value="">Nenhum pacote</option>';

        pacotes.forEach(p => {
            const sessoes = p.sessoes || p.quantidadeSessoes || 0;
            const validade = p.validade || 0;
            const valor = Number(p.valor || 0).toFixed(2);

            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = `${p.nome} - ${sessoes} sessões - ${validade} dias - R$ ${valor}`;
            select.appendChild(option);
        });

    } catch (erro) {
        console.error('Erro ao carregar pacotes no cadastro do cliente:', erro);
        select.innerHTML = '<option value="">Erro ao carregar pacotes</option>';
    }
}

function abrirModalNovoCliente() {
    if (typeof fecharFocoCliente === 'function') {
        fecharFocoCliente();
    }

    document.getElementById('nome-novo-cliente').value = '';
document.getElementById('telefone-novo-cliente').value = '';
document.getElementById('cpf-novo-cliente').value = '';

document.getElementById('pet-novo-cliente').value = '';
document.getElementById('raca-novo-cliente').value = '';
document.getElementById('tamanho-novo-cliente').value = '';
document.getElementById('observacoes-pet-novo-cliente').value = '';
document.getElementById('email-novo-cliente').value = '';
document.getElementById('pacote-novo-cliente').value = '';
document.getElementById('data-assinatura-pacote-novo-cliente').value = '';
document.getElementById('data-validade-pacote-novo-cliente').value = '';

    document.getElementById('cep-novo-cliente').value = '';
    document.getElementById('logradouro-novo-cliente').value = '';
    document.getElementById('numero-novo-cliente').value = '';
    document.getElementById('bairro-novo-cliente').value = '';
    document.getElementById('cidade-novo-cliente').value = '';
    document.getElementById('uf-novo-cliente').value = '';
    
carregarPacotesNoNovoCliente();
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
const cpf = document.getElementById('cpf-novo-cliente').value;
const email = document.getElementById('email-novo-cliente').value;

const pet = document.getElementById('pet-novo-cliente').value;
const raca = document.getElementById('raca-novo-cliente').value;
const tamanho = document.getElementById('tamanho-novo-cliente').value;
const observacoesPet = document.getElementById('observacoes-pet-novo-cliente').value;

const pacoteId = document.getElementById('pacote-novo-cliente').value;
const dataAssinaturaPacote = document.getElementById('data-assinatura-pacote-novo-cliente').value;
const dataValidadePacote = document.getElementById('data-validade-pacote-novo-cliente').value;

const params = new URLSearchParams();
params.append('nome', nome);
params.append('telefone', telefone);
params.append('cpf', cpf);
params.append('email', email);
params.append('pet', pet);
params.append('nomePet', pet);
params.append('raca', raca);
params.append('tamanho', tamanho);
params.append('observacoesPet', observacoesPet);

params.append('pacoteId', pacoteId);
params.append('dataAssinaturaPacote', dataAssinaturaPacote);
params.append('dataValidadePacote', dataValidadePacote);
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

           exibirMensagem('Cliente cadastrado com sucesso.', 'success');

        } else {
            const erroTexto = await resposta.text();
            throw new Error(erroTexto || 'Erro desconhecido ao salvar.');
        }
    } catch (erro) {
        console.error("Erro:", erro);
        exibirMensagem('Erro ao cadastrar cliente', 'error');
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
            exibirMensagem('Cliente atualizado!', 'success');
            fecharModalCliente();
            await carregarClientesDoBanco();
        } else {
            exibirMensagem('Erro ao salvar alterações.', 'error');
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
        exibirMensagem('Cliente não encontrado na lista de Clientes', 'info');
        return;
    }

    const container = document.getElementById('conteudo-modal-cliente');
    const btnEdicao = document.getElementById('btn-modo-edicao');
    const footer = document.getElementById('footer-edicao-cliente');
    const btnCadastrarPet = document.querySelector('button[onclick="abrirModalNovoPetParaCliente()"]');

    const temCadastro = clienteSendoEditado.temUsuario === true;

    // --- CONTROLE DE PERMISSÕES DOS BOTÕES DO CABEÇALHO ---
    if (footer)
        footer.classList.add('hidden');

    if (btnEdicao) {
        if (temCadastro)
            btnEdicao.classList.remove('hidden');
        else
            btnEdicao.classList.add('hidden');
    }

    if (btnCadastrarPet) {
        if (temCadastro)
            btnCadastrarPet.classList.remove('hidden');
        else
            btnCadastrarPet.classList.add('hidden');
    }

    // --- LISTA DE PETS (Editável para Cadastrados, Leitura para Sem Cadastro) ---
    let htmlPets = '';
    if (clienteSendoEditado.pets && clienteSendoEditado.pets.length > 0) {
        htmlPets = clienteSendoEditado.pets.map(p => {
            let blocoObs = '';

            if (temCadastro) {
                // Cliente CADASTRADO: Campo de digitação e botão salvar
                blocoObs = `
                <div style="margin-bottom: 10px;">
                    <textarea id="obs-pet-${p.id}" rows="2" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid #444; background: #111; color: #eee;" placeholder="Observações e histórico clínico...">${p.obs || ''}</textarea>
                </div>
                <div style="text-align: right;">
                    <button onclick="salvarObsPet(${p.id}, this)" class="btn-primary" style="background: #17a2b8; border: none; font-size: 0.85rem; padding: 5px 12px; border-radius: 4px;">
                        <i class="fas fa-save"></i> Salvar Obs
                    </button>
                </div>`;
            } else {
                // Cliente SEM CADASTRO: Apenas visualização da observação
                blocoObs = `
                <div style="background: #111; padding: 10px; border-radius: 4px; border: 1px solid #333;">
                    <span style="color: #aaa; font-size: 0.8rem; display: block; margin-bottom: 4px;"><i class="fas fa-info-circle"></i> Observações:</span>
                    <div style="color: #eee; font-size: 0.9rem; font-style: ${p.obs ? 'normal' : 'italic'};">${p.obs || 'Nenhuma observação registrada.'}</div>
                </div>`;
            }

            return `
            <div style="background: #1e1e1e; border: 1px solid #333; padding: 15px; border-radius: 8px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                    <strong style="color: #C9A96E; font-size: 1.1rem;"><i class="fas fa-paw"></i> ${p.nome}</strong>
                    <div style="display: flex; gap: 5px;">
                        <span class="badge" style="background: #333; color: #ccc;">${p.tipo || 'N/A'}</span>
                        <span class="badge" style="background: #333; color: #ccc;">${p.raca || 'S/R'}</span>
                        <span class="badge" style="background: #333; color: #ccc;">Porte ${p.porte || 'N/A'}</span>
                    </div>
                </div>
                ${blocoObs}
            </div>`;
        }).join('');
    } else {
        htmlPets = '<div style="padding: 15px; text-align: center; color: #888;">Nenhum pet cadastrado.</div>';
    }

    // --- INFORMAÇÕES DE USUÁRIO (APENAS PARA CLIENTES CADASTRADOS) ---
    let htmlUsuario = '';
    if (temCadastro && clienteSendoEditado.usuario) {
        const u = clienteSendoEditado.usuario;

        let dataCriacao = 'Não informada';
        const dRaw = u.dataCriacao || u.data_criacao || clienteSendoEditado.dataCadastro;
        if (dRaw) {
            try {
                if (Array.isArray(dRaw))
                    dataCriacao = `${String(dRaw[2]).padStart(2, '0')}/${String(dRaw[1]).padStart(2, '0')}/${dRaw[0]}`;
                else {
                    const d = new Date(dRaw);
                    if (!isNaN(d.getTime()))
                        dataCriacao = d.toLocaleDateString('pt-BR');
                    else
                        dataCriacao = dRaw;
                }
            } catch (e) {
                dataCriacao = dRaw;
            }
        }

        htmlUsuario = `
        <h5 style="color: #17a2b8; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 10px; margin-top: 20px;">
            <i class="fas fa-user-shield"></i> Dados de Acesso ao App
        </h5>
        <div style="background: rgba(23, 162, 184, 0.05); border: 1px solid rgba(23, 162, 184, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 15px;">
            <div>
                <span style="font-size: 0.75rem; color: #888; display: block; text-transform: uppercase;">E-mail</span>
                <strong style="color: #eee; font-size: 0.9rem; word-break: break-all;">${u.email || 'Não informado'}</strong>
            </div>
            <div>
                <span style="font-size: 0.75rem; color: #888; display: block; text-transform: uppercase;">CPF</span>
                <strong style="color: #eee; font-size: 0.9rem;">${u.cpf ? u.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : 'Não informado'}</strong>
            </div>
            <div>
                <span style="font-size: 0.75rem; color: #888; display: block; text-transform: uppercase;">Membro Desde</span>
                <strong style="color: #eee; font-size: 0.9rem;">${dataCriacao}</strong>
            </div>
            <div>
                <span style="font-size: 0.75rem; color: #888; display: block; text-transform: uppercase; margin-bottom: 4px;">Status</span>
                <span class="badge" style="background: ${u.ativo ? 'rgba(40,167,69,0.2)' : 'rgba(220,53,69,0.2)'}; color: ${u.ativo ? '#28a745' : '#dc3545'}; border: 1px solid ${u.ativo ? '#28a745' : '#dc3545'}; font-size: 0.75rem;">
                    ${u.ativo ? 'Ativa' : 'Bloqueada'}
                </span>
            </div>
        </div>`;
    }
    // Se NÃO tem cadastro, a variável htmlUsuario permanece vazia (''), exibindo apenas cliente e pet.

    // --- RENDERIZAÇÃO FINAL ---
    container.innerHTML = `
        <div id="view-mode">
            <div style="margin-bottom: 20px;">
                <h4 style="color: #eee; margin: 0 0 5px 0; font-size: 1.3rem;">${clienteSendoEditado.nome}</h4>
                <div style="color: #aaa; font-size: 0.95rem;"><i class="fab fa-whatsapp" style="color: #25d366;"></i> ${clienteSendoEditado.telefone}</div>
                ${temCadastro ? `<span class="badge" style="background-color: rgba(40, 167, 69, 0.15); color: #28a745; margin-top: 8px; display: inline-block;"><i class="fas fa-check-circle"></i> Possui Login no App</span>` : ''}
            </div>

            ${htmlUsuario}

            <h5 style="color: #C9A96E; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 10px;">
                <i class="fas fa-map-marker-alt"></i> Endereço
            </h5>
            <div style="color: #ccc; font-size: 0.9rem; margin-bottom: 20px; background: #111; padding: 12px; border-radius: 6px; border: 1px solid #222;">
                ${clienteSendoEditado.endereco ? `
                    <p style="margin: 3px 0;">${clienteSendoEditado.endereco.logradouro}, ${clienteSendoEditado.endereco.numero}</p>
                    <p style="margin: 3px 0;">${clienteSendoEditado.endereco.bairro} - ${clienteSendoEditado.endereco.cidade}</p>
                ` : '<p style="color: #666; font-style: italic;">Endereço não cadastrado.</p>'}
            </div>
            
            <h5 style="color: #eee; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 15px;"><i class="fas fa-dog"></i> Pets do Cliente</h5>
            ${htmlPets}
        </div>
    `;

    if (btnEdicao)
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
        exibirMensagem('Erro ao salvar a observação do pet.', 'error');
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

    petIdEdicao = null;

    document.getElementById('form-pet').reset();
    document.getElementById('pet-cliente-id').value = clienteSendoEditado.id;

    const titulo = document.querySelector('#modal-pet h3');
    if (titulo)
        titulo.innerHTML = '<i class="fas fa-dog"></i> Novo Pet';

    document.getElementById('modal-pet').classList.remove('hidden');
}

function fecharModalPet() {
    document.getElementById('modal-pet').classList.add('hidden');
}

function abrirModalEditarPet(petId) {
    const pet = clienteSendoEditado.pets.find(p => p.id === petId);
    if (!pet)
        return;

    petIdEdicao = pet.id;

    // Preenche os campos do formulário
    document.getElementById('pet-nome').value = pet.nome;
    document.getElementById('pet-tipo').value = pet.tipo;
    document.getElementById('pet-raca').value = pet.raca;
    document.getElementById('pet-porte').value = pet.porte;
    document.getElementById('pet-obs').value = pet.obs || '';
    document.getElementById('pet-cliente-id').value = clienteSendoEditado.id;

    const titulo = document.querySelector('#modal-pet h3');
    if (titulo)
        titulo.innerHTML = '<i class="fas fa-edit"></i> Editar Pet';

    document.getElementById('modal-pet').classList.remove('hidden');
}

async function salvarPet(event) {
    event.preventDefault();

    const petData = {
        id: petIdEdicao,
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
            exibirMensagem(petIdEdicao ? "🐾 Pet atualizado!" : "🐾 Pet cadastrado!", 'success');
            fecharModalPet();
            await carregarClientesDoBanco(); // Recarrega a lista
            if (clienteSendoEditado)
                abrirModalCliente(clienteSendoEditado.id); // Atualiza os detalhes abertos
        } else {
            exibirMensagem('Erro ao salvar pet.', 'error');
        }
    } catch (e) {
        console.error(e);
    }
}

function preencherModalPet(clienteId, petId) {
    const cliente = listaClientes.find(c => c.id === clienteId);
    if (!cliente)
        return;

    const pet = cliente.pets.find(p => p.id === petId);
    if (!pet)
        return;

    petIdEdicao = pet.id;
    clienteIdAtual = clienteId;

    document.querySelector('#modal-pet h3').innerHTML = '<i class="fas fa-edit"></i> Editar Pet';

    document.getElementById('pet-nome').value = pet.nome;
    document.getElementById('pet-tipo').value = pet.tipo || '';
    document.getElementById('pet-raca').value = pet.raca || '';
    document.getElementById('pet-porte').value = pet.porte || 'Médio';
    document.getElementById('pet-obs').value = pet.obs || '';
    document.getElementById('pet-cliente-id').value = clienteId;

    document.getElementById('modal-pet').classList.remove('hidden');
}