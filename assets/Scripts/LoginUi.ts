import {
  _decorator,
  Component,
  Node,
  EditBox,
  Button,
  Label,
  director,
} from "cc";
import { AuthManager } from "./AuthManager";

const { ccclass, property } = _decorator;

@ccclass("LoginUI")
export class LoginUI extends Component {
  @property(EditBox)
  usernameInput: EditBox = null!;

  @property(EditBox)
  passwordInput: EditBox = null!;

  @property(Button)
  loginButton: Button = null!;

  @property(Button)
  registerButton: Button = null!;

  @property(Label)
  messageLabel: Label = null!;

  private authManager: AuthManager;

  start() {
    this.authManager = AuthManager.getInstance();

    // Set up button events
    this.loginButton.node.on("click", this.onLoginClick, this);
    this.registerButton.node.on("click", this.onRegisterClick, this);
  }

  private async onLoginClick(): Promise<void> {
    const username = this.usernameInput.string;
    const password = this.passwordInput.string;

    if (!username || !password) {
      this.showMessage("Please enter username and password");
      return;
    }

    try {
      this.showMessage("Logging in...");
      const result = await this.authManager.login(username, password);
      this.showMessage("Login successful!");

      // Navigate to game scene
      this.navigateToGameScene();
    } catch (error) {
      this.showMessage("Login failed: " + error.message);
    }
  }

  private async onRegisterClick(): Promise<void> {
    const username = this.usernameInput.string;
    const password = this.passwordInput.string;

    if (!username || !password) {
      this.showMessage("Please enter username and password");
      return;
    }

    try {
      this.showMessage("Creating account...");
      const result = await this.authManager.register(username, "", password);
      this.showMessage("Account created successfully!");

      // Navigate to game scene
      this.navigateToGameScene();
    } catch (error) {
      this.showMessage("Registration failed: " + error.message);
    }
  }

  private showMessage(message: string): void {
    this.messageLabel.string = message;
  }

  private navigateToGameScene(): void {
    // Load your main game scene
    director.loadScene("MainMenu");
  }
}
