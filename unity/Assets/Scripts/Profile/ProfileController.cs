using UnityEngine.UIElements;
using UnityEngine.SceneManagement;
using UnityEngine;

public class ProfileController : MonoBehaviour
{
    public Button backToInitialButton;
    public Label usernameText;
    public Scene initialScene;

    internal static string username;

    void Start ()
    {
        usernameText.text = username;
        backToInitialButton.clicked += (BackToInitial);
	}

    void BackToInitial()
    {
        SceneManager.LoadScene(initialScene.name);
    }
}
