/**
 * StonehengeRunePuzzle.js - Interactive 6-Pillar Elemental Rune Puzzle for Three.js
 *
 * Implements Option 2:
 *  - 6 Ancient Megaliths around the central Altar at (35.0, -62.0)
 *  - Elemental Pillars:
 *      Pillar 1: Sun   (#ffb300, Golden Solar)
 *      Pillar 2: Moon  (#80deea, Silver Lunar)
 *      Pillar 3: Fire  (#ff3d00, Crimson Flame)
 *      Pillar 4: Water (#00b0ff, Ocean Azure)
 *      Pillar 5: Earth (#00e676, Forest Emerald)
 *      Pillar 6: Air   (#1de9b6, Sky Wind)
 *  - Solution Order: Sun (1) -> Earth (5) -> Water (4) -> Fire (3) -> Air (6) -> Moon (2)
 *  - Completion Event:
 *      * All 6 runes resonate in harmony
 *      * Central Altar Relic Crystal unlocks, rises, and spins
 *      * Onscreen glowing fantasy banner/modal displays the completion message
 *
 * Dependencies:
 *   three (>= r150)
 */

import * as THREE from 'three';

export class StonehengeRunePuzzle {
  /**
   * @param {THREE.Scene} scene - Active Three.js scene
   * @param {THREE.Camera} camera - Active camera (for raycasting clicks)
   * @param {HTMLElement} [domElement=document.body] - Container for the UI completion banner
   */
  constructor(scene, camera, domElement = document.body) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;

    // Elemental definitions
    this.pillarDefs = [
      { id: 1, name: 'Sun', color: 0xffb300, baseEmissive: 0.5, activeEmissive: 3.5 },
      { id: 2, name: 'Moon', color: 0x80deea, baseEmissive: 0.5, activeEmissive: 3.5 },
      { id: 3, name: 'Fire', color: 0xff3d00, baseEmissive: 0.5, activeEmissive: 3.5 },
      { id: 4, name: 'Water', color: 0x00b0ff, baseEmissive: 0.5, activeEmissive: 3.5 },
      { id: 5, name: 'Earth', color: 0x00e676, baseEmissive: 0.5, activeEmissive: 3.5 },
      { id: 6, name: 'Air', color: 0x1de9b6, baseEmissive: 0.5, activeEmissive: 3.5 }
    ];

    // Correct sequential ritual riddle order:
    // "First the Sun brings the dawn, then the Earth awakens, nourished by Water,
    //  ignited by Fire, carried by the Wind, resting beneath the Moon."
    this.solutionSequence = [1, 5, 4, 3, 6, 2];
    this.currentStep = 0;
    this.isSolved = false;

    // Mesh references
    this.pillars = [];
    this.runeGems = [];
    this.relicCrystal = null;

    // Raycaster for click interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Callback on solve
    this.onSolvedCallback = null;

    this.animTime = 0;
    this.relicBaseY = 4.45;
    this.relicTargetY = 4.45;

