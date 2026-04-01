let ultimoHashDados = "";

let horariosSemana = [];
let servicosCadastrados = [];

function pararAnimacaoSync(icone) {
    if (icone) {
        icone.classList.remove('fa-spin');
        // Se não deu erro (não tá vermelho), volta pro cinza discreto
        if (icone.style.color !== 'rgb(199, 122, 122)' && icone.style.color !== '#c77a7a') {
            icone.style.color = '#ccc';
        }
    }
}

async function carregarAgendaDoBanco(silencioso = false) {
    const el = document.getElementById('lista-agenda');

    const iconeSync = document.getElementById('icone-sync');
    if (iconeSync) {
        iconeSync.classList.add('fa-spin'); //  girar
        iconeSync.style.color = '#C9A96E';
    }

    const elementoFocado = document.activeElement;
    const idFocado = elementoFocado ? elementoFocado.id : null;
    let cursorInicio = null;
    let cursorFim = null;

    // Se for um input de texto digitável, salva onde o cursor estava
    if (idFocado && (elementoFocado.tagName === 'INPUT' || elementoFocado.tagName === 'TEXTAREA')) {
        try {
            cursorInicio = elementoFocado.selectionStart;
            cursorFim = elementoFocado.selectionEnd;
        } catch (e) {
        } // Alguns inputs como type="date" não usam selection
    }

    if (el && !silencioso) {
        el.innerHTML = `
            <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <i class="fas fa-circle-notch fa-spin" style="font-size: 2rem; color: #C9A96E; margin-bottom: 10px;"></i>
                <p>Sincronizando agenda com o servidor...</p>
            </div>`;
    }

    try {
        const resposta = await fetch('../api/agendamentos/listar');
        if (!resposta.ok)
            throw new Error("Erro ao buscar agenda");

        const todosOsAgendamentos = await resposta.json();

        const novoHash = JSON.stringify(todosOsAgendamentos);

        if (silencioso && novoHash === ultimoHashDados) {
            if (iconeSync) {
                setTimeout(() => {
                    iconeSync.classList.remove('fa-spin');
                    iconeSync.style.color = '#ccc'; // Volta pro cinza
                }, 600);
            }
            return;
        }

        ultimoHashDados = novoHash;

        novos = todosOsAgendamentos.filter(a =>
            a.status === 'Novo' || a.status === 'novo'
        );

        agenda = todosOsAgendamentos.filter(a =>
            a.status === 'Confirmado' || a.status === 'confirmado'
        );

        pendentes = todosOsAgendamentos.filter(a =>
            a.status === 'Pendente' || a.status === 'pendente'
        );

        historico = todosOsAgendamentos.filter(a =>
            a.status === 'Concluido' || a.status === 'concluido'
        );

        retirada = todosOsAgendamentos.filter(a =>
            a.status === 'Retirada' || a.status === 'retirada'
        );

        // Renderiza tudo (destrói e recria o HTML)
        if (typeof renderNovos === 'function')
            renderNovos();
        if (typeof renderAgenda === 'function')
            renderAgenda();
        if (typeof renderPendentes === 'function')
            renderPendentes();
        if (typeof renderRetirada === 'function')
            renderRetirada();

        if (typeof atualizarBadges === 'function') {
            atualizarBadges();
        }

        if (idFocado) {
            const elementoParaFocar = document.getElementById(idFocado);
            if (elementoParaFocar) {
                elementoParaFocar.focus(); // Devolve o clique/foco

                // Devolve a posição do cursor (para o admin não perder o que estava digitando no meio da palavra)
                if (cursorInicio !== null && cursorFim !== null) {
                    try {
                        elementoParaFocar.setSelectionRange(cursorInicio, cursorFim);
                    } catch (e) {
                    }
                }
            }
        }

        if (!document.getElementById('page-dashboard').classList.contains('hidden')) {
            renderDashboard();
        }
        if (iconeSync) {
            setTimeout(() => {
                iconeSync.classList.remove('fa-spin');
                iconeSync.style.color = '#ccc'; // Volta pro cinza
            }, 600);
        }
    } catch (erro) {
        if (iconeSync) {
            iconeSync.style.color = '#ff0000';
        }
        if (el) {
            el.innerHTML = `<p style="color:red; text-align:center; font-weight:bold; font-size: 1.1rem; padding: 20px;">
                🚨 ERRO NO JS: ${erro.message}
            </p>`;
        }
}
}

