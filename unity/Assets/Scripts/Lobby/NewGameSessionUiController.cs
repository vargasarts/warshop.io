using UnityEngine.UIElements;
using System.Linq;

public class NewGameSessionUiController : GameSessionUiController
{
    public DropdownMenu publicPrivateDropdown;
    private bool _isPrivate; 

    public void Start()
    {
        publicPrivateDropdown.AppendAction(
            "public", (e) => DropdownCallback(false)
        );
        publicPrivateDropdown.AppendAction(
            "privete", (e) => DropdownCallback(true)
        );
    }

    public void DropdownCallback(bool isPrivate)
    {
        passwordField.style.visibility = isPrivate ? Visibility.Visible : Visibility.Hidden;
        playButton.SetEnabled(!isPrivate || !passwordField.text.Equals(""));
        _isPrivate = isPrivate;
    }

    public bool GetPrivacy()
    {
        return _isPrivate;
    }
}
