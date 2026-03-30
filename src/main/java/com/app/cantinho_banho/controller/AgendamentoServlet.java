package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.AgendamentoDAO;
import com.app.cantinho_banho.dao.ClienteDAO;
import com.app.cantinho_banho.dao.PetDAO;
import com.app.cantinho_banho.dao.ServicoDAO;
import com.app.cantinho_banho.model.Agendamento;
import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Pet;
import com.app.cantinho_banho.model.Servico;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/agendar")
public class AgendamentoServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        String nomeDono = request.getParameter("nomeDono");
        String telefone = request.getParameter("telefone");
        String nomePet = request.getParameter("nomePet");
        String racaPet = request.getParameter("racaPet");
        String portePet = request.getParameter("portePet");
        String tipoPet = request.getParameter("tipo");

        Long servicoId = Long.parseLong(request.getParameter("servico"));
        ServicoDAO servicoDAO = new ServicoDAO();
        Servico servicoObj = servicoDAO.buscarPorId(servicoId);

        String dataStr = request.getParameter("data");
        String horaStr = request.getParameter("hora");

        ClienteDAO clienteDAO = new ClienteDAO();

        AgendamentoDAO agendamentoDAO = new AgendamentoDAO();

        try {
            LocalDate data = LocalDate.parse(dataStr);
            LocalTime hora = LocalTime.parse(horaStr);

            Cliente cliente = clienteDAO.buscarPorTelefoneENome(telefone, nomeDono);
            if (cliente == null) {
                if (clienteDAO.existeTelefone(telefone)) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("Este Telefone já está em uso por outra pessoa.");
                    return;
                }
                
                cliente = new Cliente();
                cliente.setNome(nomeDono);
                cliente.setTelefone(telefone);
            }

            Pet pet = null;

            if (cliente.getId() != null) {
                PetDAO petDAO = new PetDAO();
                pet = petDAO.buscarPorNomeEDono(nomePet, cliente.getId());
            }

            if (pet == null) {
                pet = new Pet();
                pet.setNome(nomePet);
                pet.setTipo(tipoPet);
                pet.setRaca(racaPet);
                pet.setPorte(portePet);
                pet.setDono(cliente);
            }

            Agendamento agendamento = new Agendamento();
            agendamento.setPet(pet);
            agendamento.setData(data);
            agendamento.setHora(hora);
            agendamento.setServico(servicoObj);
            agendamento.setStatus("Novo");

            agendamentoDAO.salvarOuAtualizar(agendamento);

            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodos();

            response.getWriter().write("Agendamento confirmado para: " + dataStr + " às " + horaStr);
        } catch (Exception e) {
            response.setStatus(500);
            response.getWriter().write("Erro: " + e.getMessage());
        }
    }
}
