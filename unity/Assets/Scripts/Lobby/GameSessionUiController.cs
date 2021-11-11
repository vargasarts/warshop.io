using UnityEngine.UIElements;
using UnityEngine;
using System;

public class GameSessionUiController: MonoBehaviour
{
    public Button playButton;
    public TextField passwordField;
    public Label usernameField;
    public Label publicPrivateText;

    public void SetPlayCallback(Action callback)
    {
        playButton.clicked += (callback);
    }

    public void SetUsername(string username)
    {
        usernameField.text = username;
    }

    public void SetPrivacy(bool isPrivate)
    {
        publicPrivateText.text = isPrivate ? "Private" : "Public";
        passwordField.style.visibility = isPrivate ? Visibility.Hidden : Visibility.Visible;
    }

    public string GetPassword()
    {
        return passwordField.text;
    }

    public void DeactivateButton()
    {
        playButton.SetEnabled(false);
    }
}
