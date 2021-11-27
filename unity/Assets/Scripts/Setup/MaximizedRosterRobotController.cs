using UnityEngine;
using UnityEngine.UI;
using System.Linq;
using TMPro;

public class MaximizedRosterRobotController : MonoBehaviour
{
    public Image selectedRobot;
    public TextMeshProUGUI nameField;
    public TextMeshProUGUI attackField;
    public TextMeshProUGUI healthField;
    public TextMeshProUGUI descriptionField;
    public Transform container;

    public void Select(Sprite robotSprite)
    {
        container.gameObject.SetActive(true);

        selectedRobot.sprite = robotSprite;
        nameField.text  = robotSprite.name;
        Robot robot = Robot.create(robotSprite.name);
        attackField.text= robot.attack.ToString();
        healthField.text=robot.health.ToString();
        descriptionField.text = robot.description;
    }

    public Sprite GetRobotSprite()
    {
        return selectedRobot.sprite;
    }

    public void Hide()
    {
        container.gameObject.SetActive(false);
    }
}