function renderAgenda() {
    const busca = (document.getElementById('busca-agenda')?.value || '').toLowerCase();
    const filData = document.getElementById('filtro-data-agenda')?.value || '';
    const filFunc = document.getElementById('filtro-func-agenda')?.value || '';

    // Identifica o utilizador atual
    const isFuncionario = (typeof perfil !== 'undefined' && perfil === 'Funcionario');
    const nomeLogado = (typeof logado !== 'undefined') ? logado : '';

    const lista = agenda.filter(a => {
        const matchBusca = (a.pet + a.dono + a.servico).toLowerCase().includes(busca);
        const matchData = filData ? a.data === filData : true;

        let matchFunc = true;
        if (!isFuncionario && filFunc) {
            matchFunc = (a.funcionario === filFunc);
        }

        return matchBusca && matchData && matchFunc;
    }).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));

    const el = document.getElementById('lista-agenda');
    if (!el)
        return;

    if (!lista.length) {
        el.innerHTML = `<div class="empty-state"><i class="fas fa-calendar-check" style="color:#5ac75a; font-size: 2rem; margin-bottom: 10px;"></i><p>Nenhum agendamento encontrado</p></div>`;
        return;
    }

    const listaFuncs = (typeof funcionarios !== 'undefined' && Array.isArray(funcionarios)) ? funcionarios : [];

    el.innerHTML = lista.map(a => {
        const statusPag = a.statusPag || a.status_pagamento || 'Pendente';
        const formaPag = a.formaPag || a.forma_pagamento || '';
        const entradaPet = a.entrada_pet || a.entradaPet || '';
        const saidaPet = a.saida_pet || a.saidaPet || '';
        const observacoes = a.obs || '';

        let funcAtribuido = a.funcionario;
        if (funcAtribuido === 'null' || funcAtribuido === null || funcAtribuido === undefined) {
            funcAtribuido = '';
        }
        funcAtribuido = funcAtribuido.trim();

        let selectFuncHtml = '';

        if (isFuncionario) {
            if (funcAtribuido !== '' && funcAtribuido !== '—' && funcAtribuido !== nomeLogado) {
                selectFuncHtml = `
                    <select class="sel-func" disabled style="opacity: 0.7; cursor: not-allowed; background: #222;">
                        <option value="${funcAtribuido}" selected>${funcAtribuido}</option>
                    </select>`;
            } else {
                selectFuncHtml = `
                    <select class="sel-func" style="border: 1px solid #C9A96E; background: #1a1a1a; color: #fff;">
                        <option value="">— Pegar Serviço —</option>
                        <option value="${nomeLogado}" ${funcAtribuido === nomeLogado ? 'selected' : ''}>${nomeLogado}</option>
                    </select>`;
            }
        } else {
            selectFuncHtml = `
                <select class="sel-func">
                    <option value="">— Selecionar —</option>
                    ${listaFuncs.map(f => `<option value="${f.nome}" ${a.funcionario === f.nome ? 'selected' : ''}>${f.nome}</option>`).join('')}
                </select>`;
        }

        return `
            <div class="agenda-card" style="${a.funcionario === nomeLogado && isFuncionario ? 'border-left: 5px solid #28a745;' : ''}">
              <div class="ac-header">
                <div>
                  <div class="ac-pet"><i class="fas fa-paw" style="color:#C9A96E;margin-right:6px;font-size:.8rem"></i>${a.pet} <small style="color:#888;font-weight:400">(${a.tipo})</small></div>
                  <div class="ac-dono">${a.dono} · <a href="https://wa.me/55${cleanTel(a.contato)}" target="_blank" style="color:#25d366"><i class="fab fa-whatsapp"></i> ${a.contato}</a></div>
                </div>
                <div style="text-align:right">
                  <span class="badge-confirmado">Confirmado</span>
                  <div style="font-size:.75rem;color:#C9A96E;margin-top:4px">${fd(a.data)} às ${a.hora}</div>
                </div>
              </div>
              <div style="margin-bottom:10px"><span class="badge badge-amarelo">${a.servico}</span></div>
              <div class="ac-grid">
                
                <div class="ag-field"><label>Funcionário Responsável</label>
                  ${selectFuncHtml}
                </div>
                
                <div class="ag-field"><label>Valor (R$)</label>
                    <input type="text" class="inp-valor" value="${typeof formatarValorTela === 'function' ? formatarValorTela(a.valor) : a.valor}" placeholder="0,00" oninput="if(typeof aplicarMascaraMoeda === 'function') aplicarMascaraMoeda(this)"/>
                </div>
                
                <div class="ag-field"><label>Forma de Pagamento</label>
                  <select class="sel-forma">
                    <option value="" ${!formaPag ? 'selected' : ''}>— Selecionar —</option>
                    ${['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito'].map(p => `<option value="${p}" ${formaPag === p ? 'selected' : ''}>${p}</option>`).join('')}
                  </select>
                </div>
                
                <div class="ag-field"><label>Status Pagamento</label>
                  <select class="sel-status">
                    <option value="Pendente" ${statusPag === 'Pendente' ? 'selected' : ''}>Pendente</option>
                    <option value="Pago" ${statusPag === 'Pago' ? 'selected' : ''}>Pago</option>
                  </select>
                </div>
                
                <div class="ag-field"><label>Entrada do Pet</label>
                  <input type="time" class="inp-entrada" value="${entradaPet}" />
                </div>
                
                <div class="ag-field"><label>Saída do Pet</label>
                  <input type="time" class="inp-saida" value="${saidaPet}" />
                </div>
                
              </div>
              
              <div class="ac-obs" style="margin-bottom:10px">
                <label>Observações</label>
                <textarea class="txt-obs" rows="2" placeholder="Notas internas...">${observacoes}</textarea>
              </div>
              
              <div class="ac-footer">
                <button class="btn-save-agenda" onclick="salvarAgendaManual(${a.id}, this)"><i class="fas fa-save"></i> Salvar Alterações</button>
                <button class="btn-concluir" onclick="concluirAtendimento(${a.id}, this)"><i class="fas fa-check-double"></i> Concluir Serviço</button>
              </div>
            </div>`;
    }).join('');
}

