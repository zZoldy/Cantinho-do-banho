package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.FornecedorDAO;
import com.app.cantinho_banho.model.Fornecedor;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/fornecedores/listar")
public class ListarFornecedoresServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");

        try {
            FornecedorDAO dao = new FornecedorDAO();
            List<Fornecedor> lista = dao.listarTodos();

            StringBuilder json = new StringBuilder();
            json.append("[");

            for (int i = 0; i < lista.size(); i++) {
                Fornecedor f = lista.get(i);

                json.append("{");
                json.append("\"id\":").append(f.getId()).append(",");

                String razaoSocial = f.getRazaoSocial() != null ? f.getRazaoSocial().replace("\"", "\\\"") : "";
                json.append("\"nome\":\"").append(razaoSocial).append("\",");

                String cnpj = f.getCnpj() != null ? f.getCnpj().replace("\"", "\\\"") : "";
                json.append("\"cnpj\":\"").append(cnpj).append("\",");

                String telefone = f.getTelefone() != null ? f.getTelefone().replace("\"", "\\\"") : "";
                json.append("\"telefone\":\"").append(telefone).append("\",");

                String email = f.getEmail() != null ? f.getEmail().replace("\"", "\\\"") : "";
                json.append("\"email\":\"").append(email).append("\",");

                String endereco = f.getEndereco() != null ? f.getEndereco().replace("\"", "\\\"") : "";
                json.append("\"endereco\":\"").append(endereco).append("\""); 

                json.append("}");

                if (i < lista.size() - 1) {
                    json.append(",");
                }
            }
            json.append("]");

            response.getWriter().write(json.toString());

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("[]");
            e.printStackTrace();
        }
    }
}
