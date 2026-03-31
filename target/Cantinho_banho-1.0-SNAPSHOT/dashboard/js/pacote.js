// ==========================================
// GESTÃO DE PACOTES (ADMIN)
// ==========================================

async function carregarPacotesAdmin() {
    const container = document.getElementById('lista-pacotes-admin');
    if (!container) return;

    container.innerHTML = '<span style="color: #888; font-size: 0.9rem;"><i class="fas fa-spinner fa-spin"></i> Carregando pacotes...</span>';

    try {
        const res = await fetch('../api/pacotes/listar'); 
        
        if (res.ok) {
            const pacotes = await res.json();
            
            if (pacotes.length === 0) {
                container.innerHTML = "<span style='color: #888; font-size: 0.9rem;'>Nenhum pacote cadastrado.</span>";
                return;
            }

            container.innerHTML = pacotes.map(p => `
                <div style="background: #1a1a1a; padding: 12px 15px; border-radius: 6px; border-left: 4px solid #C9A96E; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <strong style="color: #fff; font-size: 0.95rem;">${p.nome}</strong><br>
                        <span style="color: #aaa; font-size: 0.8rem;">
                            <i class="fas fa-shower" style="margin-right: 4px;"></i> ${p.sessoes} sessões | 
                            <i class="far fa-calendar-alt" style="margin-right: 4px; margin-left: 6px;"></i> Válido por ${p.validade} dias
                        </span>
                    </div>
                    <div style="text-align: right;">
                        <strong style="color: #28a745; font-size: 1.05rem;">R$ ${p.valor.toFixed(2)}</strong>
                    </div>
                </div>
            `).join('');
            
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


    const params = new URLSearchParams();
    params.append('nome', nome);
    params.append('sessoes', sessoes);
    params.append('validade', validade);
    params.append('valor', valor);


    const btnSubmit = document.querySelector('#form-novo-pacote button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    btnSubmit.disabled = true;

    try {
        const res = await fetch('api/pacotes/cadastrar', { 
            method: 'POST', 
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params 
        });
        
        if (res.ok) {
            document.getElementById('form-novo-pacote').reset(); 
            carregarPacotesAdmin(); 
            
            alert('Pacote "' + nome + '" criado com sucesso!');
        } else {
            alert('Erro ao criar pacote. O servidor retornou uma falha.');
        }
    } catch (erro) {
        console.error("Erro na requisição cadastrar pacote:", erro);
        alert('Falha na comunicação com o servidor.');
    } finally {
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
}