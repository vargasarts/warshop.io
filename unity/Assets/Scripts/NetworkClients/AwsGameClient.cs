using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;
using WebSocketSharp;

public class AwsGameClient : GameClient
{
    private string ip;
    private int port;
    private string playerSessionId;
    private WebSocket ws;

    internal AwsGameClient(string psid, string ipAddress, int p)
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
                Messages.SocketMessage message = JsonUtility.FromJson<Messages.SocketMessage>(e.Data);
                switch(message.name) {
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

        Messages.AcceptPlayerSessionMessage msg = new Messages.AcceptPlayerSessionMessage();
        msg.playerSessionId = playerSessionId;
        ws.Send(JsonUtility.ToJson(msg));
    }

    private void OnDisconnect()
    {
        Debug.Log("Disconnected");
        ws.Connect();
    }

    internal void SendGameRequest(string[] myRobots, string myname, UnityAction<List<Robot>, List<Robot>, string, Map> readyCallback)
    {
        Messages.StartGameMessage msg = new Messages.StartGameMessage();
        msg.myName = myname;
        msg.myRobots = myRobots;
        gameReadyCallback = readyCallback;
        ws.Send(JsonUtility.ToJson(msg));
    }
}
