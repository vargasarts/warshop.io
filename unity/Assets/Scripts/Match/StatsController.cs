using UnityEngine.UIElements;
using UnityEngine;

public class StatsController : MonoBehaviour
{
    public Label myScore;
    public Label opponentScore;
    public Label timeText;

    public void Initialize(EndEvent evt)
    {
        gameObject.SetActive(true);
        myScore.text = evt.primaryBatteryCost.ToString();
        opponentScore.text = evt.secondaryBatteryCost.ToString();
        timeText.text = "Number of turns: " + evt.turnCount;
    }
}