    // Setup CSS & UI container
    this._injectStyles();
    this._createMessageOverlay();
  }

  /**
   * Binds to the loaded GLTF world scene and extracts Stonehenge objects.
   * @param {THREE.Object3D} worldScene - Root scene from island_world_complete.glb
   */
  bindModel(worldScene) {
    worldScene.traverse((child) => {
      const lower = child.name.toLowerCase();

      // Find Megaliths & child Rune Gems
      for (let i = 1; i <= 6; i++) {
        if (lower === `magic_megalith_${i}`) {
          this.pillars[i] = child;
        }
        if (lower.includes(`megalith_rune_${i}`)) {
          this.runeGems[i] = child;
          // Set initial subtle emissive
          if (child.material) {
            child.material = child.material.clone();
            child.material.emissiveIntensity = 0.6;
          }
        }
      }

      // Find central Altar Relic Crystal
      if (lower.includes('stonehenge_altar_relic_crystal')) {
        this.relicCrystal = child;
        this.relicBaseY = child.position.y || 4.45;
        this.relicTargetY = this.relicBaseY;
        if (child.material) {
          child.material = child.material.clone();
          child.material.emissiveIntensity = 0.8;
        }
      }
    });

    console.log('[StonehengePuzzle] Bound 6 Megaliths and Altar Relic Crystal.');
  }

  /**
   * Enables pointer / mouse click interaction on the megaliths.
   * Call once after bindModel().
   */
  enableClickInteraction() {
    window.addEventListener('pointerdown', (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Collect target objects
      const targets = [];
      for (let i = 1; i <= 6; i++) {
        if (this.runeGems[i]) targets.push(this.runeGems[i]);
        if (this.pillars[i]) targets.push(this.pillars[i]);
      }

      const intersects = this.raycaster.intersectObjects(targets, true);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const pillarIndex = this._getPillarIndexFromObject(hit);
        if (pillarIndex !== null) {
          this.interactPillar(pillarIndex);
        }
      }
    });
  }

  /**
   * Interacts with a specific pillar by index (1 to 6).
   * Can be called by click raycasting OR by player character proximity interaction (e.g. key 'E').
   * @param {number} index - Pillar number (1 to 6)
   */
  interactPillar(index) {
    if (this.isSolved) return;

    const expectedIndex = this.solutionSequence[this.currentStep];
    const def = this.pillarDefs[index - 1];

    if (index === expectedIndex) {
      // Correct step
      this._activateRune(index);
      this.currentStep++;

      console.log(`[StonehengePuzzle] Correct: ${def.name} (${this.currentStep}/6)`);

      // Check if complete
      if (this.currentStep === this.solutionSequence.length) {
        this._completePuzzle();
      }
    } else {
      // Incorrect step -> gentle reset
      console.warn(`[StonehengePuzzle] Incorrect pillar ${def.name}. Expected pillar for step ${this.currentStep + 1}. Resetting...`);
      this._flashReset();
    }
  }

  /**
   * Sets callback when puzzle is solved.
   * @param {function} callback
   */
  onSolved(callback) {
    this.onSolvedCallback = callback;
  }

  /**
   * Internal: activates a pillar rune visually.
   */
  _activateRune(index) {
    const gem = this.runeGems[index];
    if (gem && gem.material) {
      gem.material.emissiveIntensity = 4.0;
    }
  }

  /**
   * Internal: resets sequence with brief flash.
   */
  _flashReset() {
    // Flash all active runes briefly
    for (let i = 1; i <= 6; i++) {
      const gem = this.runeGems[i];
      if (gem && gem.material) {
        gem.material.emissiveIntensity = 0.1;
      }
    }

    setTimeout(() => {
      for (let i = 1; i <= 6; i++) {
        const gem = this.runeGems[i];
        if (gem && gem.material) {
          gem.material.emissiveIntensity = 0.6;
        }
      }
      this.currentStep = 0;
    }, 450);
  }

  /**
   * Internal: triggers puzzle completion.
   */
  _completePuzzle() {
    this.isSolved = true;
    console.log('[StonehengePuzzle] RITUAL COMPLETE! The ancient sanctuary has awakened!');

    // All runes surge to full radiance
    for (let i = 1; i <= 6; i++) {
      const gem = this.runeGems[i];
      if (gem && gem.material) {
        gem.material.emissiveIntensity = 4.5;
      }
    }

    // Altar Relic Crystal lifts into the air and glows intensely
    if (this.relicCrystal) {
      this.relicTargetY = this.relicBaseY + 0.8;
      if (this.relicCrystal.material) {
        this.relicCrystal.material.emissiveIntensity = 5.0;
      }
    }

    // Show onscreen UI fantasy message
    this.showMessage(
      '✨ ANCIENT SANCTUARY AWAKENED! ✨',
      'You have deciphered the Rite of the Elements.<br>The Blessing of the Old Gods fills your spirit.<br><br><b>[ +500 Max Mana • Celestial Relic Acquired ]</b>'
    );

    if (this.onSolvedCallback) {
      this.onSolvedCallback();
    }
  }

  /**
   * Displays the styled fantasy completion banner/modal.
   * @param {string} title - Main header
   * @param {string} bodyHtml - Body description / reward text
   */
  showMessage(title, bodyHtml) {
    if (!this.overlay) return;

    this.titleEl.innerHTML = title;
    this.bodyEl.innerHTML = bodyHtml;

    this.overlay.classList.add('visible');

    // Auto dismiss after 7 seconds
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.hideTimeout = setTimeout(() => {
      this.hideMessage();
    }, 7000);
  }

  /**
   * Hides the completion banner.
   */
  hideMessage() {
    if (this.overlay) {
      this.overlay.classList.remove('visible');
    }
  }

  /**
   * Call this every frame inside requestAnimationFrame(render).
   * Animates relic bobbing, spinning, and resonance.
   * @param {number} delta - Delta time in seconds
   */
  update(delta = 0.016) {
    this.animTime += delta;

    if (this.relicCrystal) {
      if (this.isSolved) {
        // Fast triumphant celestial spin and higher levitation
        this.relicCrystal.rotation.z += 2.8 * delta;
        this.relicCrystal.rotation.x += 1.2 * delta;
        this.relicCrystal.position.y = this.relicTargetY + Math.sin(this.animTime * 3.5) * 0.12;
      } else {
        // Gentle dormant hover
        this.relicCrystal.rotation.z += 0.5 * delta;
        this.relicCrystal.position.y = this.relicBaseY + Math.sin(this.animTime * 1.8) * 0.06;
      }
    }

    // Gentle pulsing on active runes
    if (this.isSolved) {
      const pulse = 4.0 + Math.sin(this.animTime * 3.0) * 0.8;
      for (let i = 1; i <= 6; i++) {
        if (this.runeGems[i] && this.runeGems[i].material) {
          this.runeGems[i].material.emissiveIntensity = pulse;
        }
      }
    }
  }

  /**
   * Helper to map mesh/child to pillar index
   */
  _getPillarIndexFromObject(obj) {
    let curr = obj;
    while (curr) {
      const name = curr.name.toLowerCase();
      for (let i = 1; i <= 6; i++) {
        if (name === `magic_megalith_${i}` || name.includes(`megalith_rune_${i}`)) {
          return i;
        }
      }
      curr = curr.parent;
    }
    return null;
  }

  /**
   * Injects CSS styles for the fantasy banner modal
   */
  _injectStyles() {
    if (document.getElementById('stonehenge-puzzle-styles')) return;

    const style = document.createElement('style');
    style.id = 'stonehenge-puzzle-styles';
    style.textContent = `
      .stonehenge-modal-overlay {
        position: fixed;
        bottom: 12%;
        left: 50%;
        transform: translateX(-50%) translateY(30px);
        background: radial-gradient(circle at center, rgba(14, 18, 36, 0.95), rgba(7, 9, 18, 0.98));
        border: 2px solid #ffd54f;
        box-shadow: 0 0 25px rgba(255, 213, 79, 0.45), 0 0 50px rgba(0, 229, 255, 0.25), inset 0 0 15px rgba(255, 213, 79, 0.2);
        border-radius: 12px;
        padding: 24px 38px;
        color: #ffffff;
        font-family: 'Cinzel', 'Palatino Linotype', 'Georgia', serif;
        text-align: center;
        opacity: 0;
        pointer-events: none;
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 9999;
        max-width: 540px;
        width: 90%;
        backdrop-filter: blur(8px);
      }
      .stonehenge-modal-overlay.visible {
        opacity: 1;
        pointer-events: auto;
        transform: translateX(-50%) translateY(0);
      }
      .stonehenge-modal-title {
        font-size: 1.45rem;
        letter-spacing: 2px;
        color: #ffd54f;
        text-shadow: 0 0 12px rgba(255, 213, 79, 0.6);
        margin-bottom: 10px;
        text-transform: uppercase;
      }
      .stonehenge-modal-body {
        font-size: 0.98rem;
        line-height: 1.6;
        color: #e0f7fa;
        text-shadow: 0 0 8px rgba(0, 229, 255, 0.4);
      }
      .stonehenge-modal-btn {
        margin-top: 14px;
        background: linear-gradient(135deg, #ffd54f, #ffb300);
        color: #0b0f19;
        border: none;
        font-weight: bold;
        font-size: 0.85rem;
        letter-spacing: 1px;
        padding: 8px 22px;
        border-radius: 6px;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .stonehenge-modal-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 0 14px rgba(255, 213, 79, 0.7);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Creates the HTML elements for the message banner
   */
  _createMessageOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'stonehenge-modal-overlay';

    this.titleEl = document.createElement('div');
    this.titleEl.className = 'stonehenge-modal-title';

    this.bodyEl = document.createElement('div');
    this.bodyEl.className = 'stonehenge-modal-body';

    this.btnEl = document.createElement('button');
    this.btnEl.className = 'stonehenge-modal-btn';
    this.btnEl.textContent = 'ACCEPT BLESSING';
    this.btnEl.onclick = () => this.hideMessage();

    this.overlay.appendChild(this.titleEl);
    this.overlay.appendChild(this.bodyEl);
    this.overlay.appendChild(this.btnEl);

    this.domElement.appendChild(this.overlay);
  }
}