function renderPendentes() {
    const busca = (document.getElementById('busca-pend')?.value || '').toLowerCase();
    const lista = pendentes.filter(a => (a.pet + a.dono + a.servico).toLowerCase().includes(busca));
    const el = document.getElementById('lista-pendentes');
    if (!el)
        return;
    if (!lista.length) {
        el.innerHTML = `<div class="empty-state"><i class="fas fa-clock" style="color:#555"></i><p>Nenhum pedido pendente</p></div>`;
        return;
    }

    const dataAtual = new Date();
    dataAtual.setMinutes(dataAtual.getMinutes() - dataAtual.getTimezoneOffset());
    const dataMinima = dataAtual.toISOString().split('T')[0];

    el.innerHTML = lista.map(a => `
            <div class="pendente-card">
              <div class="pc-header">
                <div><div class="pc-pet"><i class="fas fa-paw" style="color:#c77a7a;margin-right:6px;font-size:.8rem"></i>${a.pet} <small>(${a.tipo})</small></div><div class="pc-dono">${a.dono} · ${a.contato}</div></div>
                <span class="badge-pend-red">Pendente</span>
              </div>
              <div class="pc-info">
                <span><i class="fas fa-scissors"></i> ${a.servico}</span>
                <span><i class="fas fa-calendar"></i> Data original: ${fd(a.data)} às ${a.hora}</span>
                ${a.obs ? `<span><i class="fas fa-sticky-note"></i> ${a.obs}</span>` : ''}
              </div>
            <div class="section-lbl">Reagendar</div>
              <div class="pc-reagen">
                <div class="field">
                    <label>Nova Data</label>
                    <input type="date" id="pnd-data-${a.id}" value="${a.data}" min="${dataMinima} onchange="verificarDisponibilidade(${a.id}, this.value)"/>
                </div>
                <div class="field">
                    <label>Nova Hora</label>
                    <input type="time" id="pnd-hora-${a.id}" value="${a.hora}"/>
                </div>
                <div id="pnd-disp-${a.id}" style="width: 100%; font-size: 0.72rem; margin-top: 4px;"></div>
              </div>
              <div class="pc-actions">
                <button class="btn-confirmar-pend" onclick="confirmarPendente(${a.id})">
                    <i class="fas fa-check"></i> Confirmar
                </button>
                
                <button class="btn-wpp-pend" onclick="sugerirReagendamento(${a.id}, '${a.contato}', '${a.dono}', '${a.pet}')">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
                
                <button class="btn-excluir-pend" onclick="excluirPendente(${a.id})">
                    <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>`).join('');

    lista.forEach(a => {
        verificarDisponibilidade(a.id, a.data);
    });
}

function renderRetirada() {
    // 1. Pega o valor da barra de busca (se você tiver uma na aba de retirada)
    const busca = (document.getElementById('busca-retirada')?.value || '').toLowerCase();

    // 2. Filtra a lista 'retirada' (que o nosso carregarAgendaDoBanco já alimenta automaticamente)
    const lista = retirada.filter(a => (a.pet + a.dono + a.servico).toLowerCase().includes(busca));

    // 3. Acha a div principal onde os cards vão aparecer
    const el = document.getElementById('lista-retirada');
    if (!el)
        return;

    if (!lista.length) {
        el.innerHTML = `<div class="empty-state"><i class="fas fa-home" style="color:#5ac75a; font-size: 2rem; margin-bottom: 10px;"></i><p>Nenhum pet aguardando o dono no momento.</p></div>`;
        return;
    }

    // 4. Desenha os cards
    el.innerHTML = lista.map(a => {
        // Formata o valor cobrado para mostrar bonitinho (ex: 150.5 -> 150,50)
        const valorFormatado = a.valor ? parseFloat(a.valor).toFixed(2).replace('.', ',') : '0,00';
        // Define a cor do texto do pagamento (Vermelho se pendente, Verde se pago)
        const corPagamento = (a.status_pagamento === 'Pago') ? '#5ac75a' : '#c77a7a';

        return `
            <div class="agenda-card" style="border-left: 5px solid #17a2b8;">
                <div class="ac-header">
                    <div>
                        <div class="ac-pet"><i class="fas fa-paw" style="color:#17a2b8;margin-right:6px;font-size:.8rem"></i>${a.pet} <small style="color:#888;font-weight:400">(${a.tipo})</small></div>
                        <div class="ac-dono">${a.dono} · <a href="https://wa.me/55${cleanTel(a.contato)}" target="_blank" style="color:#25d366"><i class="fab fa-whatsapp"></i> ${a.contato}</a></div>
                    </div>
                    <div style="text-align:right">
                        <span class="badge" style="background-color: #17a2b8; color: white;">Aguardando Dono</span>
                    </div>
                </div>
                
                <div style="margin-bottom:15px; font-size: 0.95rem; line-height: 1.6;">
                    <div><strong>Serviço:</strong> <span class="badge badge-amarelo">${a.servico}</span></div>
                    <div><strong>Valor Final:</strong> R$ ${valorFormatado}</div>
                    <div><strong>Status do Pagamento:</strong> <span style="color: ${corPagamento}; font-weight: bold;">${a.status_pagamento || 'Pendente'}</span></div>
                </div>
                
                ${a.obs ? `<div style="font-size:.85rem;color:#888;margin-bottom:15px; background: #f9f9f9; padding: 8px; border-radius: 4px;"><i class="fas fa-info-circle" style="color:#C9A96E;margin-right:5px"></i>${a.obs}</div>` : ''}
                
                <div class="ac-footer" style="display: flex; justify-content: flex-end;">
                    <button class="btn-concluir" onclick="finalizarRetirada(${a.id}, this)" style="background-color: #5ac75a; color: #000; padding: 8px 16px; border-radius: 6px; border: none; font-weight: 600; cursor: pointer;">
                        <i class="fas fa-flag-checkered"></i> Entregar Pet (Finalizar)
                    </button>
                </div>
            </div>`;
    }).join('');
}

