import { _decorator, Component, Node, Button } from "cc";
const { ccclass, property } = _decorator;

@ccclass("InstructionModel")
export class InstructionModel extends Component {
  @property(Node)
  modalContent: Node = null!;

  @property(Button)
  closeButton: Button = null!;

  start() {
    // Initially hide the modal
    this.hideModal();

    // Set up close button event
    if (this.closeButton) {
      this.closeButton.node.on(
        Button.EventType.CLICK,
        this.onCloseButtonClick,
        this
      );
    }
  }

  showModal() {
    if (this.modalContent) {
      this.modalContent.active = true;
    }
  }

  hideModal() {
    if (this.modalContent) {
      this.modalContent.active = false;
    }
  }

  onCloseButtonClick() {
    this.hideModal();
  }

  update(deltaTime: number) {}
}
