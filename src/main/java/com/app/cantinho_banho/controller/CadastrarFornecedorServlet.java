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

            fornecedor.setRazaoSocial(request.getParameter("nome"));
            if (Function.validarInicioNaoLetra(fornecedor.getRazaoSocial())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("Erro: A Razão Social deve iniciar com uma letra.");
                return;
            }

            String cnpj = request.getParameter("cnpj");
            fornecedor.setCnpj(cnpj != null && !cnpj.isEmpty() ? cnpj : "Não Informado");

            String telefone = request.getParameter("telefone");
            fornecedor.setTelefone(telefone != null && !telefone.isEmpty() ? telefone : "Não Informado");

            Endereco enderecoObj = new Endereco();
            enderecoObj.setCep(request.getParameter("cep-forn"));
            enderecoObj.setLogradouro(request.getParameter("logradouro-forn"));
            enderecoObj.setNumero(request.getParameter("numero-forn"));
            enderecoObj.setBairro(request.getParameter("bairro-forn"));
            enderecoObj.setCidade(request.getParameter("cidade-forn"));
            enderecoObj.setUf(request.getParameter("uf-forn"));
            enderecoObj.setComplemento(request.getParameter("complemento-forn"));

            fornecedor.setEndereco(enderecoObj);

            fornecedor.setEmail(request.getParameter("email"));
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
