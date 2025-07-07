import { useEffect, useRef, useState } from "react";
import { ChatBar } from "./ChatBar";
import { ChatBody } from "./ChatBody";
import { ChatFooter } from "./ChatFooter";
import { useSocketContext } from "../context/useSocketContext";
import { useUserContext } from "../context/useUserContext";
import { useMessages } from "../hooks/useMessages";
import { usePrivateMessages } from "../hooks/usePrivateMessages";
import { useTyping } from "../hooks/useTyping";
import { useSocketError } from "../hooks/useSocketError";

export const ChatPage = () => {
  const { socket, connectionError} = useSocketContext();
  const { currentUserID, userName, authLoading, isLoggedIn } = useUserContext(); // ✅ authLoading agregado

  // Hook de mensajes públicos
  const { messages, loading: messagesLoading } = useMessages();

  // Usuario seleccionado para chat privado
  const [selectedUser, setSelectedUser] = useState(null);

  // Hook de mensajes privados
  const { privateMessages, loading: privateLoading } = usePrivateMessages(
    selectedUser,
    currentUserID
  );

  // Hook de estado de escritura
  const { typingStatus } = useTyping(selectedUser);

  // Hook para manejar errores de conexión
  useSocketError();

  const lastMessageRef = useRef(null);

  // Auto-scroll cuando llegan mensajes nuevos
  useEffect(() => {
    console.log("📨 Messages updated:", messages);
    console.log("📨 Private messages updated:", privateMessages);
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, privateMessages]);

  // Debug opcional para verificar flujo
  console.log({
    authLoading,
    isLoggedIn,
    userName,
    messagesLoading,
    selectedUser,
    privateLoading,
    socketConnected: socket?.connected,
  });

  // ⚡ Nueva condición: bloquea render mientras se verifica auth
  if (authLoading || !isLoggedIn || !userName || messagesLoading) {
    return <div>Loading chat data...</div>;
  }

  // Si hay un usuario seleccionado y se está cargando su historial → loading específico
  if (selectedUser && privateLoading) {
    return <div>Loading private conversation...</div>;
  }

  // Si no hay conexión → mostrar mensaje de conexión
  if (!socket || !socket.connected) {
    return <div>{connectionError || "Connecting to chat..."}</div>;
  }

  return (
    <div className="chat">
      {/* Si hay error de conexión mostrarlo arriba */}
      {connectionError && (
        <div className="connection-error">{connectionError}</div>
      )}

      {/* Barra lateral de usuarios */}
      <ChatBar setSelectedUser={setSelectedUser} />

      <div className="chat__main">
        {/* Cuerpo del chat: muestra mensajes públicos o privados */}
        <ChatBody
          messages={messages}
          privateMessages={privateMessages}
          selectedUser={selectedUser}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
          currentUserID={currentUserID}
        />

        {/* Input para escribir mensajes */}
        <ChatFooter selectedUser={selectedUser} />
      </div>
    </div>
  );
};
