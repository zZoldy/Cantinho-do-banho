package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.FuncionarioDAO;
import com.app.cantinho_banho.dao.UsuarioDAO;
import com.app.cantinho_banho.model.Endereco;
import com.app.cantinho_banho.model.Funcionario;
import com.app.cantinho_banho.model.Usuario;
import com.app.cantinho_banho.resources.Function;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.mindrot.jbcrypt.BCrypt;

@WebServlet("/api/funcionarios/cadastrar")
public class CadastroFuncionarioServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        try {
            String nome = request.getParameter("nome");
            if (Function.isInicioBarraInvertida(nome)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O Nome não pode iniciar com barra invertida.");
                return;
            }

            String email = request.getParameter("email");
            if (Function.isInicioBarraInvertida(email)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O E-mail não pode iniciar com barra invertida.");
                return;
            }

            String senha = request.getParameter("senha");
            String cpf = request.getParameter("cpf");
            String rg = request.getParameter("rg");
            String perfil = request.getParameter("perfil");
            String funcao = request.getParameter("funcao");
            String salario = request.getParameter("salario");

            java.util.ArrayList<String> camposFaltando = new java.util.ArrayList<>();

            if (nome == null || nome.trim().isEmpty()) {
                camposFaltando.add("Nome");
            }
            if (email == null || email.trim().isEmpty()) {
                camposFaltando.add("E-mail");
            }
            if (cpf == null || cpf.trim().isEmpty()) {
                camposFaltando.add("CPF");
            }

            if (senha == null || senha.trim().isEmpty()) {
                camposFaltando.add("Senha");
            }

            if (perfil.equals("Funcionario")) {
                if (funcao == null || funcao.trim().isEmpty()) {
                    camposFaltando.add("Função");
                }
                if (salario == null || salario.trim().isEmpty()) {
                    camposFaltando.add("Salário");
                }
            }

            if (!camposFaltando.isEmpty()) {
                response.setStatus(400);
                response.getWriter().write("Erro. O Java não recebeu ou recebeu vazio: " + String.join(", ", camposFaltando));
                return;
            }

            Usuario novoUsuario = new Usuario();
            UsuarioDAO usuDAO = new UsuarioDAO();

            if (usuDAO.existeEmail(email)) {
                response.setStatus(500);
                response.getWriter().write("Erro ao cadastrar usuário. @Email");
                return;
            } else {
                novoUsuario.setEmail(email);
            }

            if (usuDAO.existeCpf(cpf)) {
                response.setStatus(500);
                response.getWriter().write("Erro ao cadastrar usuário. @Cpf");
                return;
            } else {
                novoUsuario.setCpf(cpf);
            }

            novoUsuario.setNome(nome);
            String senhaCriptografada = BCrypt.hashpw(senha, BCrypt.gensalt());
            novoUsuario.setSenha(senhaCriptografada);

            novoUsuario.setRg(rg);
            novoUsuario.setReset_password(true);

            novoUsuario.setPerfil(perfil);

            Funcionario func = new Funcionario();
            func.setFuncao(funcao);

            if (salario != null && !salario.trim().isEmpty()) {
                func.setSalario(Double.parseDouble(salario));
            } else {
                func.setSalario(0.0);
            }

            Endereco endFunc = new Endereco();
            endFunc.setCep(request.getParameter("cep"));
            endFunc.setLogradouro(request.getParameter("logradouro"));
            if (Function.isInicioBarraInvertida(endFunc.getLogradouro())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O Logradouro não pode iniciar com barra invertida.");
                return;
            }

            endFunc.setNumero(request.getParameter("numero"));
            if (Function.isInicioBarraInvertida(endFunc.getNumero())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O Número não pode iniciar com barra invertida.");
                return;
            }

            endFunc.setBairro(request.getParameter("bairro"));
            if (Function.isInicioBarraInvertida(endFunc.getBairro())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O Bairro não pode iniciar com barra invertida.");
                return;
            }

            endFunc.setCidade(request.getParameter("cidade"));
            endFunc.setUf(request.getParameter("uf"));
            endFunc.setComplemento(request.getParameter("complemento"));
            if (Function.isInicioBarraInvertida(endFunc.getComplemento())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O Complemento não pode iniciar com barra invertida.");
                return;
            }

            func.setEndereco(endFunc);

            FuncionarioDAO funcDAO = new FuncionarioDAO();

            String matriculaSegura = funcDAO.gerarMatriculaUnica();
            func.setMatricula(matriculaSegura);

            func.setUsuario(novoUsuario);

            funcDAO.salvar(func);

            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodos();

            response.setStatus(201);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            String jsonResponse = "{\"matricula\": \"" + func.getMatricula() + "\"}";
            response.getWriter().write(jsonResponse);

        } catch (IOException | NumberFormatException e) {
            System.err.println("ERRO: " + e);
        }
    }
}
