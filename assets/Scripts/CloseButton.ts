import { _decorator, Component, Button } from "cc";
import { InstructionModel } from "./InstructionModel";

const { ccclass, property } = _decorator;

@ccclass("CloseButton")
export class CloseButton extends Component {
  @property(InstructionModel)
  instructionModal: InstructionModel = null!;

  start() {
    // Set up button click event
    const button = this.getComponent(Button);
    if (button) {
      button.node.on(Button.EventType.CLICK, this.onCloseButtonClick, this);
    }
  }

  onCloseButtonClick() {
    if (this.instructionModal) {
      this.instructionModal.hideModal();
    }
  }
}