function renderNovos() {
    const busca = (document.getElementById('busca-novos')?.value || '').toLowerCase();
    const lista = novos.filter(a => (a.pet + a.dono + a.servico).toLowerCase().includes(busca));
    const el = document.getElementById('lista-novos');
    if (!el)
        return;

    if (!lista.length) {
        el.innerHTML = `<div class="empty-state" style="padding: 30px; text-align: center; border-radius: 8px; border: 1px dashed #ccc;"><i class="fas fa-bell-slash" style="font-size: 2rem; color: #C9A96E; margin-bottom: 10px;"></i><p>Nenhum pedido novo no momento.</p></div>`;
        return;
    }

    const clientesCadastrados = typeof listaClientes !== 'undefined' ? listaClientes : [];

    // Lista de horários comerciais padrão para sugerir ao administrador
    const horariosComerciais = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    el.innerHTML = lista.map(a => {

        // 🐛 1. CORREÇÃO DO BUG DE CADASTRO E PACOTE
        const telContato = cleanTel(a.contato || '');
        let cli = undefined;

        // Só tenta encontrar o cliente se o telefone digitado tiver pelo menos 8 dígitos
        if (telContato.length >= 8) {
            cli = clientesCadastrados.find(c => cleanTel(c.telefone || '') === telContato);
        }

        if (cli) {

        }

        // Só tem pacote se o ID existir, for diferente de zero e diferente da string "null"
        const temPacote = cli && cli.pacoteId && String(cli.pacoteId) !== "0" && String(cli.pacoteId).toLowerCase() !== "null";

        const linkWhats = a.contato
                ? `<a href="https://wa.me/55${cleanTel(a.contato)}" target="_blank" onclick="event.stopPropagation()" style="color:#25d366; text-decoration: none; font-weight: 500;"><i class="fab fa-whatsapp"></i> ${a.contato}</a>`
                : `<span style="opacity: 0.6;"><i class="fas fa-phone-slash"></i> Sem contato</span>`;


        // 🟢 2. MÁGICA DA VALIDAÇÃO DE DISPONIBILIDADE
        const horaPedida = (a.hora || '').substring(0, 5); // Ex: "14:00"

        // Pega todas as horas já confirmadas na Agenda para o mesmo dia deste pedido
        const ocupadosNoDia = agenda.filter(ag => ag.data === a.data).map(ag => (ag.hora || '').substring(0, 5));

        // Verifica se a hora pedida está no meio das ocupadas
        const isDisponivel = !ocupadosNoDia.includes(horaPedida);

        // Acha sugestões livres (ignorando as ocupadas)
        const livres = horariosComerciais.filter(h => !ocupadosNoDia.includes(h));

        // Tenta sugerir horários DEPOIS da hora pedida. Se não tiver, sugere os primeiros da manhã.
        let sugestoes = livres.filter(h => h > horaPedida).slice(0, 3);
        if (sugestoes.length === 0)
            sugestoes = livres.slice(0, 3);

        // Constrói a caixinha visual de aviso
        const boxDisponibilidade = isDisponivel
                ? `<div style="margin-top: 12px; padding: 10px; border-radius: 6px; background: rgba(40,167,69,0.1); border-left: 3px solid #28a745; font-size: 0.85rem;">
                   <strong style="color: #28a745;"><i class="fas fa-check-circle"></i> Horário Livre!</strong> <span style="opacity: 0.8;">Você pode aceitar o pedido.</span>
               </div>`
                : `<div style="margin-top: 12px; padding: 10px; border-radius: 6px; background: rgba(220,53,69,0.1); border-left: 3px solid #dc3545; font-size: 0.85rem;">
                   <strong style="color: #dc3545;"><i class="fas fa-times-circle"></i> Horário Ocupado!</strong>
                   <div style="margin-top: 4px; opacity: 0.8;">Sugestões livres neste dia: <strong>${sugestoes.length > 0 ? sugestoes.join(', ') : 'Dia totalmente lotado'}</strong></div>
               </div>`;


        // 🎨 3. DESENHO DO CARTÃO
        return `
        <div class="agenda-card cartao-expansivel" style="border-left: 5px solid ${isDisponivel ? '#17a2b8' : '#dc3545'}; padding: 20px; margin-bottom: 20px; transition: all 0.3s ease;">
            
            <div class="ac-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                <div>
                    <h3 style="margin: 0 0 5px 0; font-size: 1.2rem; font-weight: 700;">
                        <i class="fas fa-paw" style="color:#17a2b8; margin-right: 6px;"></i> ${a.pet} <small style="opacity: 0.7; font-weight: normal; font-size: 0.9rem;">(${a.tipo || 'Pet'})</small>
                    </h3>
                    <div style="margin-top: 4px; font-size: 0.95rem; opacity: 0.85;">
                        <i class="fas fa-user" style="color:#C9A96E; margin-right: 4px;"></i> ${a.dono} &nbsp;|&nbsp; ${linkWhats}
                    </div>
                </div>
                <div style="text-align:right; display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                    <span class="badge" style="background-color: rgba(23, 162, 184, 0.15); color: #17a2b8; border: 1px solid #17a2b8; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; font-weight: 600;"><i class="fas fa-star"></i> Novo Pedido</span>
                    ${temPacote ? `<span class="badge" style="background-color: rgba(133, 100, 4, 0.15); color: #d39e00; border: 1px solid #ffeeba; font-size: 0.7rem; padding: 3px 8px; border-radius: 12px;"><i class="fas fa-box-open"></i> Pacote Ativo</span>` : ''}
                    ${cli && cli.temUsuario
                ? `<span class="badge" style="background-color: rgba(40, 167, 69, 0.15); color: #28a745; border: 1px solid #c3e6cb; font-size: 0.7rem; padding: 3px 8px; border-radius: 12px;"><i class="fas fa-address-book"></i> Cadastrado</span>`
                : `<span class="badge" style="background-color: rgba(150, 150, 150, 0.1); color: #888; border: 1px dashed #555; font-size: 0.7rem; padding: 3px 8px; border-radius: 12px;"><i class="fas fa-user-slash"></i> Sem cadastro</span>`
                }
                </div>
            </div>

            <div style="border: 1px solid rgba(150, 150, 150, 0.2); padding: 12px 15px; border-radius: 6px; margin-bottom: 15px;">
                <div style="margin-bottom: 8px; font-size: 1rem;">
                    <strong>Serviço Solicitado:</strong> <span class="badge" style="background: #C9A96E; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: normal;">${a.servico}</span>
                </div>
                <div style="font-size: 0.9rem; margin-bottom: 5px;">
                    <i class="far fa-calendar-alt" style="color:#17a2b8; margin-right: 5px;"></i> <strong>Data sugerida:</strong> ${fd(a.data)} às ${horaPedida}
                </div>
                
                ${a.obs ? `<div style="font-size: 0.85rem; margin-top: 8px; border-left: 3px solid #C9A96E; padding-left: 8px; opacity: 0.8;"><em><i class="fas fa-info-circle" style="color:#C9A96E;"></i> ${a.obs}</em></div>` : ''}
                ${temPacote ? `<div style="font-size: 0.8rem; color: #d39e00; margin-top: 8px; background: rgba(255, 243, 205, 0.1); border: 1px dashed #ffeeba; padding: 5px; border-radius: 4px;"><i class="fas fa-exclamation-triangle"></i> Cliente possui pacote. O serviço será descontado na conclusão.</div>` : ''}
                
                ${boxDisponibilidade}
            </div>

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px; border-top: 1px solid rgba(150, 150, 150, 0.2); padding-top: 15px;">
                <button onclick="recusarPedido(${a.id}, this)" style="background: transparent; color: #dc3545; border: 1px solid #dc3545; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='rgba(220, 53, 69, 0.1)';" onmouseout="this.style.background='transparent';">
                    <i class="fas fa-clock"></i> Mover p/ Pendentes
                </button>
                
                <button onclick="aceitarPedido(${a.id}, this, '${a.data}', '${a.hora}', '${a.pet}')" 
                    ${!isDisponivel ? 'disabled' : ''} 
                    style="background: ${isDisponivel ? '#28a745' : '#ccc'}; color: #fff; border: none; padding: 8px 15px; border-radius: 6px; font-weight: 600; cursor: ${isDisponivel ? 'pointer' : 'not-allowed'}; transition: all 0.2s;">
                    <i class="fas fa-check"></i> Aceitar Pedido
                </button>
            </div>
        </div>`;
    }).join('');
}

