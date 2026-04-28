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

@WebServlet("/api/fornecedor/cadastrar")
public class CadastrarFornecedorServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        try {
            Fornecedor fornecedor = new Fornecedor();

            String nomeDigitado = request.getParameter("nome");

            if (Function.isInicioBarraInvertida(nomeDigitado)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("A Razão Social não pode iniciar com barra invertida.");
                return;
            }

            fornecedor.setRazaoSocial(nomeDigitado.trim());

            String cnpj = request.getParameter("cnpj");
            if (Function.isInicioBarraInvertida(cnpj)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O CNPJ não pode iniciar com barra invertida.");
                return;
            }

            fornecedor.setCnpj(cnpj != null && !cnpj.isEmpty() ? cnpj : "Não Informado");

            String telefone = request.getParameter("telefone");
            if (Function.isInicioBarraInvertida(telefone)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("Erro: O telefone iniciando com \\.");
                return;
            }

            fornecedor.setTelefone(telefone != null && !telefone.isEmpty() ? telefone : "Não Informado");

            Endereco enderecoObj = new Endereco();
            enderecoObj.setCep(request.getParameter("cep"));
            enderecoObj.setLogradouro(request.getParameter("logradouro"));
            if (Function.isInicioBarraInvertida(enderecoObj.getLogradouro())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O Logradouro não pode iniciar com barra invertida.");
                return;
            }

            enderecoObj.setNumero(request.getParameter("numero"));
            if (Function.isInicioBarraInvertida(enderecoObj.getNumero())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O Número não pode iniciar com barra invertida.");
                return;
            }

            enderecoObj.setBairro(request.getParameter("bairro"));
            if (Function.isInicioBarraInvertida(enderecoObj.getBairro())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O Bairro não pode iniciar com barra invertida.");
                return;
            }

            enderecoObj.setCidade(request.getParameter("cidade"));
            enderecoObj.setUf(request.getParameter("uf"));

            enderecoObj.setComplemento(request.getParameter("complemento"));
            if (Function.isInicioBarraInvertida(enderecoObj.getComplemento())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O Complemento não pode iniciar com barra invertida.");
                return;
            }

            fornecedor.setEndereco(enderecoObj);

            fornecedor.setEmail(request.getParameter("email"));
            if (Function.isInicioBarraInvertida(fornecedor.getEmail())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O E-mail não pode iniciar com barra invertida.");
                return;
            }
            
            fornecedor.setAtivo(true);

            FornecedorDAO dao = new FornecedorDAO();
            dao.salvar(fornecedor);

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("Fornecedor cadastrado com sucesso!");

            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosFornecedor();

        } catch (IOException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Erro ao cadastrar fornecedor: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
