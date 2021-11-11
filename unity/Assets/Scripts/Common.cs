using System;
using System.Collections.Generic;

public class Game
{
    public class Player
    {
        public List<Robot> team;
        public string name {get;internal set;}
        public short battery = GameConstants.POINTS_TO_WIN;
        public Player(Robot[] t, string n)
        {
            team = new List<Robot>(t);
            name = n;
        }
    }
}

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

public class Map 
{
    public int width { get; set; }
    public int height { get; set; }
    public Space[] spaces{ get; set; }
    public abstract class Space {
        public int x {get; set;}
        public int y {get; set;}
        public byte type {get; set;}
        
        protected const byte VOID_ID = 0;
        protected const byte BLANK_ID = 1;
        protected const byte BATTERY_ID = 2;
        protected const byte QUEUE_ID = 4;
    }
    public abstract class PlayerSpace : Space
    {
        protected bool isPrimary;

        public bool GetIsPrimary()
        {
            return isPrimary;
        }
    }

    public class Void : Space
    {
        public Void()
        {
            type = VOID_ID;
        }
    }

    public class Blank : Space
    {
        public Blank()
        {
            type = BLANK_ID;
        }
    }

    public class Battery : PlayerSpace
    {
        internal Battery(bool p)
        {
            isPrimary = p;
            type = (byte)(isPrimary ? 2 : 3);
        }
    }

    public class Queue : PlayerSpace
    {
        private byte index;
        internal Queue(byte i, bool p)
        {
            index = i;
            isPrimary = p;
            type = (byte)((isPrimary ? 4:8) + index);
        }

        public byte GetIndex()
        {
            return index;
        }

    }
}

public class Robot
{
    public string name {get; set;}
    public string description {get; set;}
    public byte priority {get; set;}
    public short startingHealth;
    public short health {get; set;}
    public short attack {get; set;}
    public short id {get; set;}
    internal Robot(string _name)
    {
        name = _name;
    }
    public static Robot create(string robotName)
    {
        return new Robot(robotName);
    }
}

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
    public short robotId { get; set; }
    public string owner { get; set; }
    public string display { get; set; }
    public byte direction { get; set; }
    public byte commandId { get; set; }
    public Command(byte dir, byte id)
    {
        direction = dir;
        commandId = id;
        display = GetDisplay(commandId);
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

    public static string GetDisplay(byte commandId)
    {
        switch (commandId)
        {
            case SPAWN_COMMAND_ID:
                return typeof(Spawn).Name;
            case MOVE_COMMAND_ID:
                return typeof(Move).Name;
            case ATTACK_COMMAND_ID:
                return typeof(Attack).Name;
            case SPECIAL_COMMAND_ID:
                return typeof(Special).Name;
            default:
                return typeof(Command).Name;
        }
    }

    public class Spawn : Command
    {
        public Spawn(byte dir) : base(dir, SPAWN_COMMAND_ID) { }
    }

    public class Move : Command
    {
        public Move(byte dir) : base(dir, MOVE_COMMAND_ID) { }
    }

    public class Attack : Command
    {
        public Attack(byte dir) : base(dir, ATTACK_COMMAND_ID) { }
    }

    public class Special : Command
    {
        public Special(byte dir) : base(dir, SPECIAL_COMMAND_ID) { }
    }
}

public class GameEvent {
    public byte priority {get; set; }
    public short primaryBatteryCost {get; set;}
    public short secondaryBatteryCost {get; set;}
    public byte type { get; set; }
}

public class ResolveEvent : GameEvent {

    internal const byte EVENT_ID = 12;
    public ResolveEvent() {
        type = EVENT_ID;
    }
    public List<Tuple<short, Tuple<int, int>>> robotIdToSpawn {get; set;}
    public List<Tuple<short, Tuple<int, int>>> robotIdToMove {get; set;}
    public List<Tuple<short, short>> robotIdToHealth {get; set;}
    public bool myBatteryHit {get; set;}
    public bool opponentBatteryHit {get; set;}
    public List<Tuple<int, int>> missedAttacks {get;set;}
    public List<short> robotIdsBlocked {get; set;}
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

public class EndEvent : GameEvent {
    internal const byte EVENT_ID = 13;

