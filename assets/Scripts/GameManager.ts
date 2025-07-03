import { _decorator, Component, Node, Label, find } from "cc";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Label })
  scoreLabel: Label | null = null;

  private static instance: GameManager | null = null;
  private score: number = 0;

  public static getInstance(): GameManager {
    return GameManager.instance!;
  }

  start() {
    // Set up singleton pattern
    if (GameManager.instance === null) {
      GameManager.instance = this;
    } else {
      this.node.destroy();
      return;
    }

    // Find the score label if not assigned
    if (!this.scoreLabel) {
      const scoreNode = find("Score");
      if (scoreNode) {
        this.scoreLabel = scoreNode.getComponent(Label);
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
  }

  private updateScoreDisplay(): void {
    if (this.scoreLabel) {
      this.scoreLabel.string = `Score : ${this.score}`;
    }
  }
}
