package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ConfigEmpresaDAO;
import com.app.cantinho_banho.model.ConfigEmpresa;
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
            ConfigEmpresaDAO dao = new ConfigEmpresaDAO();
            ConfigEmpresa config = dao.obterConfiguracao(); // Busca a única linha existente
            if (config == null) config = new ConfigEmpresa();

            config.setRazaoSocial(request.getParameter("razaoSocial"));
            config.setCnpj(request.getParameter("cnpj"));
            config.setInscricaoEstadual(request.getParameter("ie"));
            config.setCertificadoSenha(request.getParameter("senhaCertificado"));

            // 🟢 Lógica para ler o arquivo do certificado
            Part filePart = request.getPart("certificado");
            if (filePart != null && filePart.getSize() > 0) {
                byte[] bytes = filePart.getInputStream().readAllBytes();
                config.setCertificadoPfx(bytes);
            }

            dao.salvar(config);
            response.setStatus(200);
        } catch (Exception e) {
            response.setStatus(500);
            e.printStackTrace();
        }
    }
}
