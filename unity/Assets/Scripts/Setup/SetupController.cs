using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Events;
using UnityEngine.SceneManagement;
using System.Linq;
using System.Collections.Generic;

public class SetupController : MonoBehaviour
{
    public Button backButton;
    public Button startGameButton;
    public MaximizedRosterRobotController maximizedRosterRobot;
    public RobotRosterPanelController robotRosterPanel;
    public SceneReference lobbyScene;
    public SceneReference initialScene;
    public SceneReference matchScene;
    public Sprite[] robotDir;
    public SquadPanelController mySquadPanel;
    public StatusModalController statusModal;
    public Text starText;
    private bool loadMatch;
    
    void Start ()
    {
        List<RobotStats> roster = BaseGameManager.InitializeSetup(this);
        
        mySquadPanel.SetAddCallback(() => AddSelectedToSquad());
        startGameButton.onClick.AddListener(StartGame);
        robotRosterPanel.SetMaximizeCallback(maximizeSelection);
        Dictionary<string,Sprite> spritesByName = robotDir.ToDictionary((s) => s.name);
        roster.ForEach(r => robotRosterPanel.AddRobotImage(spritesByName[r.name], r));
    }

    void Update()
    {
        if (loadMatch) {
            loadMatch = false;
            SceneManager.LoadScene(matchScene);
        }
#if UNITY_EDITOR
        if (Input.GetKeyDown(KeyCode.KeypadEnter))
        {
            StartGameImpl(robotRosterPanel.GetComponents<RobotRosterPanelController>()
               .ToList()
               .GetRange(0, GameConstants.MAX_ROBOTS_ON_SQUAD)
               .ConvertAll(r => r.GetUuid()));
        }
#endif
    }

    public void EnterLobby()
    {
        SceneManager.LoadScene(lobbyScene);
    }

    public void EnterInitial()
    {
        SceneManager.LoadScene(initialScene);
    }

    public void maximizeSelection(Sprite selectedRobot, RobotStats robotStats)
    {
        maximizedRosterRobot.Select(selectedRobot, robotStats);
        mySquadPanel.squadPanelButton.interactable= true;
    }

    public void AddSelectedToSquad()
    {
        RobotSquadImageController addedRobot = mySquadPanel.AddRobotSquadImage();
        addedRobot.SetRemoveCallback(RemoveAddedFromSquad);
        addedRobot.SetSprite(maximizedRosterRobot.GetRobotSprite(), maximizedRosterRobot.GetUuid());

        maximizedRosterRobot.Hide();
        mySquadPanel.squadPanelButton.interactable =(false);
        UpdateStarText();
    }

    public void RemoveAddedFromSquad(RobotSquadImageController robot)
    {
        Destroy(robot.gameObject);
        mySquadPanel.RemoveRobotSquadImage(robot);
        UpdateStarText();
    }

    void StartGame()
    {
        StartGameImpl(mySquadPanel.GetSquadRobotUuids());
    }

    void StartGameImpl(List<string> myRoster)
    {
        statusModal.ShowLoading();
        BaseGameManager.SendPlayerInfo(myRoster, ProfileController.username, () => {loadMatch = true;});
    }

    void UpdateStarText()
    {
        starText.text = mySquadPanel.GetNumRobots().ToString() + "/" + GameConstants.MAX_ROBOTS_ON_SQUAD.ToString();
        startGameButton.interactable = (mySquadPanel.GetNumRobots() <= GameConstants.MAX_ROBOTS_ON_SQUAD);
    }
}