    public EndEvent() {
        type = EVENT_ID;
    }
    public bool primaryLost {get; set;}
    public bool secondaryLost {get; set;}
    public short turnCount {get; set;}
}

public class SpawnEvent : GameEvent
{
    internal const byte EVENT_ID = 1;
    public SpawnEvent() {
        type = EVENT_ID;
    }

    public short robotId {get; set;}
}

public class MoveEvent : GameEvent
{
    internal const byte EVENT_ID = 2;
    public MoveEvent() {
        type = EVENT_ID;
    }
    public Tuple<int, int> sourcePos {get; set;}
    public Tuple<int, int> destinationPos {get; set;}
    public short robotId {get; set;}
}

public class AttackEvent : GameEvent
{
    internal const byte EVENT_ID = 3;

    public AttackEvent() {
        type = EVENT_ID;
    }
    public List<Tuple<int, int>> locs {get; set;}
    public short robotId {get; set;}
}

public class DeathEvent: GameEvent
{
    internal const byte EVENT_ID = 9;
    public DeathEvent() {
        type = EVENT_ID;
    }
    public short robotId {get; set;}
    public short returnHealth {get; set;}
}

public class Messages {
    public const short START_LOCAL_GAME = 1;
    public const short START_GAME = 2;
    public const short GAME_READY = 3;
    public const short SUBMIT_COMMANDS = 4;
    public const short TURN_EVENTS = 5;
    public const short WAITING_COMMANDS = 6;
    public const short SERVER_ERROR = 7;
    public const short END_GAME = 8;
    public const short ACCEPT_PLAYER_SESSION = 9;
    public class AcceptPlayerSessionMessage
    {
        public string playerSessionId {get; set;}
    }
    public class StartLocalGameMessage
    {
        public string myName {get; set;}
        public string opponentName {get; set;}
        public string[] myRobots {get; set;}
        public string[] opponentRobots {get; set;}
    }
    public class StartGameMessage
    {
        public string myName {get; set;}
        public string[] myRobots {get; set;}
    }
    public class GameReadyMessage
    {
        public bool isPrimary {get; set;}
        public string opponentname {get; set;}
        public Robot[] myTeam {get; set;}
        public Robot[] opponentTeam {get; set;}
        public Map board {get; set;}
    }
    public class SubmitCommandsMessage
    {
        public Command[] commands {get; set;}
        public string owner {get; set;}
    }
    public class TurnEventsMessage
    {
        public GameEvent[] events {get; set;}
        public byte turn {get; set;}
    }
    public class OpponentWaitingMessage { }
    public class ServerErrorMessage
    {
        public string serverMessage {get; set;}
        public string exceptionType {get; set;}
        public string exceptionMessage {get; set;}
    }
    public class EndGameMessage { }

    //Gateway Objects, TODO: Get rid of repeated classes
    public class CreateGameRequest
    {
        public string playerId {get; set;}
        public bool isPrivate {get; set;}
        public string password {get; set;}
    }

    public class JoinGameRequest
    {
        public string playerId {get; set;}
        public string gameSessionId {get; set;}
        public string password {get; set;}
    }
    [Serializable]
    public class GameView {
        public string gameSessionId;
        public string creatorId;
        public bool isPrivate;
    }

    [Serializable]
    public class GetGamesResponse {
        public GameView[] gameViews;
    }

    public class GameSessionResponse
    {
        public string playerSessionId {get; set;}
        public string ipAddress {get; set;}
        public int port {get; set;}
    }
    public class CreateGameResponse : GameSessionResponse { }
    public class JoinGameResponse : GameSessionResponse { }
}