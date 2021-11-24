using UnityEngine.UI;
using UnityEngine;

public class StatsController : MonoBehaviour
{
    public Text myScore;
    public Text opponentScore;
    public Text timeText;

    public void Initialize(EndEvent evt)
    {
        gameObject.SetActive(true);
        myScore.text = evt.primaryBatteryCost.ToString();
        opponentScore.text = evt.secondaryBatteryCost.ToString();
        timeText.text = "Number of turns: " + evt.turnCount;
    }
}
