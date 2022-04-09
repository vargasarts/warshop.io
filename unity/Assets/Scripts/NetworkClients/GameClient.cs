using System.Collections.Generic;
using System;
using UnityEngine;
using UnityEngine.Events;
using WebSocketSharp;

public class GameClient
{
    private string ip;
    private int port;
    private string playerSessionId;
    private WebSocket ws;
    protected Action<List<RobotStats>> OnSetupCallback;
    protected UnityAction<GameReadyMessage> OnGameReady;
    protected UnityAction<List<GameEvent>, byte> onTurnCallback;

    public GameClient(string psid, string ipAddress, int p, Action<List<RobotStats>> callback, UnityAction<string> reject)
    {
        playerSessionId = psid;
        ip = ipAddress;
        port = p;
        OnSetupCallback = callback;
        try
        {
            ws = new WebSocket("ws://" + ip + ":" + port);
            ws.OnMessage += (sender, e) =>
            {
                SocketMessage message = JsonUtility.FromJson<SocketMessage>(e.Data);
                switch(message.name) {
                    case "LOAD_SETUP":
                        OnSetup(JsonUtility.FromJson<LoadSetupMessage>(e.Data));
                        break;
                    case "GAME_READY":
                        OnGameReady(JsonUtility.FromJson<GameReadyMessage>(e.Data));
                        break;
                    case "TURN_EVENTS":
                        OnTurnEvents(JsonUtility.FromJson<TurnEventsMessage>(e.Data));
                        break;
                    case "WAITING_COMMANDS":
                        OnOpponentWaiting();
                        break;
                    case "SERVER_ERROR":
                        ServerErrorMessage err = JsonUtility.FromJson<ServerErrorMessage>(e.Data);
                        Debug.LogError(err.exceptionMessage);
                        reject(err.serverMessage);
                        break;
                    default:
                        OnUnsupportedMessage(e.Data);
                        return;
                }
            };
            ws.OnOpen += OnConnect;
            ws.OnError += OnNetworkError;
            Debug.Log("Attempting to connect to " + ip + ":" + port);
            ws.Connect();
        }
        catch(Exception e)
        {
            Debug.LogError(e);
            reject("An unexpected error occurred! Please notify the developers.");
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

    private void OnSetup(LoadSetupMessage msg)
    {
        OnSetupCallback(msg.myRoster);
    }

    private void OnDisconnect()
    {
        Debug.Log("Disconnected");
      //  ws.Connect();
    }

    internal void SendGameRequest(List<string> myRobots, string myname, UnityAction<List<Robot>, List<Robot>, string, Map> readyCallback, Action setupCallback)
    {
        StartGameMessage msg = new StartGameMessage();
        msg.myName = myname;
        msg.myRobots = myRobots;
        msg.name = "START_GAME";
        OnGameReady = (GameReadyMessage msg) => {
            readyCallback(msg.myTeam, msg.opponentTeam, msg.opponentName, msg.board);
            setupCallback();
        };
        
        ws.Send(JsonUtility.ToJson(msg));
    }


    protected void OnUnsupportedMessage(string data)
    {
        Debug.Log("Unsupported message: " + data);
    }

    protected static void OnNetworkError(object sender, ErrorEventArgs e)
    {
        Debug.LogError("Network Error");
        Debug.LogError(e.Message);
        Debug.LogError(e.Exception);
    }

    protected void OnTurnEvents(TurnEventsMessage msg)
    {
        onTurnCallback(msg.events.ConvertAll(s => {
            GameEvent evt = JsonUtility.FromJson<GameEvent>(s);
            evt.json = s;
            return evt;
        }), msg.turn);
    }

    protected void OnOpponentWaiting()
    {
        BaseGameManager.getUi().opponentSubmitted = true;
    }
    
    internal void SendSubmitCommands (List<Command> commands, string owner, UnityAction<List<GameEvent>, byte> callback) {
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
