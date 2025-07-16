import { _decorator, Component, Button, director } from "cc";
const { ccclass } = _decorator;

@ccclass("RestartButton")
export class RestartButton extends Component {
  start() {
    // Optionally, you can set up the click event in code:
    const button = this.getComponent(Button);
    if (button) {
      button.node.on(Button.EventType.CLICK, this.onPlayClicked, this);
    }
  }

  onPlayClicked() {
    // Replace 'Game' with the exact name of your game scene asset (case-sensitive)
    director.loadScene("MainMenu");
  }
}
