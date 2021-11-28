using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Events;
using System.Collections.Generic;

public class SquadPanelController : MonoBehaviour
{
    public Button squadPanelButton;
    public RobotSquadImageController robotSquadImage;
    public Transform squadPanelRobotHolder;

    private List<RobotSquadImageController> squadRobots = new List<RobotSquadImageController>();

    public void SetAddCallback(UnityAction<SquadPanelController> callback)
    {
        squadPanelButton.onClick.AddListener(() => callback(this));
    }

    public RobotSquadImageController AddRobotSquadImage()
    {
        RobotSquadImageController addedRobot = Instantiate(robotSquadImage, squadPanelRobotHolder);
        squadRobots.Add(addedRobot);
        return addedRobot;
    }

    public void RemoveRobotSquadImage(RobotSquadImageController removedRobot)
    {
        squadRobots.Remove(removedRobot);
    }

    public List<string> GetSquadRobotUuids()
    {
        return squadRobots.ConvertAll(r => r.GetUuid());
    }

    public int GetNumRobots()
    {
        return squadRobots.Count;
    }
}
