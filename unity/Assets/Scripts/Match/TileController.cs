using UnityEngine;
using UnityEngine.Events;
using TMPro;

public class TileController : MonoBehaviour
{
    public BatteryController battery;
    public GameObject queueMarker;
    public Material baseTile;
    public Material userBaseTile;
    public Material opponentBaseTile;
    public Material opponentCore;
    public MeshRenderer meshRenderer;
    public TextMeshPro spawnTileText;
    public AnimatorHelper animatorHelper;

    private Color userColor = Color.blue;
    private Color opponentColor = Color.red;
    private UnityAction<BatteryController> primaryBatterySetterCallback;
    private UnityAction<BatteryController> secondaryBatterySetterCallback;

    public void LoadTile(Space s, UnityAction<BatteryController> primaryCallback, UnityAction<BatteryController> secondaryCallback)
    {
        primaryBatterySetterCallback = primaryCallback;
        secondaryBatterySetterCallback = secondaryCallback;
        if (s.type >=2 && s.type <= 3) LoadBatteryTile(s, s.type == 2);
        else if (s.type >= 4) LoadQueueTile(s, s.type < 8, s.type - (s.type < 8 ? 4 : 8));
    }

    public void LoadBatteryTile(Space s, bool isPrimary)
    {
        BatteryController newBattery = Instantiate(battery, transform.parent);
        newBattery.transform.localRotation = Quaternion.Euler(Vector3.left * 90);
        newBattery.transform.position = transform.position;

        if (isPrimary)
        {
            primaryBatterySetterCallback(newBattery);
        }
        else
        {
            newBattery.coreRenderer.material = opponentCore;
            newBattery.score.color = Color.red;
            secondaryBatterySetterCallback(newBattery);
        }
    }

    public void LoadQueueTile(Space s, bool isPrimary, int index)
    {
        TextMeshPro spawnText = Instantiate(spawnTileText, transform);
        spawnText.text = (index + 1).ToString();
        spawnText.transform.localPosition = Vector3.back * 0.101f;
        spawnText.color = isPrimary ? userColor : opponentColor;
    }

    public void LoadRobotOnTileMesh(bool isOpponent)
    {
        meshRenderer.material = isOpponent ? opponentBaseTile : userBaseTile;
    }

    public void ResetMesh()
    {
        meshRenderer.material = baseTile;
    }

    internal void DisplayMiss(UnityAction callback)
    {
        animatorHelper.Animate("MissAttack", callback);
    }

    public Material GetMaterial()
    {
        return meshRenderer.material;
    }

    public void SetMaterial(Material m)
    {
        meshRenderer.material = m;
    }
}
