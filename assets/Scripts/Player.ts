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
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Player")
export class Player extends Component {
  @property
  moveSpeed: number = 200;

  @property
  jumpForce: number = 800;

  @property
  groundCheckDistance: number = 0.1;

  private rigidBody: RigidBody2D | null = null;
  private collider: Collider2D | null = null;
  private isGrounded: boolean = false;
  private moveDirection: number = 0;

  start() {
    // Get the RigidBody2D component
    this.rigidBody = this.getComponent(RigidBody2D);
    this.collider = this.getComponent(Collider2D);

    // Set up collision detection
    if (this.collider) {
      this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    // Register keyboard input events
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
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
        if (this.moveDirection === -1) {
          this.moveDirection = 0;
        }
        break;
      case KeyCode.ARROW_RIGHT:
      case KeyCode.KEY_D:
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
    // Check if the contact is from below (player landing on something)
    if (contact) {
      const normal = contact.getWorldManifold().normal;
      // If the normal is pointing upward (y > 0), we're landing on something
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
}
