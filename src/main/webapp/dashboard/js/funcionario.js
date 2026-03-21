let editFuncId = null;

function renderFuncionarios() {
    renderFuncsCadastro();
    renderPerformance();
}

function renderFuncsCadastro() {
    const el = document.getElementById('lista-funcs-cad');
    if (!el)
        return;
    if (!funcionarios.length) {
        el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-users" style="color:#555"></i><p>Nenhum funcionário cadastrado</p></div>`;
        return;
    }
    el.innerHTML = funcionarios.map(f => `
            <div class="func-cad-card">
              <div class="func-avatar">${f.nome.charAt(0).toUpperCase()}</div>
              <div class="func-cad-info">
                <div class="func-cad-nome">${f.nome}</div>
                <div class="func-cad-cargo">${f.cargo || '—'}</div>

              </div>
              <div style="display:flex;gap:6px">
                <button class="btn-sm-primary" onclick="abrirModalFunc(${f.id})" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-danger-sm" onclick="excluirFunc(${f.id})" title="Excluir"><i class="fas fa-trash"></i></button>
              </div>
            </div>`).join('');
}

function renderPerformance() {
    const mes = document.getElementById('filtro-mes-func')?.value || mesMes;
    const el = document.getElementById('lista-performance');
    if (!el)
        return;
    if (!funcionarios.length) {
        el.innerHTML = '';
        return;
    }
    el.innerHTML = funcionarios.map(f => {
        const concl = historico.filter(a => a.funcionario === f.nome && a.data?.startsWith(mes));
        const agnd = agenda.filter(a => a.funcionario === f.nome && a.data?.startsWith(mes));
        const fat = concl.reduce((s, a) => s + (a.valor || 0), 0);
        const fatPago = concl.filter(a => a.statusPag === 'Pago').reduce((s, a) => s + (a.valor || 0), 0);
        const servs = {};
        concl.forEach(a => {
            servs[a.servico] = (servs[a.servico] || 0) + 1;
        });
        const maxS = Math.max(...Object.values(servs), 1);
        const prox = agnd.filter(a => a.data >= hojeStr).sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora)).slice(0, 3);
        return `
              <div class="func-card">
                <div class="func-header">
                  <div class="func-avatar">${f.nome.charAt(0)}</div>
                  <div><div class="func-nome">${f.nome}</div><div class="func-cargo-lbl">${f.cargo || 'Funcionário'} · ${mes}</div></div>
                </div>
                <div class="func-stats">
                  <div class="func-stat"><span class="func-stat-val">${concl.length}</span><span class="func-stat-lbl">Concluídos</span></div>
                  <div class="func-stat"><span class="func-stat-val">${agnd.length}</span><span class="func-stat-lbl">Agendados</span></div>
                  <div class="func-stat"><span class="func-stat-val" style="font-size:.85rem">R$ ${fat.toFixed(0)}</span><span class="func-stat-lbl">Faturamento</span></div>
                </div>
                <div style="background:#111;border-radius:8px;padding:10px;display:flex;justify-content:space-between;font-size:.78rem">
                  <span style="color:#888">Pago: <strong style="color:#5ac75a">R$ ${fatPago.toFixed(2)}</strong></span>
                  <span style="color:#888">Pendente: <strong style="color:#C9A96E">R$ ${(fat - fatPago).toFixed(2)}</strong></span>
                </div>
                ${Object.keys(servs).length ? `
                <div>
                  <div class="section-lbl">Serviços</div>
                  <div class="func-bar-wrap">
                    ${Object.entries(servs).sort((a, b) => b[1] - a[1]).map(([s, v]) => `
                      <div class="func-bar-item">
                        <span class="func-bar-label">${s}</span>
                        <div class="func-bar-track"><div class="func-bar-fill" style="width:${(v / maxS) * 100}%"></div></div>
                        <span style="font-size:.72rem;color:#888;width:20px;text-align:right">${v}</span>
                      </div>`).join('')}
                  </div>
                </div>` : ``}
                ${prox.length ? `
                <div>
                  <div class="section-lbl">Próximos</div>
                  ${prox.map(a => `<div class="func-agenda-item"><span class="fai-pet"><i class="fas fa-paw" style="font-size:.7rem;margin-right:4px;color:#C9A96E"></i>${a.pet}</span><span class="fai-serv">${a.servico}</span><span class="fai-hora">${fd(a.data)} ${a.hora}</span></div>`).join('')}
                </div>` : ``}
              </div>`;
    }).join('');
}

