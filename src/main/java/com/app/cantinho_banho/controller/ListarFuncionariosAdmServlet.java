package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.FuncionarioDAO;
import com.app.cantinho_banho.model.Funcionario;
import com.app.cantinho_banho.model.Usuario;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/funcionarios/listar-adm")
public class ListarFuncionariosAdmServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            FuncionarioDAO dao = new FuncionarioDAO();
            List<Funcionario> lista = dao.buscarTodos();

            // Montagem manual de um JSON (Array de objetos)
            StringBuilder json = new StringBuilder("[");
            for (int i = 0; i < lista.size(); i++) {
                Funcionario f = lista.get(i);

                Usuario u = f.getUsuario();

                String nome = (u != null && u.getNome() != null) ? u.getNome() : "";
                String email = (u != null && u.getEmail() != null) ? u.getEmail() : "";
                String cpf = (u != null && u.getCpf() != null) ? u.getCpf() : "";
                String rg = (u != null && u.getRg() != null) ? u.getRg() : "";
                String perfil = (u != null && u.getPerfil() != null) ? u.getPerfil() : "Funcionario";
                String data_criacao = "";
                if (u != null && u.getDataCriacao() != null) {
                    DateTimeFormatter formatador = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");
                    data_criacao = u.getDataCriacao().format(formatador);
                }
                Boolean conta_ativa = (u != null) ? u.isAtivo() : false;

                Long idFuncionario = (u != null) ? f.getId() : 0L;
                String matricula = f.getMatricula() != null ? f.getMatricula() : "";
                String funcao = f.getFuncao() != null ? f.getFuncao() : "";
                Double salario = f.getSalario() != null ? f.getSalario() : 0.0;

                json.append("{")
                        .append("\"id\":").append(idFuncionario).append(",")
                        .append("\"nome\":\"").append(nome).append("\",")
                        .append("\"email\":\"").append(email).append("\",")
                        .append("\"cpf\":\"").append(cpf).append("\",")
                        .append("\"rg\":\"").append(rg).append("\",")
                        .append("\"perfil\":\"").append(perfil).append("\",")
                        .append("\"data_criacao\":\"").append(data_criacao).append("\",")
                        .append("\"conta_ativa\":\"").append(conta_ativa).append("\",")
                        .append("\"matricula\":\"").append(matricula).append("\",")
                        .append("\"funcao\":\"").append(funcao).append("\",")
                        .append("\"salario\":").append(salario)
                        .append("}");

                if (i < lista.size() - 1) {
                    json.append(",");
                }
            }
            json.append("]");

            System.out.println("Analise:\n" + json.toString());
            response.setStatus(200);
            response.getWriter().write(json.toString());

        } catch (Exception e) {
            response.setStatus(500);
            response.getWriter().write("{\"erro\": \"Erro ao buscar funcionários: " + e.getMessage() + "\"}");
        }
    }
}
