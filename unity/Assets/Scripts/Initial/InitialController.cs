using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine;

public class InitialController : MonoBehaviour
{
    public Button enterLobbyButton;
    public Button profileButton;
    public InputField usernameField;
    public SceneReference lobbyScene;
    public SceneReference profileScene;
    public SceneReference setupScene;

    void Start ()
    {
        enterLobbyButton.onClick.AddListener(EnterLobby);
        profileButton.onClick.AddListener(EnterProfile);

        usernameField.text = ProfileController.username;
        OnUsernameFieldEdit(usernameField.text);
        usernameField.onValueChanged.AddListener(OnUsernameFieldEdit);
        usernameField.Select();
    }

    void OnUsernameFieldEdit(string newValue)
    {
        bool valid = !string.IsNullOrEmpty(newValue);
        enterLobbyButton.interactable = valid;
        profileButton.interactable = valid;
        ProfileController.username = usernameField.text;
    }

    void EnterLobby()
    {
        enterLobbyButton.interactable = false;
        usernameField.interactable = false;

        SceneManager.LoadScene(lobbyScene);
    }

    void EnterProfile()
    {
        SceneManager.LoadScene(profileScene);
    }
}
