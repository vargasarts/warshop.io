using UnityEngine;
using UnityEngine.Events;
using System;
using System.Collections.Generic;
using System.Linq;

public class BaseGameManager
{
    private BoardController boardController;
    private SetupController setupController;
    private string myName;
    private string opponentName;
    private List<Robot> myTeam;
    private List<Robot> opponentTeam;
    private GameClient gameClient;
    private UIController uiController;
    private Dictionary<short, RobotController> robotControllers;

    private byte turnNumber = 1;
    private int currentHistoryIndex;
    private List<HistoryState> history = new List<HistoryState>();
    private Map board;
    private List<RobotStats> roster;
    private Action SetupNextTurn;

    private static List<GameEvent> latestEvents;
    private static byte latestTurn;
    private static BaseGameManager instance;

    public static void Initialize(string playerSessionId, string ipAddress, int port, Action callback, UnityAction<string> reject)
    {
        instance = new BaseGameManager(playerSessionId, ipAddress, port, callback, reject);
    }

    public BaseGameManager(string playerSessionId, string ipAddress, int port, Action callback, UnityAction<string> reject) 
    {
        gameClient = new GameClient(playerSessionId, ipAddress, port, (List<RobotStats> myRoster) => {
            roster = myRoster;
            callback();
        }, reject);
    }

    public static List<RobotStats> InitializeSetup(SetupController sc)
    {
        instance.setupController = sc;
        sc.backButton.onClick.AddListener(sc.EnterLobby);
        return instance.roster;
    }

    public static void SendPlayerInfo(List<string> myRobotNames, string username, Action callback)
    {
        instance.myName = username;
        instance.gameClient.SendGameRequest(myRobotNames, username, instance.LoadBoard, callback);
    }

    internal void LoadBoard(List<Robot> _myTeam, List<Robot> _opponentTeam, string _opponentName, Map b)
    {
        myTeam = _myTeam;
        opponentName = _opponentName;
        opponentTeam = _opponentTeam;
        board = b;
    }

    public static void InitializeBoard(BoardController bc)
    {
        instance.boardController = bc;
        instance.boardController.InitializeBoard(instance.board);
        instance.boardController.SetBattery(GameConstants.POINTS_TO_WIN, GameConstants.POINTS_TO_WIN);
        instance.InitializeRobots();
    }

    private void InitializeRobots()
    {
        robotControllers = new Dictionary<short, RobotController>(myTeam.Count() + opponentTeam.Count());
        InitializePlayerRobots(myTeam, boardController.myDock);
        InitializePlayerRobots(opponentTeam, boardController.opponentDock);
    }

    private void InitializePlayerRobots(List<Robot> team, DockController dock)
    {
        team.ForEach(r => InitializeRobot(r, dock));
    }

    private void InitializeRobot(Robot robot, DockController dock)
    {
        RobotController r = boardController.LoadRobot(robot, dock.transform);
        r.isOpponent = dock.Equals(boardController.opponentDock);
        robotControllers.Add(r.id, r);
        r.transform.localPosition = dock.PlaceInBelt();
        r.transform.localRotation = Quaternion.Euler(0, 0, r.isOpponent ? 180 : 0);
    }

    public static void InitializeUI(UIController ui)
    {
        instance.uiController = ui;
        instance.uiController.InitializeUI(instance.myName, instance.myTeam, instance.opponentName, instance.opponentTeam);
        instance.robotControllers.Keys.ToList().ForEach(k => instance.uiController.BindUiToRobotController(k, instance.robotControllers[k]));
        instance.uiController.submitCommands.SetCallback(instance.SubmitCommands);
        instance.uiController.backToPresent.SetCallback(instance.BackToPresent);
        instance.uiController.stepForwardButton.SetCallback(instance.StepForward);
        instance.uiController.stepBackButton.SetCallback(instance.StepBackward);
        instance.history.Add(instance.SerializeState(1, GameConstants.MAX_PRIORITY));
    }

    public static UIController getUi() {
        return instance.uiController;
    }

    private void SubmitCommands()
    {
        List<Command> commands = GetSubmittedCommands(robotControllers.Values.ToList());
        uiController.actionButtonContainer.SetButtons(false);
        uiController.robotButtonContainer.SetButtons(false);
        gameClient.SendSubmitCommands(commands, myName, (e, t) => {
            latestEvents = e;
            latestTurn = t;
            uiController.submitted = true;
        });
    }

