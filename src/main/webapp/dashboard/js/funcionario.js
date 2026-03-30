let lista_funcionarios = [];
let editFuncId = null;

function carregarFuncionariosDoBanco(isAdm = false) {
    const elLista = document.getElementById('lista-funcs-cad');
    const elPerf = document.getElementById('lista-performance');

    // 1. ATIVAR O AGUARDE (Antes do fetch)
    const loadingHTML = `
        <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <i class="fas fa-circle-notch fa-spin" style="font-size: 2rem; color: #C9A96E; margin-bottom: 10px;"></i>
            <p style="color: #888; font-family: 'Cormorant Garamond', serif;">Consultando banco de dados...</p>
        </div>
    `;

    if (elLista)
        elLista.innerHTML = loadingHTML;
    if (elPerf)
        elPerf.innerHTML = loadingHTML;

    let urlDaApi = '../api/funcionarios/listar';

    if (isAdm) {
        urlDaApi = '../api/funcionarios/listar-adm';
    }
    fetch(urlDaApi)
            .then(response => {
                if (!response.ok)
                    throw new Error("Erro ao buscar dados do servidor.");
                return response.json();
            })
            .then(dadosRecebidos => {
                lista_funcionarios = dadosRecebidos;
                renderFuncionarios();
            })
            .catch(error => {
                console.error("Erro:", error);
                if (elLista) {
                    elLista.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1; color:#dc3545">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Erro de conexão com o banco de dados. Verifique o servidor.</p>
                    </div>`;
                }
            });
}

function renderFuncionarios() {
    renderFuncsCadastro();
    renderPerformance();
}

function renderFuncsCadastro() {
    const el = document.getElementById('lista-funcs-cad');
    if (!el)
        return;

    if (!lista_funcionarios.length) {
        el.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-users" style="color:#555"></i><p>Nenhum funcionário cadastrado</p></div>`;
        return;
    }

    // Mapeia usando a variável certa (lista_funcionarios)
    el.innerHTML = lista_funcionarios.map(f => `
            <div class="func-cad-card">
              <div class="func-avatar">${f.nome.charAt(0).toUpperCase()}</div>
              <div class="func-cad-info">
                <div class="func-cad-nome">${f.nome}</div>
                <div class="func-cad-cargo">${f.perfil || '—'}</div>
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
    if (!lista_funcionarios.length) {
        el.innerHTML = '';
        return;
    }
    el.innerHTML = lista_funcionarios.map(f => {
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

    document.getElementById('modal-func-titulo').textContent = id ? 'Editar Usuário' : 'Novo Usuário';
    const campoSenha = document.getElementById('senhaFuncionario');

    const divDadosEdicao = document.getElementById('divDadosEdicao');

    if (id) {
        const f = lista_funcionarios.find(x => x.id === id);
        if (!f)
            return;

        document.getElementById('nomeFuncionario').value = f.nome || '';
        document.getElementById('emailFuncionario').value = f.email || '';
        document.getElementById('cpfFuncionario').value = f.cpf || '';
        document.getElementById('rgFuncionario').value = f.rg || '';
        document.getElementById('perfilFuncionario').value = f.perfil || 'Selecione';
        document.getElementById('func-cargo').value = f.funcao || '';
        if (f.salario) {
            let valorString = f.salario.toFixed(2).replace('.', '');
            document.getElementById('salarioFunc').value = valorString;
            mascaraMoeda({target: document.getElementById('salarioFunc')});
        } else {
            document.getElementById('salarioFunc').value = '';
        }

        const isAtivo = (f.conta_ativa === true || f.conta_ativa === "true");
        document.getElementById('statusConta').value = isAtivo ? "true" : "false";

        if (f.data_criacao && f.data_criacao !== "") {
            document.getElementById('dataCriacaoFunc').value = f.data_criacao;
        } else {
            document.getElementById('dataCriacaoFunc').value = 'Data não registrada';
        }

        if (divDadosEdicao)
            divDadosEdicao.style.display = 'block';

        campoSenha.value = '';
        campoSenha.disabled = true;
        campoSenha.placeholder = 'Senha (não alterável aqui)';

        mostrarOcultarFuncao();
        validarFormulario();

    } else {
        const camposLimpar = ['nomeFuncionario', 'emailFuncionario', 'senhaFuncionario', 'cpfFuncionario', 'rgFuncionario', 'perfilFuncionario', 'func-cargo', 'salarioFunc'];
        camposLimpar.forEach(campoId => {
            const elemento = document.getElementById(campoId);
            if (elemento)
                elemento.value = '';
        });

        document.getElementById('statusConta').value = "true";
        document.getElementById('dataCriacaoFunc').value = '';

        if (divDadosEdicao)
            divDadosEdicao.style.display = 'none';

        campoSenha.disabled = false;
        campoSenha.placeholder = 'Crie uma senha forte';

        mostrarOcultarFuncao();
        validarFormulario();
    }
    document.getElementById('modalFunc').classList.remove('hidden');
}

function fecharModalFunc() {
    document.getElementById('senhaFuncionario').value = '';
    document.getElementById('modalFunc').classList.add('hidden');
    editFuncId = null;
}

function fecharModalInfoFunc() {
    document.getElementById('modalInfoNovoFunc').classList.add('hidden');

    document.getElementById('info-matricula').textContent = '';
    document.getElementById('info-nome').textContent = '';
    document.getElementById('info-email').textContent = '';
    document.getElementById('info-senha').textContent = '';
    document.getElementById('info-funcao').textContent = '';
    document.getElementById('info-perfil').textContent = '';
}

function mostrarOcultarFuncao() {
    const perfilSelecionado = document.getElementById('perfilFuncionario').value;
    const divFuncao = document.getElementById('divFuncao');
    const inputFuncao = document.getElementById('func-cargo');
    const inputSalario = document.getElementById('salarioFunc')

    if (perfilSelecionado === 'Funcionario') {
        divFuncao.style.display = 'block';
        inputFuncao.required = true;
    } else {
        divFuncao.style.display = 'none';
        inputFuncao.required = false;
        inputSalario.required = false;
    }
}

function cadastrarUsuario(event) {
    event.preventDefault();

    // 1. Captura o botão que foi clicado
    const btnSalvar = document.querySelector('#modalFunc .btn-primary');
    const textoOriginalBotao = btnSalvar.innerHTML;

    // 2. Coloca o botão em estado de "Aguarde"
    btnSalvar.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Aguarde...';
    btnSalvar.disabled = true;
    btnSalvar.style.cursor = 'wait';
    btnSalvar.style.opacity = '0.7';

    const nomeDigitado = document.getElementById('nomeFuncionario').value;
    const emailDigitado = document.getElementById('emailFuncionario').value;
    const senhaDigitada = document.getElementById('senhaFuncionario').value;
    const funcaoDigitada = document.getElementById('func-cargo').value;
    const perfilSelecionado = document.getElementById('perfilFuncionario').value;
    const salarioDigitado = document.getElementById('salarioFunc').value;

    const formData = new FormData();
    formData.append('nome', nomeDigitado);
    formData.append('email', emailDigitado);
    formData.append('senha', senhaDigitada);
    formData.append('cpf', document.getElementById('cpfFuncionario').value);
    formData.append('rg', document.getElementById('rgFuncionario').value);
    formData.append('perfil', perfilSelecionado);
    formData.append('funcao', funcaoDigitada);

    const statusConta = document.getElementById('statusConta');
    if (statusConta) {
        formData.append('ativo', statusConta.value);
    }

    let salarioFormatado = document.getElementById('salarioFunc').value;
    if (salarioFormatado) {
        salarioFormatado = salarioFormatado.replace('R$ ', '').replace(/\./g, '').replace(',', '.');
    }
    formData.append('salario', salarioFormatado);

    let urlDaApi = '../api/funcionarios/cadastrar';

    if (editFuncId) {
        // Edição, envia o ID e muda a rota! (NÃO envia a senha)
        formData.append('id', editFuncId);
        urlDaApi = '../api/funcionarios/atualizar';
    } else {
        // Cadastro, envia a senha e mantém a rota de cadastrar
        formData.append('senha', document.getElementById('senhaFuncionario').value);
    }

    const urlEncodedData = new URLSearchParams(formData).toString();

    fetch(urlDaApi, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        body: urlEncodedData
    })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.text().then(text => {
                        throw new Error(text);
                    });
                }
            })
            .then(dadosRecebidos => {
                restaurarBotaoSalvar(btnSalvar, textoOriginalBotao);
                fecharModalFunc();

                // Só exibe a tela de "Sucesso com Senha e Matrícula" se for um cadastro NOVO
                if (!editFuncId && dadosRecebidos && dadosRecebidos.matricula) {
                    document.getElementById('info-matricula').textContent = dadosRecebidos.matricula;
                    document.getElementById('info-nome').textContent = formData.get('nome');
                    document.getElementById('info-email').textContent = formData.get('email');
                    document.getElementById('info-senha').textContent = formData.get('senha');
                    document.getElementById('info-funcao').textContent = formData.get('funcao');
                    const infoSalario = document.getElementById('info-salario');
                    if (infoSalario)
                        infoSalario.textContent = formData.get('salario');
                    document.getElementById('info-perfil').textContent = formData.get('perfil');

                    document.getElementById('modalInfoNovoFunc').classList.remove('hidden');
                }

                carregarFuncionariosDoBanco(false);
            })
            .catch(error => {
                restaurarBotaoSalvar(btnSalvar, textoOriginalBotao);
                alert(error.message);
            });
}

async function excluirFunc(id) {
    if (!confirm('Tem certeza que deseja excluir este funcionário permanentemente? O acesso dele ao sistema será revogado.')) {
        return;
    }

    try {

        const btnSalvar = document.querySelector('#modalFunc .btn-primary');
        const textoOriginalBotao = btnSalvar.innerHTML;

        // 2. Coloca o botão em estado de "Aguarde"
        btnSalvar.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Aguarde...';
        btnSalvar.disabled = true;
        btnSalvar.style.cursor = 'wait';
        btnSalvar.style.opacity = '0.7';

        // 2. Prepara os dados para enviar ao Java (Formato formulário)
        const params = new URLSearchParams();
        params.append('id', id);

        // 3. Dispara a requisição POST para a nova Servlet
        const resposta = await fetch('../api/funcionarios/excluir', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: params
        });

        if (resposta.ok) {
            restaurarBotaoSalvar(btnSalvar, textoOriginalBotao);
            alert("Funcionário excluído com sucesso!");

            // 4. Recarrega a lista de funcionários do banco para atualizar a tela e os dropdowns
            await carregarFuncionariosDoBanco(isAdm);

        } else {
            const msgErro = await resposta.text();
            alert("Erro ao excluir: " + msgErro);
        }
    } catch (erro) {
        console.error("Erro na requisição:", erro);
        alert("Falha de comunicação com o servidor.");
    }
}

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '' || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf))
        return false;
    let add = 0;
    for (let i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(9)))
        return false;
    add = 0;
    for (let i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10)))
        return false;
    return true;
}

function validarFormulario() {
    const btnSalvar = document.querySelector('#modalFunc .btn-primary');
    const perfil = document.getElementById('perfilFuncionario').value;

    const campos = {
        nome: document.getElementById('nomeFuncionario'),
        email: document.getElementById('emailFuncionario'),
        cpf: document.getElementById('cpfFuncionario'),
        senha: document.getElementById('senhaFuncionario'),
        cargo: document.getElementById('func-cargo'),
        salario: document.getElementById('salarioFunc')
    };

    const cpfValido = validarCPF(campos.cpf.value);
    const emailValido = campos.email.value.includes('@') && campos.email.value.length > 5;
    const nomeValido = campos.nome.value.trim().length > 3;
    const senhaValida = editFuncId ? true : campos.senha.value.length >= 4;

    let cargoValido = true;
    let salarioValido = true;

    if (perfil === 'Funcionario') {
        cargoValido = campos.cargo.value.trim().length > 2;

        let salarioLimpo = campos.salario.value.replace('R$ ', '').replace(/\./g, '').replace(',', '.').trim();

        salarioValido = salarioLimpo.length > 0 && Number(salarioLimpo) >= 0;
    }

    aplicarEstiloValidacao(campos.cpf, cpfValido);
    aplicarEstiloValidacao(campos.email, emailValido);
    aplicarEstiloValidacao(campos.nome, nomeValido);
    if (!editFuncId)
        aplicarEstiloValidacao(campos.senha, senhaValida);

    if (perfil === 'Funcionario') {
        aplicarEstiloValidacao(campos.cargo, cargoValido);
        aplicarEstiloValidacao(campos.salario, salarioValido);
    }

    // O botão só acende se TUDO for verdadeiro
    btnSalvar.disabled = !(cpfValido && emailValido && nomeValido && cargoValido && salarioValido);
    btnSalvar.style.opacity = btnSalvar.disabled ? "0.5" : "1";
    btnSalvar.style.cursor = btnSalvar.disabled ? "not-allowed" : "pointer";
}

function aplicarEstiloValidacao(elemento, v) {
    if (elemento.value.length > 0) {
        elemento.style.borderColor = v ? "#28a745" : "#dc3545"; // Verde ou Vermelho
    } else {
        elemento.style.borderColor = "#ddd"; // Cor padrão
    }
}

document.querySelector('[data-page="funcionarios"]').addEventListener('click', () => {
    carregarFuncionariosDoBanco(isAdm);
});

document.addEventListener('DOMContentLoaded', () => {
    const ids = ['nomeFuncionario', 'emailFuncionario', 'cpfFuncionario', 'senhaFuncionario', 'func-cargo', 'salarioFunc'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el)
            el.addEventListener('input', validarFormulario);
    });

    // Mascaras
    const inputCpf = document.getElementById('cpfFuncionario');
    if (inputCpf)
        inputCpf.addEventListener('input', mascaraCPF);

    const inputRg = document.getElementById('rgFuncionario');
    if (inputRg)
        inputRg.addEventListener('input', mascaraRG);

    const inputSalario = document.getElementById('salarioFunc');
    if (inputSalario)
        inputSalario.addEventListener('input', mascaraMoeda);
});


// 🎭 MÁSCARAS DE INPUT

function mascaraCPF(evento) {
    let v = evento.target.value.replace(/\D/g, ""); // Remove tudo o que não é dígito
    v = v.replace(/(\d{3})(\d)/, "$1.$2"); // Coloca um ponto entre o 3º e o 4º dígitos
    v = v.replace(/(\d{3})(\d)/, "$1.$2"); // Coloca um ponto entre o 6º e o 7º dígitos
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Coloca um hífen antes dos 2 últimos dígitos
    evento.target.value = v.substring(0, 14); // Limita a 14 caracteres (000.000.000-00)
}

function mascaraRG(evento) {
    // RG varia de estado para estado, essa máscara aceita números e a letra X no final
    let v = evento.target.value.replace(/[^0-9xX]/g, "");
    v = v.replace(/(\d{2})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})([0-9xX]{1})$/, "$1-$2");
    evento.target.value = v.substring(0, 12).toUpperCase(); // Ex: 12.345.678-9 ou 12.345.678-X
}

function mascaraMoeda(evento) {
    let v = evento.target.value.replace(/\D/g, ""); // Remove o que não é dígito
    if (v === "") {
        evento.target.value = "";
        return;
    }
    v = (v / 100).toFixed(2) + ""; // Divide por 100 para criar os centavos
    v = v.replace(".", ","); // Troca ponto por vírgula
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); // Coloca ponto a cada 3 dígitos
    evento.target.value = "R$ " + v;
}

function restaurarBotaoSalvar(botao, textoOriginal) {
    botao.innerHTML = textoOriginal;
    botao.disabled = false;
    botao.style.cursor = 'pointer';
    botao.style.opacity = '1';
}