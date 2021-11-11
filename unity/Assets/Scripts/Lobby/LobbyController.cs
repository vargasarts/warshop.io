using UnityEngine;
using UnityEngine.UIElements;
using UnityEngine.SceneManagement;
using System.Linq;

public class LobbyController : MonoBehaviour
{
    public Button backButton;
    public NewGameSessionUiController newGameSessionUI;
    public GameSessionUiController gameSessionUI;
    public GameSessionUiController[] gameSessionUIs;
    public Scene initialScene;
    public Scene setupScene;
    public StatusModalController statusModal;
    public GridLayout matches;

    void Start ()
    {
        AwsLambdaClient.SendFindAvailableGamesRequest(FindAvailableGamesCallback);

        newGameSessionUI.SetUsername(ProfileController.username);
        newGameSessionUI.SetPlayCallback(NewGame);
        backButton.clicked +=LoadInitial;
    }

    void FindAvailableGamesCallback(Messages.GameView[] gameViews)
    {
        Debug.Log(gameViews);
        Debug.Log(gameViews.Length);
        gameSessionUIs = gameViews.ToList().ConvertAll(g => CreateGameSessionUi(g.gameSessionId, g.creatorId, g.isPrivate)).ToArray();
    }

    GameSessionUiController CreateGameSessionUi(string gameSessionId, string creatorId, bool isPrivate)
    {
        GameSessionUiController match = Instantiate(gameSessionUI, matches.transform);
        match.SetUsername(creatorId);
        match.SetPrivacy(isPrivate);
        match.SetPlayCallback(() => JoinGame(match, gameSessionId));
        return match;
    }

    void NewGame()
    {
        DeactivateButtons();
        bool isPrivate = newGameSessionUI.GetPrivacy();
        string password = newGameSessionUI.GetPassword();
        AwsLambdaClient.SendCreateGameRequest(isPrivate, ProfileController.username, password, SetupGame);
    }

    void JoinGame(GameSessionUiController match, string gameSessionId)
    {
        DeactivateButtons();
        string password = match.GetPassword();
        AwsLambdaClient.SendJoinGameRequest(gameSessionId, ProfileController.username, password, SetupGame);
    }

    void SetupGame(string playerSessionId, string ipAddress, int port)
    {
        BaseGameManager.InitializeStandard(playerSessionId, ipAddress, port);
        SceneManager.LoadScene(setupScene.name);
    }

    void DeactivateButtons()
    {
        newGameSessionUI.DeactivateButton();
        gameSessionUIs.ToList().ForEach(g => g.DeactivateButton());
    }

    void LoadInitial()
    {
        SceneManager.LoadScene(initialScene.name);
    }
}
