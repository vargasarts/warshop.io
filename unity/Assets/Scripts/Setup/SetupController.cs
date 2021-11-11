using UnityEngine;
using UnityEngine.UIElements;
using UnityEngine.Events;
using UnityEngine.SceneManagement;
using System.Linq;

public class SetupController : MonoBehaviour
{
    public Button backButton;
    public Button startGameButton;
    public MaximizedRosterRobotController maximizedRosterRobot;
    public RobotRosterPanelController robotRosterPanel;
    public Scene lobbyScene;
    public Scene initialScene;
    public Sprite[] robotDir;
    public SquadPanelController mySquadPanel;
    public SquadPanelController opponentSquadPanel;
    public StatusModalController statusModal;
    public Label starText;
    
    void Start ()
    {
        BaseGameManager.InitializeSetup(this);
        
        mySquadPanel.SetAddCallback(AddSelectedToMySquad);
        startGameButton.clicked +=StartGame;
        robotRosterPanel.SetMaximizeCallback(maximizeSelection);
        robotDir.ToList().ForEach(robotRosterPanel.AddRobotImage);
    }

    public void EnterLobby()
    {
        SceneManager.LoadScene(lobbyScene.name);
    }

    public void EnterInitial()
    {
        SceneManager.LoadScene(initialScene.name);
    }

    public void maximizeSelection(Sprite selectedRobot)
    {
        maximizedRosterRobot.Select(selectedRobot);
        mySquadPanel.squadPanelButton.SetEnabled(true);
        opponentSquadPanel.squadPanelButton.SetEnabled(true);
    }

    public void AddSelectedToMySquad(SquadPanelController squadPanel)
    {
        UpdateStarText();
        AddSelectedToSquad(squadPanel, RemoveAddedFromMySquad);
    }

    public void AddSelectedToOpponentSquad(SquadPanelController squadPanel)
    {
        AddSelectedToSquad(squadPanel, RemoveAddedFromOpponentSquad);
    }

    public void AddSelectedToSquad(SquadPanelController squadPanel, UnityAction<RobotSquadImageController> removeCallback)
    {
        RobotSquadImageController addedRobot = squadPanel.AddRobotSquadImage();
        addedRobot.SetRemoveCallback(removeCallback);
        addedRobot.SetSprite(maximizedRosterRobot.GetRobotSprite());
        addedRobot.SetRating(maximizedRosterRobot.GetRating());

        maximizedRosterRobot.Hide();
        mySquadPanel.squadPanelButton.SetEnabled(false);
        opponentSquadPanel.squadPanelButton.SetEnabled(false);
    }

    public void RemoveAddedFromMySquad(RobotSquadImageController robot)
    {
        UpdateStarText();
        RemoveAddedFromSquad(robot, mySquadPanel);
    }

    public void RemoveAddedFromOpponentSquad(RobotSquadImageController robot)
    {
        RemoveAddedFromSquad(robot, opponentSquadPanel);
    }

    public void RemoveAddedFromSquad(RobotSquadImageController robot, SquadPanelController panel)
    {
        Destroy(robot.gameObject);
        panel.RemoveRobotSquadImage(robot);
    }

    void StartGame()
    {
        statusModal.ShowLoading();
        string[] myRosterStrings = mySquadPanel.GetSquadRobotNames();
        BaseGameManager.SendPlayerInfo(myRosterStrings, ProfileController.username);
    }

    void UpdateStarText()
    {
        starText.text = mySquadPanel.GetNumRobots().ToString() + "/" + GameConstants.MAX_ROBOTS_ON_SQUAD.ToString();
        startGameButton.SetEnabled(mySquadPanel.GetNumRobots() <= GameConstants.MAX_ROBOTS_ON_SQUAD);
    }
}
