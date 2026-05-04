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
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("A Razão Social não pode iniciar com barra invertida.");
                return;
            }
            config.setCnpj(request.getParameter("cnpj"));
            if (Function.isInicioBarraInvertida(config.getCnpj())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O CNPJ não pode iniciar com barra invertida.");
                return;
            }

            config.setInscricaoEstadual(request.getParameter("ie"));
            config.setCertificadoSenha(request.getParameter("senhaCertificado"));

            Part filePart = request.getPart("certificado");
            if (filePart != null && filePart.getSize() > 0) {
                byte[] bytes = filePart.getInputStream().readAllBytes();
                config.setCertificadoPfx(bytes);
            }

            String limiteHorarioStr = request.getParameter("limitePorHorario");
            if (limiteHorarioStr != null && !limiteHorarioStr.trim().isEmpty()) {
                config.setLimitePorHorario(Integer.parseInt(limiteHorarioStr));
            } else {
                config.setLimitePorHorario(5);
            }

            dao.salvar(config);
            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosConfigEmpresa();
            response.setStatus(200);
        } catch (Exception e) {
            response.setStatus(500);
            e.printStackTrace();
        }
    }
}
