package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.AgendamentoDAO;
import com.app.cantinho_banho.dao.ClienteDAO;
import com.app.cantinho_banho.dao.PetDAO;
import com.app.cantinho_banho.dao.ServicoDAO;
import com.app.cantinho_banho.model.Agendamento;
import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Pet;
import com.app.cantinho_banho.model.Servico;
import com.app.cantinho_banho.resources.Function;
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
        if (Function.isInicioBarraInvertida(nomeDono)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("text/plain;charset=UTF-8");
            response.getWriter().write("O Nome do Dono não pode iniciar com barra invertida.");
            return;
        }

        String telefone = request.getParameter("telefone");
        String nomePet = request.getParameter("nomePet");
        if (Function.isInicioBarraInvertida(nomePet)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("text/plain;charset=UTF-8");
            response.getWriter().write("O Nome do Pet não pode iniciar com barra invertida.");
            return;
        }

        String racaPet = request.getParameter("racaPet");
        if (Function.isInicioBarraInvertida(racaPet)) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("text/plain;charset=UTF-8");
            response.getWriter().write("A Raça do Pet não pode iniciar com barra invertida.");
            return;
        }

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

            Cliente cliente = new Cliente();
            Pet pet = null;

            Long id = clienteDAO.buscarIdPorTelefoneENome(telefone, nomeDono);

            if (id != null) {
                if (clienteDAO.temUsuario(id)) {
                    cliente = clienteDAO.buscarPorId(id);
                    if (cliente.getNome().equals(nomeDono)) {
                        PetDAO petDAO = new PetDAO();
                        pet = petDAO.buscarPorNomeEDono(nomePet, cliente.getId());
                    } else {
                        cliente = null;
                        cliente = new Cliente();
                        cliente.setNome(nomeDono);
                        cliente.setTelefone(telefone);
                    }

                } else {
                    cliente.setNome(nomeDono);
                    cliente.setTelefone(telefone);
                }
            } else {
                cliente.setNome(nomeDono);
                cliente.setTelefone(telefone);
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
