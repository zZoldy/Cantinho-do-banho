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

    const agora = new Date();
    const hojeIso = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const horaAtual = String(agora.getHours()).padStart(2, '0') + ':' + String(agora.getMinutes()).padStart(2, '0');

    el.innerHTML = lista.map(a => {
        const telContato = cleanTel(a.contato || '');
        let cli = clientesCadastrados.find(c => (telContato.length >= 8 && cleanTel(c.telefone || '') === telContato) || (c.nome === a.dono));
        const temPacote = verificarPacoteValido(a.dono, a.servico);

        const linkWhats = a.contato
                ? `<a href="https://wa.me/55${cleanTel(a.contato)}" target="_blank" onclick="event.stopPropagation()" style="color:#25d366; text-decoration: none; font-weight: 500;"><i class="fab fa-whatsapp"></i> ${a.contato}</a>`
                : `<span style="opacity: 0.6;"><i class="fas fa-phone-slash"></i> Sem contato</span>`;

        let dataReqIso = a.data;
        if (a.data.includes('/')) {
            const p = a.data.split('/');
            dataReqIso = `${p[2]}-${p[1]}-${p[0]}`;
        }
        const horaPedida = (a.hora || '').substring(0, 5);

        // ==========================================================
        // 🟢 VALIDAÇÃO PADRONIZADA (Limite da Loja + Choque de Hora)
        // ==========================================================
        let horasLoja = obterHorariosDoDia(dataReqIso);
        const lojaFechada = horasLoja.length === 0;

        // Limites do expediente
        let abertura = "00:00";
        let fechamento = "23:59";
        let foraDoHorario = false;

        if (!lojaFechada) {
            abertura = horasLoja[0];
            fechamento = horasLoja[horasLoja.length - 1];
            if (horaPedida < abertura || horaPedida > fechamento) {
                foraDoHorario = true;
            }
        }

        // Verifica se JÁ TEM alguém Confirmado/Retirada nesse dia/hora
        const jaTemAgendamento = agenda.some(ag => {
            let agIso = ag.data;
            if (ag.data && ag.data.includes('/')) {
                const p = ag.data.split('/');
                agIso = `${p[2]}-${p[1]}-${p[0]}`;
            }
            const agHora = (ag.hora || '').substring(0, 5);
            return agIso === dataReqIso && agHora === horaPedida && (ag.status === 'Confirmado' || ag.status === 'Retirada');
        });

        const isDataPassada = dataReqIso < hojeIso;
        const isHoraPassadaHoje = dataReqIso === hojeIso && horaPedida < horaAtual;

        // O Veredito final
        const isDisponivel = !isDataPassada && !isHoraPassadaHoje && !lojaFechada && !foraDoHorario && !jaTemAgendamento;

        // ==========================================================
        // 🟢 LAYOUT ORIGINAL DA CAIXA (Avisos e Radar)
        // ==========================================================
        let boxDisponibilidade = "";
        if (isDisponivel) {
            boxDisponibilidade = `<div style="margin-top: 12px; padding: 10px; border-radius: 6px; background: rgba(40,167,69,0.1); border-left: 3px solid #28a745; font-size: 0.85rem;">
                   <strong style="color: #28a745;"><i class="fas fa-check-circle"></i> Horário Livre!</strong> <span style="opacity: 0.8;">Pode aceitar o pedido sem conflitos.</span>
               </div>`;
        } else {
            const proximosLivres = buscarProximosHorariosLivres(dataReqIso, 3);
            let sugestoesTexto = proximosLivres.length > 0
                    ? proximosLivres.map(s => {
                        const diaFmt = s.data.split('-').reverse().join('/');
                        return `<strong>${diaFmt} às ${s.hora}</strong>`;
                    }).join(' <span style="opacity:0.5">|</span> ')
                    : "<strong>Nenhum horário livre nos próximos dias.</strong>";

            let tituloErro = "Horário Indisponível!";
            if (lojaFechada)
                tituloErro = "A loja não abre neste dia!";
            else if (isDataPassada || isHoraPassadaHoje)
                tituloErro = "O tempo já passou! 🕰️";
            else if (foraDoHorario)
                tituloErro = `Fora do expediente (${abertura} - ${fechamento})!`;
            else if (jaTemAgendamento)
                tituloErro = "Já existe cliente nesta hora!";

            boxDisponibilidade = `<div style="margin-top: 12px; padding: 10px; border-radius: 6px; background: rgba(220,53,69,0.1); border-left: 3px solid #dc3545; font-size: 0.85rem;">
                   <strong style="color: #dc3545;"><i class="fas fa-times-circle"></i> ${tituloErro}</strong>
                   <div style="margin-top: 4px; opacity: 0.8;">Sugerimos reagendar para: ${sugestoesTexto}</div>
               </div>`;
        }

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

function renderAgenda() {
    const busca = (document.getElementById('busca-agenda')?.value || '').toLowerCase();
    const filData = document.getElementById('filtro-data-agenda')?.value || '';
    const filFunc = document.getElementById('filtro-func-agenda')?.value || '';

    const isFuncionario = (perfil);
    const nomeLogado = (logado);

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

    const listaFuncs = (Array.isArray(funcionarios)) ? funcionarios : [];

    const clientesCadastrados = (listaClientes);

    el.innerHTML = lista.map(a => {

        const telContato = cleanTel(a.contato || '');
        const donoAgendamento = (a.dono || '').trim().toLowerCase();

        let cli = clientesCadastrados.find(c => {
            const telCli = cleanTel(c.telefone || '');
            const nomeCli = (c.nome || '').trim().toLowerCase();
            return (telContato.length >= 8 && telCli === telContato) || (nomeCli === donoAgendamento && nomeCli !== '');
        });


        const temPacote = verificarPacoteValido(a.dono, a.servico);

        // =====================================================================
        // 💰 3. AUTOMAÇÃO FINANCEIRA
        // =====================================================================
        const statusPag = temPacote ? 'Pago' : (a.statusPag || a.status_pagamento || 'Pendente');
        const formaPag = temPacote ? 'Pacote' : (a.formaPag || a.forma_pagamento || '');
        // Se tiver pacote o valor é "0,00", caso contrário usa a função de formatar máscara ou deixa como veio
        const valorExibicao = temPacote ? "0,00" : (typeof formatarValorTela === 'function' ? formatarValorTela(a.valor) : a.valor || '');

        const entradaPet = a.entrada_pet || a.entradaPet || '';
        const saidaPet = a.saida_pet || a.saidaPet || '';
        const observacoes = a.obs || '';

        let funcAtribuido = a.funcionario;
        if (funcAtribuido === 'null' || funcAtribuido === null || funcAtribuido === undefined)
            funcAtribuido = '';
        funcAtribuido = funcAtribuido.trim();

        let selectFuncHtml = '';
        if (isFuncionario && !isAdm) {
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
                <select class="sel-func" style="border: 1px solid #C9A96E; background: #1a1a1a; color: #fff;">
                    <option value="">— Selecionar —</option>
                    ${listaFuncs.map(f => `<option value="${f.nome}" ${funcAtribuido === f.nome ? 'selected' : ''}>${f.nome}</option>`).join('')}
                </select>`;
        }

        // =======================================================================
        // 🎨 4. HTML DO CARTÃO DA AGENDA
        // =======================================================================
        return `
            <div class="agenda-card" style="${funcAtribuido === nomeLogado && isFuncionario ? 'border-left: 5px solid #28a745;' : 'border-left: 5px solid #C9A96E;'}">
              <div class="ac-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                <div>
                  <div class="ac-pet" style="font-size: 1.1rem; font-weight: 600; margin-bottom: 4px;">
                    <i class="fas fa-paw" style="color:#C9A96E;margin-right:6px;font-size:.9rem"></i>${a.pet} <small style="font-weight: normal; opacity: 0.7;">(${a.tipo})</small>
                  </div>
                  <div class="ac-dono" style="font-size: 0.9rem;">
                    <i class="fas fa-user" style="color:#C9A96E; margin-right: 4px;"></i> ${a.dono} · <a href="https://wa.me/55${cleanTel(a.contato)}" target="_blank" style="color:#25d366"><i class="fab fa-whatsapp"></i> ${a.contato}</a>
                  </div>
                </div>
                
                <div style="text-align:right; display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                  <span class="badge" style="background-color: rgba(40, 167, 69, 0.15); color: #28a745; border: 1px solid #c3e6cb; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; font-weight: 600;">Confirmado</span>
                  ${cli && cli.temUsuario
                ? `<span class="badge" style="background-color: rgba(40, 167, 69, 0.15); color: #28a745; border: 1px solid #c3e6cb; font-size: 0.7rem; padding: 3px 8px; border-radius: 12px;"><i class="fas fa-address-book"></i> Cadastrado</span>`
                : `<span class="badge" style="background-color: rgba(150, 150, 150, 0.1); color: #888; border: 1px dashed #555; font-size: 0.7rem; padding: 3px 8px; border-radius: 12px;"><i class="fas fa-user-slash"></i> S/ Cad.</span>`
                }
                                  ${temPacote ? `<span class="badge" style="background-color: rgba(133, 100, 4, 0.15); color: #d39e00; border: 1px solid #ffeeba; font-size: 0.7rem; padding: 3px 8px; border-radius: 12px;"><i class="fas fa-box-open"></i> Pacote Ativo</span>` : ''}
                  <div style="font-size:.75rem;color:#C9A96E;margin-top:4px"><i class="far fa-calendar-alt"></i> ${fd(a.data)} às ${a.hora}</div>
                </div>
              </div>
              
              <div style="margin-bottom:10px">
                <strong>Serviço:</strong> <span class="badge badge-amarelo">${a.servico}</span>
              </div>
              
              <div class="ac-grid" style="background: rgba(0,0,0,0.02); padding: 15px; border-radius: 6px; border: 1px solid #eee; margin-bottom: 15px;">
                
                <div class="ag-field"><label>Funcionário Responsável</label>
                  ${selectFuncHtml}
                </div>
                
                <div class="ag-field"><label>Valor (R$)</label>
                    <input type="text" class="inp-valor" value="${valorExibicao}" placeholder="0,00" 
                       <input type="text" class="inp-valor" value="${valorExibicao}" placeholder="0,00" 
                        ${temPacote ? 'readonly style="background-color: #222; border-color: #444; cursor: not-allowed; color: #888; font-weight: bold;"' : 'oninput="if(typeof aplicarMascaraMoeda === \'function\') aplicarMascaraMoeda(this)"'}/>
                </div>
                
                <div class="ag-field"><label>Forma de Pagamento</label>
                 <select class="sel-forma" ${temPacote ? 'style="background-color: #222; border-color: #444; pointer-events: none; color: #888; font-weight: bold;"' : ''}>
                    <option value="" ${!formaPag ? 'selected' : ''}>— Selecionar —</option>
                    ${['Pix', 'Dinheiro', 'Cartão de Crédito', 'Cartão de Débito'].map(p => `<option value="${p}" ${formaPag === p ? 'selected' : ''}>${p}</option>`).join('')}
                    <option value="Pacote" ${formaPag === 'Pacote' ? 'selected' : ''}>Desconto de Pacote</option>
                  </select>
                </div>
                
                <div class="ag-field"><label>Status Pagamento</label>
                 <select class="sel-status" ${temPacote ? 'style="background-color: #222; border-color: #444; pointer-events: none; color: #888; font-weight: bold;"' : ''}>
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
              
              <div class="ac-obs" style="margin-bottom:15px">
                <label>Observações</label>
                <textarea class="txt-obs" rows="2" placeholder="Notas internas...">${observacoes}</textarea>
              </div>
              
              <div class="ac-footer" style="display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid rgba(150, 150, 150, 0.2); padding-top: 15px;">
                <button class="btn-save-agenda" onclick="salvarAgendaManual(${a.id}, this)" style="background: transparent; color: #17a2b8; border: 1px solid #17a2b8; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: 600;"><i class="fas fa-save"></i> Salvar</button>
                <button class="btn-concluir" onclick="concluirAtendimento(${a.id}, this)" style="background: #28a745; color: #fff; border: none; padding: 8px 15px; border-radius: 6px; font-weight: 600; cursor: pointer;"><i class="fas fa-check-double"></i> Concluir Serviço</button>
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

    // Pega a lista de clientes para os crachás
    const clientesCadastrados = listaClientes;

    // Bloqueia as datas anteriores a hoje no calendário input="date"
    const agora = new Date();
    const hojeIso = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

    el.innerHTML = lista.map(a => {
        const telContato = cleanTel(a.contato || '');
        const donoAgendamento = (a.dono || '').trim().toLowerCase();

        let cli = clientesCadastrados.find(c => {
            const telCli = cleanTel(c.telefone || '');
            const nomeCli = (c.nome || '').trim().toLowerCase();
            return (telContato.length >= 8 && telCli === telContato) || (nomeCli === donoAgendamento && nomeCli !== '');
        });

        const temPacote = verificarPacoteValido(a.dono, a.servico);

        const linkWhats = a.contato
                ? `<a href="https://wa.me/55${cleanTel(a.contato)}" target="_blank" onclick="event.stopPropagation()" style="color:#25d366; text-decoration: none;"><i class="fab fa-whatsapp"></i> ${a.contato}</a>`
                : `<span style="opacity: 0.6;"><i class="fas fa-phone-slash"></i> Sem contato</span>`;

        let dataIso = a.data;
        if (a.data && a.data.includes('/')) {
            const p = a.data.split('/');
            dataIso = `${p[2]}-${p[1]}-${p[0]}`;
        }

        return `
            <div class="pendente-card" style="border-left: 5px solid #dc3545;">
              <div class="pc-header" style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <div class="pc-pet" style="font-size: 1.1rem; font-weight: 600; margin-bottom: 4px;">
                        <i class="fas fa-paw" style="color:#dc3545;margin-right:6px;font-size:.9rem"></i>${a.pet} <small style="font-weight: normal; opacity: 0.7;">(${a.tipo})</small>
                    </div>
                    <div class="pc-dono" style="font-size: 0.9rem;">
                        <i class="fas fa-user" style="color:#C9A96E; margin-right: 4px;"></i> ${a.dono} · ${linkWhats}
                    </div>
                </div>
                
                <div style="text-align:right; display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                    <span class="badge" style="background-color: rgba(220, 53, 69, 0.15); color: #dc3545; border: 1px solid #dc3545; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; font-weight: 600;">Pendente</span>
                    ${temPacote ? `<span class="badge" style="background-color: rgba(133, 100, 4, 0.15); color: #d39e00; border: 1px solid #ffeeba; font-size: 0.7rem; padding: 3px 8px; border-radius: 12px;"><i class="fas fa-box-open"></i> Pacote</span>` : ''}
                    ${cli && cli.temUsuario
                ? `<span class="badge" style="background-color: rgba(40, 167, 69, 0.15); color: #28a745; border: 1px solid #c3e6cb; font-size: 0.7rem; padding: 3px 8px; border-radius: 12px;"><i class="fas fa-address-book"></i> Cadastrado</span>`
                : `<span class="badge" style="background-color: rgba(150, 150, 150, 0.1); color: #888; border: 1px dashed #555; font-size: 0.7rem; padding: 3px 8px; border-radius: 12px;"><i class="fas fa-user-slash"></i> S/ Cad.</span>`
                }
                </div>
              </div>
              
              <div class="pc-info" style="margin: 15px 0; padding: 10px; background: rgba(0,0,0,0.02); border-radius: 6px; border: 1px solid #eee;">
                <div style="margin-bottom: 5px;"><strong><i class="fas fa-cut" style="color:#C9A96E;"></i> Serviço:</strong> ${a.servico}</div>
                <div><strong><i class="fas fa-calendar-times" style="color:#dc3545;"></i> Data original:</strong> ${fd(a.data)} às ${a.hora}</div>
                ${a.obs ? `<div style="margin-top: 8px; font-size: 0.85rem; border-left: 3px solid #C9A96E; padding-left: 6px;"><em>${a.obs}</em></div>` : ''}
              </div>
              
              <div class="section-lbl" style="font-weight: 600; margin-bottom: 8px; color: #555;">Reagendar Serviço</div>
              <div class="pc-reagen" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 10px;">
                <div class="field" style="flex: 1; min-width: 130px;">
                    <label style="font-size: 0.8rem; color: #666;">Nova Data</label>
                    <input type="date" id="pnd-data-${a.id}" value="${dataIso}" min="${hojeIso}" onchange="verificarDisponibilidade(${a.id})" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px;"/>
                </div>
                <div class="field" style="flex: 1; min-width: 100px;">
                    <label style="font-size: 0.8rem; color: #666;">Nova Hora</label>
                    <input type="time" id="pnd-hora-${a.id}" value="${a.hora}" onchange="verificarDisponibilidade(${a.id})" style="width: 100%; padding: 6px; border: 1px solid #ccc; border-radius: 4px;"/>
                </div>
              </div>
              
              <div id="pnd-disp-${a.id}" style="width: 100%; font-size: 0.8rem; margin-bottom: 15px; min-height: 20px;"></div>
              
              <div class="pc-actions" style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid #eee; padding-top: 15px;">
                <button class="btn-excluir-pend" onclick="excluirPendente(${a.id})" style="background: transparent; color: #dc3545; border: 1px solid #dc3545; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-wpp-pend" onclick="sugerirReagendamento(${a.id}, '${a.contato}', '${a.dono}', '${a.pet}')" style="background: #25d366; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
                    <i class="fab fa-whatsapp"></i> Conversar
                </button>
                <button id="btn-agendar-pend-${a.id}" class="btn-confirmar-pend" onclick="confirmarPendente(${a.id})" style="background: #007bff; color: #fff; border: none; padding: 6px 15px; border-radius: 6px; font-weight: bold; cursor: pointer;">
                    <i class="fas fa-calendar-check"></i> Agendar
                </button>
              </div>
            </div>`;
    }).join('');

    lista.forEach(a => {
        // 🟢 AJUSTE 4: A chamada inicial agora só envia o ID
        verificarDisponibilidade(a.id);
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

function verificarDisponibilidade(id) {
    const inputData = document.getElementById(`pnd-data-${id}`);
    const inputHora = document.getElementById(`pnd-hora-${id}`);
    const elDisp = document.getElementById(`pnd-disp-${id}`);

    // Procura o botão para travar. ATENÇÃO: No seu HTML atual, o botão de agendar NÃO TEM ID. 
    // Por favor, adicione id="btn-agendar-pend-${a.id}" no botão "Agendar" dentro do seu renderPendentes!
    const btnAgendar = document.getElementById(`btn-agendar-pend-${id}`);

    if (!elDisp || !inputData || !inputHora)
        return;

    const dataSelecionada = inputData.value;
    const horaPedida = (inputHora.value || '').substring(0, 5);

    if (!dataSelecionada || !horaPedida) {
        elDisp.innerHTML = '';
        if (btnAgendar)
            btnAgendar.disabled = true;
        return;
    }

    const agora = new Date();
    const hojeIso = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const horaAtual = String(agora.getHours()).padStart(2, '0') + ':' + String(agora.getMinutes()).padStart(2, '0');

    // ==========================================================
    // 🟢 VALIDAÇÃO PADRONIZADA (Igual ao Novos)
    // ==========================================================
    let horasLoja = obterHorariosDoDia(dataSelecionada);
    const lojaFechada = horasLoja.length === 0;

    let abertura = "00:00";
    let fechamento = "23:59";
    let foraDoHorario = false;

    if (!lojaFechada) {
        abertura = horasLoja[0];
        fechamento = horasLoja[horasLoja.length - 1];
        if (horaPedida < abertura || horaPedida > fechamento) {
            foraDoHorario = true;
        }
    }

    const jaTemAgendamento = agenda.some(ag => {
        let agIso = ag.data;
        if (ag.data && ag.data.includes('/')) {
            const p = ag.data.split('/');
            agIso = `${p[2]}-${p[1]}-${p[0]}`;
        }
        const agHora = (ag.hora || '').substring(0, 5);
        return agIso === dataSelecionada && agHora === horaPedida && (ag.status === 'Confirmado' || ag.status === 'Retirada') && ag.id !== id;
    });

    const isDataPassada = dataSelecionada < hojeIso;
    const isHoraPassadaHoje = dataSelecionada === hojeIso && horaPedida < horaAtual;

    const isDisponivel = !isDataPassada && !isHoraPassadaHoje && !lojaFechada && !foraDoHorario && !jaTemAgendamento;

    // ==========================================================
    // 🟢 LISTA VISUAL (Mantendo o seu modelo original de listar as horas)
    // ==========================================================
    if (dataSelecionada === hojeIso) {
        horasLoja = horasLoja.filter(h => h > horaAtual);
    }

    const ocupadosDoDia = agenda.filter(ag => {
        let agIso = ag.data;
        if (ag.data && ag.data.includes('/')) {
            const p = ag.data.split('/');
            agIso = `${p[2]}-${p[1]}-${p[0]}`;
        }
        return agIso === dataSelecionada && (ag.status === 'Confirmado' || ag.status === 'Retirada') && ag.id !== id;
    }).map(ag => (ag.hora || '').substring(0, 5));

    const livres = horasLoja.filter(h => !ocupadosDoDia.includes(h));

    const txtLivres = livres.length > 0
            ? `<div style="margin-top: 4px;"><i class="fas fa-check-circle"></i> Livres: <strong>${livres.join(', ')}</strong></div>`
            : ``;

    // ==========================================================
    // 🟢 ATUALIZA HTML E BOTÃO
    // ==========================================================
    if (isDisponivel) {
        elDisp.innerHTML = `
            <span style="color:#28a745; background: rgba(40,167,69,0.1); padding: 4px 8px; border-radius: 4px; display: inline-block;">
                <i class="fas fa-check-circle"></i> Horário Válido!
            </span>
            <span style="color:#28a745; background: rgba(40,167,69,0.1); padding: 4px 8px; border-radius: 4px; display: inline-block;">
               ${txtLivres}
            </span>`;

        if (btnAgendar) {
            btnAgendar.disabled = false;
            btnAgendar.style.opacity = '1';
            btnAgendar.style.cursor = 'pointer';
        }
    } else {
        let erro = "Horário indisponível!";
        if (lojaFechada)
            erro = "Loja fechada neste dia!";
        else if (isDataPassada || isHoraPassadaHoje)
            erro = "Data/hora no passado!";
        else if (foraDoHorario)
            erro = `Fora de expediente (${abertura}-${fechamento})`;
        else if (jaTemAgendamento)
            erro = "Já existe cliente nesta hora!";

        elDisp.innerHTML = `
            <span style="color:#dc3545; background: rgba(220,53,69,0.1); padding: 4px 8px; border-radius: 4px; display: inline-block;">
                <i class="fas fa-times-circle"></i> ${erro}
            </span>
            <span style="color:#dc3545; background: rgba(220,53,69,0.1); padding: 4px 8px; border-radius: 4px; display: inline-block;">
               ${txtLivres}
            </span>`;

        if (btnAgendar) {
            btnAgendar.disabled = true;
            btnAgendar.style.opacity = '0.5';
            btnAgendar.style.cursor = 'not-allowed';
        }
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

    if (forma === "Pacote") {
        // Usa a sua lista global de clientes (ajuste o nome da variável se for 'listaClientes' ou 'clientesCadastrados')
        const clientesGlobais = listaClientes;
        const clienteObj = clientesGlobais.find(c => c.nome === item.dono);

        // Procura se ele tem algum pacote ativo para este serviço exato
        const temSaldoParaOServico = clienteObj?.pacotes?.some(p =>
            p.servicoNome.trim().toLowerCase() === item.servico.trim().toLowerCase() &&
                    p.sessoesRestantes > 0
        );

        if (!temSaldoParaOServico) {
            alert(`❌ Erro: O cliente ${item.dono} não possui pacote de "${item.servico}" com saldo disponível. Selecione outra forma de pagamento.`);
            card.querySelector('.sel-forma').focus();
            return;
        }
    }

    if (forma !== "Pacote" && (!valorRaw || valorRaw === "0,00" || valorRaw === "")) {
        alert("⚠️ Erro: O Valor Cobrado não pode ser zero ou vazio para pagamentos normais.");
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
        params.append('entrada_pet', entrada);
        params.append('saida_pet', saida);
        params.append('obs', obs);

        const resposta = await fetch('../api/agendamentos/concluir', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            await carregarAgendaDoBanco(true);
            await listarClientesBD();

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

// ==========================================
// VALIDADOR GLOBAL DE PACOTES
// ==========================================
function verificarPacoteValido(nomeDono, nomeServicoAgendado) {
    // 1. Acha o cliente na base global
    const cli = listaClientes.find(c => c.nome === nomeDono);

    // 2. Se não achou o cliente, ou se ele não possui o array de pacotes, retorna falso
    if (!cli || !cli.pacotes || cli.pacotes.length === 0) {
        return false;
    }

    const servicoProcurado = (nomeServicoAgendado || '').trim().toLowerCase();

    // 3. Verifica se ALGUM dos pacotes do cliente cobre o serviço agendado E tem saldo
    const temPacoteValido = cli.pacotes.some(p => {
        const servicoDoPacote = (p.servicoNome || '').trim().toLowerCase();
        return servicoDoPacote === servicoProcurado && p.sessoesRestantes > 0;
    });

    return temPacoteValido;
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

async function listarHorariosDoBanco() {
    try {
        const resHorarios = await fetch('../api/horarios/listar');
        if (resHorarios.ok) {
            horariosSemana = await resHorarios.json();
        }
    } catch (erro) {
        console.error("Falha ao buscar horários para a agenda:", erro);
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

function obterHorariosDoDia(dataIso) {
    if (!horariosSemana || horariosSemana.length === 0) {
        return ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    }

    const dataObj = new Date(dataIso + 'T12:00:00');
    const diaJS = dataObj.getDay();
    const nomesDias = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const nomeDiaCerto = nomesDias[diaJS];

    let configDia = horariosSemana.find(h =>
        (h.nomeDia && h.nomeDia.toLowerCase().includes(nomeDiaCerto.toLowerCase().substring(0, 3))) ||
                String(h.diaDaSemana) === String(diaJS === 0 ? 7 : diaJS) ||
                String(h.diaDaSemana) === String(diaJS + 1)
    );

    let horas = [];
    if (configDia && (configDia.aberto === true || String(configDia.aberto).toLowerCase() === 'true')) {
        const start = parseInt((configDia.horaAbertura || '08:00').split(':')[0]);
        const end = parseInt((configDia.horaFechamento || '17:00').split(':')[0]);
        for (let i = start; i < end; i++) {
            horas.push(i.toString().padStart(2, '0') + ':00');
        }
    }
    return horas;
}

function buscarProximosHorariosLivres(dataInicialIso, qtdDesejada) {
    let encontrados = [];

    const agora = new Date();
    const hojeIso = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const horaAtual = String(agora.getHours()).padStart(2, '0') + ':' + String(agora.getMinutes()).padStart(2, '0');

    let dataDeBusca = dataInicialIso < hojeIso ? hojeIso : dataInicialIso;
    let dataAtualObj = new Date(dataDeBusca + 'T12:00:00');

    for (let diaOff = 0; diaOff < 23; diaOff++) {
        if (encontrados.length >= qtdDesejada)
            break;

        const iterDate = new Date(dataAtualObj.getTime() + (diaOff * 86400000));
        const iterIso = `${iterDate.getFullYear()}-${String(iterDate.getMonth() + 1).padStart(2, '0')}-${String(iterDate.getDate()).padStart(2, '0')}`;

        let horasDia = obterHorariosDoDia(iterIso);

        if (iterIso === hojeIso) {
            horasDia = horasDia.filter(h => h > horaAtual);
        }

        const ocupados = agenda.filter(ag => {
            let agIso = ag.data;
            if (ag.data && ag.data.includes('/')) {
                const p = ag.data.split('/');
                agIso = `${p[2]}-${p[1]}-${p[0]}`;
            }
            return agIso === iterIso;
        }).map(ag => (ag.hora || '').substring(0, 5));

        const livres = horasDia.filter(h => !ocupados.includes(h));

        for (let h of livres) {
            encontrados.push({data: iterIso, hora: h});
            if (encontrados.length >= qtdDesejada)
                break;
        }
    }
    return encontrados;
}