using UnityEngine;
using UnityEngine.UIElements;
using System.Linq;

public class MaximizedRosterRobotController : MonoBehaviour
{
    public Image selectedRobot;
    public GridLayout ratingGroup;
    public TextMesh nameField;
    public TextMesh attackField;
    public TextMesh healthField;
    public TextMesh descriptionField;
    public Transform container;

    private byte rating;

    public void Select(Sprite robotSprite)
    {
        container.gameObject.SetActive(true);

        selectedRobot.image = robotSprite.texture;
        nameField.text  = robotSprite.name;
        Robot robot = Robot.create(robotSprite.name);
        attackField.text= robot.attack.ToString();
        healthField.text=robot.health.ToString();
        descriptionField.text = robot.description;
        Enumerable.Range(0, ratingGroup.transform.childCount).ToList().ForEach(SetRating);
    }

    public Texture GetRobotSprite()
    {
        return selectedRobot.image;
    }

    public void Hide()
    {
        container.gameObject.SetActive(false);
        rating = 0;
    }

    public byte GetRating()
    {
        return rating;
    }

    private void SetRating(int i)
    {
        ratingGroup.transform.GetChild(i).gameObject.SetActive(i < rating);
    }
}
