package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.FuncionarioDAO;
import com.app.cantinho_banho.dao.UsuarioDAO;
import com.app.cantinho_banho.model.Funcionario;
import com.app.cantinho_banho.model.Usuario;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/funcionarios/atualizar")
public class AtualizarFuncionarioServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        try {

            String idStr = request.getParameter("id");
            if (idStr == null || idStr.isEmpty()) {
                response.setStatus(400);
                response.getWriter().write("Erro: ID do usuário não fornecido");
                return;
            }
            
            String nome = request.getParameter("nome");
            String email = request.getParameter("email");
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

            Long id = Long.parseLong(idStr);
            FuncionarioDAO dao = new FuncionarioDAO();
            Funcionario f = dao.buscarPorId(id);
            if (f == null) {
                response.setStatus(404);
                response.getWriter().write("Erro: Funcionário não encontrado no banco.");
                return;
            }

            Usuario usuario = f.getUsuario();
            UsuarioDAO usuDAO = new UsuarioDAO();

            if (!usuario.getEmail().equals(email)) {
                if (usuDAO.existeEmail(email)) {
                    response.setStatus(409);
                    response.getWriter().write("Erro: Este e-mail já está sendo usado por outro usuário.");
                    return;
                }
                usuario.setEmail(email);
            }

            if (!usuario.getCpf().equals(cpf)) {
                if (usuDAO.existeCpf(cpf)) {
                    response.setStatus(409);
                    response.getWriter().write("Erro: Este CPF já está cadastrado.");
                    return;
                }
                usuario.setCpf(cpf);
            }
            usuario.setNome(nome);
            usuario.setRg(rg != null && !rg.trim().isEmpty() ? rg : null);

            String ativa = request.getParameter("ativo");
            if (ativa != null && !ativa.trim().isEmpty()) {
                if (ativa.equals("true")) {
                    usuario.setAtivo(true);
                } else {
                    usuario.setAtivo(false);
                }
            }

            if (perfil != null && !perfil.trim().isEmpty()) {
                usuario.setPerfil(perfil);
            }

            if (!"Cliente".equals(perfil)) {
                if (usuario.getPerfil().equals("Funcionario")) {
                    f.setFuncao(funcao);

                    String salarioStr = salario;
                    f.setSalario(salarioStr != null && !salarioStr.trim().isEmpty() ? Double.valueOf(salarioStr) : 0.0);
                } else if (usuario.getPerfil().equals("Admin")) {
                    f.setFuncao("Administrador");
                    f.setSalario(0.0);
                }

            }

            dao.atualizar(f);
            
            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodos();

            response.setStatus(200);
            response.setContentType("application/json");
            response.getWriter().write("{\"mensagem\": \"Funcionário atualizado com sucesso!\"}");

        } catch (IOException | NumberFormatException e) {
            response.setStatus(500);
            response.getWriter().write("Erro ao atualizar funcionário. Detalhes: " + e.getMessage());
        }
    }
}
