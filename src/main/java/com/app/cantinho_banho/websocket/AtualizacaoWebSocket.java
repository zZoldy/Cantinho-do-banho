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

    public static void notificarTodosHorario() {
        for (Session s : sessoes) {
            if (s.isOpen()) {
                try {
                    s.getBasicRemote().sendText("ATUALIZAR_HORARIO");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public static void notificarTodosCadCliente() {
        for (Session s : sessoes) {
            if (s.isOpen()) {
                try {
                    s.getBasicRemote().sendText("ATUALIZAR_CADASTRO");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public static void notificarTodosProduto() {
        for (Session s : sessoes) {
            if (s.isOpen()) {
                try {
                    s.getBasicRemote().sendText("ATUALIZAR_PRODUTO");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public static void notificarTodosFornecedor() {
        for (Session s : sessoes) {
            if (s.isOpen()) {
                try {
                    s.getBasicRemote().sendText("ATUALIZAR_FORNECEDORES");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public static void notificarTodosServico() {
        for (Session s : sessoes) {
            if (s.isOpen()) {
                try {
                    s.getBasicRemote().sendText("ATUALIZAR_SERVICO");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public static void notificarTodosPacote() {
        for (Session s : sessoes) {
            if (s.isOpen()) {
                try {
                    s.getBasicRemote().sendText("ATUALIZAR_PACOTE");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public static void notificarTodosDespesa() {
        for (Session s : sessoes) {
            if (s.isOpen()) {
                try {
                    s.getBasicRemote().sendText("ATUALIZAR_DESPESA");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
