using UnityEngine;
using UnityEngine.UIElements;
using UnityEngine.SceneManagement;

public class InitialController : MonoBehaviour
{
    public Button enterLobbyButton;
    public Button enterLocalMatchButton;
    public Button profileButton;
    public TextField usernameField;
    public Scene lobbyScene;
    public Scene profileScene;
    public Scene setupScene;

    void Start ()
    {
        enterLobbyButton.clicked += EnterLobby;
        enterLocalMatchButton.clicked += EnterLocalMatch;
        profileButton.clicked += EnterProfile;

        usernameField.value = ProfileController.username;
        OnUsernameFieldEdit(usernameField.text);
        usernameField.RegisterValueChangedCallback((e) => OnUsernameFieldEdit(e.newValue));
        usernameField.Focus();
    }

    void OnUsernameFieldEdit(string newValue)
    {
        bool valid = !string.IsNullOrEmpty(newValue);
        enterLobbyButton.SetEnabled(valid);
        enterLocalMatchButton.SetEnabled(valid);
        profileButton.SetEnabled(valid);
        ProfileController.username = usernameField.text;
    }

    void EnterLobby()
    {
        enterLobbyButton.SetEnabled(false);
        usernameField.SetEnabled(false);

        SceneManager.LoadScene(lobbyScene.name);
    }

    void EnterLocalMatch()
    {
        BaseGameManager.InitializeLocal();

        SceneManager.LoadScene(setupScene.name);
    }

    void EnterProfile()
    {
        SceneManager.LoadScene(profileScene.name);
    }
}
