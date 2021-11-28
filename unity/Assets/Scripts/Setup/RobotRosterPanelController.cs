using UnityEngine;
using UnityEngine.Events;

public class RobotRosterPanelController : MonoBehaviour
{
    public RobotRosterImageController robotRosterImage;

    private UnityAction<Sprite, RobotStats> maximizeCallback;

    public void AddRobotImage(Sprite robotImage, RobotStats robotStats)
    {
        RobotRosterImageController newRobotRosterImage = Instantiate(robotRosterImage, transform);
        newRobotRosterImage.Initialize(robotImage, (s) => maximizeCallback(s, robotStats));
    }

    public void SetMaximizeCallback(UnityAction<Sprite, RobotStats> callback)
    {
        maximizeCallback = callback;
    }
}
