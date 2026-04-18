package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ClienteDAO;
import com.app.cantinho_banho.dao.VendaPacoteDAO;
import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Pet;
import com.app.cantinho_banho.model.VendaPacote;
import com.app.cantinho_banho.model.Endereco; // 🟢 Novo Import
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
            VendaPacoteDAO vendaDao = new VendaPacoteDAO();
            List<Cliente> clientes = dao.listarTodos();

            StringBuilder json = new StringBuilder();
            json.append("[");

            boolean primeiroCliente = true;

            for (Cliente c : clientes) {
                if (!primeiroCliente) {
                    json.append(",");
                }
                primeiroCliente = false;

                boolean temUsuario = (c.getUsuario() != null);

                json.append("{");
                json.append("\"id\":").append(c.getId()).append(",");
                json.append("\"nome\":\"").append(escapeJson(c.getNome())).append("\",");
                json.append("\"telefone\":\"").append(escapeJson(c.getTelefone())).append("\",");
                json.append("\"temUsuario\":").append(temUsuario).append(",");

                // 🟢 INÍCIO DO BLOCO DE ENDEREÇO
                json.append("\"endereco\":");
                if (c.getEndereco() != null) {
                    Endereco end = c.getEndereco();
                    json.append("{");
                    json.append("\"cep\":\"").append(escapeJson(end.getCep())).append("\",");
                    json.append("\"logradouro\":\"").append(escapeJson(end.getLogradouro())).append("\",");
                    json.append("\"numero\":\"").append(escapeJson(end.getNumero())).append("\",");
                    json.append("\"bairro\":\"").append(escapeJson(end.getBairro())).append("\",");
                    json.append("\"cidade\":\"").append(escapeJson(end.getCidade())).append("\",");
                    json.append("\"uf\":\"").append(escapeJson(end.getUf())).append("\",");
                    json.append("\"complemento\":\"").append(escapeJson(end.getComplemento())).append("\"");
                    json.append("}");
                } else {
                    json.append("null");
                }
                json.append(",");

                List<VendaPacote> pacotesAtivos = vendaDao.listarAtivosPorCliente(c.getId());
                json.append("\"pacotes\":[");
                for (int j = 0; j < pacotesAtivos.size(); j++) {
                    VendaPacote vp = pacotesAtivos.get(j);
                    json.append("{");
                    json.append("\"idVenda\":").append(vp.getId()).append(",");
                    json.append("\"pacoteNome\":\"").append(escapeJson(vp.getPacote().getNome())).append("\",");
                    json.append("\"servicoNome\":\"").append(escapeJson(vp.getPacote().getServico().getNome())).append("\",");
                    json.append("\"sessoesRestantes\":").append(vp.getSessoesRestantes()).append(",");
                    json.append("\"sessoesTotais\":").append(vp.getPacote().getQuantidadeSessoes()).append(",");
                    json.append("\"validade\":\"").append(vp.getDataVenda().toLocalDate().plusDays(vp.getPacote().getValidadeDias())).append("\"");
                    json.append("}");
                    if (j < pacotesAtivos.size() - 1) {
                        json.append(",");
                    }
                }
                json.append("],");


                json.append("\"pets\":[");
                if (c.getPets() != null && !c.getPets().isEmpty()) {
                    boolean primeiroPet = true;
                    for (Pet p : c.getPets()) {
                        if (!primeiroPet) {
                            json.append(",");
                        }
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

        } catch (Exception e) { // Alterado para Exception para capturar erros de Cast ou NullPointer
            response.setStatus(500);
            response.getWriter().write("Erro no servidor: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String escapeJson(String texto) {
        if (texto == null) {
            return "";
        }
        return texto.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}