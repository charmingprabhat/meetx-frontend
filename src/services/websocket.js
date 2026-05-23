import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

export const connectWebSocket = (onConnected) => {

  // CREATE SOCKJS CONNECTION
  const socket = new SockJS(
    "http://localhost:8081/ws"
  );

  // CREATE STOMP CLIENT
  stompClient = new Client({

    webSocketFactory: () => socket,

    reconnectDelay: 5000,

    debug: (str) => {
      console.log(str);
    },

    onConnect: () => {

      console.log(
        "Connected to WebSocket"
      );

      if (onConnected) {
        onConnected();
      }
    },

    onStompError: (frame) => {

      console.error(
        "Broker error:",
        frame.headers["message"]
      );

      console.error(
        "Details:",
        frame.body
      );
    },
  });

  // ACTIVATE CONNECTION
  stompClient.activate();
};

export const disconnectWebSocket = () => {

  if (stompClient) {

    stompClient.deactivate();

    console.log(
      "Disconnected from WebSocket"
    );
  }
};

export const getStompClient = () =>
  stompClient;