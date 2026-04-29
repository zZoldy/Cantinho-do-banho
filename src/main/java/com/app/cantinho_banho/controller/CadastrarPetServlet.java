/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ClienteDAO;
import com.app.cantinho_banho.dao.PetDAO;
import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Pet;
import com.app.cantinho_banho.resources.Function;
import java.io.IOException;
import java.util.stream.Collectors;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/pets/salvar")
public class CadastrarPetServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String jsonStr = request.getReader().lines().collect(Collectors.joining());

            Pet pet = new Pet();

            String idStr = extrairCampo(jsonStr, "id");
            if (idStr != null && !idStr.isEmpty() && !idStr.equals("null")) {
                pet.setId(Long.parseLong(idStr));
            }

            pet.setNome(extrairCampo(jsonStr, "nome"));
            if (Function.isInicioBarraInvertida(pet.getNome())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O Nome não pode iniciar com barra invertida.");
                return;
            }
            pet.setTipo(extrairCampo(jsonStr, "tipo"));
            if (Function.isInicioBarraInvertida(pet.getNome())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O Tipo não pode iniciar com barra invertida.");
                return;
            }

            pet.setRaca(extrairCampo(jsonStr, "raca"));
            if (Function.isInicioBarraInvertida(pet.getRaca())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("A Raça não pode iniciar com barra invertida.");
                return;
            }

            pet.setPorte(extrairCampo(jsonStr, "porte"));
            pet.setObs(extrairCampo(jsonStr, "obs"));
            if (Function.isInicioBarraInvertida(pet.getObs())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("A Observação não pode iniciar com barra invertida.");
                return;
            }

            Long clienteId = Long.parseLong(extrairCampo(jsonStr, "clienteId"));
            Cliente cliente = new ClienteDAO().buscarPorId(clienteId);
            pet.setDono(cliente);

            new PetDAO().salvarOuAtualizar(pet);
            response.getWriter().write("{\"status\": \"sucesso\"}");

            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosCadPet();

        } catch (Exception e) {
            response.setStatus(500);
            response.getWriter().write("{\"erro\": \"" + e.getMessage() + "\"}");
        }
    }

    private String extrairCampo(String json, String campo) {
        String chave = "\"" + campo + "\":\"";
        int inicio = json.indexOf(chave);
        if (inicio == -1) {
            chave = "\"" + campo + "\":";
            inicio = json.indexOf(chave);
            if (inicio == -1) {
                return "";
            }
            int fim = json.indexOf(",", inicio + chave.length());
            if (fim == -1) {
                fim = json.indexOf("}", inicio + chave.length());
            }
            return json.substring(inicio + chave.length(), fim).trim().replace("\"", "");
        }
        int fim = json.indexOf("\"", inicio + chave.length());
        return json.substring(inicio + chave.length(), fim);
    }
}
