using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

public class RobotSquadImageController : MonoBehaviour
{
    public Button removeButton;
    public Image robotImage;

    public void SetRemoveCallback(UnityAction<RobotSquadImageController> callback)
    {
        removeButton.onClick.AddListener(() => callback(this));
    }

    public void SetSprite(Sprite robotSprite)
    {
        robotImage.sprite = robotSprite;
    }

    public string GetName()
    {
        return robotImage.sprite.name;
    }
}