function renderServicos() {
    const lista = document.getElementById('lista-servicos');
    if (!lista)
        return;

    if (servicosCadastrados.length === 0) {
        lista.innerHTML = '<div class="empty-state"><i class="fas fa-cut"></i><p>Nenhum serviço cadastrado ainda.</p></div>';
        return;
    }

    lista.innerHTML = servicosCadastrados.map(s => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border: 1px solid #252525; border-left: 4px solid #C9A96E; border-radius: 8px; background: #111;">
            <div>
                <strong style="color: #eee; display: block; font-size: 1rem; margin-bottom: 4px;">${s.nome}</strong>
                <span style="font-size: 0.8rem; color: #888;"><i class="fas fa-stopwatch" style="color: #C9A96E; margin-right: 4px;"></i> ${s.tempo} minutos estim.</span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="abrirModalServico(${s.id})" class="btn-sm-primary" title="Editar"><i class="fas fa-edit"></i></button>
                <button onclick="excluirServico(${s.id}, this)" class="btn-danger-sm" title="Excluir"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function renderHorarios() {
    const grid = document.getElementById('grid-horarios');
    if (!grid)
        return;

    grid.innerHTML = horariosSemana.map((h, index) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: ${h.aberto ? '#f8f9fa' : '#ffeeba'}; border: 1px solid #ddd; border-radius: 6px; transition: 0.3s;">
            <div style="width: 120px; font-weight: 600; color: ${h.aberto ? '#333' : '#888'};">
                <input type="checkbox" id="dia-${index}" ${h.aberto ? 'checked' : ''} onchange="toggleDia(${index}, this.checked)" style="margin-right: 5px; accent-color: #17a2b8; cursor: pointer;">
                <label for="dia-${index}" style="cursor: pointer;">${h.nomeDia}</label>
            </div>
            
            <div style="display: flex; gap: 10px; opacity: ${h.aberto ? '1' : '0.4'}; pointer-events: ${h.aberto ? 'auto' : 'none'}; transition: 0.3s;">
                <input type="time" value="${h.horaAbertura || ''}" onchange="atualizarHora(${index}, 'abre', this.value)" style="padding: 5px; border: 1px solid #ccc; border-radius: 4px; outline: none; background: #fff; color: #333;">
                <span style="line-height: 28px; color: #333;">às</span>
                <input type="time" value="${h.horaFechamento || ''}" onchange="atualizarHora(${index}, 'fecha', this.value)" style="padding: 5px; border: 1px solid #ccc; border-radius: 4px; outline: none; background: #fff; color: #333;">
            </div>
        </div>
    `).join('');
}

function renderConfiguracoes() {
    navConfig('servicos');
}

function navConfig(aba) {
    ['servicos', 'horarios', 'pacotes'].forEach(a => {
        document.getElementById('conf-' + a).style.display = 'none';
        document.getElementById('btn-conf-' + a).classList.remove('active');
    });

    document.getElementById('conf-' + aba).style.display = 'block';
    document.getElementById('btn-conf-' + aba).classList.add('active');

    if (aba === 'servicos')
        carregarServicosDoBanco();
    if (aba === 'horarios')
        carregarHorariosDoBanco();
    if (aba === 'pacotes') {
        carregarPacotesAdmin();
        carregarServicosNoSelect();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        carregarAgendaDoBanco(false);
    } catch (e) {
        console.error('Erro na inicialização do sistema:', e);
    }
});

function sugerirReagendamento(id, contato, dono, pet) {
    // 1. Lê a data e a hora que o Admin escolheu nas caixinhas do card
    const inputData = document.getElementById(`pnd-data-${id}`).value;
    const inputHora = document.getElementById(`pnd-hora-${id}`).value;

    if (!inputData || !inputHora) {
        alert("Por favor, preencha uma data e hora para sugerir ao cliente.");
        return;
    }

    const dataFormatada = inputData.split('-').reverse().join('/');
    const mensagem = `*Cantinho do Banho*\n\nOlá, *${dono}*! Tudo bem?\n\nTemos um horário disponível para o(a) *${pet}* no dia *${dataFormatada}* às *${inputHora}*.\n\nPodemos confirmar esse reagendamento?`;

    openWA(contato, mensagem);
}

function verificarDisponibilidade(id, dataSelecionada) {
    const elDisp = document.getElementById(`pnd-disp-${id}`);
    if (!elDisp)
        return;

    if (!dataSelecionada) {
        elDisp.innerHTML = '';
        return;
    }

    const horariosOcupados = agenda
            .filter(a => a.data === dataSelecionada)
            .map(a => a.hora)
            .sort();

    if (horariosOcupados.length === 0) {
        elDisp.innerHTML = `<span style="color:#5ac75a"><i class="fas fa-check-circle"></i> Dia totalmente livre!</span>`;
    } else {
        elDisp.innerHTML = `<span style="color:#C9A96E"><i class="fas fa-exclamation-circle"></i> Ocupados: <strong>${horariosOcupados.join(', ')}</strong></span>`;
    }
}

async function confirmarPendente(id) {
    const novaData = document.getElementById(`pnd-data-${id}`)?.value;
    const novaHora = document.getElementById(`pnd-hora-${id}`)?.value;

    const item = pendentes.find(x => x.id === id);
    if (!item)
        return;

    const dataFinal = novaData || item.data;
    const horaFinal = novaHora || item.hora;

    const horarioOcupado = agenda.some(a => a.data === dataFinal && a.hora === horaFinal);

    if (horarioOcupado) {
        const dataBR = dataFinal.split('-').reverse().join('/');
        alert(`⚠️ Choque de Horários!\n\nJá existe um agendamento confirmado para o dia ${dataBR} às ${horaFinal}.\n\nPor favor, escolha um horário diferente antes de confirmar.`);
        return;
    }

    try {
        // Prepara os dados para enviar ao Java
        const params = new URLSearchParams();
        params.append('id', id);
        params.append('status', 'Confirmado')
        if (novaData)
            params.append('data', novaData);
        if (novaHora)
            params.append('hora', novaHora);

        const resposta = await fetch('../api/agendamentos/confirmar', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            await carregarAgendaDoBanco(true);
        } else {
            alert("Erro ao confirmar no banco de dados.");
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Falha de comunicação com o servidor.");
    }
}

async function excluirPendente(id) {
    if (!confirm('Tem certeza que deseja remover este agendamento permanentemente?'))
        return;

    try {
        const params = new URLSearchParams();
        params.append('id', id);

        const resposta = await fetch('../api/agendamentos/excluir', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            await carregarAgendaDoBanco(true);
        } else {
            alert("Erro ao excluir do banco de dados.");
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Falha de comunicação com o servidor.");
    }
}

async function salvarAgendaManual(id, btn) {
    const card = btn.closest('.agenda-card');
    if (!card)
        return;

    const originalHTML = btn.innerHTML;
    const originalBg = btn.style.backgroundColor;
    const originalColor = btn.style.color;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aguarde...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    try {
        const selects = card.querySelectorAll('select');
        const inputs = card.querySelectorAll('input');
        const textarea = card.querySelector('textarea');

        const funcionario = selects[0]?.value || '';
        const formaPag = selects[1]?.value || '';
        const statusPag = selects[2]?.value || 'Pendente';

        let valorString = inputs[0]?.value || '0';
        // Tira os pontos de milhar e troca a vírgula por ponto ("1250.00")
        const valorLimpoParaOJava = valorString.replace(/\./g, '').replace(',', '.');
        const entrada_pet = inputs[1]?.value || '';
        const saida_pet = inputs[2]?.value || '';

        const obs = textarea?.value || '';

        const params = new URLSearchParams();
        params.append('id', id);
        params.append('funcionario', funcionario);
        params.append('valor', valorLimpoParaOJava);
        params.append('formaPag', formaPag);
        params.append('status_pagamento', statusPag);
        params.append('entrada_pet', entrada_pet);
        params.append('saida_pet', saida_pet);
        params.append('obs', obs);

        const resposta = await fetch('../api/agendamentos/atualizar', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            btn.innerHTML = '<i class="fas fa-check"></i> Salvo!';
            btn.style.backgroundColor = '#5ac75a';
            btn.style.color = '#fff';
            btn.style.opacity = '1';

            carregarAgendaDoBanco(true);

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
                btn.style.backgroundColor = originalBg;
                btn.style.color = originalColor;
            }, 3000);

        } else {
            throw new Error('Falha no servidor');
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao salvar os dados no banco.");
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        btn.style.opacity = '1';
    }

}

async function concluirAtendimento(id, btn) {
    const item = agenda.find(a => a.id === id);
    if (!item)
        return;

    const card = btn.closest('.agenda-card');
    const func = card.querySelector('.sel-func').value;
    const valorRaw = card.querySelector('.inp-valor').value;
    const forma = card.querySelector('.sel-forma').value;
    const status = card.querySelector('.sel-status').value;
    const entrada = card.querySelector('.inp-entrada').value;
    const saida = card.querySelector('.inp-saida').value;
    const obs = card.querySelector('.txt-obs').value;

    if (!func || func === "" || func === "null" || func === "— Pegar Serviço —") {
        alert("⚠️ Erro: Você precisa selecionar o Funcionário Responsável antes de concluir.");
        card.querySelector('.sel-func').focus();
        return;
    }
    if (!valorRaw || valorRaw === "0,00" || valorRaw === "") {
        alert("⚠️ Erro: O Valor Cobrado não pode ser zero ou vazio.");
        card.querySelector('.inp-valor').focus();
        return;
    }
    if (!forma) {
        alert("⚠️ Erro: Selecione a Forma de Pagamento.");
        card.querySelector('.sel-forma').focus();
        return;
    }
    if (status !== "Pago") {
        alert("⛔ Bloqueio: Não é possível concluir um serviço com pagamento 'Pendente'. Altere para 'Pago' após receber do cliente.");
        card.querySelector('.sel-status').focus();
        return;
    }
    if (!entrada || !saida) {
        alert("⚠️ Erro: Os horários de Entrada e Saída do pet são obrigatórios.");
        if (!entrada)
            card.querySelector('.inp-entrada').focus();
        else
            card.querySelector('.inp-saida').focus();
        return;
    }

    if (!confirm(`O serviço de ${item.pet} foi finalizado? O cliente será notificado.`)) {
        return;
    }

    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A processar...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    try {
        const params = new URLSearchParams();
        params.append('id', id);
        params.append('status', 'Retirada'); 
        params.append('funcionario', func);
        params.append('valor', valorRaw);
        params.append('formaPag', forma);
        params.append('statusPag', status);
        params.append('entradaPet', entrada);
        params.append('saidaPet', saida);
        params.append('obs', obs);

        const resposta = await fetch('../api/agendamentos/concluir', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            await carregarAgendaDoBanco(true);

            // Redireciona a tela para a aba de Retirada
            if (typeof navigateTo === 'function')
                navigateTo('retirada');

            // Manda o WhatsApp avisando o dono!
            const msg = `🐾 *Cantinho do Banho*\n\nOlá, *${item.dono}*!\nO banho do(a) *${item.pet}* terminou! Ele(a) está prontinho(a), cheiroso(a) e aguardando você. 😊\n\nVenha buscar quando puder! 🏠`;
            if (typeof openWA === 'function')
                openWA(item.contato, msg);

        } else {
            alert("Erro ao concluir o serviço.");
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Falha de comunicação com o servidor.");
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

async function listarFuncionariosDoBanco(isAdm = false) {
    try {
        let urlDaApi = '../api/funcionarios/listar';

        if (isAdm) {
            urlDaApi = '../api/funcionarios/listar-adm';
        }

        const resposta = await fetch(urlDaApi);

        if (!resposta.ok) {
            throw new Error("Erro ao buscar funcionários do banco");
        }

        funcionarios = await resposta.json();

        populateFuncSelects();

        console.log("Funcionários carregados com sucesso!", funcionarios.length);

    } catch (erro) {
        console.error("Erro ao carregar funcionários:", erro);
}
}

async function finalizarRetirada(id, btn) {
    const item = retirada.find(a => a.id === id);
    if (!item)
        return;

    if (item.status_pagamento !== 'Pago') {
        const confirmarPagamento = confirm(`Atenção: O sistema indica que o pagamento de R$ ${item.valor} ainda está PENDENTE.\n\nTem a certeza que deseja entregar o ${item.pet} e finalizar o serviço?`);
        if (!confirmarPagamento)
            return;
    } else {
        if (!confirm(`Confirmar a entrega do ${item.pet} ao dono? O agendamento será arquivado no histórico.`))
            return;
    }

    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A arquivar...';
    btn.disabled = true;

    try {
        const params = new URLSearchParams();
        params.append('id', id);
        params.append('status', 'Concluido');

        const resposta = await fetch('../api/agendamentos/concluir', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            await carregarAgendaDoBanco(true);
        } else {
            throw new Error('Falha no servidor');
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao arquivar o agendamento. Tente novamente.");
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// Formata o número do banco (ex: 150.5) para a tela (ex: 150,50)
function formatarValorTela(valor) {
    if (!valor || isNaN(valor))
        return '';
    let v = parseFloat(valor).toFixed(2);
    return v.replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

function aplicarMascaraMoeda(input) {
    let v = input.value.replace(/\D/g, ''); // Remove tudo que não for número
    if (!v) {
        input.value = '';
        return;
    }
    v = (parseInt(v) / 100).toFixed(2) + ''; // Divide por 100 para criar os centavos
    v = v.replace('.', ','); // Troca o ponto da casa decimal por vírgula
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'); // Coloca os pontos de milhar
    input.value = v;
}

// ═══════════════════════════════════════════════════
// NOVOS PEDIDOS
// ═══════════════════════════════════════════════════

async function aceitarPedido(id, btn, dataReal, horaReal, pet) {
    const horarioOcupado = agenda.some(ag => ag.data === dataReal && ag.hora === horaReal);
    const dataBR = fd(dataReal);

    if (horarioOcupado) {
        alert(`⚠️ Choque de Horários!\n\nJá existe um agendamento confirmado para o dia ${dataBR} às ${horaReal}.\n\nPor favor, clique em "Mover p/ Pendentes" para sugerir um novo horário ao cliente.`);
        return; // O código morre aqui e não aceita o pedido!
    }

    if (!confirm(`Deseja CONFIRMAR o agendamento de ${pet} para o dia ${dataBR} às ${horaReal}?`))
        return;

    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A aceitar...';
    btn.disabled = true;

    try {
        const params = new URLSearchParams();
        params.append('id', id);
        params.append('status', 'Confirmado');

        const resposta = await fetch('../api/agendamentos/confirmar', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            await carregarAgendaDoBanco(true);
        } else {
            throw new Error("Falha ao aceitar no servidor");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao confirmar o agendamento.");
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

async function recusarPedido(id, btn) {
    if (!confirm(`Deseja mover este pedido para a lista de Pendentes para negociação de horário?`))
        return;

    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A mover...';
    btn.disabled = true;

    try {
        const params = new URLSearchParams();
        params.append('id', id);
        params.append('status', 'Pendente');

        const resposta = await fetch('../api/agendamentos/confirmar', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            // Recarrega o banco e o pedido vai para a aba de Pendentes!
            await carregarAgendaDoBanco(true);
        } else {
            throw new Error("Falha ao atualizar no servidor");
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao mover o agendamento.");
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

// ================= CONFIGURAÇÕES: SERVIÇOS =================

async function carregarServicosDoBanco() {
    const lista = document.getElementById('lista-servicos');
    if (lista)
        lista.innerHTML = '<div style="text-align:center; padding: 30px;"><i class="fas fa-spinner fa-spin" style="color:#C9A96E; font-size: 1.5rem;"></i></div>';

    try {
        const resposta = await fetch('../api/servicos/listar');
        if (resposta.ok) {
            servicosCadastrados = await resposta.json();
            renderServicos();
        }
    } catch (erro) {
        console.error("Erro:", erro);
    }
}

// ================= MODAL DE SERVIÇOS (LÓGICA REAL) =================

function abrirModalServico(id = null) {
    const inputId = document.getElementById('id-servico');
    const inputNome = document.getElementById('nome-servico');
    const inputTempo = document.getElementById('tempo-servico');
    const titulo = document.getElementById('modal-servico-titulo');

    if (id) {
        // Modo Edição: Puxa os dados do array
        const serv = servicosCadastrados.find(s => s.id === id);
        if (serv) {
            inputId.value = serv.id;
            inputNome.value = serv.nome;
            inputTempo.value = serv.tempo;
            titulo.innerHTML = '<i class="fas fa-edit"></i> Editar Serviço';
        }
    } else {
        // Modo Novo
        inputId.value = '';
        inputNome.value = '';
        inputTempo.value = '';
        titulo.innerHTML = '<i class="fas fa-cut"></i> Novo Serviço';
    }

    document.getElementById('modal-servico').classList.remove('hidden');
}

function fecharModalServico() {
    document.getElementById('modal-servico').classList.add('hidden');
}

async function salvarServico(e) {
    e.preventDefault();

    const btn = document.getElementById('btn-salvar-servico');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    btn.disabled = true;

    const id = document.getElementById('id-servico').value;
    const nome = document.getElementById('nome-servico').value;
    const tempo = document.getElementById('tempo-servico').value;

    const params = new URLSearchParams();
    if (id)
        params.append('id', id); // Só envia o ID se for edição!
    params.append('nome', nome);
    params.append('tempo', tempo);

    // 🟢 ROTEAMENTO INTELIGENTE: Decide qual Servlet chamar baseado na existência do ID
    const url = id ? '../api/servicos/atualizar' : '../api/servicos/cadastrar';

    try {
        const resposta = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            fecharModalServico();
            await carregarServicosDoBanco();
        } else {
            alert('Erro ao processar serviço no servidor.');
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert('Falha de comunicação.');
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}

async function excluirServico(id, btn) {
    if (!confirm("Tem certeza que deseja remover este serviço permanentemente?"))
        return;

    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;

    try {
        const params = new URLSearchParams();
        params.append('id', id);

        const resposta = await fetch('../api/servicos/excluir', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            await carregarServicosDoBanco();
        } else {
            alert("Erro ao excluir serviço.");
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert('Falha de comunicação.');
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}


// ================= CONFIGURAÇÕES: HORÁRIOS =================

async function carregarHorariosDoBanco() {
    const grid = document.getElementById('grid-horarios');
    if (grid)
        grid.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fas fa-spinner fa-spin" style="color:#17a2b8; font-size: 1.5rem;"></i></div>';

    try {
        const resposta = await fetch('../api/horarios/listar');
        if (resposta.ok) {
            horariosSemana = await resposta.json();
            renderHorarios();
        }
    } catch (erro) {
        console.error("Erro ao carregar horários:", erro);
    }
}

function toggleDia(index, isOpen) {
    horariosSemana[index].aberto = isOpen;
    renderHorarios();
}

function atualizarHora(index, tipo, valor) {
    if (tipo === 'abre')
        horariosSemana[index].horaAbertura = valor;
    if (tipo === 'fecha')
        horariosSemana[index].horaFechamento = valor;
}

async function salvarHorariosFuncionamento(btn) {
    const originalHTML = btn.innerHTML;
    const originalBg = btn.style.background;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> A guardar...';
    btn.disabled = true;

    const params = new URLSearchParams();
    horariosSemana.forEach(h => {
        params.append('dia_' + h.diaDaSemana + '_aberto', h.aberto);
        params.append('dia_' + h.diaDaSemana + '_abre', h.horaAbertura || '00:00');
        params.append('dia_' + h.diaDaSemana + '_fecha', h.horaFechamento || '00:00');
    });

    try {
        const resposta = await fetch('../api/horarios/atualizar', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            btn.innerHTML = '<i class="fas fa-check"></i> Salvo com sucesso!';
            btn.style.background = '#28a745';

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = originalBg;
                btn.disabled = false;
            }, 2000);
        } else {
            throw new Error("Falha no servidor");
        }
    } catch (erro) {
        console.error(erro);
        alert('Falha ao salvar horários.');
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
}