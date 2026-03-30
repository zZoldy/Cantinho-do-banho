package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ClienteDAO;
import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Pet;
import java.io.IOException;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/clientes/listar")
public class ListarClientesServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            ClienteDAO dao = new ClienteDAO();
            List<Cliente> clientes = dao.listarTodos(); 

            StringBuilder json = new StringBuilder();
            json.append("[");
            
            boolean primeiroCliente = true;

            for (Cliente c : clientes) {
                if (!primeiroCliente) json.append(",");
                primeiroCliente = false;

                boolean temUsuario = (c.getUsuario() != null);

                json.append("{");
                json.append("\"id\":").append(c.getId()).append(",");
                json.append("\"nome\":\"").append(escapeJson(c.getNome())).append("\",");
                json.append("\"telefone\":\"").append(escapeJson(c.getTelefone())).append("\",");
                json.append("\"temUsuario\":").append(temUsuario).append(",");
                
                json.append("\"pets\":[");
                if (c.getPets() != null && !c.getPets().isEmpty()) {
                    boolean primeiroPet = true;
                    for (Pet p : c.getPets()) {
                        if (!primeiroPet) json.append(",");
                        primeiroPet = false;
                        
                        json.append("{");
                        json.append("\"id\":").append(p.getId()).append(",");
                        json.append("\"nome\":\"").append(escapeJson(p.getNome())).append("\",");
                        json.append("\"tipo\":\"").append(escapeJson(p.getTipo())).append("\",");
                        json.append("\"obs\":\"").append(escapeJson(p.getObs())).append("\"");
                        json.append("}");
                    }
                }
                json.append("]");
                json.append("}");
            }
            json.append("]");

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(json.toString());
            
        } catch (IOException e) {
            response.setStatus(500);
            response.getWriter().write("Erro no servidor: " + e.getMessage());
        }
    }

    private String escapeJson(String texto) {
        if (texto == null) return "";
        return texto.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
