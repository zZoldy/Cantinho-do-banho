package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.PetDAO;
import com.app.cantinho_banho.model.Pet;
import com.app.cantinho_banho.resources.Function;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/pets/atualizar-obs")
public class AtualizarObsPetServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        try {
            Long id = Long.parseLong(request.getParameter("id"));
            String obs = request.getParameter("obs");
            if (Function.isInicioBarraInvertida(obs)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("A Observação não pode iniciar com barra invertida.");
                return;
            }

            PetDAO dao = new PetDAO();
            Pet pet = dao.buscarPorId(id);

            if (pet != null) {
                pet.setObs(obs);
                dao.salvarOuAtualizar(pet);
                response.setStatus(HttpServletResponse.SC_OK);

                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosCadPet();
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