    private List<Command> GetSubmittedCommands(List<RobotController> robotsToSubmit)
    {
        uiController.LightUpPanel(true);
        List<Command> commands = robotsToSubmit.ConvertAll(AddCommands).SelectMany(x => x).ToList();
        uiController.commandButtonContainer.SetButtons(false);
        uiController.directionButtonContainer.SetButtons(false);
        uiController.submitCommands.Deactivate();
        return commands;
    }

    private List<Command> AddCommands(RobotController robot)
    {
        robot.commands.ForEach(c => c.robotId = robot.id);
        uiController.ColorCommandsSubmitted(robot.id, robot.isOpponent);
        uiController.ChangeToBoardLayer(robot);
        return robot.commands;
    }

    private void PlayEvent(List<GameEvent> events, int index) 
    {
        if (index == events.Count) {
            SetupNextTurn();
            return;
        }
        UnityAction Next = () => PlayEvent(events, index+1);
        GameEvent e = events[index];
        if (history[currentHistoryIndex].IsAfter(e.priority)) {
            history.Add(SerializeState(turnNumber, e.priority));
            currentHistoryIndex++;
        }
        boardController.DiffBattery(e.primaryBatteryCost, e.secondaryBatteryCost);
        if (e is ResolveEvent) {
            ResolveEvent re = (ResolveEvent)e;
            uiController.HighlightCommands(re.priority);
            Counter animationsToPlay = new Counter(re.GetNumResolutions());
            UnityAction callback = () => {
                animationsToPlay.Decrement();
                if (animationsToPlay.Get() <= 0) Next();
            };
            re.robotIdToSpawn.ForEach(p => {
                RobotController primaryRobot = robotControllers[p.Item1];
                (primaryRobot.isOpponent ? boardController.opponentDock : boardController.myDock).RemoveFromBelt(primaryRobot.transform.localPosition);
                primaryRobot.transform.parent = boardController.transform;
                boardController.PlaceRobot(primaryRobot, p.Item2.Item1, p.Item2.Item2);
                primaryRobot.displaySpawn(callback);
            });
            re.robotIdToMove.ForEach(p => {
                RobotController primaryRobot = robotControllers[p.Item1];
                primaryRobot.displayMove(ToVector(p.Item2), boardController, callback);
            });
            re.robotIdToHealth.ForEach(t => {
                RobotController primaryRobot = robotControllers[t.Item1];
                primaryRobot.displayDamage(t.Item2, callback);
            });
            if (re.myBatteryHit) boardController.GetMyBattery().DisplayDamage(callback);
            if (re.opponentBatteryHit) boardController.GetOpponentBattery().DisplayDamage(callback);
            re.missedAttacks.ConvertAll(ToVector).ForEach(v => boardController.DisplayMiss(v, callback));
            re.robotIdsBlocked.ForEach(r => robotControllers[r].DisplayBlocked(callback));
        }
        else if (e is SpawnEvent) robotControllers[((SpawnEvent)e).robotId].displaySpawnRequest(Next);
        else if (e is MoveEvent) robotControllers[((MoveEvent)e).robotId].displayMoveRequest(ToVector(((MoveEvent)e).destinationPos), Next);
        else if (e is AttackEvent) ((AttackEvent)e).locs.ConvertAll(ToVector).ForEach(v => robotControllers[((AttackEvent)e).robotId].displayAttack(v, Next));
        else if (e is DeathEvent) {
            robotControllers[((DeathEvent)e).robotId].displayDeath(((DeathEvent)e).returnHealth, (RobotController primaryRobot) =>
            {
                boardController.UnplaceRobot(primaryRobot);
                DockController dock = !primaryRobot.isOpponent ? boardController.myDock : boardController.opponentDock;
                primaryRobot.transform.parent = dock.transform;
                primaryRobot.transform.localPosition = dock.PlaceInBelt();
                Next();
            });
        }
        else if (e is EndEvent)
        {
            EndEvent evt = (EndEvent)e;
            Counter animationsToPlay = new Counter((evt.primaryLost ? 1 : 0) + (evt.secondaryLost ? 1 : 0));
            UnityAction callback = () => {
                animationsToPlay.Decrement();
                if (animationsToPlay.Get() <= 0) {
                    uiController.robotButtonContainer.SetButtons(false);
                    uiController.statsInterface.Initialize(evt);
                    gameClient.SendEndGameRequest();
                }
            };
            if (evt.primaryLost) boardController.GetMyBattery().DisplayEnd(callback);
            if (evt.secondaryLost) boardController.GetOpponentBattery().DisplayEnd(callback);
        }
        else PlayEvent(events, index + 1);
    }

