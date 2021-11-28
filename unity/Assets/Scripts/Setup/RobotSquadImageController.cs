using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

public class RobotSquadImageController : MonoBehaviour
{
    public Button removeButton;
    public Image robotImage;
    private string uuid;

    public void SetRemoveCallback(UnityAction<RobotSquadImageController> callback)
    {
        removeButton.onClick.AddListener(() => callback(this));
    }

    public void SetSprite(Sprite robotSprite, string _uuid)
    {
        robotImage.sprite = robotSprite;
        uuid = _uuid;
    }

    public string GetUuid()
    {
        return uuid;
    }
}
