package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.FornecedorDAO;
import com.app.cantinho_banho.model.Endereco;
import com.app.cantinho_banho.model.Fornecedor;
import com.app.cantinho_banho.resources.Function;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/fornecedor/atualizar")
public class AtualizarFornecedorServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        try {
            Long id = Long.parseLong(request.getParameter("id"));
            FornecedorDAO dao = new FornecedorDAO();
            Fornecedor fornecedor = dao.buscarPorId(id); // Busca o original

            if (fornecedor != null) {
                fornecedor.setRazaoSocial(request.getParameter("nome"));
                if (Function.isInicioBarraInvertida(fornecedor.getRazaoSocial())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("A Razão Social não pode iniciar com barra invertida.");
                    return;
                }
                fornecedor.setCnpj(request.getParameter("cnpj"));
                if (Function.isInicioBarraInvertida(fornecedor.getCnpj())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("O CNPJ não pode iniciar com barra invertida.");
                    return;
                }
                fornecedor.setTelefone(request.getParameter("telefone"));
                if (Function.isInicioBarraInvertida(fornecedor.getTelefone())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("O Telefone não pode iniciar com barra invertida.");
                    return;
                }
                fornecedor.setEmail(request.getParameter("email"));
                if (Function.isInicioBarraInvertida(fornecedor.getEmail())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("O E-mail não pode iniciar com barra invertida.");
                    return;
                }

                Endereco endereco = fornecedor.getEndereco();
                if (endereco == null) {
                    endereco = new Endereco();
                }

                endereco.setCep(request.getParameter("cep"));
                endereco.setLogradouro(request.getParameter("logradouro"));
                if (Function.isInicioBarraInvertida(endereco.getLogradouro())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("O Logradouro não pode iniciar com barra invertida.");
                    return;
                }

                endereco.setNumero(request.getParameter("numero"));
                if (Function.isInicioBarraInvertida(endereco.getNumero())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("O número não pode iniciar com barra invertida.");
                    return;
                }

                endereco.setBairro(request.getParameter("bairro"));
                if (Function.isInicioBarraInvertida(endereco.getBairro())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("O Bairro não pode iniciar com barra invertida.");
                    return;
                }

                endereco.setCidade(request.getParameter("cidade"));
                endereco.setUf(request.getParameter("uf"));
                endereco.setComplemento(request.getParameter("complemento"));
                if (Function.isInicioBarraInvertida(endereco.getComplemento())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("O Complemento não pode iniciar com barra invertida.");
                    return;
                }

                fornecedor.setEndereco(endereco);
                dao.atualizar(fornecedor);
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("Fornecedor atualizado com sucesso!");
                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosFornecedor();
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Fornecedor não encontrado.");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Erro: " + e.getMessage());
        }
    }
}
