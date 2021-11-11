using UnityEngine;
using UnityEngine.UIElements;
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
        squadPanelButton.clicked += (() => callback(this));
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

    public string[] GetSquadRobotNames()
    {
        return squadRobots.ConvertAll(r => r.GetName()).ToArray();
    }

    public int GetNumRobots()
    {
        return squadRobots.Count;
    }
}
