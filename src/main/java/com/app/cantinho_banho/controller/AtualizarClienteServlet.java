package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ClienteDAO;
import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Endereco;
import com.app.cantinho_banho.resources.Function;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/clientes/atualizar")
public class AtualizarClienteServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        try {
            Long id = Long.parseLong(request.getParameter("id"));
            ClienteDAO dao = new ClienteDAO();
            Cliente c = dao.buscarPorId(id);

            if (c != null) {
                c.setNome(request.getParameter("nome"));
                if (Function.isInicioBarraInvertida(c.getNome())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("O Nome do Cliente não pode iniciar com barra invertida.");
                    return;
                }

                c.setTelefone(request.getParameter("telefone"));

                // Lógica do Endereço
                Endereco end = c.getEndereco();
                if (end == null) {
                    end = new Endereco();
                }

                end.setCep(request.getParameter("cep"));
                end.setLogradouro(request.getParameter("logradouro"));
                if (Function.isInicioBarraInvertida(end.getLogradouro())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("O Logradouro não pode iniciar com barra invertida.");
                    return;
                }

                end.setNumero(request.getParameter("numero"));
                if (Function.isInicioBarraInvertida(end.getNumero())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("O Número não pode iniciar com barra invertida.");
                    return;
                }

                end.setBairro(request.getParameter("bairro"));
                if (Function.isInicioBarraInvertida(end.getBairro())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("O Bairro não pode iniciar com barra invertida.");
                    return;
                }

                end.setCidade(request.getParameter("cidade"));
                if (Function.isInicioBarraInvertida(end.getCidade())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("A Cidade não pode iniciar com barra invertida.");
                    return;
                }

                end.setUf(request.getParameter("uf"));
                if (Function.isInicioBarraInvertida(end.getUf())) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("A UF não pode iniciar com barra invertida.");
                    return;
                }

                c.setEndereco(end);
                dao.salvar(c);
                response.setStatus(200);
            }
        } catch (Exception e) {
            response.setStatus(500);
            response.getWriter().write("Erro: " + e.getMessage());
        }
    }
}