    public static void PlayEvents()
    {
        instance.PlayEvents(latestEvents, latestTurn);
    }

    private void PlayEvents(List<GameEvent> events, byte turn)
    {
        uiController.DimPanel(false);
        PlayEvent(events, 0);
        SetupNextTurn = () => {
            robotControllers.Values.ToList().ForEach(SetupRobotTurn);

            uiController.submitCommands.Deactivate();
            uiController.backToPresent.Deactivate();
            uiController.stepForwardButton.Deactivate();
            uiController.stepBackButton.SetActive(history.Count != 0);
            uiController.robotButtonContainer.SetButtons(true);
            uiController.LightUpPanel(false);
            uiController.LightUpPanel(true);
            uiController.opponentSubmitted = false;

            currentHistoryIndex = history.Count;
            turnNumber = turn;
            history.Add(SerializeState((byte)(turnNumber), GameConstants.MAX_PRIORITY));
        };
    }

    private void SetupRobotTurn(RobotController r)
    {
        if (!r.gameObject.activeSelf) {
            r.gameObject.SetActive(true);
            r.animatorHelper.Animate("Reset", () => {});
        }
        uiController.ClearCommands(r.id, r.isOpponent);
        r.commands.Clear();
    }

    private HistoryState SerializeState(byte turn, byte priority)
    {
        HistoryState historyState = new HistoryState(turn, priority);
        historyState.SerializeRobots(robotControllers);
        historyState.SerializeTiles(boardController.GetAllTiles());
        historyState.SerializeScore(boardController.GetMyBatteryScore(), boardController.GetOpponentBatteryScore());
        return historyState;
    }

    private void DeserializeState(HistoryState historyState)
    {
        historyState.DeserializeRobots(robotControllers, uiController.AddSubmittedCommand);
        historyState.DeserializeTiles(boardController.GetAllTiles());
        historyState.DeserializeScore(boardController);
    }

    private void RefillCommands(RobotController r)
    {
        uiController.ClearCommands(r.id, r.isOpponent);
        r.commands.ForEach(c => uiController.AddSubmittedCommand(c, r.id, r.isOpponent));
    }

    public void BackToPresent()
    {
        GoTo(history[history.Count - 1]);
    }

    public void StepForward()
    {
        GoTo(history[++currentHistoryIndex]);
    }

    public void StepBackward()
    {
        GoTo(history[--currentHistoryIndex]);
    }

    private void GoTo(HistoryState historyState)
    {
        DeserializeState(historyState);
        robotControllers.Values.ToList().ForEach(RefillCommands);
        Enumerable.Range(0, GameConstants.MAX_PRIORITY).ToList().ForEach(p => ForEachPriorityHighlight(historyState, (byte)(p + 1)));
        robotControllers.Values.ToList().ForEach(uiController.ChangeToBoardLayer);

        bool isPresent = currentHistoryIndex == history.Count - 1;
        uiController.submitCommands.SetActive(isPresent && robotControllers.Values.ToList().Any(r => r.commands.Count > 0));
        uiController.stepForwardButton.SetActive(currentHistoryIndex < history.Count - 1);
        uiController.stepBackButton.SetActive(currentHistoryIndex > 0);
        uiController.backToPresent.SetActive(currentHistoryIndex < history.Count - 1);

        uiController.robotButtonContainer.SetButtons(isPresent);
        uiController.commandButtonContainer.SetButtons(false);
        uiController.directionButtonContainer.SetButtons(false);
    }
    
    private void ForEachPriorityHighlight(HistoryState state, byte p)
    {
        if (state.IsBeforeOrDuring(p)) uiController.HighlightCommands(p);
    }

    private Vector2Int ToVector(Tuple<int, int> t) {
        return new Vector2Int(t.Item1, t.Item2);
    }
}

