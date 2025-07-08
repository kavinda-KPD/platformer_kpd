import {
  _decorator,
  Component,
  Node,
  Collider2D,
  Contact2DType,
  IPhysics2DContact,
} from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

@ccclass("stars")
export class stars extends Component {
  private collider: Collider2D | null = null;

  start() {
    this.collider = this.getComponent(Collider2D);
    if (this.collider) {
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    // Check if the other collider's tag is 1 (player tag)
    if (otherCollider.tag === 1) {
      // Add score before destroying the star
      const gameManager = GameManager.getInstance();
      if (gameManager) {
        gameManager.addScore(1);
        console.log("Star collected! Score added.");
      } else {
        console.error("GameManager not found! Cannot add score.");
      }

      // Destroy the star node itself
      this.node.destroy();
    }
  }

  onDestroy() {
    if (this.collider) {
      this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  update(deltaTime: number) {}
}
