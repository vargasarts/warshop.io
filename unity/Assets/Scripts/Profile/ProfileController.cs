using UnityEngine.UI;
using UnityEngine.SceneManagement;
using UnityEngine;

public class ProfileController : MonoBehaviour
{
    public Button backToInitialButton;
    public Text usernameText;
    public SceneReference initialScene;

    public static string username;

    void Start ()
    {
        usernameText.text = username;
        backToInitialButton.onClick.AddListener(BackToInitial);
	}

    void BackToInitial()
    {
        SceneManager.LoadScene(initialScene);
    }
}
