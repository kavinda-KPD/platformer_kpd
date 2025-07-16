import { _decorator, Component, Button } from "cc";
import { InstructionModel } from "./InstructionModel";

const { ccclass, property } = _decorator;

@ccclass("InstructionButton")
export class InstructionButton extends Component {
  @property(InstructionModel)
  instructionModal: InstructionModel = null!;

  start() {
    // Set up button click event
    const button = this.getComponent(Button);
    if (button) {
      button.node.on(
        Button.EventType.CLICK,
        this.onInstructionButtonClick,
        this
      );
    }
  }

  onInstructionButtonClick() {
    if (this.instructionModal) {
      this.instructionModal.showModal();
    }
  }
}
