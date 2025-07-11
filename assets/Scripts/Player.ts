import {
  _decorator,
  Component,
  Node,
  input,
  Input,
  EventKeyboard,
  KeyCode,
  Vec2,
  RigidBody2D,
  Collider2D,
  Contact2DType,
  IPhysics2DContact,
  PhysicsSystem2D,
  ERaycast2DType,
  director,
  Animation,
  AnimationClip,
} from "cc";
import { GameManager } from "./GameManager";
const { ccclass, property } = _decorator;

@ccclass("Player")
export class Player extends Component {
  @property
  moveSpeed: number = 200;

  @property
  jumpForce: number = 800;

  @property
  groundCheckDistance: number = 0.1;

  @property({ type: AnimationClip })
  idleAnimation: AnimationClip | null = null;

  @property({ type: AnimationClip })
  runAnimation: AnimationClip | null = null;

  private rigidBody: RigidBody2D | null = null;
  private collider: Collider2D | null = null;
  private animation: Animation | null = null;
  private isGrounded: boolean = false;
  private moveDirection: number = 0;
  private currentAnimation: string = "idle";

  start() {
    // Get the RigidBody2D component
    this.rigidBody = this.getComponent(RigidBody2D);
    this.collider = this.getComponent(Collider2D);
    this.animation = this.getComponent(Animation);

    // Set up collision detection
    if (this.collider) {
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    // Register keyboard input events
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);

    // Reset score when game starts
    const gameManager = GameManager.getInstance();
    if (gameManager) {
      gameManager.resetScore();
    }

    // Start with idle animation
    this.playAnimation("boy_idle");
  }

  onDestroy() {
    // Clean up collision listeners
    if (this.collider) {
      this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    // Clean up input listeners
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
  }

  onKeyDown(event: EventKeyboard) {
    switch (event.keyCode) {
      case KeyCode.ARROW_LEFT:
      case KeyCode.KEY_A:
        this.moveDirection = -1;
        break;
      case KeyCode.ARROW_RIGHT:
      case KeyCode.KEY_D:
        this.moveDirection = 1;
        break;
      case KeyCode.SPACE:
        this.jump();
        break;
    }
  }

  onKeyUp(event: EventKeyboard) {
    switch (event.keyCode) {
      case KeyCode.ARROW_LEFT:
      case KeyCode.KEY_A:
        // If we were moving left, stop moving
        if (this.moveDirection === -1) {
          this.moveDirection = 0;
        }
        break;
      case KeyCode.ARROW_RIGHT:
      case KeyCode.KEY_D:
        // If we were moving right, stop moving
        if (this.moveDirection === 1) {
          this.moveDirection = 0;
        }
        break;
    }
  }

  checkGrounded(): boolean {
    if (!this.rigidBody) return false;

    // Check if player is moving downward and close to ground
    const velocity = this.rigidBody.linearVelocity;
    const isMovingDown = velocity.y <= 0;

    // Simple ground check based on velocity and position
    if (isMovingDown && Math.abs(velocity.y) < 50) {
      return true;
    }

    return this.isGrounded;
  }

  jump() {
    const canJump = this.checkGrounded();

    if (this.rigidBody && canJump) {
      // Apply upward force for jumping
      const worldPos = this.node.worldPosition;
      this.rigidBody.applyLinearImpulse(
        new Vec2(0, this.jumpForce),
        new Vec2(worldPos.x, worldPos.y),
        true
      );
      this.isGrounded = false;
    } else {
      console.log("Cannot jump - not grounded or no rigid body");
    }
  }

  update(deltaTime: number) {
    if (this.rigidBody && this.moveDirection !== 0) {
      // Calculate movement velocity
      const velocity = this.rigidBody.linearVelocity;
      velocity.x = this.moveDirection * this.moveSpeed;

      // Apply the velocity
      this.rigidBody.linearVelocity = velocity;

      // Flip the player sprite based on movement direction
      this.flipPlayerSprite();

      // Play run animation when moving
      if (this.currentAnimation !== "boy_run") {
        this.playAnimation("boy_run");
      }
    } else {
      // Play idle animation when not moving
      if (this.currentAnimation !== "idle_boy") {
        this.playAnimation("idle_boy");
      }
    }

    // Update grounded state based on velocity
    if (this.rigidBody) {
      const velocity = this.rigidBody.linearVelocity;
      if (velocity.y <= 0 && Math.abs(velocity.y) < 50) {
        this.isGrounded = true;
      }
    }
  }

  onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    // Check for GameOver collision (tag 3)
    if (otherCollider.tag === 3) {
      director.loadScene("GameOver");
      return;
    }

    // Check if the contact is from below (player landing on something)
    if (contact) {
      const normal = contact.getWorldManifold().normal;
      if (normal.y > 0.5) {
        this.isGrounded = true;
      }
    } else {
      // Fallback: if no contact info, assume it's ground if it's not the player itself
      if (otherCollider.node !== this.node) {
        this.isGrounded = true;
      }
    }
  }

  onEndContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    // Don't immediately set isGrounded to false on end contact
    // Let the velocity-based check handle it
  }

  playAnimation(animationName: string) {
    if (this.animation) {
      this.animation.play(animationName);
      this.currentAnimation = animationName;
    }
  }

  flipPlayerSprite() {
    // Get the current scale
    const currentScale = this.node.scale;

    // Flip based on movement direction
    if (this.moveDirection > 0) {
      // Moving right - face right (positive scale)
      this.node.setScale(
        Math.abs(currentScale.x),
        currentScale.y,
        currentScale.z
      );
    } else if (this.moveDirection < 0) {
      // Moving left - face left (negative scale)
      this.node.setScale(
        -Math.abs(currentScale.x),
        currentScale.y,
        currentScale.z
      );
    }
    // If moveDirection is 0, keep the current scale (don't change direction when idle)
  }
}