function abrirModalFunc(id = null) {
    editFuncId = id;

    // Atualiza o título da modal
    document.getElementById('modal-func-titulo').textContent = id ? 'Editar Usuário' : 'Novo Usuário';

    if (id) {
        // --- MODO EDIÇÃO ---
        // Busca o usuário na lista (que no futuro virá do Java)
        const f = funcionarios.find(x => x.id === id);
        if (!f)
            return;

        // Preenche os campos com os dados do banco
        document.getElementById('nomeFuncionario').value = f.nome || '';
        document.getElementById('emailFuncionario').value = f.email || '';
        document.getElementById('cpfFuncionario').value = f.cpf || '';
        document.getElementById('rgFuncionario').value = f.rg || '';
        document.getElementById('perfilFuncionario').value = f.perfil || 'Funcionario';
        document.getElementById('func-cargo').value = f.funcao || ''; // Usando a variável nova 'funcao'

        // Dica de Segurança: Nunca preencha a senha ao editar! Deixe em branco.
        // Se o usuário digitar algo, o Java atualiza. Se não digitar, o Java mantém a antiga.
        document.getElementById('senhaFuncionario').value = '';

        // Chama a função para esconder/mostrar o campo de Função baseado no perfil carregado
        mostrarOcultarFuncao();

    } else {
        // --- MODO NOVO USUÁRIO ---
        // Limpa todos os campos de texto
        const camposLimpar = ['nomeFuncionario', 'emailFuncionario', 'senhaFuncionario', 'cpfFuncionario', 'rgFuncionario', 'func-cargo'];
        camposLimpar.forEach(campoId => {
            const elemento = document.getElementById(campoId);
            if (elemento)
                elemento.value = '';
        });

        // Reseta o perfil para o padrão
        document.getElementById('perfilFuncionario').value = 'Funcionario';

        // Garante que o campo de função apareça para novos cadastros
        mostrarOcultarFuncao();
    }

    // Mostra a modal na tela (removendo a classe que esconde)
    document.getElementById('modalFunc').classList.remove('hidden');
}

function fecharModalFunc() {
    // Esconde a modal
    document.getElementById('modalFunc').classList.add('hidden');
    editFuncId = null;
}

function mostrarOcultarFuncao() {
    const perfilSelecionado = document.getElementById('perfilFuncionario').value;
    const divFuncao = document.getElementById('divFuncao');
    const inputFuncao = document.getElementById('func-cargo');

    if (perfilSelecionado === 'Funcionario') {
        // Se for funcionário, mostra o campo e obriga a preencher
        divFuncao.style.display = 'block';
        inputFuncao.required = true;
    } else {
        // Se for Admin, esconde o campo e tira a obrigatoriedade
        divFuncao.style.display = 'none';
        inputFuncao.required = false;
        inputFuncao.value = ''; // Limpa o texto caso o usuário tenha digitado algo antes de mudar
    }
}

function cadastrarUsuario(event) {
    event.preventDefault();

    const formData = new URLSearchParams();
    formData.append('user', document.getElementById('nomeFuncionario').value);
    formData.append('nome', document.getElementById('nomeFuncionario').value);
    formData.append('email', document.getElementById('emailFuncionario').value);
    formData.append('senha', document.getElementById('senhaFuncionario').value);
    formData.append('cpf', document.getElementById('cpfFuncionario').value);
    formData.append('rg', document.getElementById('rgFuncionario').value);
    formData.append('perfil', document.getElementById('perfilFuncionario').value);
    formData.append('funcao', document.getElementById('func-cargo').value);

    fetch('../api/usuarios/cadastrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: formData
    })
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    return response.text().then(text => {
                        throw new Error(text)
                    });
                }
            })
            .then(mensagem => {
                alert("Sucesso: " + mensagem); // Aqui vai aparecer a Matrícula gerada!
            })
            .catch(error => {
                alert(error.message);
            });
}

// Local ainda
function excluirFunc(id) {
    if (!confirm('Excluir funcionário?'))
        return;
    funcionarios = funcionarios.filter(x => x.id !== id);
    salvarTudo();
    renderFuncionarios();
}