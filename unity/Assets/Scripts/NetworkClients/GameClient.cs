using System.Collections.Generic;
using System;
using UnityEngine;
using UnityEngine.Events;
using WebSocketSharp;
using System.Linq;

public class GameClient
{
    private string ip;
    private int port;
    private string playerSessionId;
    private WebSocket ws;
    protected UnityAction<GameReadyMessage> OnGameReady;
    protected UnityAction<GameEvent[]> onTurnCallback;

    public GameClient(string psid, string ipAddress, int p)
    {
        playerSessionId = psid;
        ip = ipAddress;
        port = p;
    }
    
    internal void ConnectToGameServer(UnityAction<string> errorCallback)
    {
        try
        {
            ws = new WebSocket("ws://" + ip + ":" + port);
            ws.OnMessage += (sender, e) =>
            {
                SocketMessage message = JsonUtility.FromJson<SocketMessage>(e.Data);
                switch(message.name) {
                    case "GAME_READY":
                        OnGameReady(JsonUtility.FromJson<GameReadyMessage>(e.Data));
                        break;
                    default:
                        Console.WriteLine(e.Data);
                        return;
                }
            };
            ws.OnOpen += OnConnect;
            Debug.Log("Attempting to connect to " + ip + ":" + port);
            ws.Connect();
        }
        catch(Exception e)
        {
            Debug.LogError(e);
            errorCallback("An unexpected error occurred! Please notify the developers.");
        }
    }

    private void OnConnect(object sender, EventArgs e)
    {
        Debug.Log("Connected");

        AcceptPlayerSessionMessage msg = new AcceptPlayerSessionMessage();
        msg.playerSessionId = playerSessionId;
        msg.name = "ACCEPT_PLAYER_SESSION";

        ws.Send(JsonUtility.ToJson(msg));
    }

    private void OnDisconnect()
    {
        Debug.Log("Disconnected");
        ws.Connect();
    }

    internal void SendGameRequest(List<string> myRobots, string myname, UnityAction<List<Robot>, List<Robot>, string, Map> readyCallback, Action setupCallback)
    {
        StartGameMessage msg = new StartGameMessage();
        msg.myName = myname;
        msg.myRobots = myRobots;
        msg.name = "START_GAME";
        OnGameReady = (GameReadyMessage msg) => {
            Debug.Log("READY!");
            readyCallback(msg.myTeam, msg.opponentTeam, msg.opponentName, msg.board);
            Debug.Log("LOAD SCENE!");
            setupCallback();
        };
        
        ws.Send(JsonUtility.ToJson(msg));
    }


    protected void OnUnsupportedMessage()//NetworkMessage netMsg)
    {
        Debug.Log("Unsupported message type: ");// + netMsg.msgType);
    }

    protected static void OnNetworkError()//NetworkMessage netMsg)
    {
        Debug.Log("Network Error");
    }

    protected void OnTurnEvents()//NetworkMessage netMsg)
    {
        Debug.Log("Received Turn Events");
       // Messages.TurnEventsMessage msg = netMsg.ReadMessage<Messages.TurnEventsMessage>();
       // onTurnCallback(msg.events);
    }

    protected void OnOpponentWaiting()//NetworkMessage netMsg)
    {
        //BaseGameManager.uiController.LightUpPanel(!GameConstants.LOCAL_MODE, false);
    }

    protected void OnServerError()//NetworkMessage netMsg)
    {
       // Messages.ServerErrorMessage msg = netMsg.ReadMessage<Messages.ServerErrorMessage>();
       // Debug.LogError(msg.serverMessage + ": " + msg.exceptionType + " - " + msg.exceptionMessage);
    }
    
    internal void SendSubmitCommands (List<Command> commands, string owner, UnityAction<GameEvent[]> callback) {
        SubmitCommandsMessage msg = new SubmitCommandsMessage();
        msg.commands = commands;
        msg.name = "SUBMIT_COMMANDS";
        onTurnCallback = callback;
        ws.Send(JsonUtility.ToJson(msg));
    }

    internal void SendEndGameRequest ()
    {
      //  Send(Messages.END_GAME, new Messages.EndGameMessage());
    }
}
