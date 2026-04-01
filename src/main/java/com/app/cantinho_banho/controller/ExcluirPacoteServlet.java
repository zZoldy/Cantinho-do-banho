package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.PacoteDAO;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/pacotes/excluir")
public class ExcluirPacoteServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/plain");
        response.setCharacterEncoding("UTF-8");

        try {
            String idParam = request.getParameter("id");
            if (idParam == null || idParam.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("ID do pacote não fornecido.");
                return;
            }

            Long id = Long.parseLong(idParam);

            PacoteDAO dao = new PacoteDAO();
            dao.excluir(id);

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("Pacote excluído com sucesso.");

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_CONFLICT); 
            response.getWriter().write(e.getMessage());
        }
    }
}