import { _decorator, Component, Node, Label, find } from "cc";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Label })
  scoreLabel: Label | null = null;

  private static instance: GameManager | null = null;
  private score: number = 0;

  public static getInstance(): GameManager | null {
    if (!GameManager.instance) {
      console.error(
        "GameManager instance not found! Make sure GameManager component is attached to a node in the scene."
      );
    }
    return GameManager.instance;
  }

  start() {
    // Set up singleton pattern
    if (GameManager.instance === null) {
      GameManager.instance = this;
      console.log("GameManager initialized successfully");
    } else {
      console.warn(
        "Multiple GameManager instances detected! Destroying duplicate."
      );
      this.node.destroy();
      return;
    }

    // Find the score label if not assigned
    if (!this.scoreLabel) {
      const scoreNode = find("Score");
      if (scoreNode) {
        this.scoreLabel = scoreNode.getComponent(Label);
        console.log("Score label found and connected");
      } else {
        console.error(
          "Score node not found in scene! Make sure there's a node named 'Score' with a Label component."
        );
      }
    }

    // Initialize score display
    this.updateScoreDisplay();
  }

  public addScore(points: number = 1): void {
    this.score += points;
    this.updateScoreDisplay();
    console.log(`Score increased! Current score: ${this.score}`);
  }

  public getScore(): number {
    return this.score;
  }

  public resetScore(): void {
    this.score = 0;
    this.updateScoreDisplay();
    console.log("Score reset to 0");
  }

  private updateScoreDisplay(): void {
    if (this.scoreLabel) {
      this.scoreLabel.string = `Score : ${this.score}`;
    } else {
      console.warn("Score label not available for display update");
    }
  }
}
