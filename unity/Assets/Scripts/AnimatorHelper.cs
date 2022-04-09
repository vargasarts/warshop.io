using UnityEngine;
using UnityEngine.Events;

public class AnimatorHelper : MonoBehaviour
{
    public Animator animator;

    internal UnityAction animatorCallback = () => { };

    public void OnEndAnimation()
    {
        Debug.Log(gameObject.name + " ended animation");
        animatorCallback();
    }

    public void Animate(string name, UnityAction robotCallback)
    {
        Debug.Log(name + " is about to animate");
        animatorCallback = robotCallback;
        animator.Play(name);
    }
}
