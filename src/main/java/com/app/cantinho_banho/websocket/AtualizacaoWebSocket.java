package com.app.cantinho_banho.websocket;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import javax.websocket.OnClose;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint("/ws/notificacoes")
public class AtualizacaoWebSocket {

    private static final Set<Session> sessoes = new CopyOnWriteArraySet<>();

    @OnOpen
    public void onOpen(Session session) {
        sessoes.add(session);
    }

    @OnClose
    public void onClose(Session session) {
        sessoes.remove(session);
    }

    public static void notificarTodos() {
        for (Session s : sessoes) {
            if (s.isOpen()) {
                try {
                    s.getBasicRemote().sendText("ATUALIZAR_TELA");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
