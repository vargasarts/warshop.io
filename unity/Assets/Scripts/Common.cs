using System;
using System.Collections.Generic;

public class GameConstants
{
    public const int POINTS_TO_WIN = 256;
    public const byte MAX_ROBOTS_ON_SQUAD = 4;
    public const byte MAX_PRIORITY = 8;
    public const byte DEFAULT_SPAWN_LIMIT = 1;
    public const byte DEFAULT_MOVE_LIMIT = 2;
    public const byte DEFAULT_ATTACK_LIMIT = 1;
    public const byte DEFAULT_SPECIAL_LIMIT = 0;
    public const byte DEFAULT_SPAWN_POWER = 2;
    public const byte DEFAULT_MOVE_POWER = 1;
    public const byte DEFAULT_ATTACK_POWER = 2;
    public const byte DEFAULT_SPECIAL_POWER = 2;
}

[Serializable]
public class RobotStats
{
    public string name;
    public byte priority;
    public short health;
    public short attack;
    public string uuid;
}

[Serializable]
public class Robot : RobotStats
{
    public string description;
    public short startingHealth;
    public short id;
    internal Robot(string _name)
    {
        name = _name;
    }
    public static Robot create(string robotName)
    {
        return new Robot(robotName);
    }
}

[Serializable]
public class Command
{
    public const byte UP = 0;
    public const byte LEFT = 1;
    public const byte DOWN = 2;
    public const byte RIGHT = 3;
    public const byte SPAWN_COMMAND_ID = 0;
    public const byte MOVE_COMMAND_ID = 1;
    public const byte ATTACK_COMMAND_ID = 2;
    public const byte SPECIAL_COMMAND_ID = 3;
    public short robotId;
    public byte direction;
    public byte commandId;
    public Command(byte dir, byte id)
    {
        direction = dir;
        commandId = id;
    }
    public static byte[] limit = new byte[]
    {
        GameConstants.DEFAULT_SPAWN_LIMIT,
        GameConstants.DEFAULT_MOVE_LIMIT,
        GameConstants.DEFAULT_ATTACK_LIMIT,
        GameConstants.DEFAULT_SPECIAL_LIMIT
    };
    public static byte[] power = new byte[]
    {
        GameConstants.DEFAULT_SPAWN_POWER,
        GameConstants.DEFAULT_MOVE_POWER,
        GameConstants.DEFAULT_ATTACK_POWER,
        GameConstants.DEFAULT_SPECIAL_POWER
    };

    public static byte[] TYPES = new byte[] {
        SPAWN_COMMAND_ID,
        MOVE_COMMAND_ID,
        ATTACK_COMMAND_ID,
        SPECIAL_COMMAND_ID
    };
    public static string[] byteToDirectionString = new string[]{"Up", "Left", "Down", "Right"};

    public static string[] GetDisplay = new string[] {
        "Spawn","Move","Attack","Special"
    };
}

[Serializable]
public class Space {
    public int x;
    public int y;
    public byte type;
    public string json;
}

[Serializable]
public class BatterySpace: Space {
    public const byte ID = 2;
    public bool isPrimary;
}

[Serializable]
public class QueueSpace: Space {
    public const byte ID = 4;  
    public bool isPrimary;
    public short index;
}

[Serializable]
public class GameEvent {
    public byte priority;
    public short primaryBatteryCost;
    public short secondaryBatteryCost;
    public byte type;
    public string json;
}


[Serializable]
public class ResolveEvent: GameEvent {
    internal const byte EVENT_ID = 12;
    public List<Tuple<short, Tuple<int, int>>> robotIdToSpawn;
    public List<Tuple<short, Tuple<int, int>>> robotIdToMove;
    public List<Tuple<short, short>> robotIdToHealth;
    public bool myBatteryHit;
    public bool opponentBatteryHit;
    public List<Tuple<int, int>> missedAttacks;
    public List<short> robotIdsBlocked;
    public int GetNumResolutions()
    {
        return robotIdToSpawn.Count
        + robotIdToMove.Count
        + robotIdToHealth.Count
        + (myBatteryHit ? 1 : 0)
        + (opponentBatteryHit ? 1 : 0)
        + missedAttacks.Count
        + robotIdsBlocked.Count;
    }
}

[Serializable]
public class EndEvent: GameEvent {
    internal const byte EVENT_ID = 13;
    public bool primaryLost;
    public bool secondaryLost;
    public short turnCount;
}

[Serializable]
public class SpawnEvent: GameEvent
{
    internal const byte EVENT_ID = 1;
    public short robotId;
}

[Serializable]
public class MoveEvent: GameEvent
{
    internal const byte EVENT_ID = 2;
    public Tuple<int, int> sourcePos;
    public Tuple<int, int> destinationPos;
    public short robotId;
}

[Serializable]
public class AttackEvent: GameEvent
{
    internal const byte EVENT_ID = 3;
    public List<Tuple<int, int>> locs;
    public short robotId;
}

[Serializable]
public class DeathEvent: GameEvent
{
    internal const byte EVENT_ID = 9;
    public short robotId;
    public short returnHealth;
}

[Serializable]
public class Map 
{
    public int width;
    public int height;
    public List<string> spaces;
}

[Serializable]
public class SocketMessage {
    public string name;
}
    
[Serializable]
public class StartGameMessage: SocketMessage
{
    public string myName;
    public List<string> myRobots;
}

[Serializable]
public class AcceptPlayerSessionMessage: SocketMessage
{
    public string playerSessionId;
}
    
[Serializable]
public class LoadSetupMessage: SocketMessage
{
    public List<RobotStats> myRoster;
}
    
[Serializable]
public class GameReadyMessage: SocketMessage
{
    public bool isPrimary;
    public string opponentName;
    public List<Robot> myTeam;
    public List<Robot> opponentTeam;
    public Map board;
}
    
[Serializable]
public class SubmitCommandsMessage: SocketMessage
{
    public List<Command> commands;
}

[Serializable]
public class ServerErrorMessage: SocketMessage
{
    public string serverMessage;
    public string exceptionMessage;
}
    
[Serializable]
public class GameView {
    public string gameSessionId;
    public string creatorId;
    public bool isPrivate;
}

[Serializable]
public class EndGameMessage { }

[Serializable]
public class GetGamesResponse {
    public GameView[] gameViews;
}

[Serializable]
public class GameSessionResponse
{
    public string playerSessionId;
    public string ipAddress;
    public int port;
}
[Serializable]
public class CreateGameResponse : GameSessionResponse { }
[Serializable]
public class JoinGameResponse : GameSessionResponse { }

[Serializable]
public class TurnEventsMessage
{
    public List<string> events;
    public byte turn;
}
