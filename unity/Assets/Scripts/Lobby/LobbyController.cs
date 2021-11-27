using UnityEngine;
using UnityEngine.UI;
using UnityEngine.SceneManagement;
using System.Linq;

public class LobbyController : MonoBehaviour
{
    public Button backButton;
    public NewGameSessionUiController newGameSessionUI;
    public GameSessionUiController gameSessionUI;
    public GameSessionUiController[] gameSessionUIs;
    public SceneReference initialScene;
    public SceneReference setupScene;
    public StatusModalController statusModal;
    public VerticalLayoutGroup matches;

    void Start ()
    {
        AwsLambdaClient.SendFindAvailableGamesRequest(FindAvailableGamesCallback, Reject);

        newGameSessionUI.SetUsername(ProfileController.username);
        newGameSessionUI.SetPlayCallback(NewGame);
        backButton.onClick.AddListener(LoadInitial);
    }

    void FindAvailableGamesCallback(Messages.GameView[] gameViews)
    {
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
        AwsLambdaClient.SendCreateGameRequest(isPrivate, ProfileController.username, password, SetupGame, Reject);
    }

    void JoinGame(GameSessionUiController match, string gameSessionId)
    {
        DeactivateButtons();
        string password = match.GetPassword();
        AwsLambdaClient.SendJoinGameRequest(gameSessionId, ProfileController.username, password, SetupGame, Reject);
    }

    void SetupGame(string playerSessionId, string ipAddress, int port)
    {
        BaseGameManager.InitializeStandard(playerSessionId, ipAddress, port);
        SceneManager.LoadScene(setupScene);
    }

    void DeactivateButtons()
    {
        newGameSessionUI.DeactivateButton();
        gameSessionUIs.ToList().ForEach(g => g.DeactivateButton());
    }

    void LoadInitial()
    {
        SceneManager.LoadScene(initialScene);
    }

    public void OnCanvasClick()
    {
        statusModal.Hide();
        newGameSessionUI.ReactivateButton();
        gameSessionUIs.ToList().ForEach(g => g.ReactivateButton());
    }

    public void Reject(string s) {
        statusModal.DisplayError(s);
    }
}
