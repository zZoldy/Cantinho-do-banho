package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.PetDAO;
import com.app.cantinho_banho.model.Pet;
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
        
        try {
            Long id = Long.parseLong(request.getParameter("id"));
            String obs = request.getParameter("obs");

            PetDAO dao = new PetDAO();
            Pet pet = dao.buscarPorId(id);
            
            if (pet != null) {
                pet.setObs(obs);
                dao.salvarOuAtualizar(pet);
                response.setStatus(HttpServletResponse.SC_OK);
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}