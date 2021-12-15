using UnityEngine;
using UnityEngine.Events;

public class RobotRosterPanelController : MonoBehaviour
{
    public RobotRosterImageController robotRosterImage;

    private UnityAction<Sprite, RobotStats> maximizeCallback;
    private string uuid;

    public void AddRobotImage(Sprite robotImage, RobotStats robotStats)
    {
        RobotRosterImageController newRobotRosterImage = Instantiate(robotRosterImage, transform);
        newRobotRosterImage.Initialize(robotImage, (s) => maximizeCallback(s, robotStats));
        uuid = robotStats.uuid;
    }

    public void SetMaximizeCallback(UnityAction<Sprite, RobotStats> callback)
    {
        maximizeCallback = callback;
    }

    public string GetUuid() {
        return uuid;
    }
}
