using UnityEngine;
using UnityEngine.UIElements;

public class StatusModalController : MonoBehaviour
{
    public Label statusText;

    public void ShowLoading()
    {
        gameObject.SetActive(true);
        statusText.style.color = Color.white;
        statusText.text = "Loading...";
    }

    public void DisplayError(string message)
    {
        gameObject.SetActive(true);
        statusText.style.color = Color.red;
        statusText.text = message;
    }
}
