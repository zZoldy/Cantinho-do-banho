package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ConfigEmpresaDAO;
import com.app.cantinho_banho.model.ConfigEmpresa;
import com.app.cantinho_banho.resources.Function;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

@WebServlet("/api/config/empresa/salvar")
@MultipartConfig
public class SalvarConfigEmpresaServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
        try {
            request.setCharacterEncoding("UTF-8");
            ConfigEmpresaDAO dao = new ConfigEmpresaDAO();

            ConfigEmpresa config = dao.obterConfiguracao();
            if (config == null) {
                config = new ConfigEmpresa();
            }
            config.setRazaoSocial(request.getParameter("razaoSocial"));
            if (Function.isInicioBarraInvertida(config.getRazaoSocial())) {
                enviarRespostaErro(response, "A Razão Social não pode iniciar com barra invertida.");
                return;
            }

            config.setCnpj(request.getParameter("cnpj"));
            if (Function.isInicioBarraInvertida(config.getCnpj())) {
                enviarRespostaErro(response, "O CNPJ não pode iniciar com barra invertida.");
                return;
            }

            config.setInscricaoEstadual(request.getParameter("ie"));

            config.setEmailNotificacao(request.getParameter("emailNotificacao"));
            config.setWhatsappContato(request.getParameter("whatsappContato"));

            String regimeStr = request.getParameter("regimeTributario");
            if (regimeStr != null) {
                config.setRegimeTributario(Integer.parseInt(regimeStr));
            }

            String ambienteStr = request.getParameter("ambiente");
            if (ambienteStr != null) {
                config.setAmbiente(Integer.parseInt(ambienteStr));
            }

            String limiteHorarioStr = request.getParameter("limitePorHorario");
            config.setLimitePorHorario((limiteHorarioStr != null && !limiteHorarioStr.trim().isEmpty())
                    ? Integer.parseInt(limiteHorarioStr) : 5);

            config.setCertificadoSenha(request.getParameter("senhaCertificado"));
            Part filePart = request.getPart("certificado");
            if (filePart != null && filePart.getSize() > 0) {
                byte[] bytes = filePart.getInputStream().readAllBytes();
                config.setCertificadoPfx(bytes);
            }

            dao.salvar(config);
            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosConfigEmpresa();

            response.setStatus(HttpServletResponse.SC_OK);

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            e.printStackTrace();
        }
    }

    private void enviarRespostaErro(HttpServletResponse response, String mensagem) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.setContentType("text/plain;charset=UTF-8");
        response.getWriter().write(mensagem);
    }
}
