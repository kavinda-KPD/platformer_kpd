import {
  _decorator,
  Component,
  Node,
  RigidBody2D,
  Collider2D,
  Contact2DType,
  IPhysics2DContact,
  Vec3,
  Vec2,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("SimpleMovingPlatform")
export class SimpleMovingPlatform extends Component {
  @property
  fallSpeed: number = 150; // Speed at which the platform falls

  @property
  maxFallDistance: number = 10; // Maximum distance the platform can fall

  @property
  debugMode: boolean = true; // Enable debug messages

  private rigidBody: RigidBody2D | null = null;
  private collider: Collider2D | null = null;
  private isFalling: boolean = false;
  private originalPosition: Vec3 | null = null;
  private fallDistance: number = 0;
  private isPlayerOnPlatform: boolean = false;
  private playerNode: Node | null = null;
  private lastPlatformY: number = 0;

  start() {
    // Get components
    this.rigidBody = this.getComponent(RigidBody2D);
    this.collider = this.getComponent(Collider2D);

    // Store original position
    this.originalPosition = this.node.worldPosition.clone();
    this.lastPlatformY = this.originalPosition.y;

    // Set up rigid body for kinematic movement
    this.rigidBody.type = 1; // KINEMATIC type
    this.rigidBody.gravityScale = 0; // Disable gravity for the platform

    // Set up collision detection (like bombs script)
    this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
  }

  onDestroy() {
    // Clean up collision listeners
    if (this.collider) {
      this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      this.collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
  }

  onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    // Check if the other collider's tag is 1 (player tag) - same as bombs script
    if (otherCollider.tag === 1) {
      // Store reference to player node
      this.playerNode = otherCollider.node;

      // Check if the contact is from above (player landing on platform)
      if (contact) {
        const normal = contact.getWorldManifold().normal;

        // Only trigger if player is landing on top (normal.y > 0.5 means from above)
        if (normal.y > 0.5) {
          this.isPlayerOnPlatform = true;
          this.startFalling();
        }
      }
    }
  }

  onEndContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    // Check if the player (tag 1) left the platform
    if (otherCollider.tag === 1) {
      this.isPlayerOnPlatform = false;
      this.playerNode = null;
    }
  }

  startFalling() {
    if (!this.isFalling) {
      this.isFalling = true;
    }
  }

  update(deltaTime: number) {
    if (this.isFalling && this.fallDistance < this.maxFallDistance) {
      // Calculate how much to fall this frame
      const fallAmount = this.fallSpeed * deltaTime;
      this.fallDistance += fallAmount;

      // Move the platform downward
      const currentPos = this.node.worldPosition;
      const newY = currentPos.y - fallAmount;

      // Update position
      this.node.setWorldPosition(currentPos.x, newY, currentPos.z);

      // If player is on platform, move them with it
      if (this.isPlayerOnPlatform && this.playerNode) {
        const playerPos = this.playerNode.worldPosition;
        const platformYChange = this.lastPlatformY - newY; // How much the platform moved down

        // Move the player down by the same amount
        this.playerNode.setWorldPosition(
          playerPos.x,
          playerPos.y - platformYChange,
          playerPos.z
        );
      }

      // Update last platform Y position
      this.lastPlatformY = newY;

      // If we've reached max fall distance, stop falling
      if (this.fallDistance >= this.maxFallDistance) {
        this.isFalling = false;
      }
    }
  }

  // Method to reset the platform (useful for level restart)
  resetPlatform() {
    if (this.originalPosition) {
      this.node.setWorldPosition(this.originalPosition);
      this.isFalling = false;
      this.fallDistance = 0;
      this.isPlayerOnPlatform = false;
      this.playerNode = null;
      this.lastPlatformY = this.originalPosition.y;
    }
  }

  // Getter to check if platform is currently falling
  get isCurrentlyFalling(): boolean {
    return this.isFalling;
  }

  // Getter to check if player is on platform
  get hasPlayerOnTop(): boolean {
    return this.isPlayerOnPlatform;
  }
}
