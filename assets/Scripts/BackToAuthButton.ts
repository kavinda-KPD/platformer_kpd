import { _decorator, Component, Button, director } from "cc";
const { ccclass } = _decorator;

@ccclass("BackToAuthButton")
export class BackToAuthButton extends Component {
  start() {
    // Set up button click event
    const button = this.getComponent(Button);
    if (button) {
      button.node.on(Button.EventType.CLICK, this.onBackToAuthClick, this);
    }
  }

  onBackToAuthClick() {
    // Navigate to AuthScene
    director.loadScene("AuthScene");
  }
}
