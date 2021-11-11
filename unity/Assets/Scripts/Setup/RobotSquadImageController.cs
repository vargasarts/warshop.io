using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UIElements;

public class RobotSquadImageController : MonoBehaviour
{
    public Button removeButton;
    public Image robotImage;

    private byte rating;

    public void SetRemoveCallback(UnityAction<RobotSquadImageController> callback)
    {
        removeButton.clicked += (() => callback(this));
    }

    public void SetSprite(Texture robotSprite)
    {
        robotImage.image = robotSprite;
    }

    public void SetRating(byte r)
    {
        rating = r;
    }

    public byte GetRating()
    {
        return rating;
    }

    public string GetName()
    {
        return robotImage.image.name;
    }
}
