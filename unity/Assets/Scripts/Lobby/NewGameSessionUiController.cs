using UnityEngine.UI;
using System.Linq;

public class NewGameSessionUiController : GameSessionUiController
{
    public Dropdown publicPrivateDropdown;

    public void Start()
    {
        publicPrivateDropdown.onValueChanged.AddListener((e) => DropdownCallback(e == 1));
    }

    public void DropdownCallback(bool isPrivate)
    {
        passwordField.gameObject.SetActive(isPrivate);
        playButton.interactable = (!isPrivate || !passwordField.text.Equals(""));
    }

    public bool GetPrivacy()
    {
        return publicPrivateDropdown.value == 1;
    }
}
