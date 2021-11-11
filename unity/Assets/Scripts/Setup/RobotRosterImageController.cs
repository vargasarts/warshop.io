using UnityEngine;
using UnityEngine.UIElements;
using UnityEngine.Events;

public class RobotRosterImageController : MonoBehaviour
{
    public Button maximizeButton;
    public Image myImage;

    public void Initialize(Sprite sprite, UnityAction<Sprite> maximizeCallback)
    {
        name = sprite.name;
        myImage.image = sprite.texture;
        maximizeButton.clicked += (() => maximizeCallback(sprite));
    }
}
